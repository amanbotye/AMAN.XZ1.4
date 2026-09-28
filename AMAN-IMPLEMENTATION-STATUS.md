# AMAN — سجل حالة التنفيذ الرسمي
# AMAN-IMPLEMENTATION-STATUS.md

## Project State
- **المرحلة الحالية:** المرحلة 01 — Authentication (تسجيل الدخول + إنشاء الحساب + استعادة كلمة المرور)
- **تاريخ التنفيذ:** 28 سبتمبر 2026
- **حالة المرحلة:** مكتملة بنجاح ومطابقة للمرجع الوظيفي وقواعد البيانات (100% Complete)

---

## Authentication Status Summary (المرحلة 01)
- **Login Status (تسجيل الدخول):** مكتمل
  - البريد الإلكتروني وكلمة المرور وفق المرجع 1.4.1.
  - إظهار/إخفاء كلمة المرور.
  - التحقق المحلي (Validation) وظهور الخطأ تحت الحقل المرتبط به.
  - عدم مسح أو تصفير الحقول عند حدوث خطأ بالمصادقة.
  - استدعاء Supabase GoTrue Auth الحقيقي (`signInWith(Email)`).
  - جلب الملف الشخصي الحقيقي للمستخدم من `public.users` وقراءة `user_type` للتوجيه السليم.
  - منع دخول الحسابات المعطلة أو الموقوفة (`status.canAccess = false`).
- **Register Status (إنشاء حساب جديد):** مكتمل
  - حقول: الاسم الكامل، البريد الإلكتروني، كلمة المرور، وتأكيد كلمة المرور وفق المرجع 1.4.2.
  - التحقق من تطابق كلمتي المرور وطول كلمة المرور (6+ أحرف) وصلاحية البريد.
  - تمرير الاسم في metadata أثناء `signUpWith(Email)`.
  - الاعتماد على Trigger قاعدة البيانات `handle_new_auth_user()` لإنشاء السجل في `public.users` بنوع `customer` وحالة `active` دون تكرار.
  - تحديث الاسم الكامل ومزامنة الملف مباشرة بعد التسجيل.
  - التقاط خطأ البريد المسجل مسبقاً (`UserAlreadyExists`) وإظهاره تحت حقل البريد.
- **Password Reset Status (استعادة كلمة المرور):** مكتمل
  - حقل البريد الإلكتروني والتحقق من صحته وفق المرجع 1.4.3.
  - استدعاء `SupabaseProvider.auth.resetPasswordForEmail`.
  - معالجة حالات التحميل والنجاح وإظهار بطاقة التأكيد الخضراء بوضوح.
- **Session Status (إدارة الجلسات):** مكتمل
  - استعادة الجلسة الفعلية من `currentSessionOrNull()`.
  - معالجة أخطاء استعادة الجلسة والشبكة كأخطاء حقيقية دون تحويلها لنجاح وهمي.
  - الانتقال التلقائي للرئيسية المناسبة (`AdminHome` للمدير و `CustomerHome` للعميل).

---

## Completed
1. [المرحلة 01] مسار تسجيل الدخول الكامل: UI → ViewModel → Repository → Supabase Auth → Session → Navigation.
2. [المرحلة 01] مسار إنشاء الحساب الكامل: UI → ViewModel → Repository → Supabase Auth → Trigger → public.users → Navigation.
3. [المرحلة 01] مسار استعادة كلمة المرور الكامل: UI → ViewModel → Repository → Supabase Auth.
4. [المرحلة 01] رسائل الأخطاء المترجمة للعربية وعرضها تحت الحقول المحددة.
5. [المرحلة 01] تصحيح منطق معالجة أخطاء `restoreSession()` في `AuthRepositoryImpl.kt`.

---

## Partially Completed
(لا توجد مهام جزئية ضمن نطاق المرحلة 01).

---

## Pending (للمراحل القادمة)
1. **المرحلة القادمة:** شاشات إدارة أرقام العميل (عرض الأرقام + إضافة رقم جديد والكشف التلقائي).
2. **منظومة طلبات الحماية:** ربط تدقيق الدفع اليدوي `rpc_verify_manual_payment` قبل الاعتماد.
3. **منظومة التجديدات (Renewals):** واجهة تقديم التجديد وواجهة اعتماد التجديد.
4. **شاشات الإدارة:** الحمايات النشطة، فصل إشعارات المشرف، وسجل الحركات المالية.

---

## Known Issues (خارج نطاق المرحلة 01)
1. دالة `rpc_approve_protection_request` تفشل إذا لم يكن الدفع قد دُقّق مسبقاً عبر `rpc_verify_manual_payment` (سيتم حلها في مرحلة طلبات الحماية).
2. شاشة إشعارات المشرف تعرض مكون `CustomerNotificationsScreen` (سيتم حلها في مرحلة الإدارة والإشعارات).

---

## Database/RPC Changes
No database changes. (الحفاظ الصارم والتام على بنية الجداول والدوال الحالية).

---

## Files Modified (المرحلة 01)
- `app/src/main/java/com/aman/protection/core/AmanError.kt`
- `app/src/main/java/com/aman/protection/auth/repository/AuthRepository.kt`
- `app/src/main/java/com/aman/protection/auth/repository/AuthRepositoryImpl.kt`
- `app/src/main/java/com/aman/protection/presentation/auth/AuthUiState.kt`
- `app/src/main/java/com/aman/protection/presentation/auth/AuthViewModel.kt`
- `app/src/main/java/com/aman/protection/presentation/screens/AuthScreen.kt`

---

## Files Created
None. (تم تعديل وتطوير الملفات القائمة دون إنشاء ملفات مكررة).

---

## Files Deleted
None.

---

## Verification
- **Applet Compilation:** نجاح التجميع `compile_applet` بنسبة 100%.
- **Syntax & Imports:** فحص شامل لمطابقة استيرادات Kotlin وصحة الأنواع عبر جميع ملفات المصادقة المعدلة.
- **Validation Rules:** التحقق من صيغة البريد، كلمة المرور (6+ أحرف)، وتطابق كلمتي المرور.
- **Git Diff:** تم تدقيق الفروقات والتأكد من انحصار التعديلات بالكامل داخل حزمة المصادقة `auth`.

---

## Next Stage
المرحلة 02: تطبيق العميل — إدارة الأرقام (شاشة أرقامي + شاشة إضافة رقم مع الكشف التلقائي للمشغل).
