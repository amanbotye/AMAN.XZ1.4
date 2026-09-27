/*
  AMAN — Corrective / Complementary Database Migration
  Source: AMAN.XZ1.4 current database snapshot + AMAN_XZ1_4.txt
  Purpose: close authorization / workflow gaps without redesigning the schema.

  IMPORTANT BUSINESS RULES:
  - Customer never selects telecom company.
  - Company is detected from the saved phone number/prefix.
  - Payment is external/manual. AMAN never connects to bank/wallet/telecom APIs.
  - Customer submits transfer reference; manager verifies externally; manager records
    verification in AMAN; only then can protection/renewal be approved.
  - One active protection per number.
  - Multiple pending protection requests are allowed; first valid acceptance wins.
  - Renewal belongs only to the current protection owner.
*/

BEGIN;

/* ================================================================
   1. AUTH/USER INTEGRITY
   ================================================================ */
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_id_auth_users_fkey'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_id_auth_users_fkey
      FOREIGN KEY (id) REFERENCES auth.users(id)
      NOT VALID;
  END IF;
END $$;

/* ================================================================
   2. DEFENSE-IN-DEPTH: CUSTOMER/MANAGER MUST USE TRUSTED RPCs
      Direct writes to business-critical records are removed.
   ================================================================ */

DROP POLICY IF EXISTS cn_insert_own ON public.customer_numbers;
DROP POLICY IF EXISTS cn_update_own ON public.customer_numbers;

DROP POLICY IF EXISTS pr_insert_own ON public.protection_requests;
DROP POLICY IF EXISTS pr_update_admin ON public.protection_requests;

DROP POLICY IF EXISTS renewal_insert_own ON public.protection_renewals;
DROP POLICY IF EXISTS renewal_update_admin ON public.protection_renewals;

DROP POLICY IF EXISTS prot_update_admin ON public.protections;

DROP POLICY IF EXISTS mpl_insert_admin ON public.manual_payment_logs;
DROP POLICY IF EXISTS mpl_update_admin ON public.manual_payment_logs;

/* ================================================================
   3. CUSTOMER NUMBER UPDATE RPC
      The customer may only change notes. Phone/company/prefix/status/
      ownership remain controlled by AMAN.
   ================================================================ */
CREATE OR REPLACE FUNCTION public.rpc_update_customer_number_notes(
  p_customer_number_id uuid,
  p_notes text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED');
  END IF;
  IF NOT public.is_active_customer() THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'FORBIDDEN');
  END IF;

  UPDATE public.customer_numbers
     SET notes = p_notes,
         updated_at = now()
   WHERE id = p_customer_number_id
     AND customer_id = v_user_id
     AND is_deleted = false;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'NOT_FOUND');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$function$;

/* ================================================================
   4. EXTERNAL MANUAL PAYMENT VERIFICATION
      Manager copies/reads transfer reference externally, verifies the
      transfer outside AMAN, then records the result here.
   ================================================================ */
