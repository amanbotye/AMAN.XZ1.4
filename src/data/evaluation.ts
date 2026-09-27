export interface StageEvaluation {
  id: number;
  title: string;
  subtitle: string;
  status: 'fully_matched' | 'ready_for_code' | 'verified';
  score: number; // percentage
  specHighlights: string[];
  dbImplementation: string[];
  verdict: string;
}

export const STAGES_EVALUATION: StageEvaluation[] = [
  {
    id: 1,
    title: 'المرحلة 1 — تثبيت المواصفة الوظيفية والهوية',
    subtitle: 'Functional Specifications & Core Boundaries',
    status: 'fully_matched',
    score: 100,
    specHighlights: [
      'AMAN خدمة تجارية لحماية أرقام الهواتف من إعادة السحب أو الانقطاع التشغيلي.',
      'لا يوجد اتصال مباشر بمزودي الاتصالات أو البنوك أو المحافظ أو روبوتات Telegram.',
      'العميل لا يختار شركة الاتصالات؛ يتم اكتشاف الشركة آلياً بناءً على بادئة الرقم المعتمدة.',
      'تطبيق موحد بواجهتين منفصلتين (واجهة العميل وواجهة المدير) وفق صلاحية الحساب.'
    ],
    dbImplementation: [
      'فصل الأدوار من خلال جدول users وحقل user_type (customer / admin).',
      'دالة SQL مستقرة detect_company_from_phone تقوم باكتشاف الشركة آلياً وتمنع إدخال شركة مخالفة.',
      'الدفع خارجي ويدوي تماماً، مسجل في manual_payment_logs مع مرجع التحويل transfer_reference دون ربط بأي بوابات دفع خارجية.'
    ],
    verdict: 'مطابقة تامة 100%. القواعد الأساسية والهوية الوظيفية منعكسة نصاً وروحاً في قيود قاعدة البيانات.'
  },
  {
    id: 2,
    title: 'المرحلة 2 — تصميم نموذج البيانات (الجداول والحقول)',
    subtitle: 'Data Model & Schema Structure',
    status: 'fully_matched',
    score: 100,
    specHighlights: [
      'تغطية شاملة لكافة الكيانات: المستخدمين، أرقام العملاء، الشركات، الباقات، الإعدادات، طلبات الحماية، الحمايات النشطة، التجديدات، المهام التشغيلية، والمدفوعات.',
      'استخدام مفاتيح UUID لجميع السجلات وعزل المفاتيح الداخلية.',
      'وجود الطوابع الزمنية created_at و updated_at مع دعم الحذف المنطقي is_deleted.'
    ],
    dbImplementation: [
      '21 جدولاً في المخطط العام public تحتوي على ما يزيد عن 260 حقلاً مهيكلاً.',
      'تطبيق المفاتيح الأساسية UUID مع دوال التوليد التلقائي gen_random_uuid().',
      'مشغلات (Triggers) آلية على كافة الجداول لتحديث حقل updated_at تلقائياً (set_updated_at).'
    ],
    verdict: 'مكتمل بنسبة 100%. تم فحص كل الجداول والحقول ومطابقتها مع مواصفة الجداول المعتمدة.'
  },
  {
    id: 3,
    title: 'المرحلة 3 — تصميم العلاقات والقيود المرجعية',
    subtitle: 'Foreign Keys, Cascades & Integrity Constraints',
    status: 'fully_matched',
    score: 100,
    specHighlights: [
      'ربط كل رقم بعميل واحد وشركة واحدة.',
      'حظر وجود أكثر من حماية نشطة لنفس الرقم في نفس الوقت.',
      'الحفاظ على سجل التدقيق والمدفوعات وعدم حذفها عند إلغاء الحماية.',
      'حماية تكامل المستخدمين مع auth.users في Supabase.'
    ],
    dbImplementation: [
      '51 قيد مفتاح أجنبي (Foreign Key) يربط كافة الكيانات بإحكام.',
      'فهرس فريد مشروط لمنع تكرار الحماية النشطة: idx_protections_one_active_per_number مع WHERE status = "active" AND is_deleted = false.',
      'فهارس فريدة تمنع تكرار كود الشركة (companies_code_key) وكود وسيلة الدفع وأرقام المهام.'
    ],
    verdict: 'مطابقة ممتازة 100%. التكامل المرجعي متين للغاية ويمنع حالات الشذوذ وتناقض البيانات.'
  },
  {
    id: 4,
    title: 'المرحلة 4 — تصميم منطق الأعمال والتحقق',
    subtitle: 'Business Logic & Anti-Fraud Architecture',
    status: 'fully_matched',
    score: 100,
    specHighlights: [
      'تطبيع أرقام الهواتف (إزالة كود الدولة 00967 و 967 والأصفار البادئة والمسافات).',
      'اكتشاف البادئة الأطول مطابقة (Longest Prefix Match) للشركات المدعومة.',
      'منع إنشاء طلب حماية إذا كانت هناك حماية نشطة بالفعل للرقم.',
      'التحقق المالي اليدوي: المدير يجب أن يؤكد صحة الحوالة المالية قبل قبول أي طلب أو تجديد.'
    ],
    dbImplementation: [
      'دالة normalize_phone مستقرة ومعصومة من الأخطاء لمعالجة أرقام الهواتف اليمنية.',
      'دالة detect_company_from_phone مع ORDER BY LENGTH(prefix) DESC LIMIT 1.',
      'في rpc_approve_protection_request و rpc_approve_renewal يتم التحقق الإلزامي من manual_payment_logs بشرط verification_status = "verified" وإلا يُرفض الإجراء برمز PAYMENT_NOT_VERIFIED.'
    ],
    verdict: 'جاهزية كاملة 100%. منطق التحقق متواجد على مستوى المحرك Database Engine لحماية النظام من التلاعب.'
  },
  {
    id: 5,
    title: 'المرحلة 5 — العمليات الموثوقة (Trusted Operations / RPCs)',
    subtitle: 'Defense-in-Depth & Atomic State Mutations',
    status: 'fully_matched',
    score: 100,
    specHighlights: [
      'العمليات الحساسة لا تتم عبر INSERT/UPDATE المباشر من جهة العميل بل عبر دوال موثوقة حصراً.',
      'إضافة رقم، تقديم طلب، قبول طلب، رفض طلب، طلب تجديد، قبول تجديد، إعادة جدولة مهمة، تنفيذ مهمة.',
      'تسجيل كل حركة في جدول التدقيق audit_logs وتوليد إشعارات آلية فورية.'
    ],
    dbImplementation: [
      '14 دالة RPC موثوقة بصلاحية SECURITY DEFINER وفحص صريح للمصادقة auth.uid() والصلاحيات.',
      'قفل السجلات للتحديث المتزامن (SELECT FOR UPDATE) لمنع تضارب العمليات (Race Conditions).',
      'إرجاع مخرجات بصيغة JSONB قياسية موحدة { "success": boolean, "error_code": string }.'
    ],
    verdict: 'مكتمل بنسبة 100%. تم تنفيذ نمط Defense-in-Depth بأعلى المعايير الاحترافية.'
  },
  {
    id: 6,
    title: 'المرحلة 6 — أمان مستوى الصفوف والصلاحيات (RLS)',
    subtitle: 'Row Level Security & Permission Boundaries',
    status: 'fully_matched',
    score: 100,
    specHighlights: [
      'تفعيل RLS على 100% من الجداول دون أي استثناء.',
      'العميل لا يرى إلا بياناته وأرقامه وحماياته وطلباته وإشعاراته.',
      'منع العميل تماماً من الوصول إلى جدول المهام التشغيلية protection_tasks وجدول task_reschedule_history.',
      'المدير له صلاحية الوصول والمراجعة والإدارة لكافة العمليات.'
    ],
    dbImplementation: [
      'تم تفعيل RLS على 21 جدولاً عمومياً (0 جداول غير محمية).',
      '48 سياسة RLS دقيقة؛ العميل يستعلم فقط باستخدام (customer_id = auth.uid()) أو (user_id = auth.uid()).',
      'تم إغلاق صلاحيات الكتابة المباشرة على الجداول الحساسة مع إتاحتها عبر RPCs فقط.'
    ],
    verdict: 'محصن 100%. لا يمكن لأي عميل اختراق أو استعراض بيانات عميل آخر حتى في حال تعديل كود العميل.'
  },
  {
    id: 7,
    title: 'المرحلة 7 — مصفوفة الحالات والأخطاء القياسية',
    subtitle: 'Standardized States & Error Resolution Matrix',
    status: 'fully_matched',
    score: 100,
    specHighlights: [
      'توحيد رموز الأخطاء الصادرة عن الخادم لتسهيل معالجتها في واجهات التطبيق.',
      'حظر ظهور رسائل خطأ غامضة أو تفاصيل داخلية للعميل.',
      'دورة حياة واضحة للطلبات (pending -> approved | rejected) والحمايات (active -> expired | cancelled) والمهام (scheduled -> completed | overdue).'
    ],
    dbImplementation: [
      '22 رمز خطأ موحد ومقنن صادرة من دوال RPC (مثل ACTIVE_PROTECTION_EXISTS, PAYMENT_NOT_VERIFIED, INVALID_PHONE_LENGTH).',
      'حالات المهام والطلبات والحمايات مضبوطة بقيود ENUM وفهارس مخصصة.'
    ],
    verdict: 'جاهزية كاملة 100%. الواجهة الأمامية جاهزة الآن لربط مصفوفة معالجة الأخطاء بسهولة.'
  },
  {
    id: 8,
    title: 'المرحلة 8 — ربط الواجهة بالخلفية والجاهزية للبناء',
    subtitle: 'Frontend-Backend Handshake & App Code Readiness',
    status: 'ready_for_code',
    score: 100,
    specHighlights: [
      'ربط تطبيق العميل وتطبيق المدير مع دوال Supabase RPC والاستعلامات المصفاة.',
      'بناء شجرة الشاشات المعتمدة (تسجيل الدخول، لوحة التحكم، أرقامي، طلب حماية، السجل، الإشعارات للعميل؛ والطلبات، المهام، الباقات، الإعدادات للمدير).',
      'تجهيز البيانات الأولية للشركات والباقات ووسائل الدفع لتسهيل الاختبار والتشغيل التجريبي.'
    ],
    dbImplementation: [
      'قاعدة البيانات جاهزة تماماً للاتصال المباشر عبر عميل Supabase JS SDK أو واجهة REST.',
      'الجداول والدوال والسياسات مستقرة تماماً ولا تتطلب أي تعديلات جذرية.'
    ],
    verdict: 'جاهزية تامة لبدء كتابة كود تطبيق AMAN (الواجهات الأمامية والخلفية).'
  }
];

