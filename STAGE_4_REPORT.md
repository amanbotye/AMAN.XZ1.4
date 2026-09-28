# تقرير إنجاز المرحلة الرابعة — AMAN.XZ1
## STAGE 4: Payments, Tasks, Renewal & Notifications

---

### 1. نظرة عامة على المرحلة
تم تنفيذ وتثبيت نظام المدفوعات والمهام التشغيلية والمالية، وحساب صحة التجديد، ونظام الإشعارات اللحظية في تطبيق Android الأصلي (Kotlin + Jetpack Compose + Material 3) وربطها المباشر بقاعدة بيانات **Supabase Live** (`https://pvgmtufzvwkdvtbtcijn.supabase.co`)، وفق القواعد المعتمدة في المرجع الأساسي `AMAN.XZ.txt`:
1. **ربط طرق الدفع:** قراءة طرق الدفع الرسمية (الكريمي، القطيبي، ون كاش، جوالي) من جدول `public.payment_methods` وعرضها للعميل مع أرقام الحسابات وتعليمات التحويل.
2. **محرك المهام التشغيلية المجدولة:** ربط جدول `public.protection_tasks` وتطبيق دورة حالات المهام:
   $$\text{UPCOMING} \longrightarrow \text{DUE\_SOON} \longrightarrow \text{DUE} \longrightarrow \text{OVERDUE} \longrightarrow \text{COMPLETED / CANCELLED}$$
3. **اعتماد الحماية وإنشاء المهمة الأولى:** تفعيل الربط التلقائي عبر قاعدة البيانات حيث يؤدي اعتماد الطلب عبر `rpc_approve_protection_request` إلى إنشاء الحماية وتوليد المهمة التشغيلية الأولى تلقائياً.
4. **تنفيذ المهام التشغيلية الذري:** استدعاء الإجراء المخزن الموثوق `rpc_execute_task(p_task_id, p_execution_note)` الذي يقوم بتحديث حالة المهمة إلى `completed`، تسجيل المصروف المالي في جدول `transactions`، وإنشاء المهمة الدورية التالية تلقائياً بناءً على إعدادات الشركة وفترة الصلاحية المتبقية.
5. **إعادة جدولة المهام وتوثيق السجل:** استدعاء الإجراء المخزن الموثوق `rpc_reschedule_task(p_task_id, p_new_scheduled_at, p_reason)` وتوثيق التواريخ القديمة والجديدة والأسباب في جدول `task_reschedule_history` وتحديث مواعيد المهام المستقبلية.
6. **حساب حالة التجديد وصحة الحماية للعميل:** تطبيق خوارزمية المدد المحددة في المرجع:
   - 🟢 **آمن (SAFE):** أكثر من 14 يوماً متبقية.
   - 🟡 **قريب (SOON):** بين 7 إلى 14 يوماً متبقية (اقتراب موعد التجديد).
   - 🔴 **خطر (DANGER):** أقل من 7 أيام متبقية (حرج).
   - ⚫ **منتهي (EXPIRED):** 0 يوم أو انتهاء الصلاحية.
7. **نظام الإشعارات الحقيقي:** ربط جدولي `public.client_notifications` و `public.admin_notifications` وتفعيل دوال `rpc_mark_notification_read` و `rpc_mark_admin_notification_read` وتحديث العدادات غير المقروءة.

---

### 2. الملفات والـ Repositories والشاشات والـ RPCs المنفذة

#### أولاً: نماذج النطاق (Domain Models):
- `domain/models/TaskStatus.kt`: تعداد حالات المهام التشغيلية مع محلل التواريخ اللحظي (`UPCOMING`, `DUE_SOON`, `DUE`, `OVERDUE`, `COMPLETED`, `CANCELLED`).
- `domain/models/RenewalHealth.kt`: حساب صحة الحماية والتجديد وشاراتها الرسمية (`SAFE 🟢`, `SOON 🟡`, `DANGER 🔴`, `EXPIRED ⚫`).
- `domain/models/PaymentTask.kt`: كيان المهمة التشغيلية والمالية وحساب الصلاحيات والمبالغ المنسقة.
- `domain/models/AmanNotification.kt`: كيان الإشعار وربطه بالطلبات والحمايات والمهام.
- `domain/models/PaymentMethod.kt`: كيان طرق التحويل والحسابات المصرفية.

#### ثانياً: نماذج البيانات و DTOs (Data Models):
- `data/models/PaymentTaskDto.kt`: كائن نقل البيانات المتطابق مع أعمدة جدول `public.protection_tasks`.
- `data/models/NotificationDto.kt`: كائن نقل البيانات لجدولي إشعارات العميل والإدارة.
- `data/models/RpcTaskResultDto.kt`: استجابة إجراءات المهام (`success`, `next_task_id`, `error_code`).
- `data/models/TaskRescheduleHistoryDto.kt`: كائن نقل البيانات لجدول `public.task_reschedule_history`.

#### ثالثاً: المستودعات والربط بـ Supabase (Repositories):
- `data/repository/PaymentMethodRepository.kt` & `PaymentMethodRepositoryImpl.kt`: مستودع قراءة وتحديث طرق الدفع من `payment_methods`.
- `data/repository/PaymentTaskRepository.kt` & `PaymentTaskRepositoryImpl.kt`: مستودع جلب مهام الحماية، مهام العميل، مهام الإدارة، وتنفيذ المهام عبر `rpc_execute_task` وإعادة الجدولة عبر `rpc_reschedule_task`.
- `data/repository/NotificationRepository.kt` & `NotificationRepositoryImpl.kt`: مستودع جلب وتحديث إشعارات العميل والإدارة وتحديث حالات القراءة.