CREATE OR REPLACE FUNCTION public.rpc_verify_manual_payment(
  p_request_id uuid DEFAULT NULL,
  p_renewal_id uuid DEFAULT NULL,
  p_verification_status payment_verification_status_enum DEFAULT 'verified',
  p_verification_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_admin_id uuid := auth.uid();
  v_log public.manual_payment_logs%ROWTYPE;
  v_request public.protection_requests%ROWTYPE;
  v_renewal public.protection_renewals%ROWTYPE;
BEGIN
  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED');
  END IF;
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'FORBIDDEN');
  END IF;
  IF (p_request_id IS NULL) = (p_renewal_id IS NULL) THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'VALIDATION_ERROR');
  END IF;
  IF p_verification_status NOT IN ('verified', 'rejected') THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_VERIFICATION_STATUS');
  END IF;

  IF p_request_id IS NOT NULL THEN
    SELECT * INTO v_request
      FROM public.protection_requests
     WHERE id = p_request_id
     FOR UPDATE;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error_code', 'NOT_FOUND');
    END IF;

    SELECT * INTO v_log
      FROM public.manual_payment_logs
     WHERE request_id = p_request_id
     ORDER BY created_at DESC
     LIMIT 1
     FOR UPDATE;

    IF v_log.id IS NULL THEN
      INSERT INTO public.manual_payment_logs
        (request_id, payment_method_id, transfer_reference, amount,
         verification_status, verified_by, verified_at, verification_note)
      VALUES
        (p_request_id, v_request.payment_method_id,
         v_request.payment_transfer_reference, v_request.requested_price,
         p_verification_status, v_admin_id, now(), p_verification_note)
      RETURNING * INTO v_log;
    ELSE
      UPDATE public.manual_payment_logs
         SET payment_method_id = v_request.payment_method_id,
             transfer_reference = v_request.payment_transfer_reference,
             amount = v_request.requested_price,
             verification_status = p_verification_status,
             verified_by = v_admin_id,
             verified_at = now(),
             verification_note = p_verification_note
       WHERE id = v_log.id
       RETURNING * INTO v_log;
    END IF;

    INSERT INTO public.audit_logs
      (actor_user_id, action, entity_type, entity_id, new_data)
    VALUES
      (v_admin_id, 'VERIFY_MANUAL_PAYMENT', 'protection_request',
       p_request_id::text,
       jsonb_build_object(
         'verification_status', p_verification_status,
         'manual_payment_log_id', v_log.id,
         'verification_note', p_verification_note
       ));

    RETURN jsonb_build_object(
      'success', true,
      'verification_status', p_verification_status,
      'manual_payment_log_id', v_log.id
    );
  END IF;

  SELECT * INTO v_renewal
    FROM public.protection_renewals
   WHERE id = p_renewal_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'NOT_FOUND');
  END IF;

  SELECT * INTO v_log
    FROM public.manual_payment_logs
   WHERE renewal_id = p_renewal_id
   ORDER BY created_at DESC
   LIMIT 1
   FOR UPDATE;

  IF v_log.id IS NULL THEN
    INSERT INTO public.manual_payment_logs
      (renewal_id, payment_method_id, transfer_reference, amount,
       verification_status, verified_by, verified_at, verification_note)
    VALUES
      (p_renewal_id, v_renewal.payment_method_id,
       v_renewal.payment_transfer_reference, v_renewal.price_snapshot,
       p_verification_status, v_admin_id, now(), p_verification_note)
    RETURNING * INTO v_log;
  ELSE
    UPDATE public.manual_payment_logs
       SET payment_method_id = v_renewal.payment_method_id,
           transfer_reference = v_renewal.payment_transfer_reference,
           amount = v_renewal.price_snapshot,
           verification_status = p_verification_status,
           verified_by = v_admin_id,
           verified_at = now(),
           verification_note = p_verification_note
     WHERE id = v_log.id
     RETURNING * INTO v_log;
  END IF;

  INSERT INTO public.audit_logs
    (actor_user_id, action, entity_type, entity_id, new_data)
  VALUES
    (v_admin_id, 'VERIFY_MANUAL_PAYMENT', 'protection_renewal',
     p_renewal_id::text,
     jsonb_build_object(
       'verification_status', p_verification_status,
       'manual_payment_log_id', v_log.id,
       'verification_note', p_verification_note
     ));

  RETURN jsonb_build_object(
    'success', true,
    'verification_status', p_verification_status,
    'manual_payment_log_id', v_log.id
  );
END;
$function$;

/* ================================================================
   5. CREATE PROTECTION REQUEST
      Company is derived from customer_numbers. It is never accepted
      from the customer as an independent company choice.
   ================================================================ */
