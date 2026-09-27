import {
  RpcResult,
  CustomerNumber,
  ProtectionRequest,
  Protection,
  ProtectionRenewal,
  ProtectionTask,
  TelecomCompany,
  CompanyPackage,
  PaymentMethod,
  UserProfile,
  ManualPaymentLog,
  ClientNotification,
  AdminNotification,
  AuditLog
} from '../types/aman.ts';
import {
  INITIAL_COMPANIES,
  INITIAL_PREFIXES,
  INITIAL_PACKAGES,
  INITIAL_PAYMENT_METHODS,
  INITIAL_USERS,
  INITIAL_CUSTOMER_NUMBERS,
  INITIAL_PROTECTIONS,
  INITIAL_REQUESTS,
  INITIAL_PAYMENT_LOGS,
  INITIAL_TASKS,
  INITIAL_CLIENT_NOTIFICATIONS,
  INITIAL_ADMIN_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS
} from './mockData.ts';
import { supabase, isLiveSupabaseConfigured } from './supabaseClient.ts';

// In-Memory state for flawless local preview & seamless live Supabase fallback
class AmanDataStore {
  companies: TelecomCompany[] = [...INITIAL_COMPANIES];
  prefixes = [...INITIAL_PREFIXES];
  packages: CompanyPackage[] = [...INITIAL_PACKAGES];
  paymentMethods: PaymentMethod[] = [...INITIAL_PAYMENT_METHODS];
  users: UserProfile[] = [...INITIAL_USERS];
  customerNumbers: CustomerNumber[] = [...INITIAL_CUSTOMER_NUMBERS];
  protections: Protection[] = [...INITIAL_PROTECTIONS];
  requests: ProtectionRequest[] = [...INITIAL_REQUESTS];
  renewals: ProtectionRenewal[] = [];
  paymentLogs: ManualPaymentLog[] = [...INITIAL_PAYMENT_LOGS];
  tasks: ProtectionTask[] = [...INITIAL_TASKS];
  clientNotifications: ClientNotification[] = [...INITIAL_CLIENT_NOTIFICATIONS];
  adminNotifications: AdminNotification[] = [...INITIAL_ADMIN_NOTIFICATIONS];
  auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];

  currentUser: UserProfile = INITIAL_USERS[0]; // Default: Customer

  setCurrentUser(userId: string) {
    const found = this.users.find(u => u.id === userId);
    if (found) {
      this.currentUser = found;
    }
  }

  // Pure SQL normalize_phone replication
  normalizePhone(raw: string): string {
    let clean = raw.replace(/[^0-9]/g, '');
    if (clean.startsWith('00967')) {
      clean = clean.substring(5);
    } else if (clean.startsWith('967')) {
      clean = clean.substring(3);
    }
    if (clean.startsWith('0') && clean.length > 1) {
      clean = clean.substring(1);
    }
    return clean;
  }

  // Pure SQL detect_company_from_phone replication
  detectCompanyFromPhone(normalized: string) {
    const activePrefixes = this.prefixes.filter(p => p.is_active && !p.is_deleted);
    // Sort by prefix length descending
    const sorted = [...activePrefixes].sort((a, b) => b.prefix.length - a.prefix.length);
    for (const p of sorted) {
      if (normalized.startsWith(p.prefix)) {
        const company = this.companies.find(c => c.id === p.company_id && c.is_active && !c.is_deleted);
        if (company) {
          return { company_id: company.id, prefix: p.prefix, number_length: p.number_length, company };
        }
      }
    }
    return null;
  }

  // RPC: rpc_add_customer_number
  async rpcAddCustomerNumber(phone: string): Promise<RpcResult> {
    if (isLiveSupabaseConfigured()) {
      const { data, error } = await supabase.rpc('rpc_add_customer_number', { p_phone_number: phone });
      if (error) return { success: false, error_code: error.message };
      return data;
    }

    if (!this.currentUser) return { success: false, error_code: 'UNAUTHORIZED' };
    if (this.currentUser.user_type !== 'customer' || this.currentUser.status !== 'active') {
      return { success: false, error_code: 'FORBIDDEN' };
    }

    const normalized = this.normalizePhone(phone);
    if (normalized.length < 6) return { success: false, error_code: 'INVALID_PHONE' };

    const detected = this.detectCompanyFromPhone(normalized);
    if (!detected) return { success: false, error_code: 'COMPANY_NOT_FOUND' };

    if (detected.number_length && normalized.length !== detected.number_length) {
      return { success: false, error_code: 'INVALID_PHONE_LENGTH' };
    }

    // Check duplicate
    const exists = this.customerNumbers.some(
      n => n.customer_id === this.currentUser.id && n.normalized_phone_number === normalized && !n.is_deleted
    );
    if (exists) return { success: false, error_code: 'DUPLICATE_OPERATION' };

    const newId = `num-${Date.now()}`;
    const newNumber: CustomerNumber = {
      id: newId,
      customer_id: this.currentUser.id,
      phone_number: phone,
      normalized_phone_number: normalized,
      company_id: detected.company_id,
      detected_prefix: detected.prefix,
      status: 'active',
      notes: null,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.customerNumbers.unshift(newNumber);
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actor_user_id: this.currentUser.id,
      action: 'ADD_NUMBER',
      entity_type: 'customer_number',
      entity_id: newId,
      old_data: null,
      new_data: { phone: normalized, company_id: detected.company_id },
      metadata: null,
      created_at: new Date().toISOString()
    });

    return { success: true, id: newId };
  }

  // RPC: rpc_create_protection_request
  async rpcCreateProtectionRequest(
    customerNumberId: string,
    packageId: string,
    paymentMethodId: string,
    transferReference: string,
    customerNote?: string
  ): Promise<RpcResult> {
    if (isLiveSupabaseConfigured()) {
      const { data, error } = await supabase.rpc('rpc_create_protection_request', {
        p_customer_number_id: customerNumberId,
        p_package_id: packageId,
        p_payment_method_id: paymentMethodId,
        p_transfer_reference: transferReference,
        p_customer_note: customerNote || null
      });
      if (error) return { success: false, error_code: error.message };
      return data;
    }

    if (!this.currentUser) return { success: false, error_code: 'UNAUTHORIZED' };
    if (this.currentUser.user_type !== 'customer') return { success: false, error_code: 'FORBIDDEN' };
    if (!transferReference || transferReference.trim().length === 0) {
      return { success: false, error_code: 'VALIDATION_ERROR', message: 'رقم مرجع الحوالة إلزامي' };
    }

    const cn = this.customerNumbers.find(
      n => n.id === customerNumberId && n.customer_id === this.currentUser.id && !n.is_deleted && n.status === 'active'
    );
    if (!cn) return { success: false, error_code: 'NOT_FOUND' };

    // Re-detect company
    const detected = this.detectCompanyFromPhone(cn.normalized_phone_number);
    if (!detected) return { success: false, error_code: 'COMPANY_NOT_FOUND' };

    const pkg = this.packages.find(
      p => p.id === packageId && p.company_id === detected.company_id && p.is_active && p.is_visible && !p.is_deleted
    );
    if (!pkg) return { success: false, error_code: 'PACKAGE_UNAVAILABLE' };

    const pm = this.paymentMethods.find(m => m.id === paymentMethodId && m.is_active && !m.is_deleted);
    if (!pm) return { success: false, error_code: 'PAYMENT_METHOD_UNAVAILABLE' };

    // Check active protection exists
    const hasActiveProt = this.protections.some(
      p => p.customer_number_id === customerNumberId && p.status === 'active' && !p.is_deleted
    );
    if (hasActiveProt) return { success: false, error_code: 'ACTIVE_PROTECTION_EXISTS' };

    const newReqId = `req-${Date.now()}`;
    const newReq: ProtectionRequest = {
      id: newReqId,
      customer_id: this.currentUser.id,
      customer_number_id: customerNumberId,
      company_id: detected.company_id,
      package_id: packageId,
      payment_method_id: paymentMethodId,
      status: 'pending',
      requested_price: pkg.price,
      requested_currency: pkg.currency,
      requested_duration_days: pkg.duration_days,
      payment_transfer_reference: transferReference.trim(),
      customer_note: customerNote || null,
      rejection_reason: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.requests.unshift(newReq);

    // Create pending manual payment log
    this.paymentLogs.unshift({
      id: `log-${Date.now()}`,
      request_id: newReqId,
      renewal_id: null,
      payment_method_id: paymentMethodId,
      transfer_reference: transferReference.trim(),
      amount: pkg.price,
      verification_status: 'pending',
      verified_by: null,
      verified_at: null,
      verification_note: null,
      created_at: new Date().toISOString()
    });

    // Admin Notification
    this.adminNotifications.unshift({
      id: `anotif-${Date.now()}`,
      notification_type: 'new_request',
      title: 'طلب حماية جديد',
      body: `تم إرسال طلب حماية جديد للرقم ${cn.phone_number} بقيمة ${pkg.price} ${pkg.currency}`,
      related_request_id: newReqId,
      related_protection_id: null,
      related_task_id: null,
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return { success: true, id: newReqId };
  }

  // RPC: rpc_verify_manual_payment (Matching the exact newly pushed logic!)
  async rpcVerifyManualPayment(
    requestId?: string,
    renewalId?: string,
    status: 'verified' | 'rejected' = 'verified',
    note?: string
  ): Promise<RpcResult> {
    if (isLiveSupabaseConfigured()) {
      const { data, error } = await supabase.rpc('rpc_verify_manual_payment', {
        p_request_id: requestId || null,
        p_renewal_id: renewalId || null,
        p_verification_status: status,
        p_verification_note: note || null
      });
      if (error) return { success: false, error_code: error.message };
      return data;
    }

    if (!this.currentUser) return { success: false, error_code: 'UNAUTHORIZED' };
    if (this.currentUser.user_type !== 'admin') return { success: false, error_code: 'FORBIDDEN' };
    if (!requestId && !renewalId) return { success: false, error_code: 'VALIDATION_ERROR' };

    if (requestId) {
      const req = this.requests.find(r => r.id === requestId);
      if (!req) return { success: false, error_code: 'NOT_FOUND' };
      if (req.status !== 'pending') {
        return {
          success: false,
          error_code: 'INVALID_STATE',
          message: 'لا يمكن التحقق المالي إلا عندما يكون الطلب معلقاً (Pending).'
        };
      }

      const logId = `log-${Date.now()}`;
      // In new SQL: Insert cumulative log record
      this.paymentLogs.unshift({
        id: logId,
        request_id: requestId,
        renewal_id: null,
        payment_method_id: req.payment_method_id,
        transfer_reference: req.payment_transfer_reference,
        amount: req.requested_price,
        verification_status: status,
        verified_by: this.currentUser.id,
        verified_at: new Date().toISOString(),
        verification_note: note || null,
        created_at: new Date().toISOString()
      });

      return { success: true, manual_payment_log_id: logId };
    }

    if (renewalId) {
      const renewal = this.renewals.find(r => r.id === renewalId);
      if (!renewal) return { success: false, error_code: 'NOT_FOUND' };
      if (renewal.status !== 'pending') {
        return {
          success: false,
          error_code: 'INVALID_STATE',
          message: 'لا يمكن التحقق المالي إلا عندما يكون التجديد معلقاً (Pending).'
        };
      }

      const logId = `log-${Date.now()}`;
      this.paymentLogs.unshift({
        id: logId,
        request_id: null,
        renewal_id: renewalId,
        payment_method_id: renewal.payment_method_id,
        transfer_reference: renewal.payment_transfer_reference,
        amount: renewal.price_snapshot,
        verification_status: status,
        verified_by: this.currentUser.id,
        verified_at: new Date().toISOString(),
        verification_note: note || null,
        created_at: new Date().toISOString()
      });

      return { success: true, manual_payment_log_id: logId };
    }

    return { success: false, error_code: 'VALIDATION_ERROR' };
  }

  // RPC: rpc_approve_protection_request
  async rpcApproveProtectionRequest(requestId: string): Promise<RpcResult> {
    if (isLiveSupabaseConfigured()) {
      const { data, error } = await supabase.rpc('rpc_approve_protection_request', { p_request_id: requestId });
      if (error) return { success: false, error_code: error.message };
      return data;
    }

    if (!this.currentUser) return { success: false, error_code: 'UNAUTHORIZED' };
    if (this.currentUser.user_type !== 'admin') return { success: false, error_code: 'FORBIDDEN' };

    const req = this.requests.find(r => r.id === requestId);
    if (!req) return { success: false, error_code: 'NOT_FOUND' };
    if (req.status !== 'pending') return { success: false, error_code: 'INVALID_STATE' };

    // Mandatory payment check!
    const verifiedLog = this.paymentLogs.find(
      l => l.request_id === requestId && l.verification_status === 'verified'
    );
    if (!verifiedLog) {
      return {
        success: false,
        error_code: 'PAYMENT_NOT_VERIFIED',
        message: 'يجب تأكيد التحويل المالي من قبل الإدارة أولاً قبل قبول الطلب.'
      };
    }

    const cn = this.customerNumbers.find(n => n.id === req.customer_number_id);
    if (!cn) return { success: false, error_code: 'INVALID_NUMBER' };

    // Check if active protection exists
    if (this.protections.some(p => p.customer_number_id === req.customer_number_id && p.status === 'active' && !p.is_deleted)) {
      return { success: false, error_code: 'ACTIVE_PROTECTION_EXISTS' };
    }

    const pkg = this.packages.find(p => p.id === req.package_id);
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + req.requested_duration_days * 86400000);

    const newProtId = `prot-${Date.now()}`;
    const newProt: Protection = {
      id: newProtId,
      customer_id: req.customer_id,
      customer_number_id: req.customer_number_id,
      company_id: req.company_id,
      source_request_id: req.id,
      package_id: req.package_id,
      package_name_snapshot: pkg ? pkg.name_ar : 'باقة حماية',
      price_snapshot: req.requested_price,
      currency_snapshot: req.requested_currency,
      duration_days_snapshot: req.requested_duration_days,
      task_amount_snapshot: 500,
      task_interval_days_snapshot: 25,
      task_currency_snapshot: 'YER',
      start_at: startDate.toISOString(),
      end_at: endDate.toISOString(),
      status: 'active',
      renewal_count: 0,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.protections.unshift(newProt);

    // Update request state
    req.status = 'approved';
    req.reviewed_by = this.currentUser.id;
    req.reviewed_at = new Date().toISOString();
    req.updated_at = new Date().toISOString();

    // Generate first scheduled tasks
    const firstTaskDate = new Date(startDate.getTime() + 25 * 86400000);
    this.tasks.unshift({
      id: `task-${Date.now()}-1`,
      protection_id: newProtId,
      customer_id: req.customer_id,
      customer_number_id: req.customer_number_id,
      company_id: req.company_id,
      task_number: 1,
      task_type: 'operational',
      amount: 500,
      currency: 'YER',
      scheduled_at: firstTaskDate.toISOString(),
      due_at: new Date(firstTaskDate.getTime() + 25 * 86400000).toISOString(),
      status: 'scheduled',
      completed_at: null,
      completed_by: null,
      execution_note: null,
      source_task_interval_days: 25,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Notify Customer
    this.clientNotifications.unshift({
      id: `cnotif-${Date.now()}`,
      user_id: req.customer_id,
      notification_type: 'request_approved',
      title: 'تم قبول طلب الحماية وتفعيل الخدمة',
      body: `تم تفعيل حماية الرقم ${cn.phone_number} بنجاح حتى تاريخ ${endDate.toLocaleDateString('ar-YE')}.`,
      related_request_id: req.id,
      related_protection_id: newProtId,
      related_task_id: null,
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return { success: true, id: newProtId };
  }

  // RPC: rpc_reject_protection_request
  async rpcRejectProtectionRequest(requestId: string, reason: string): Promise<RpcResult> {
    if (isLiveSupabaseConfigured()) {
      const { data, error } = await supabase.rpc('rpc_reject_protection_request', {
        p_request_id: requestId,
        p_rejection_reason: reason
      });
      if (error) return { success: false, error_code: error.message };
      return data;
    }

    if (!this.currentUser) return { success: false, error_code: 'UNAUTHORIZED' };
    if (this.currentUser.user_type !== 'admin') return { success: false, error_code: 'FORBIDDEN' };
    if (!reason || reason.trim().length === 0) return { success: false, error_code: 'VALIDATION_ERROR' };

    const req = this.requests.find(r => r.id === requestId);
    if (!req) return { success: false, error_code: 'NOT_FOUND' };
    if (req.status !== 'pending') return { success: false, error_code: 'INVALID_STATE' };

    req.status = 'rejected';
    req.rejection_reason = reason.trim();
    req.reviewed_by = this.currentUser.id;
    req.reviewed_at = new Date().toISOString();
    req.updated_at = new Date().toISOString();

    // Client notification
    this.clientNotifications.unshift({
      id: `cnotif-${Date.now()}`,
      user_id: req.customer_id,
      notification_type: 'request_rejected',
      title: 'تم رفض طلب الحماية',
      body: `تم رفض طلب حماية الرقم. سبب الرفض: ${reason.trim()}`,
      related_request_id: req.id,
      related_protection_id: null,
      related_task_id: null,
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return { success: true };
  }

  // RPC: rpc_create_renewal_request
  async rpcCreateRenewalRequest(
    protectionId: string,
    packageId: string,
    paymentMethodId: string,
    transferReference: string
  ): Promise<RpcResult> {
    if (isLiveSupabaseConfigured()) {
      const { data, error } = await supabase.rpc('rpc_create_renewal_request', {
        p_protection_id: protectionId,
        p_package_id: packageId,
        p_payment_method_id: paymentMethodId,
        p_transfer_reference: transferReference
      });
      if (error) return { success: false, error_code: error.message };
      return data;
    }

    if (!this.currentUser) return { success: false, error_code: 'UNAUTHORIZED' };
    if (this.currentUser.user_type !== 'customer') return { success: false, error_code: 'FORBIDDEN' };

    const prot = this.protections.find(
      p => p.id === protectionId && p.customer_id === this.currentUser.id && p.status === 'active' && !p.is_deleted
    );
    if (!prot) return { success: false, error_code: 'NOT_FOUND' };

    const pkg = this.packages.find(
      p => p.id === packageId && p.company_id === prot.company_id && p.is_active && !p.is_deleted
    );
    if (!pkg) return { success: false, error_code: 'PACKAGE_UNAVAILABLE' };

    const pm = this.paymentMethods.find(m => m.id === paymentMethodId && m.is_active && !m.is_deleted);
    if (!pm) return { success: false, error_code: 'PAYMENT_METHOD_UNAVAILABLE' };

    const newRenewalId = `ren-${Date.now()}`;
    const newRenewal: ProtectionRenewal = {
      id: newRenewalId,
      protection_id: protectionId,
      customer_id: this.currentUser.id,
      package_id: packageId,
      price_snapshot: pkg.price,
      currency_snapshot: pkg.currency,
      duration_days_snapshot: pkg.duration_days,
      previous_end_at: prot.end_at,
      new_end_at: null,
      payment_method_id: paymentMethodId,
      payment_transfer_reference: transferReference.trim(),
      status: 'pending',
      rejection_reason: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.renewals.unshift(newRenewal);

    // Insert pending payment log
    this.paymentLogs.unshift({
      id: `log-${Date.now()}`,
      request_id: null,
      renewal_id: newRenewalId,
      payment_method_id: paymentMethodId,
      transfer_reference: transferReference.trim(),
      amount: pkg.price,
      verification_status: 'pending',
      verified_by: null,
      verified_at: null,
      verification_note: null,
      created_at: new Date().toISOString()
    });

    // Admin notification
    this.adminNotifications.unshift({
      id: `anotif-${Date.now()}`,
      notification_type: 'new_renewal',
      title: 'طلب تجديد حماية جديد',
      body: `تم استلام طلب تجديد حماية بقيمة ${pkg.price} ${pkg.currency}`,
      related_request_id: null,
      related_protection_id: protectionId,
      related_task_id: null,
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return { success: true, id: newRenewalId };
  }

  // RPC: rpc_execute_task
  async rpcExecuteTask(taskId: string, executionNote?: string): Promise<RpcResult> {
    if (isLiveSupabaseConfigured()) {
      const { data, error } = await supabase.rpc('rpc_execute_task', {
        p_task_id: taskId,
        p_execution_note: executionNote || null
      });
      if (error) return { success: false, error_code: error.message };
      return data;
    }

    if (!this.currentUser) return { success: false, error_code: 'UNAUTHORIZED' };
    if (this.currentUser.user_type !== 'admin') return { success: false, error_code: 'FORBIDDEN' };

    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return { success: false, error_code: 'NOT_FOUND' };
    if (task.status === 'completed') return { success: false, error_code: 'TASK_ALREADY_COMPLETED' };

    task.status = 'completed';
    task.completed_at = new Date().toISOString();
    task.completed_by = this.currentUser.id;
    task.execution_note = executionNote || null;
    task.updated_at = new Date().toISOString();

    return { success: true };
  }

  // RPC: rpc_mark_notification_read
  async rpcMarkNotificationRead(notificationId: string): Promise<RpcResult> {
    const notif = this.clientNotifications.find(n => n.id === notificationId && n.user_id === this.currentUser.id);
    if (notif) {
      notif.is_read = true;
      notif.read_at = new Date().toISOString();
      return { success: true };
    }
    return { success: false, error_code: 'NOT_FOUND' };
  }

  // RPC: rpc_mark_admin_notification_read
  async rpcMarkAdminNotificationRead(notificationId: string): Promise<RpcResult> {
    const notif = this.adminNotifications.find(n => n.id === notificationId);
    if (notif) {
      notif.is_read = true;
      notif.read_at = new Date().toISOString();
      return { success: true };
    }
    return { success: false, error_code: 'NOT_FOUND' };
  }
}

export const amanStore = new AmanDataStore();
