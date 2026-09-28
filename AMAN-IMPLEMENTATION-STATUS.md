# AMAN — سجل حالة التنفيذ الرسمي
# AMAN-IMPLEMENTATION-STATUS.md

## Project State
- **آخر مرحلة منفذة:** تأسيس خط الأساس للعمل المرحلي واعتماد التوجيه التنفيذي (Phase 0: Baseline & Audit Completed)
- **تاريخ التنفيذ:** 28 سبتمبر 2026
- **حالة المشروع:** جاهز للبدء في المراحل التنفيذية المحددة خطوة بخطوة.

---

## Completed
1. فحص وتدقيق كامل المستودع وقاعدة بيانات Supabase وتوثيق `FINAL_COMPREHENSIVE_AUDIT.md`.
2. تثبيت المعمارية النظيفة (Clean Architecture) والواجهات الأصلية Jetpack Compose و Material 3.
3. التحقق من تكامل 21 جدولاً في Supabase و 21 دالة مخزنة (RPC) و 48 سياسة أمان RLS.
4. تثبيت عزل بيانات العملاء وصلاحيات المديرين في طبقة الأمان بقاعدة البيانات.
5. تصحيح استيرادات `AdminManagementRepository` في ملف `AmanApplication.kt` لضمان قابلية بناء APK.

---

## Partially Completed
1. **المصادقة:** تسجيل الدخول بكلمة المرور والبريد وإنشاء الحساب مكتمل، بينما تسجيل الدخول باسم المستخدم واستعادة كلمة المرور بحاجة لربط مكتمل.
2. **اعتماد طلبات الحماية:** الواجهة ودالة الاعتماد موجودة، لكنها بحاجة لربط خطوة التحقق من الدفع اليدوي `rpc_verify_manual_payment` قبل استدعاء `rpc_approve_protection_request`.
3. **مؤشرات صحة الحماية:** الحساب يعمل حالياً عبر قيم ثابتة في `RenewalHealth.kt` وبحاجة للربط بالدالة المخزنة `get_subscription_status`.

---

## Pending
1. **منظومة التجديدات (Renewals):**
   - واجهة تقديم طلب التجديد للعميل (`CreateRenewalRequestScreen`).
   - واجهة مراجعة واعتماد ورفض التجديدات للمدير (`AdminRenewalsScreen`).
   - مستودع التجديد وكائنات النقل في Kotlin.
2. **تدقيق الدفع اليدوي للمدير:**
   - واجهة مراجعة الحوالة وتأكيدها عبر `rpc_verify_manual_payment`.
3. **فصل إشعارات المدير:**
   - تخصيص شاشة إشعارات المشرف لاستعلام `admin_notifications` واستدعاء `rpc_mark_admin_notification_read`.
4. **سجل الحركات المالية للمدير:**
   - واجهة استعراض جدول `transactions`.

---

## Known Issues
1. `rpc_approve_protection_request` تفشل إذا لم يكن الدفع قد دُقّق مسبقاً عبر `rpc_verify_manual_payment`.
2. شاشة إشعارات المشرف تعرض مكون `CustomerNotificationsScreen` بدلاً من إشعارات الإدارة المخصصة.
3. عداد التجديدات المطلوبة في لوحة المشرف مقدر حسابياً (`activeProts.size / 2`) وليس مستعلماً من جدول `protection_renewals`.

---

## Database/RPC Changes
No database changes. (الحفاظ الصارم على البنية والجداول والدوال الحالية).

---

## Files Modified
- `app/src/main/java/com/aman/protection/AmanApplication.kt`

---

## Files Created
- `FINAL_COMPREHENSIVE_AUDIT.md`
- `AMAN-IMPLEMENTATION-STATUS.md`

---

## Files Deleted
None.

---

## Verification
- تم التحقق من تجميع الكود (Compile) بنجاح.
- تم التحقق من مطابقة قاعدة البيانات والجداول والدوال مع تفريغ Supabase المصدري.
- تم التحقق من دفع التحديثات إلى المستودع البعيد (`origin/main`).

---

## Next Stage
بانتظار تحديد نطاق المرحلة الأولى من قِبل المستخدم (المحددة بشاشتين أو وحدة وظيفية مترابطة).