CREATE OR REPLACE FUNCTION public.rpc_create_protection_request(
  p_customer_number_id uuid,
  p_package_id uuid,
  p_payment_method_id uuid,
  p_transfer_reference text,
  p_customer_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_cn public.customer_numbers%ROWTYPE;
  v_package public.company_packages%ROWTYPE;
  v_pm public.payment_methods%ROWTYPE;
  v_number_length integer;
  v_new_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED');
  END IF;
  IF NOT public.is_active_customer() THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'FORBIDDEN');
  END IF;
  IF p_transfer_reference IS NULL OR length(trim(p_transfer_reference)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'VALIDATION_ERROR', 'field', 'transfer_reference');
  END IF;

  SELECT * INTO v_cn
    FROM public.customer_numbers
   WHERE id = p_customer_number_id
     AND customer_id = v_user_id
     AND is_deleted = false
     AND status = 'active'
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'NOT_FOUND', 'entity', 'customer_number');
  END IF;

  /* Re-detect company from the phone itself; do not trust a mutable company_id. */
  SELECT dc.company_id, dc.prefix, dc.number_length
    INTO v_cn.company_id, v_cn.detected_prefix, v_number_length
    FROM public.detect_company_from_phone(v_cn.normalized_phone_number) dc;

  IF v_cn.company_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'COMPANY_NOT_FOUND');
  END IF;

  IF v_number_length IS NOT NULL AND length(v_cn.normalized_phone_number) <> v_number_length THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_PHONE_LENGTH');
  END IF;

  IF v_cn.company_id IS DISTINCT FROM (
    SELECT company_id FROM public.customer_numbers WHERE id = p_customer_number_id
  ) THEN
    UPDATE public.customer_numbers
       SET company_id = v_cn.company_id,
           detected_prefix = v_cn.detected_prefix,
           updated_at = now()
     WHERE id = p_customer_number_id;
  ELSE
    UPDATE public.customer_numbers
       SET detected_prefix = v_cn.detected_prefix,
           updated_at = now()
     WHERE id = p_customer_number_id;
  END IF;

  SELECT * INTO v_package
    FROM public.company_packages
   WHERE id = p_package_id
     AND company_id = v_cn.company_id
     AND is_active = true
     AND is_visible = true
     AND is_deleted = false;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'PACKAGE_UNAVAILABLE');
  END IF;

  SELECT * INTO v_pm
    FROM public.payment_methods
   WHERE id = p_payment_method_id
     AND is_active = true
     AND is_deleted = false;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'PAYMENT_METHOD_UNAVAILABLE');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.protections
     WHERE customer_number_id = p_customer_number_id
       AND status = 'active'
       AND is_deleted = false
  ) THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'ACTIVE_PROTECTION_EXISTS');
  END IF;

  INSERT INTO public.protection_requests (
    customer_id, customer_number_id, company_id, package_id, payment_method_id,
    status, requested_price, requested_currency, requested_duration_days,
    payment_transfer_reference, customer_note
  ) VALUES (
    v_user_id, p_customer_number_id, v_cn.company_id, p_package_id, p_payment_method_id,
    'pending', v_package.price, v_package.currency, v_package.duration_days,
    trim(p_transfer_reference), p_customer_note
  ) RETURNING id INTO v_new_id;

  /* Internal record of an external/manual payment verification workflow. */
  INSERT INTO public.manual_payment_logs (
    request_id, payment_method_id, transfer_reference, amount, verification_status
  ) VALUES (
    v_new_id, p_payment_method_id, trim(p_transfer_reference), v_package.price, 'pending'
  );

  INSERT INTO public.admin_notifications (notification_type, title, body, related_request_id)
  VALUES ('new_request', 'طلب حماية جديد', 'تم إرسال طلب حماية جديد بانتظار المراجعة', v_new_id);

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id)
  VALUES (v_user_id, 'CREATE_PROTECTION_REQUEST', 'protection_request', v_new_id::text);

  RETURN jsonb_build_object('success', true, 'id', v_new_id, 'company_id', v_cn.company_id);
END;
$function$;

/* ================================================================
   6. APPROVE PROTECTION
      Requires verified external payment + atomic first-wins locking.
   ================================================================ */
