import {
  TelecomCompany,
  CompanyPrefix,
  CompanyPackage,
  PaymentMethod,
  CustomerNumber,
  ProtectionRequest,
  Protection,
  ProtectionRenewal,
  ProtectionTask,
  ManualPaymentLog,
  ClientNotification,
  AdminNotification,
  AuditLog,
  UserProfile
} from '../types/aman.ts';

export const INITIAL_COMPANIES: TelecomCompany[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name_ar: 'يمن موبايل',
    name_en: 'Yemen Mobile',
    code: 'YEMEN_MOBILE',
    description: 'المزود الوطني لشبكة الهاتف المحمول بتقنية CDMA و 4G/LTE',
    display_order: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name_ar: 'يو (YOU - إم تي إن سابقاً)',
    name_en: 'YOU Telecom',
    code: 'YOU',
    description: 'الشركة اليمنية العمانية للاتصالات بتقنية GSM و 4G',
    display_order: 2,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name_ar: 'سبأفون',
    name_en: 'Sabafon',
    code: 'SABAFON',
    description: 'أول مشغل للهاتف النقال بنظام GSM في اليمن',
    display_order: 3,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name_ar: 'واي للاتصالات',
    name_en: 'Y Telecom',
    code: 'Y',
    description: 'شركة واي للاتصالات النقالة',
    display_order: 4,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString()
  }
];