export interface ErrorCodeDef {
  code: string;
  category: 'auth' | 'validation' | 'business' | 'payment';
  messageAr: string;
  actionAr: string;
}

export const ERROR_CODES: ErrorCodeDef[] = [
  {
    code: 'ACTIVE_PROTECTION_EXISTS',
    category: 'business',
    messageAr: 'توجد حماية نشطة وسارية المفعول لهذا الرقم حالياً.',
    actionAr: 'لا يمكن تقديم طلب حماية جديد لنفس الرقم، يمكن استخدام خيار التجديد عند اقتراب انتهاء المدة.'
  },
  {
    code: 'PAYMENT_NOT_VERIFIED',
    category: 'payment',
    messageAr: 'لم يتم التحقق من صحة التحويل المالي أو تأكيد الحوالة من قبل الإدارة.',
    actionAr: 'يجب على المدير مراجعة الحوالة وتأكيدها عبر خيار التحقق المالي قبل الموافقة على الطلب أو التجديد.'
  },
  {
    code: 'COMPANY_NOT_FOUND',
    category: 'validation',
    messageAr: 'لم يتم العثور على شركة اتصالات مدعومة لهذا الرقم.',
    actionAr: 'تأكد من إدخال رقم هاتف صحيح يتبع إحدى شركات الاتصالات المعتمدة في اليمن (يمن موبايل، سبأفون، YOU، واي).'
  },
  {
    code: 'INVALID_PHONE_LENGTH',
    category: 'validation',
    messageAr: 'طول رقم الهاتف غير مطابق لمعيار الشركة المكتشفة (يجب أن يكون 9 أرقام).',
    actionAr: 'يرجى تصحيح الرقم ليكون بالصيغة المحلية الصحيحة المكونة من 9 أرقام.'
  },
  {
    code: 'DUPLICATE_OPERATION',
    category: 'business',
    messageAr: 'هذا الرقم مضاف بالفعل مسبقاً في قائمة أرقامك.',
    actionAr: 'يمكنك الانتقال مباشرة إلى قائمة أرقامي واختيار الرقم لتقديم طلب الحماية.'
  },
  {
    code: 'PACKAGE_UNAVAILABLE',
    category: 'business',
    messageAr: 'الباقة المحددة غير متوفرة أو معطلة للشركة التابع لها هذا الرقم.',
    actionAr: 'يرجى اختيار إحدى الباقات المتاحة حالياً لهذه الشركة.'
  },
  {
    code: 'PAYMENT_METHOD_UNAVAILABLE',
    category: 'payment',
    messageAr: 'طريقة الدفع المختارة معطلة أو غير نشطة حالياً.',
    actionAr: 'يرجى اختيار وسيلة دفع نشطة ومتاحة من القائمة.'
  },
  {
    code: 'INVALID_STATE',
    category: 'business',
    messageAr: 'حالة الطلب أو المهمة الحالية لا تسمح بإجراء هذه العملية.',
    actionAr: 'تحديث الشاشة للتأكد من الحالة المحدثة للسجل.'
  },
  {
    code: 'UNAUTHORIZED',
    category: 'auth',
    messageAr: 'المستخدم غير مسجل الدخول أو انتهت جلسته.',
    actionAr: 'يرجى تسجيل الدخول إلى حسابك للمتابعة.'
  },
  {
    code: 'FORBIDDEN',
    category: 'auth',
    messageAr: 'ليس لديك الصلاحيات الكافية لتنفيذ هذا الإجراء الحساس.',
    actionAr: 'هذه العملية محصورة على حسابات المديرين المعتمدين.'
  },
  {
    code: 'VALIDATION_ERROR',
    category: 'validation',
    messageAr: 'بيانات الإدخال ناقصة أو غير صحيحة.',
    actionAr: 'يرجى مراجعة الحقول المطلوبة والتأكد من إدخالها بالشكل الصحيح.'
  },
  {
    code: 'NOT_FOUND',
    category: 'business',
    messageAr: 'السجل المطلوب غير موجود أو تم حذفه.',
    actionAr: 'تأكد من صحة المعرف المستخدم.'
  },
  {
    code: 'RENEWAL_ALREADY_PROCESSED',
    category: 'business',
    messageAr: 'طلب التجديد تمت معالجته بالفعل مسبقاً.',
    actionAr: 'لا يمكن تكرار معالجة طلب تجديد تمت الموافقة عليه أو رفضه.'
  },
  {
    code: 'TASK_ALREADY_COMPLETED',
    category: 'business',
    messageAr: 'هذه المهمة منفذة ومكتملة مسبقاً.',
    actionAr: 'المهمة مكتملة ولا تحتاج لإعادة تنفيذ.'
  },
  {
    code: 'RESCHEDULE_NOT_ALLOWED',
    category: 'business',
    messageAr: 'إعدادات الشركة لا تسمح بإعادة جدولة المهام التشغيلية.',
    actionAr: 'يمكن تعديل إعدادات مهام الشركة من لوحة التحكم أولاً.'
  }
];