CREATE OR REPLACE FUNCTION public.rpc_approve_protection_request(p_request_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_admin_id uuid := auth.uid();
  v_req public.protection_requests%ROWTYPE;
  v_cn public.customer_numbers%ROWTYPE;
  v_pkg public.company_packages%ROWTYPE;
  v_ts public.company_task_settings%ROWTYPE;
  v_payment public.manual_payment_logs%ROWTYPE;
  v_now timestamptz := now();
  v_start timestamptz;
  v_end timestamptz;
  v_prot_id uuid;
  v_task_date timestamptz;
  v_due_date timestamptz;
  v_task_num integer := 1;
  v_boundary timestamptz;
BEGIN
  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED');
  END IF;
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'FORBIDDEN');
  END IF;

  SELECT * INTO v_req
    FROM public.protection_requests
   WHERE id = p_request_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'NOT_FOUND');
  END IF;
  IF v_req.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_STATE');
  END IF;

  SELECT * INTO v_cn
    FROM public.customer_numbers
   WHERE id = v_req.customer_number_id
   FOR UPDATE;
  IF NOT FOUND OR v_cn.customer_id IS DISTINCT FROM v_req.customer_id THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_NUMBER');
  END IF;

  SELECT * INTO v_pkg
    FROM public.company_packages
   WHERE id = v_req.package_id;
  IF NOT FOUND OR v_pkg.company_id IS DISTINCT FROM v_cn.company_id
     OR v_req.company_id IS DISTINCT FROM v_cn.company_id THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'COMPANY_MISMATCH');
  END IF;

  SELECT * INTO v_payment
    FROM public.manual_payment_logs
   WHERE request_id = p_request_id
     AND verification_status = 'verified'
   ORDER BY verified_at DESC NULLS LAST, created_at DESC
   LIMIT 1
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'PAYMENT_NOT_VERIFIED');
  END IF;

  /* Locks the number row so concurrent approvals serialize. */
  IF EXISTS (
    SELECT 1 FROM public.protections
     WHERE customer_number_id = v_req.customer_number_id
       AND status = 'active'
       AND is_deleted = false
     FOR UPDATE
  ) THEN
    UPDATE public.protection_requests
       SET status = 'rejected',
           rejection_reason = 'تمت حماية الرقم بطلب آخر',
           reviewed_by = v_admin_id,
           reviewed_at = v_now
     WHERE id = p_request_id;
    RETURN jsonb_build_object('success', false, 'error_code', 'ACTIVE_PROTECTION_EXISTS');
  END IF;

  SELECT * INTO v_ts
    FROM public.company_task_settings
   WHERE company_id = v_req.company_id
     AND is_active = true;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'CONFIGURATION_ERROR');
  END IF;

  v_start := v_now;
  v_end := v_start + (v_req.requested_duration_days || ' days')::interval;

  UPDATE public.protection_requests
     SET status = 'approved', reviewed_by = v_admin_id, reviewed_at = v_now
   WHERE id = p_request_id AND status = 'pending';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_STATE');
  END IF;

  INSERT INTO public.protections (
    customer_id, customer_number_id, company_id, source_request_id, package_id,
    package_name_snapshot, price_snapshot, currency_snapshot, duration_days_snapshot,
    task_amount_snapshot, task_interval_days_snapshot, task_currency_snapshot,
    start_at, end_at, status, renewal_count
  ) VALUES (
    v_req.customer_id, v_req.customer_number_id, v_req.company_id, p_request_id, v_req.package_id,
    v_pkg.name_ar, v_req.requested_price, v_req.requested_currency, v_req.requested_duration_days,
    v_ts.task_amount, v_ts.task_interval_days, v_ts.task_currency,
    v_start, v_end, 'active', 0
  ) RETURNING id INTO v_prot_id;

  IF v_ts.enable_first_task THEN
    IF v_ts.allow_after_expiry THEN
      v_boundary := v_end + (v_ts.max_days_after_expiry || ' days')::interval;
    ELSE
      v_boundary := v_end;
    END IF;
    v_task_date := v_start;
    v_due_date := v_task_date + (v_ts.task_interval_days || ' days')::interval;
    WHILE v_task_date <= v_boundary LOOP
      INSERT INTO public.protection_tasks (
        protection_id, customer_id, customer_number_id, company_id,
        task_number, task_type, amount, currency, scheduled_at, due_at,
        status, source_task_interval_days
      ) VALUES (
        v_prot_id, v_req.customer_id, v_req.customer_number_id, v_req.company_id,
        v_task_num, 'operational', v_ts.task_amount, v_ts.task_currency,
        v_task_date, v_due_date, 'scheduled', v_ts.task_interval_days
      );
      v_task_num := v_task_num + 1;
      v_task_date := v_task_date + (v_ts.task_interval_days || ' days')::interval;
      v_due_date := v_task_date + (v_ts.task_interval_days || ' days')::interval;
      IF NOT v_ts.enable_recurring_tasks THEN EXIT; END IF;
    END LOOP;
  END IF;

  INSERT INTO public.transactions (
    customer_id, protection_id, request_id, transaction_type, amount, currency,
    payment_method_id, external_reference, created_by
  ) VALUES (
    v_req.customer_id, v_prot_id, p_request_id, 'income', v_req.requested_price,
    v_req.requested_currency, v_req.payment_method_id,
    v_req.payment_transfer_reference, v_admin_id
  );

  /* All other pending requests for the same number lose the race automatically. */
  UPDATE public.protection_requests
     SET status = 'rejected',
         rejection_reason = 'تمت حماية الرقم بطلب آخر',
         reviewed_by = v_admin_id,
         reviewed_at = v_now
   WHERE customer_number_id = v_req.customer_number_id
     AND id <> p_request_id
     AND status = 'pending';

  INSERT INTO public.client_notifications
    (user_id, notification_type, title, body, related_request_id, related_protection_id)
  VALUES
    (v_req.customer_id, 'request_approved', 'تم قبول طلبك',
     'تم قبول طلب الحماية وبدأت حمايتك.', p_request_id, v_prot_id);

  INSERT INTO public.audit_logs
    (actor_user_id, action, entity_type, entity_id, new_data)
  VALUES
    (v_admin_id, 'APPROVE_REQUEST', 'protection_request', p_request_id::text,
     jsonb_build_object('protection_id', v_prot_id, 'manual_payment_verified', true,
                        'start_at', v_start, 'end_at', v_end));

  RETURN jsonb_build_object('success', true, 'protection_id', v_prot_id);
END;
$function$;

/* ================================================================
   7. CREATE RENEWAL REQUEST
      Only current protection owner may request renewal.
   ================================================================ */