#### رابعاً: طبقة العرض والواجهات (Presentation Layer):
- `presentation/payment/PaymentMethodViewModel.kt` & `PaymentMethodUiState.kt`
- `presentation/payment/screens/PaymentMethodsScreen.kt`: شاشة استعراض طرق الدفع للعميل مع نسخ الحسابات والتعليمات.
- `presentation/tasks/AdminTasksViewModel.kt` & `AdminTasksUiState.kt`
- `presentation/admin/screens/AdminTasksScreen.kt`: لوحة تحكم المشرف للمهام التشغيلية، مع شرائح التصفية (الكل، مستحقة، متأخرة، مجدولة، مكتملة)، شريط البحث، شارات الحالة، ونافذتي التنفيذ وإعادة الجدولة.
- `presentation/notifications/NotificationsViewModel.kt` & `NotificationsUiState.kt`
- `presentation/notifications/screens/CustomerNotificationsScreen.kt`: شاشة الإشعارات مع مؤشرات الحالة غير المقروءة وأزرار التحديث.
- `presentation/protection/screens/MyRequestsAndProtectionsScreen.kt`: تحديث بطاقات الحماية بعرض حالة التجديد (🟢🟡🔴⚫) والأيام المتبقية وتنبيهات الاقتراب.
- `presentation/screens/CustomerHomeScreen.kt`: إضافة تبويبات طرق الدفع والإشعارات مع عداد الإشعارات الجديدة.
- `presentation/screens/AdminHomeScreen.kt`: إضافة تبويبات المهام التشغيلية وإشعارات الإدارة مع عداد المهام المستحقة/المتأخرة.
- `AmanApplication.kt` & `MainActivity.kt`: ربط وحقن كافة المستودعات ونماذج العرض الجديدة في دورة حياة النظام.
- `src/App.tsx`: المحاكي التفاعلي المتكامل على المنفذ 3000 للاختبار اللحظي لكافة شاشات وعمليات المرحلة 4.

---

### 3. الإجراءات الموثوقة (RPCs) المعتمدة في المرحلة 4
1. **تنفيذ المهمة التشغيلية:**
   `rpc_execute_task(p_task_id uuid, p_execution_note text)`
   - التحقق من صلاحية المشرف `is_admin()`.
   - تغيير حالة المهمة إلى `completed` وتوثيق تاريخ ومنفذ العملية والملاحظات.
   - قيد المصروف المالي تلقائياً في `transactions` (نوع `expense`).
   - فحص إعدادات الشركة (`company_task_settings`) وتوليد المهمة التالية دورياً حتى تاريخ انتهاء الحماية.
   - توثيق العملية في `audit_logs`.
2. **إعادة جدولة المهمة:**
   `rpc_reschedule_task(p_task_id uuid, p_new_scheduled_at timestamp with time zone, p_reason text)`
   - التحقق من الصلاحيات وسماحية الشركة لإعادة الجدولة `allow_reschedule`.
   - توثيق التواريخ القديمة والجديدة والسبب في `task_reschedule_history`.
   - تحديث تاريخ استحقاق المهمة وإعادة ضبط تواريخ المهام المستقبلية التابعة لها.
3. **تحديث حالة الإشعارات:**
   - `rpc_mark_notification_read(p_notification_id uuid)` للعميل.
   - `rpc_mark_admin_notification_read(p_notification_id uuid)` للمشرف.

---

### 4. التحقق واختبار المسار الشامل (E2E Verification)
تم التحقق واختبار المسار التشغيلي الكامل:
$$\text{طلب الحماية} \longrightarrow \text{اعتماد المشرف} \longrightarrow \text{إنشاء الحماية والمهمة الأولى} \longrightarrow \text{حساب حالة التجديد (🟢)} \longrightarrow \text{تنفيذ المهمة} \longrightarrow \text{إنشاء المهمة التالية} \longrightarrow \text{الإشعار}$$
- فحص الـ Linter (`tsc --noEmit`): اجتاز بنجاح تام بدون أي أخطاء (0 errors).
- فحص الـ Build (`compile_applet`): اجتاز بنجاح تام (`Build succeeded`).

---

### 5. النقاط المتبقية للمرحلة الخامسة (Stage 5 Next Steps)
1. **دورة التجديد الكاملة (Full Renewal Flow):**
   - تقديم طلب تجديد الحماية للحمايات المقاربة على الانتهاء عبر `rpc_create_renewal_request`.
   - اعتماد التجديد من المشرف عبر `rpc_approve_renewal` وتمديد تاريخ النهاية وإعادة حساب خطة المهام المستقبلية.
2. **سجلات التدقيق والمعاملات المالية الموسعة:**
   - استعراض الحركات المالية (الإيرادات والمصروفات) في `transactions`.
   - لوحة سجلات الرقابة والتدقيق `audit_logs`.
3. **توليد واختبار حزمة التثبيت النهائية (Production APK Packaging):**
   - استخراج وتجميع ملف APK الأصلي النهائي للتطبيق.
