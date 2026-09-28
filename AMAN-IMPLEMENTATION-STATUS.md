# AMAN — سجل حالة التنفيذ الرسمي
# AMAN-IMPLEMENTATION-STATUS.md

## Project State
- **المرحلة الحالية:** المرحلة 02 — تطبيق العميل: الشاشة الرئيسية (Customer Home) + شاشة حسابي (Customer Account)
- **تاريخ التنفيذ:** 28 سبتمبر 2026
- **حالة المرحلة:** مكتملة بنجاح ومطابقة للمرجع وقواعد بيانات Supabase (100% Complete)

---

## Phase 02 Execution Summary

### 1. الشاشة الرئيسية للعميل (Customer Overview / الرئيسية) — الحالة: مكتمل
- **بيانات الترحيب:** عرض الاسم الحقيقي للعميل وتحية مخصصة دون أي قيم ثابتة (`user.displayName`).
- **حالة الحماية والاشتراك:** عرض الحالة الحقيقية من جدول `protections` (نشط، مقارب على الانتهاء، منتهي) مع لون الشارة المناسب.
- **الرقم المحمي والباقة:** عرض رقم الهاتف الفعلي، اسم الشركة المشغلة، واسم باقة الحماية والمدة بالأيام من الـ Snapshot المحفوظ في قاعدة البيانات.
- **التواريخ والأيام المتبقية:** عرض تاريخ البداية والانتهاء الفعليين، واحتساب الأيام المتبقية ديناميكياً من التوقيت الفعلي، مع منع أي قيم سالبة وعرض "منتهية" عند انتهاء المدة.
- **منع التفاصيل التشغيلية:** حظر تام لعرض أي مهام داخلية (`payment_tasks`, `protection_tasks`, المبالغ التشغيلية التي تدفعها أمان، الشركات المنفذة، أو حالة السداد الداخلي).
- **حالات الواجهة:** دعم كامل لحالات البدء (Initial)، التحميل (Loading)، النجاح (Success)، الحالة الفارغة (Empty State) عند عدم وجود حماية نشطة مع زر طلب حماية، والخطأ (Error) مع زر إعادة المحاولة (Retry).
- **الإجراءات السريعة:** بطاقات توجيه سلسة وسريعة إلى: قائمة أرقامي، طلبات وحمايات الحساب، دليل الباقات، الإشعارات، وإعدادات حسابي.

### 2. شاشة حسابي للعميل (Customer Account) — الحالة: مكتمل
- **بيانات الحساب الشخصية:** عرض الاسم الكامل، البريد الإلكتروني، اسم المستخدم، وتاريخ الانضمام من `public.users`.
- **البيانات المقيدة (Read-only):** عرض نوع الحساب ("عميل") وحالة الحساب ("نشط") كشارات قراءة فقط، وحظر تام لتعديل `user_type` أو `role_id` أو `status` أو الصلاحيات.
- **تعديل الملف الشخصي:** نموذج لتعديل الاسم الكامل مع التحقق من المدخلات (مطلوب، 3 أحرف فأكثر)، وتعطيل الزر أثناء الحفظ مع مؤشر تحميل (`isSavingProfile`)، وعرض رسائل النجاح والخطأ.
- **المسار البرمجي للحفظ:**
  $$\text{Account UI} \longrightarrow \text{CustomerViewModel} \longrightarrow \text{CustomerRepository} \longrightarrow \text{Supabase postgrest update("users")} \longrightarrow \text{State Update}$$
- **إحصائيات الحساب:** إجمالي الأرقام المسجلة وإجمالي الحمايات الفعالة.
- **تسجيل الخروج الحقيقي (Sign Out):** ربط زر الخروج المباشر بمستودع المصادقة وجلسة Supabase GoTrue لإنهاء الجلسة ومسح الكاش والعودة لشاشة الدخول.

---