CREATE OR REPLACE FUNCTION public.rpc_create_renewal_request(
  p_protection_id uuid,
  p_package_id uuid,
  p_payment_method_id uuid,
  p_transfer_reference text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_prot public.protections%ROWTYPE;
  v_pkg public.company_packages%ROWTYPE;
  v_pm public.payment_methods%ROWTYPE;
  v_ss public.company_subscription_settings%ROWTYPE;
  v_new_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED');
  END IF;
  IF NOT public.is_active_customer() THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'FORBIDDEN');
  END IF;
  IF p_transfer_reference IS NULL OR length(trim(p_transfer_reference)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'VALIDATION_ERROR');
  END IF;

  SELECT * INTO v_prot
    FROM public.protections
   WHERE id = p_protection_id
     AND customer_id = v_user_id
     AND is_deleted = false
     AND status = 'active'
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'NOT_FOUND');
  END IF;

  SELECT * INTO v_ss
    FROM public.company_subscription_settings
   WHERE company_id = v_prot.company_id;
  IF v_ss IS NOT NULL AND NOT v_ss.renewal_enabled THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RENEWAL_NOT_ALLOWED');
  END IF;

  SELECT * INTO v_pkg
    FROM public.company_packages
   WHERE id = p_package_id
     AND company_id = v_prot.company_id
     AND is_active = true
     AND is_visible = true
     AND is_deleted = false;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'PACKAGE_UNAVAILABLE');
  END IF;

  SELECT * INTO v_pm
    FROM public.payment_methods
   WHERE id = p_payment_method_id
     AND is_active = true
     AND is_deleted = false;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'PAYMENT_METHOD_UNAVAILABLE');
  END IF;

  INSERT INTO public.protection_renewals (
    protection_id, customer_id, package_id, price_snapshot, currency_snapshot,
    duration_days_snapshot, previous_end_at, payment_method_id,
    payment_transfer_reference, status
  ) VALUES (
    p_protection_id, v_user_id, p_package_id, v_pkg.price, v_pkg.currency,
    v_pkg.duration_days, v_prot.end_at, p_payment_method_id,
    trim(p_transfer_reference), 'pending'
  ) RETURNING id INTO v_new_id;

  INSERT INTO public.manual_payment_logs (
    renewal_id, payment_method_id, transfer_reference, amount, verification_status
  ) VALUES (
    v_new_id, p_payment_method_id, trim(p_transfer_reference), v_pkg.price, 'pending'
  );

  INSERT INTO public.admin_notifications
    (notification_type, title, body, related_protection_id)
  VALUES
    ('new_renewal', 'طلب تجديد جديد', 'تم إرسال طلب تجديد بانتظار المراجعة', p_protection_id);

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id)
  VALUES (v_user_id, 'CREATE_RENEWAL', 'protection_renewal', v_new_id::text);

  RETURN jsonb_build_object('success', true, 'id', v_new_id);
END;
$function$;

/* ================================================================
   8. APPROVE RENEWAL
      Requires verified external payment and locks the current protection.
   ================================================================ */
