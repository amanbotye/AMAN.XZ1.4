import { ERROR_CODES } from '../data/evaluation.ts';

export function getErrorMessageAr(errorCode?: string, fallbackMessage?: string): { message: string; action: string } {
  if (!errorCode) {
    return {
      message: fallbackMessage || 'حدث خطأ غير متوقع أثناء تنفيذ العملية.',
      action: 'يرجى المحاولة مجدداً أو مراجعة الاتصال بالخادم.'
    };
  }

  const found = ERROR_CODES.find(e => e.code === errorCode);
  if (found) {
    return {
      message: found.messageAr,
      action: found.actionAr
    };
  }

  // Handle default codes
  switch (errorCode) {
    case 'UNAUTHORIZED':
      return {
        message: 'الجلسة غير صالحة أو غير مسجل الدخول.',
        action: 'يرجى تسجيل الدخول مجدداً للمتابعة.'
      };
    case 'FORBIDDEN':
      return {
        message: 'ليس لديك الصلاحية لتنفيذ هذا الإجراء.',
        action: 'هذا الإجراء محصور على المستخدمين المصرح لهم.'
      };
    case 'VALIDATION_ERROR':
      return {
        message: fallbackMessage || 'البيانات المدخلة غير مكتملة أو غير متوافقة.',
        action: 'يرجى التأكد من تعبئة كافة الحقول الإلزامية بالصيغة الصحيحة.'
      };
    case 'INVALID_STATE':
      return {
        message: fallbackMessage || 'حالة السجل الحالية لا تسمح بإجراء هذا الإجراء.',
        action: 'يرجى تحديث الشاشة للاطلاع على الحالة المحدثة.'
      };
    case 'NOT_FOUND':
      return {
        message: 'السجل المطلوب غير موجود أو تم حذفه.',
        action: 'يرجى التحقق من الرقم أو المعرف المحدد.'
      };
    default:
      return {
        message: fallbackMessage || `رمز الخطأ: ${errorCode}`,
        action: 'يرجى إبلاغ الدعم الفني أو مراجعة سجل العمليات.'
      };
  }
}