## Completed
1. [المرحلة 01] مسار تسجيل الدخول، إنشاء الحساب، واستعادة كلمة المرور وإدارة الجلسات.
2. [المرحلة 02] شاشة الرئيسية للعميل (`CustomerOverviewScreen.kt`) ببيانات حقيقية وخالية تماماً من أي تفاصيل تشغيلية.
3. [المرحلة 02] شاشة حسابي للعميل (`CustomerAccountScreen.kt`) مع تعديل الاسم وتأمين الحقول الحساسة وتسجيل الخروج.
4. [المرحلة 02] تصحيح فك ترميز أرقام وحمايات العميل في `CustomerRepositoryImpl.kt`.
5. [المرحلة 02] تكامل التبويبات والتنقل في `CustomerHomeScreen.kt`.

---

## Partially Completed
(لا توجد مهام جزئية ضمن نطاق المرحلة 02).

---

## Pending (للمراحل القادمة)
1. **المرحلة القادمة (المرحلة 03):** إدارة أرقام العميل (شاشة أرقامي + شاشة إضافة رقم جديد مع الكشف التلقائي للمشغل).
2. **منظومة طلبات الحماية:** ربط تدقيق الدفع اليدوي `rpc_verify_manual_payment` قبل الاعتماد النهائي.
3. **منظومة التجديدات (Renewals):** واجهة تقديم التجديد وواجهة اعتماد التجديد للمشرف.
4. **شاشات الإدارة:** إدارة الحمايات النشطة، إشعارات المشرف المستقلة، وسجل الحركات المالية.

---

## Known Issues (خارج نطاق المرحلة 02)
1. دالة `rpc_approve_protection_request` تفشل إذا لم يكن الدفع قد دُقّق مسبقاً عبر `rpc_verify_manual_payment` (سيتم ربطها في مرحلة طلبات الحماية).
2. شاشة إشعارات المشرف في لوحة الإدارة تستعلم جدول `client_notifications` بدلاً من `admin_notifications` (سيتم حلها في مرحلة الإدارة).

---

## Database/RPC Changes
None. (الحفاظ الصارم والتام على بنية الجداول والدوال الحالية).

---

## RLS Verification
- تم التحقق من سياسة `users_select_own` لقراءة بيانات المستخدم الحالي فقط `(id = auth.uid())`.
- تم التحقق من سياسة `users_update_own` لتحديث الاسم فقط ومنع تغيير `user_type` حيث تشترط:
  `((id = auth.uid()) AND (user_type = (SELECT users_1.user_type FROM users users_1 WHERE (users_1.id = auth.uid()))))`
- تم التحقق من عزل بيانات الحماية والأرقام حيث لا يستطيع العميل قراءة سوى بيانات `customer_id = auth.uid()`.

---

## Files Modified (المرحلة 02)
- `app/src/main/java/com/aman/protection/data/repository/CustomerRepositoryImpl.kt`
- `app/src/main/java/com/aman/protection/presentation/customer/CustomerUiState.kt`
- `app/src/main/java/com/aman/protection/presentation/customer/CustomerViewModel.kt`
- `app/src/main/java/com/aman/protection/presentation/screens/CustomerHomeScreen.kt`

---

## Files Created (المرحلة 02)
- `app/src/main/java/com/aman/protection/presentation/customer/screens/CustomerOverviewScreen.kt`
- `app/src/main/java/com/aman/protection/presentation/customer/screens/CustomerAccountScreen.kt`

---

## Files Deleted
None.

---

## Verification
- **Applet Compilation:** نجاح التجميع `compile_applet` بنسبة 100%.
- **Syntax & Imports:** فحص شامل لمطابقة استيرادات Kotlin والأنواع لكافة الملفات المنشأة والمعدلة.
- **Data Path:** التأكد من مسار البيانات الفعلي: UI → ViewModel → Repository → Supabase.
- **Git Diff:** تم تدقيق الفروقات والتأكد من انحصار التعديلات داخل نطاق المرحلة 02 فقط.

---

## Next Stage
المرحلة 03: تطبيق العميل — إدارة الأرقام (شاشة أرقامي + شاشة إضافة رقم جديد مع الكشف التلقائي للمشغل وتحديث الملاحظات).