CREATE OR REPLACE FUNCTION public.rpc_approve_renewal(p_renewal_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_admin_id uuid := auth.uid();
  v_renewal public.protection_renewals%ROWTYPE;
  v_prot public.protections%ROWTYPE;
  v_ts public.company_task_settings%ROWTYPE;
  v_payment public.manual_payment_logs%ROWTYPE;
  v_now timestamptz := now();
  v_new_end timestamptz;
  v_candidate timestamptz;
  v_max_task_num integer;
  v_boundary timestamptz;
BEGIN
  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED');
  END IF;
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'FORBIDDEN');
  END IF;

  SELECT * INTO v_renewal
    FROM public.protection_renewals
   WHERE id = p_renewal_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'NOT_FOUND');
  END IF;
  IF v_renewal.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RENEWAL_ALREADY_PROCESSED');
  END IF;

  SELECT * INTO v_prot
    FROM public.protections
   WHERE id = v_renewal.protection_id
   FOR UPDATE;
  IF NOT FOUND OR v_prot.customer_id IS DISTINCT FROM v_renewal.customer_id
     OR v_prot.status <> 'active' OR v_prot.is_deleted THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_PROTECTION');
  END IF;

  SELECT * INTO v_payment
    FROM public.manual_payment_logs
   WHERE renewal_id = p_renewal_id
     AND verification_status = 'verified'
   ORDER BY verified_at DESC NULLS LAST, created_at DESC
   LIMIT 1
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'PAYMENT_NOT_VERIFIED');
  END IF;

  SELECT * INTO v_ts
    FROM public.company_task_settings
   WHERE company_id = v_prot.company_id
     AND is_active = true;

  v_new_end := v_prot.end_at + (v_renewal.duration_days_snapshot || ' days')::interval;

  UPDATE public.protection_renewals
     SET status = 'approved', new_end_at = v_new_end,
         reviewed_by = v_admin_id, reviewed_at = v_now
   WHERE id = p_renewal_id AND status = 'pending';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RENEWAL_ALREADY_PROCESSED');
  END IF;

  UPDATE public.protections
     SET end_at = v_new_end,
         renewal_count = renewal_count + 1,
         updated_at = v_now
   WHERE id = v_renewal.protection_id;

  IF v_ts IS NOT NULL THEN
    SELECT COALESCE(MAX(scheduled_at), v_prot.start_at)
      INTO v_candidate
      FROM public.protection_tasks
     WHERE protection_id = v_prot.id;
    SELECT COALESCE(MAX(task_number), 0)
      INTO v_max_task_num
      FROM public.protection_tasks
     WHERE protection_id = v_prot.id;

    IF v_ts.allow_after_expiry THEN
      v_boundary := v_new_end + (v_ts.max_days_after_expiry || ' days')::interval;
    ELSE
      v_boundary := v_new_end;
    END IF;

    v_candidate := v_candidate + (v_ts.task_interval_days || ' days')::interval;
    WHILE v_candidate <= v_boundary LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.protection_tasks
         WHERE protection_id = v_prot.id
           AND scheduled_at = v_candidate
      ) THEN
        v_max_task_num := v_max_task_num + 1;
        INSERT INTO public.protection_tasks (
          protection_id, customer_id, customer_number_id, company_id,
          task_number, task_type, amount, currency, scheduled_at, due_at,
          status, source_task_interval_days
        ) VALUES (
          v_prot.id, v_prot.customer_id, v_prot.customer_number_id, v_prot.company_id,
          v_max_task_num, 'operational', v_ts.task_amount, v_ts.task_currency,
          v_candidate,
          v_candidate + (v_ts.task_interval_days || ' days')::interval,
          'scheduled', v_ts.task_interval_days
        );
      END IF;
      v_candidate := v_candidate + (v_ts.task_interval_days || ' days')::interval;
    END LOOP;
  END IF;

  INSERT INTO public.transactions (
    customer_id, protection_id, renewal_id, transaction_type, amount,
    currency, payment_method_id, external_reference, created_by
  ) VALUES (
    v_renewal.customer_id, v_renewal.protection_id, p_renewal_id, 'income',
    v_renewal.price_snapshot, v_renewal.currency_snapshot,
    v_renewal.payment_method_id, v_renewal.payment_transfer_reference, v_admin_id
  );

  INSERT INTO public.client_notifications
    (user_id, notification_type, title, body, related_protection_id)
  VALUES (
    v_renewal.customer_id, 'renewal_approved', 'تم قبول تجديد الحماية',
    'تم تمديد حمايتك حتى ' || v_new_end::date::text, v_renewal.protection_id
  );

  INSERT INTO public.audit_logs
    (actor_user_id, action, entity_type, entity_id, new_data)
  VALUES (
    v_admin_id, 'APPROVE_RENEWAL', 'protection_renewal', p_renewal_id::text,
    jsonb_build_object('new_end_at', v_new_end, 'previous_end_at', v_prot.end_at,
                       'manual_payment_verified', true)
  );

  RETURN jsonb_build_object('success', true, 'new_end_at', v_new_end);
END;
$function$;

/* ================================================================
   9. ATOMIC TASK EXECUTION
      Prevent two simultaneous managers from completing the same task.
   ================================================================ */
