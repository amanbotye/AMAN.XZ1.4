// Centralized Arabic Error Translator for AMAN Application

export const ERROR_MAPPINGS: Record<string, { messageAr: string; actionAr: string }> = {
  UNAUTHORIZED: {
    messageAr: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول مجدداً.',
    actionAr: 'أعد تسجيل الدخول للتحقق من هويتك.'
  },
  FORBIDDEN: {
    messageAr: 'لا تملك الصلاحيات الكافية لتنفيذ هذا الإجراء.',
    actionAr: 'تأكد من تسجيل الدخول بحساب له صلاحيات المدير.'
  },
  INVALID_PHONE: {
    messageAr: 'صيغة رقم الهاتف غير صحيحة.',
    actionAr: 'أدخل رقم هاتف يمني صحيح مكون من 9 أرقام يبدأ بـ 77 أو 78 أو 73 أو 71 أو 70.'
  },
  PHONE_ALREADY_EXISTS: {
    messageAr: 'هذا الرقم مسجل مسبقاً في حسابك.',
    actionAr: 'تفقد قائمة أرقامي لإدارة هذا الرقم مباشرة.'
  },
  ACTIVE_PROTECTION_EXISTS: {
    messageAr: 'توجد حماية سارية بالفعل لهذا الرقم.',
    actionAr: 'يمكنك استخدام خيار تجديد الحماية بدلاً من تقديم طلب جديد.'
  },
  PENDING_REQUEST_EXISTS: {
    messageAr: 'يوجد طلب حماية معلق بالفعل لهذا الرقم بانتظار المراجعة.',
    actionAr: 'انتظر حتى يتم تدقيق واعتماد الطلب القائم حالياً.'
  },
  PAYMENT_NOT_VERIFIED: {
    messageAr: 'يجب تأكيد التحقق المالي للحوالة من قبل الإدارة أولاً.',
    actionAr: 'قم بتأكيد استلام المبلغ ومطابقة مرجع الحوالة قبل الاعتماد.'
  },
  INVALID_PAYMENT_METHOD: {
    messageAr: 'وسيلة الدفع المختارة غير مفعلة حالياً.',
    actionAr: 'اختر طريقة دفع أخرى من القائمة المتاحة.'
  },
  PACKAGE_NOT_FOUND: {
    messageAr: 'باقة الحماية المختارة غير موجودة أو تم إيقافها.',
    actionAr: 'اختر إحدى الباقات المتاحة حالياً.'
  },
  COMPANY_NOT_FOUND: {
    messageAr: 'لم يتم التعرف على شركة الاتصالات لهذا الرقم.',
    actionAr: 'تأكد من كتابة الرقم اليمني بشكل صحيح.'
  },
  NOT_FOUND: {
    messageAr: 'العنصر المطلوب غير موجود.',
    actionAr: 'تأكد من صحة المعرف أو قم بتحديث الصفحة.'
  },
  INVALID_STATE: {
    messageAr: 'حالة الطلب الحالية لا تسمح بتنفيذ هذا الإجراء.',
    actionAr: 'قد يكون الطلب قد تم اعتماده أو رفضه مسبقاً.'
  },
  TASK_ALREADY_COMPLETED: {
    messageAr: 'هذه المهمة تم تنفيذها بالفعل مسبقاً.',
    actionAr: 'لا يمكن تعديل أو إعادة جدولة مهمة منجزة.'
  }
};

export function getErrorMessageAr(errorCode?: string, fallbackMessage?: string) {
  if (!errorCode) {
    return {
      message: fallbackMessage || 'حدث خطأ غير متوقع.',
      action: 'يرجى المحاولة مرة أخرى أو مراجعة الاتصال بالإنترنت.'
    };
  }

  const cleanCode = errorCode.trim().toUpperCase();
  const matched = ERROR_MAPPINGS[cleanCode];

  if (matched) {
    return {
      message: matched.messageAr,
      action: matched.actionAr
    };
  }

  return {
    message: fallbackMessage || `رمز الخطأ: ${errorCode}`,
    action: 'يرجى مراجعة إدارة النظام أو التحقق من البيانات المدخلة.'
  };
}