export const INITIAL_PREFIXES: CompanyPrefix[] = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    prefix: '77',
    number_length: 9,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p1111111-1111-1111-1111-222222222222',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    prefix: '78',
    number_length: 9,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p2222222-2222-2222-2222-111111111111',
    company_id: 'c2222222-2222-2222-2222-222222222222',
    prefix: '73',
    number_length: 9,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p3333333-3333-3333-3333-111111111111',
    company_id: 'c3333333-3333-3333-3333-333333333333',
    prefix: '71',
    number_length: 9,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p4444444-4444-4444-4444-111111111111',
    company_id: 'c4444444-4444-4444-4444-444444444444',
    prefix: '70',
    number_length: 9,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_PACKAGES: CompanyPackage[] = [
  // Yemen Mobile Packages
  {
    id: 'pkg-ym-3m',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    name_ar: 'باقة الحماية الربعية (3 أشهر)',
    name_en: 'Quarterly Protection (3 Months)',
    description: 'تمديد صلاحية الرقم وحمايته من السحب مع مهام تنشيط دورية كل 25 يوماً',
    price: 3500,
    currency: 'YER',
    duration_days: 90,
    is_active: true,
    is_visible: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'pkg-ym-6m',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    name_ar: 'باقة الحماية النصف سنوية (6 أشهر)',
    name_en: 'Semi-Annual Protection (6 Months)',
    description: 'حماية متواصلة لمدة 180 يوماً مع مهام تشغيلية دورية وتنبيهات مسبقة قبل التجديد',
    price: 6500,
    currency: 'YER',
    duration_days: 180,
    is_active: true,
    is_visible: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'pkg-ym-12m',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    name_ar: 'باقة الحماية السنوية الكاملة (12 شهر)',
    name_en: 'Annual Full Protection (12 Months)',
    description: 'أفضل قيمة: حماية كاملة ومتابعة مستمرة على مدار العام (365 يوماً)',
    price: 12000,
    currency: 'YER',
    duration_days: 365,
    is_active: true,
    is_visible: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // YOU Packages
  {
    id: 'pkg-you-3m',
    company_id: 'c2222222-2222-2222-2222-222222222222',
    name_ar: 'باقة يو الربعية (3 أشهر)',
    name_en: 'YOU 3M',
    description: 'حماية وتنشيط خط YOU لمدة 90 يوماً',
    price: 3500,
    currency: 'YER',
    duration_days: 90,
    is_active: true,
    is_visible: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'pkg-you-12m',
    company_id: 'c2222222-2222-2222-2222-222222222222',
    name_ar: 'باقة يو السنوية (12 شهر)',
    name_en: 'YOU 12M',
    description: 'حماية سنوية متكاملة لخط يو',
    price: 12000,
    currency: 'YER',
    duration_days: 365,
    is_active: true,
    is_visible: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Sabafon Packages
  {
    id: 'pkg-saba-3m',
    company_id: 'c3333333-3333-3333-3333-333333333333',
    name_ar: 'باقة سبأفون الربعية (3 أشهر)',
    name_en: 'Sabafon 3M',
    description: 'حماية وتنشيط خط سبأفون لمدة 90 يوماً',
    price: 3500,
    currency: 'YER',
    duration_days: 90,
    is_active: true,
    is_visible: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'pkg-saba-12m',
    company_id: 'c3333333-3333-3333-3333-333333333333',
    name_ar: 'باقة سبأفون السنوية (12 شهر)',
    name_en: 'Sabafon 12M',
    description: 'حماية خط سبأفون لمدة عام كامل',
    price: 12000,
    currency: 'YER',
    duration_days: 365,
    is_active: true,
    is_visible: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm-kuraimi',
    name_ar: 'بنك الكريمي (حساب مميز)',
    name_en: 'Kuraimi Bank',
    code: 'KURAIMI',
    instructions: 'يرجى الإيداع أو التحويل عبر تطبيق الكريمي جوال وإرفاق رقم الإشعار/الحوالة في الخانة المخصصة.',
    account_name: 'خدمة أمان لحماية الأرقام',
    account_identifier: 'حساب رقم: 123456789',
    display_order: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'pm-onecash',
    name_ar: 'محفظة ون كاش (OneCash)',
    name_en: 'OneCash Wallet',
    code: 'ONECASH',
    instructions: 'التحويل المباشر من تطبيق ون كاش إلى رقم حساب الخدمة وتضمين الرقم المرجعي للعملية.',
    account_name: 'أمان - سداد العمليات',
    account_identifier: 'رقم المحفظة: 770000000',
    display_order: 2,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'pm-jawali',
    name_ar: 'محفظة جوالي (Jawali)',
    name_en: 'Jawali Wallet',
    code: 'JAWALI',
    instructions: 'إرسال الحوالة عبر محفظة جوالي من بنك كاك بنك أو أي وكيل صرافة معتمد.',
    account_name: 'أمان للخدمات التشغيلية',
    account_identifier: 'رقم الحساب: 771112233',
    display_order: 3,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-customer-1',
    email: 'client@aman.ye',
    username: 'client_ahmed',
    full_name: 'أحمد علي العولقي',
    user_type: 'customer',
    status: 'active',
    is_deleted: false,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'usr-admin-1',
    email: 'admin@aman.ye',
    username: 'admin_aman',
    full_name: 'المدير العام — منظومة أمان',
    user_type: 'admin',
    status: 'active',
    is_deleted: false,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_CUSTOMER_NUMBERS: CustomerNumber[] = [
  {
    id: 'num-1',
    customer_id: 'usr-customer-1',
    phone_number: '771234567',
    normalized_phone_number: '771234567',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    detected_prefix: '77',
    status: 'active',
    notes: 'الرقم الشخصي الأساسي للواتساب والأعمال',
    is_deleted: false,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'num-2',
    customer_id: 'usr-customer-1',
    phone_number: '739876543',
    normalized_phone_number: '739876543',
    company_id: 'c2222222-2222-2222-2222-222222222222',
    detected_prefix: '73',
    status: 'active',
    notes: 'خط العمل المشترك',
    is_deleted: false,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

export const INITIAL_PROTECTIONS: Protection[] = [
  {
    id: 'prot-1',
    customer_id: 'usr-customer-1',
    customer_number_id: 'num-1',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    source_request_id: 'req-1',
    package_id: 'pkg-ym-3m',
    package_name_snapshot: 'باقة الحماية الربعية (3 أشهر)',
    price_snapshot: 3500,
    currency_snapshot: 'YER',
    duration_days_snapshot: 90,
    task_amount_snapshot: 500,
    task_interval_days_snapshot: 25,
    task_currency_snapshot: 'YER',
    start_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    end_at: new Date(Date.now() + 80 * 86400000).toISOString(),
    status: 'active',
    renewal_count: 0,
    is_deleted: false,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

export const INITIAL_REQUESTS: ProtectionRequest[] = [
  {
    id: 'req-2',
    customer_id: 'usr-customer-1',
    customer_number_id: 'num-2',
    company_id: 'c2222222-2222-2222-2222-222222222222',
    package_id: 'pkg-you-3m',
    payment_method_id: 'pm-kuraimi',
    status: 'pending',
    requested_price: 3500,
    requested_currency: 'YER',
    requested_duration_days: 90,
    payment_transfer_reference: 'TRX-99882211',
    customer_note: 'تم الإيداع قبل قليل عبر تطبيق الكريمي جوال باسم أحمد العولقي',
    rejection_reason: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString()
  }
];

export const INITIAL_PAYMENT_LOGS: ManualPaymentLog[] = [
  {
    id: 'log-1',
    request_id: 'req-2',
    renewal_id: null,
    payment_method_id: 'pm-kuraimi',
    transfer_reference: 'TRX-99882211',
    amount: 3500,
    verification_status: 'pending',
    verified_by: null,
    verified_at: null,
    verification_note: null,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString()
  }
];

export const INITIAL_TASKS: ProtectionTask[] = [
  {
    id: 'task-1',
    protection_id: 'prot-1',
    customer_id: 'usr-customer-1',
    customer_number_id: 'num-1',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    task_number: 1,
    task_type: 'operational',
    amount: 500,
    currency: 'YER',
    scheduled_at: new Date(Date.now() + 15 * 86400000).toISOString(),
    due_at: new Date(Date.now() + 40 * 86400000).toISOString(),
    status: 'scheduled',
    completed_at: null,
    completed_by: null,
    execution_note: null,
    source_task_interval_days: 25,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'task-2',
    protection_id: 'prot-1',
    customer_id: 'usr-customer-1',
    customer_number_id: 'num-1',
    company_id: 'c1111111-1111-1111-1111-111111111111',
    task_number: 2,
    task_type: 'operational',
    amount: 500,
    currency: 'YER',
    scheduled_at: new Date(Date.now() + 40 * 86400000).toISOString(),
    due_at: new Date(Date.now() + 65 * 86400000).toISOString(),
    status: 'scheduled',
    completed_at: null,
    completed_by: null,
    execution_note: null,
    source_task_interval_days: 25,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

export const INITIAL_CLIENT_NOTIFICATIONS: ClientNotification[] = [
  {
    id: 'notif-1',
    user_id: 'usr-customer-1',
    notification_type: 'request_approved',
    title: 'تم قبول طلب الحماية',
    body: 'تم تفعيل حماية الرقم 771234567 بنجاح لمدة 90 يوماً.',
    related_request_id: 'req-1',
    related_protection_id: 'prot-1',
    related_task_id: null,
    is_read: true,
    read_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 9 * 86400000).toISOString()
  }
];

export const INITIAL_ADMIN_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'anotif-1',
    notification_type: 'new_request',
    title: 'طلب حماية جديد',
    body: 'تم استلام طلب حماية جديد للرقم 739876543 بحاجة للتدقيق المالي والموافقة.',
    related_request_id: 'req-2',
    related_protection_id: null,
    related_task_id: null,
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString()
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    actor_user_id: 'usr-customer-1',
    action: 'ADD_NUMBER',
    entity_type: 'customer_number',
    entity_id: 'num-1',
    old_data: null,
    new_data: { phone: '771234567', company_id: 'c1111111-1111-1111-1111-111111111111' },
    metadata: null,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'aud-2',
    actor_user_id: 'usr-customer-1',
    action: 'CREATE_PROTECTION_REQUEST',
    entity_type: 'protection_request',
    entity_id: 'req-2',
    old_data: null,
    new_data: { requested_price: 3500, transfer_reference: 'TRX-99882211' },
    metadata: null,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString()
  }
];