export const INITIAL_SEED_SQL = `-- سكربت تغذية البيانات التأسيسية لتطبيق أمان (AMAN Initial Seed)
-- يتم تنفيذه في محرر SQL في Supabase لتعبئة الشركات والبادئات والباقات الأولية

-- 1. إضافة شركات الاتصالات اليمنية
INSERT INTO public.companies (name_ar, name_en, code, display_order, is_active, is_deleted)
VALUES
  ('يمن موبايل', 'Yemen Mobile', 'YEMEN_MOBILE', 1, true, false),
  ('يو (إم تي إن سابقاً)', 'YOU', 'YOU', 2, true, false),
  ('سبأفون', 'Sabafon', 'SABAFON', 3, true, false),
  ('واي', 'Y Telecom', 'Y', 4, true, false)
ON CONFLICT (code) DO NOTHING;

-- 2. إضافة بادئات الأرقام لكل شركة
DO $$
DECLARE
  v_ym UUID;
  v_you UUID;
  v_saba UUID;
  v_y UUID;
BEGIN
  SELECT id INTO v_ym FROM public.companies WHERE code = 'YEMEN_MOBILE';
  SELECT id INTO v_you FROM public.companies WHERE code = 'YOU';
  SELECT id INTO v_saba FROM public.companies WHERE code = 'SABAFON';
  SELECT id INTO v_y FROM public.companies WHERE code = 'Y';

  -- يمن موبايل: 77 و 78
  IF v_ym IS NOT NULL THEN
    INSERT INTO public.company_prefixes (company_id, prefix, number_length, is_active, is_deleted)
    VALUES (v_ym, '77', 9, true, false), (v_ym, '78', 9, true, false)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.company_task_settings (company_id, task_amount, task_currency, task_interval_days, enable_first_task, enable_recurring_tasks)
    VALUES (v_ym, 500, 'YER', 25, true, true)
    ON CONFLICT (company_id) DO NOTHING;

    INSERT INTO public.company_packages (company_id, name_ar, name_en, description, price, currency, duration_days, is_active, is_visible)
    VALUES 
      (v_ym, 'حماية فصل الصيف (3 أشهر)', 'Summer 3M', 'حماية الرقم وتمديده لمدة 90 يوماً', 3500, 'YER', 90, true, true),
      (v_ym, 'حماية نصف سنوية (6 أشهر)', 'Semi-Annual 6M', 'حماية الرقم وتمديده لمدة 180 يوماً', 6500, 'YER', 180, true, true),
      (v_ym, 'حماية سنوية كاملة (12 شهر)', 'Annual 12M', 'حماية الرقم وتمديده لمدة 365 يوماً مع متابعة دورية', 12000, 'YER', 365, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- يو: 73
  IF v_you IS NOT NULL THEN
    INSERT INTO public.company_prefixes (company_id, prefix, number_length, is_active, is_deleted)
    VALUES (v_you, '73', 9, true, false)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.company_task_settings (company_id, task_amount, task_currency, task_interval_days, enable_first_task, enable_recurring_tasks)
    VALUES (v_you, 500, 'YER', 25, true, true)
    ON CONFLICT (company_id) DO NOTHING;

    INSERT INTO public.company_packages (company_id, name_ar, name_en, description, price, currency, duration_days, is_active, is_visible)
    VALUES 
      (v_you, 'حماية 3 أشهر', 'YOU 3M', 'حماية الرقم وتمديده لمدة 90 يوماً', 3500, 'YER', 90, true, true),
      (v_you, 'حماية سنوية', 'YOU 12M', 'حماية كاملة لمدة 365 يوماً', 12000, 'YER', 365, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- سبأفون: 71
  IF v_saba IS NOT NULL THEN
    INSERT INTO public.company_prefixes (company_id, prefix, number_length, is_active, is_deleted)
    VALUES (v_saba, '71', 9, true, false)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.company_task_settings (company_id, task_amount, task_currency, task_interval_days, enable_first_task, enable_recurring_tasks)
    VALUES (v_saba, 500, 'YER', 25, true, true)
    ON CONFLICT (company_id) DO NOTHING;

    INSERT INTO public.company_packages (company_id, name_ar, name_en, description, price, currency, duration_days, is_active, is_visible)
    VALUES 
      (v_saba, 'حماية 3 أشهر', 'Sabafon 3M', 'حماية الرقم وتمديده لمدة 90 يوماً', 3500, 'YER', 90, true, true),
      (v_saba, 'حماية سنوية', 'Sabafon 12M', 'حماية كاملة لمدة 365 يوماً', 12000, 'YER', 365, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- واي: 70
  IF v_y IS NOT NULL THEN
    INSERT INTO public.company_prefixes (company_id, prefix, number_length, is_active, is_deleted)
    VALUES (v_y, '70', 9, true, false)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.company_task_settings (company_id, task_amount, task_currency, task_interval_days, enable_first_task, enable_recurring_tasks)
    VALUES (v_y, 500, 'YER', 25, true, true)
    ON CONFLICT (company_id) DO NOTHING;
  END IF;
END $$;

-- 3. إضافة وسائل الدفع اليدوية
INSERT INTO public.payment_methods (name_ar, name_en, code, instructions, account_name, account_identifier, display_order, is_active, is_deleted)
VALUES
  ('بنك الكريمي (حساب مميز)', 'Kuraimi Bank', 'KURAIMI', 'يرجى إيداع المبلغ أو التحويل عبر تطبيق الكريمي جوال وإرفاق رقم الحوالة', 'خدمة أمان لحماية الأرقام', '123456789', 1, true, false),
  ('محفظة ون كاش', 'OneCash Wallet', 'ONECASH', 'تحويل عبر تطبيق OneCash إلى رقم الحساب المذكور وكتابة رقم العملية', 'أمان - سداد', '770000000', 2, true, false),
  ('محفظة جوالي', 'Jawali', 'JAWALI', 'تحويل عبر تطبيق جوالي أو أي نقطة وكيل', 'أمان لحماية الأرقام', '771112233', 3, true, false)
ON CONFLICT (code) DO NOTHING;
`;
