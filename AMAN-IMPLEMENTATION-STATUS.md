# AMAN — سجل حالة التنفيذ الرسمي
# AMAN-IMPLEMENTATION-STATUS.md

## Project State
- **المرحلة الحالية:** المرحلة 03 — تطبيق العميل: إدارة الأرقام (أرقامي + إضافة رقم)
- **تاريخ التنفيذ:** 28 سبتمبر 2026
- **حالة المرحلة:** مكتملة بنجاح ومطابقة للمرجع وقواعد بيانات Supabase (100% Complete)

---

## Phase 03 Execution Summary

### 1. شاشة أرقامي (Customer Numbers Screen) — الحالة: مكتمل
- **فصل الحماية عن تسجيل الرقم:** تطبيق القاعدة الصارمة بأن مجرد وجود الرقم في الحساب لا يعني أنه محمي. يتم فحص وجود سجل حماية نشط وفعال في جدول `protections` مرتبط بالرقم، وإظهار الشارة المناسبة بدقة ("محمي 🛡️" أو "غير محمي").
- **عرض الأرقام والمشغل:** عرض رقم الهاتف بصيغة مقروءة، شارة شركة الاتصالات المشغلة (يمن موبايل، يو، سبأفون، واي)، والملاحظات المرتبطة بكل رقم.
- **حالات الواجهة:**
  - التحميل (Loading): مؤشر تقدم أثناء استعلام قاعدة البيانات.
  - القائمة الفارغة (Empty State): تظهر بوضوح عند عدم وجود أي أرقام مسجلة مع شرح وزر لإضافة رقم، دون أي أرقام تجريبية.
  - حالة الخطأ (Error State): تظهر عند فشل الاتصال مع رسالة واضحة وزر "إعادة المحاولة" (Retry) دون تحويل الخطأ إلى حالة فارغة.
  - التصفية والبحث: تصفية حسب مشغل الاتصالات والبحث في الأرقام والملاحظات.
- **إدارة الملاحظات والحذف:** تعديل ملاحظات الرقم عبر `rpc_update_customer_number_notes`، وحظر حذف أي رقم مرتبط بحماية نشطة.

### 2. شاشة إضافة رقم (Add Number Screen) — الحالة: مكتمل
- **التحقق والتطبيع اللحظي:** فحص رقم الهاتف عبر `PhoneValidationService` واستدعاء `detect_company_from_phone` لاكتشاف المشغل والتأكد من طول الرقم (9 أرقام) وصحة البادئة.
- **إضافة الرقم عبر RPC موثوق:** استدعاء الإجراء المخزن `rpc_add_customer_number` الذي يفرض أن المالك هو `auth.uid()` تلقائياً ويمنع أي تلاعب بهوية العميل.
- **معالجة التكرار (Duplicate Handling):** التقاط خطأ `DUPLICATE_OPERATION` من قاعدة البيانات وعرض رسالة صريحة بأن الرقم مسجل مسبقاً في حساب العميل.
- **عدم إنشاء حماية تلقائياً:** إضافة الرقم تؤدي فقط إلى حفظه في جدول `customer_numbers` ليكون متاحاً لاحقاً لمرحلة طلب الحماية.
- **تحديث القائمة الحقيقي:** بعد نجاح العملية في Supabase، يتم استدعاء `fetchCustomerNumbers()` لتحديث القائمة من المصدر الحقيقي وإغلاق شاشة الإضافة.

---

## Completed
1. [المرحلة 01] مسار تسجيل الدخول، إنشاء الحساب، استعادة كلمة المرور، وإدارة الجلسات.
2. [المرحلة 02] الشاشة الرئيسية للعميل (`CustomerOverviewScreen`) وشاشة حسابي (`CustomerAccountScreen`).
3. [المرحلة 03] شاشة أرقامي (`CustomerNumbersScreen.kt`) مع ربط حالة الحماية الحقيقية ومعالجة الحالات (Loading, Empty, Error, Retry).
4. [المرحلة 03] شاشة إضافة رقم (`AddNumberScreen.kt`) مع التحقق اللحظي من المشغل واستدعاء `rpc_add_customer_number` ومعالجة التكرار.
5. [المرحلة 03] بطاقة الرقم (`NumberItemCard.kt`) ونافذة تفاصيل الرقم والملاحظات (`NumberDetailsDialog.kt`).