CREATE OR REPLACE FUNCTION public.rpc_execute_task(
  p_task_id uuid,
  p_execution_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_admin_id uuid := auth.uid();
  v_task public.protection_tasks%ROWTYPE;
  v_prot public.protections%ROWTYPE;
  v_ts public.company_task_settings%ROWTYPE;
  v_now timestamptz := now();
  v_next_date timestamptz;
  v_next_due timestamptz;
  v_next_num integer;
  v_new_task_id uuid;
  v_boundary timestamptz;
BEGIN
  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED');
  END IF;
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'FORBIDDEN');
  END IF;

  SELECT * INTO v_task
    FROM public.protection_tasks
   WHERE id = p_task_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'NOT_FOUND');
  END IF;
  IF v_task.status = 'completed' THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'TASK_ALREADY_COMPLETED');
  END IF;

  SELECT * INTO v_prot
    FROM public.protections
   WHERE id = v_task.protection_id
   FOR UPDATE;
  SELECT * INTO v_ts
    FROM public.company_task_settings
   WHERE company_id = v_task.company_id
     AND is_active = true;

  UPDATE public.protection_tasks
     SET status = 'completed', completed_at = v_now,
         completed_by = v_admin_id, execution_note = p_execution_note,
         updated_at = v_now
   WHERE id = p_task_id AND status <> 'completed';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'TASK_ALREADY_COMPLETED');
  END IF;

  IF v_task.amount > 0 THEN
    INSERT INTO public.transactions
      (customer_id, protection_id, task_id, transaction_type, amount, currency, created_by)
    VALUES
      (v_task.customer_id, v_task.protection_id, p_task_id, 'expense',
       v_task.amount, v_task.currency, v_admin_id);
  END IF;

  IF v_ts IS NOT NULL AND v_ts.enable_recurring_tasks THEN
    v_next_date := v_task.scheduled_at + (v_ts.task_interval_days || ' days')::interval;
    v_next_due := v_next_date + (v_ts.task_interval_days || ' days')::interval;
    v_next_num := v_task.task_number + 1;

    IF v_ts.allow_after_expiry THEN
      v_boundary := v_prot.end_at + (v_ts.max_days_after_expiry || ' days')::interval;
    ELSE
      v_boundary := v_prot.end_at;
    END IF;

    IF v_next_date <= v_boundary
       AND NOT EXISTS (
         SELECT 1 FROM public.protection_tasks
          WHERE protection_id = v_task.protection_id
            AND task_number = v_next_num
       ) THEN
      INSERT INTO public.protection_tasks (
        protection_id, customer_id, customer_number_id, company_id,
        task_number, task_type, amount, currency, scheduled_at, due_at,
        status, source_task_interval_days
      ) VALUES (
        v_task.protection_id, v_task.customer_id, v_task.customer_number_id, v_task.company_id,
        v_next_num, 'operational', v_ts.task_amount, v_ts.task_currency,
        v_next_date, v_next_due, 'scheduled', v_ts.task_interval_days
      ) RETURNING id INTO v_new_task_id;
    END IF;
  END IF;

  INSERT INTO public.audit_logs
    (actor_user_id, action, entity_type, entity_id, new_data)
  VALUES (
    v_admin_id, 'EXECUTE_TASK', 'protection_task', p_task_id::text,
    jsonb_build_object('completed_at', v_now, 'next_task_id', v_new_task_id)
  );

  RETURN jsonb_build_object('success', true, 'next_task_id', v_new_task_id);
END;
$function$;

/* ================================================================
   10. RESCHEDULE TASK
       New date becomes the baseline for subsequent future tasks.
       Example: day 5, interval 90 => 5,95,185,275...
   ================================================================ */
CREATE OR REPLACE FUNCTION public.rpc_reschedule_task(
  p_task_id uuid,
  p_new_scheduled_at timestamptz,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_admin_id uuid := auth.uid();
  v_task public.protection_tasks%ROWTYPE;
  v_future public.protection_tasks%ROWTYPE;
  v_ts public.company_task_settings%ROWTYPE;
  v_interval integer;
  v_new_date timestamptz;
  v_new_due timestamptz;
BEGIN
  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'UNAUTHORIZED');
  END IF;
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'FORBIDDEN');
  END IF;
  IF p_new_scheduled_at IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'VALIDATION_ERROR');
  END IF;

  SELECT * INTO v_task
    FROM public.protection_tasks
   WHERE id = p_task_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'NOT_FOUND');
  END IF;
  IF v_task.status = 'completed' THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'INVALID_STATE');
  END IF;

  SELECT * INTO v_ts
    FROM public.company_task_settings
   WHERE company_id = v_task.company_id
     AND is_active = true;
  IF v_ts IS NOT NULL AND NOT v_ts.allow_reschedule THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'RESCHEDULE_NOT_ALLOWED');
  END IF;

  v_interval := COALESCE(v_ts.task_interval_days, v_task.source_task_interval_days);
  IF v_interval IS NULL OR v_interval <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'CONFIGURATION_ERROR');
  END IF;

  v_new_date := p_new_scheduled_at;
  v_new_due := v_new_date + (v_interval || ' days')::interval;

  INSERT INTO public.task_reschedule_history (
    task_id, protection_id, old_scheduled_at, new_scheduled_at,
    old_due_at, new_due_at, old_interval_days, new_interval_days,
    reason, changed_by
  ) VALUES (
    p_task_id, v_task.protection_id, v_task.scheduled_at, v_new_date,
    v_task.due_at, v_new_due, v_task.source_task_interval_days,
    v_interval, p_reason, v_admin_id
  );

  UPDATE public.protection_tasks
     SET scheduled_at = v_new_date,
         due_at = v_new_due,
         source_task_interval_days = v_interval,
         updated_at = now()
   WHERE id = p_task_id;

  /* Rebuild only future, uncompleted tasks from the rescheduled task baseline. */
  FOR v_future IN
    SELECT *
      FROM public.protection_tasks
     WHERE protection_id = v_task.protection_id
       AND id <> p_task_id
       AND status <> 'completed'
       AND task_number > v_task.task_number
     ORDER BY task_number
     FOR UPDATE
  LOOP
    v_new_date := v_new_date + (v_interval || ' days')::interval;
    v_new_due := v_new_date + (v_interval || ' days')::interval;

    INSERT INTO public.task_reschedule_history (
      task_id, protection_id, old_scheduled_at, new_scheduled_at,
      old_due_at, new_due_at, old_interval_days, new_interval_days,
      reason, changed_by
    ) VALUES (
      v_future.id, v_future.protection_id, v_future.scheduled_at, v_new_date,
      v_future.due_at, v_new_due, v_future.source_task_interval_days,
      v_interval, COALESCE(p_reason, 'baseline_reschedule'), v_admin_id
    );

    UPDATE public.protection_tasks
       SET scheduled_at = v_new_date,
           due_at = v_new_due,
           source_task_interval_days = v_interval,
           updated_at = now()
     WHERE id = v_future.id;
  END LOOP;

  INSERT INTO public.audit_logs
    (actor_user_id, action, entity_type, entity_id, new_data)
  VALUES (
    v_admin_id, 'RESCHEDULE_TASK', 'protection_task', p_task_id::text,
    jsonb_build_object('new_date', p_new_scheduled_at,
                       'interval_days', v_interval,
                       'reason', p_reason)
  );

  RETURN jsonb_build_object('success', true);