---

## Partially Completed
(لا توجد مهام جزئية ضمن نطاق المرحلة 03).

---

## Pending (للمراحل القادمة)
1. **المرحلة القادمة (المرحلة 04):** منظومة طلبات الحماية للعميل (عرض الباقات واختيار الرقم وطريقة الدفع + إرسال طلب الحماية `rpc_create_protection_request`).
2. **اعتماد طلبات الحماية للمشرف:** ربط خطوة تدقيق الدفع اليدوي `rpc_verify_manual_payment` قبل `rpc_approve_protection_request`.
3. **منظومة التجديدات (Renewals):** واجهة تقديم التجديد للعميل وواجهة الاعتماد للمشرف.
4. **شاشات الإدارة:** الحمايات النشطة، إشعارات المشرف المستقلة، وسجل العمليات المالية.

---

## Known Issues (خارج نطاق المرحلة 03)
1. دالة `rpc_approve_protection_request` تفشل إذا لم يكن الدفع اليدوي قد دُقّق مسبقاً عبر `rpc_verify_manual_payment` (سيتم ربطها في مرحلة طلبات الحماية والاعتماد).
2. شاشة إشعارات المشرف تستعلم جدول `client_notifications` بدلاً من `admin_notifications` (سيتم حلها في مرحلة الإدارة).

---

## Database / Tables / RPCs Used
- **الجداول المستخدمة:**
  - `public.customer_numbers`: لتخزين واسترجاع أرقام العميل.
  - `public.protections`: للتحقق من وجود حماية نشطة للرقم.
  - `public.companies`: لجلب بيانات وأسماء المشغلين المعتمدة.
- **الإجراءات المخزنة (RPCs):**
  - `public.rpc_add_customer_number`: إضافة رقم العميل والتحقق من المشغل ومنع التكرار وتسجيل Audit Log.
  - `public.rpc_update_customer_number_notes`: تحديث ملاحظات العميل على الرقم.
  - `public.detect_company_from_phone`: استنتاج شركة الاتصالات والبادئة المعتمدة من الرقم المنمط.
- **Database Changes:** None. (الحفاظ التام على المخطط والدوال وسياسات الأمان).

---

## RLS Verification
- تم التحقق من سياسات RLS على `customer_numbers`:
  - `customer_numbers_select_own`: العميل يستعلم فقط أرقامه الخاصة `(customer_id = auth.uid())`.
  - `customer_numbers_insert_own` / `rpc_add_customer_number`: الإضافة محصورة بالمستخدم المصادق عليه `auth.uid()`.
  - لا يمكن لعميل الاطلاع على أرقام عميل آخر أو تعديلها.

---

## Files Modified (المرحلة 03)
- `app/src/main/java/com/aman/protection/domain/models/CustomerNumber.kt`
- `app/src/main/java/com/aman/protection/data/repository/CustomerNumberRepositoryImpl.kt`
- `app/src/main/java/com/aman/protection/presentation/customer/components/NumberItemCard.kt`
- `app/src/main/java/com/aman/protection/presentation/customer/components/NumberDetailsDialog.kt`
- `app/src/main/java/com/aman/protection/presentation/customer/screens/CustomerNumbersScreen.kt`

---

## Files Created (المرحلة 03)
None. (تم تطوير وتعديل الملفات الحالية بنجاح).

---

## Files Deleted
None.

---

## Verification
- **Applet Compilation:** نجاح التجميع `compile_applet` بنسبة 100%.
- **Syntax & Imports:** فحص شامل لمطابقة استيرادات Kotlin وصحة الأنواع لكافة الملفات.
- **Protection Separation:** التأكد من أن حالة الحماية تستعلم من جدول `protections` الفعلي ولا تستنتج من مجرد وجود الرقم.
- **Git Diff:** تم تدقيق الفروقات والتأكد من انحصار التعديلات بالكامل داخل نطاق المرحلة 03 فقط.

---

## Next Stage
المرحلة 04: تطبيق العميل — طلبات الحماية (شاشة طلب حماية جديد + شاشة متابعة الطلبات والحمايات).