END;
$function$;

/* ================================================================
   11. CUSTOMER-FACING CATALOG VISIBILITY
       Hide inactive/invisible records from customers while retaining
       historical records for managers/audit.
   ================================================================ */
DROP POLICY IF EXISTS companies_select_all ON public.companies;
CREATE POLICY companies_select_all
ON public.companies FOR SELECT
TO public
USING (is_active = true AND is_deleted = false);

DROP POLICY IF EXISTS packages_select_customer ON public.company_packages;
CREATE POLICY packages_select_customer
ON public.company_packages FOR SELECT
TO public
USING (is_active = true AND is_visible = true AND is_deleted = false);

DROP POLICY IF EXISTS prefixes_select_all ON public.company_prefixes;
CREATE POLICY prefixes_select_all
ON public.company_prefixes FOR SELECT
TO public
USING (is_active = true AND is_deleted = false);

DROP POLICY IF EXISTS pm_select_active ON public.payment_methods;
CREATE POLICY pm_select_active
ON public.payment_methods FOR SELECT
TO public
USING (is_active = true AND is_deleted = false);

/* Customer does not need internal task/subscription configuration. */
DROP POLICY IF EXISTS task_settings_select_all ON public.company_task_settings;
CREATE POLICY task_settings_select_admin
ON public.company_task_settings FOR SELECT
TO public
USING (is_admin());

DROP POLICY IF EXISTS sub_settings_select_all ON public.company_subscription_settings;
CREATE POLICY sub_settings_select_admin
ON public.company_subscription_settings FOR SELECT
TO public
USING (is_admin());

/* ================================================================
   12. TASK NUMBER CONCURRENCY GUARANTEE
   ================================================================ */
CREATE UNIQUE INDEX IF NOT EXISTS uq_protection_tasks_protection_task_number
ON public.protection_tasks (protection_id, task_number);

/* Existing duplicate active-protection indexes are intentionally not
   dropped here: this migration is conservative and preserves current
   protection guarantees. */

/* ================================================================
   13. GRANTS — RPCs are callable; underlying tables remain protected.
   ================================================================ */
GRANT EXECUTE ON FUNCTION public.rpc_update_customer_number_notes(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_verify_manual_payment(uuid,uuid,payment_verification_status_enum,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_create_protection_request(uuid,uuid,uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_approve_protection_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_create_renewal_request(uuid,uuid,uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_approve_renewal(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_execute_task(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_reschedule_task(uuid,timestamptz,text) TO authenticated;

COMMIT;

/* ================================================================
   POST-MIGRATION VERIFICATION QUERIES (READ ONLY)
   Run separately after applying the migration.
   ================================================================

SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname='public'
  AND tablename IN ('customer_numbers','protection_requests','protection_renewals',
                    'protections','manual_payment_logs')
ORDER BY tablename, policyname;

SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname='users_id_auth_users_fkey';

SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname='public'
  AND tablename='protection_tasks'
  AND indexname='uq_protection_tasks_protection_task_number';
*/
