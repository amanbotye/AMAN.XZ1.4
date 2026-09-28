# تقرير إنجاز المرحلة الثالثة — AMAN.XZ1
## STAGE 3: Protection Plans & Protection Requests

---

### 1. نظرة عامة على المرحلة
تم تنفيذ وتثبيت دورة طلبات الحماية والباقات بالكامل في تطبيق Android الأصلي (Kotlin + Jetpack Compose) وربطها المباشر بقاعدة بيانات **Supabase Live**، مع تطبيق القواعد المعتمدة في المرجع الأساسي `AMAN.XZ.txt`:
1. التحقق من عدم وجود حماية نشطة مسبقاً لنفس الرقم (`ACTIVE_PROTECTION_EXISTS`).
2. التحقق من عدم وجود طلب حماية غير محسوم (PENDING) لنفس الرقم قبل إنشاء طلب جديد.
3. استدعاء الإجراء المخزن الموثوق `rpc_create_protection_request` مع حفظ الطلب بحالة `pending` وتوثيق إشعار التحويل اليدوي.
4. مراجعة واعتماد الطلبات من قبل المشرف عبر `rpc_approve_protection_request` لإنشاء الحماية وحفظ اللقطات المالية والفترة الزمنية (`package_name_snapshot, price_snapshot, duration_days_snapshot`).
5. رفض الطلبات مع توثيق سبب الرفض عبر `rpc_reject_protection_request`.

---

### 2. الملفات والـ Repositories والشاشات والـ RPCs المنفذة

#### أولاً: نماذج النطاق (Domain Models):
- `domain/models/ProtectionPlan.kt`: باقة الحماية (الاسم بالعربية والإنجليزية، السعر، العملة، ومدة الأيام).
- `domain/models/PaymentMethod.kt`: طريقة التحويل والدفع اليدوية (الكريمي، القطيبي، ون كاش، جوالي، والتعليمات).
- `domain/models/ProtectionRequest.kt`: طلب الحماية بحالاته الرسمية (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`).
- `domain/models/Protection.kt`: الحماية الفعلية والـ Snapshots المعتمدة وتواريخ البداية والنهاية.

#### ثانياً: نماذج البيانات و DTOs (Data Models):
- `data/models/ProtectionPlanDto.kt`: كائن نقل البيانات لجدول `public.company_packages`.
- `data/models/PaymentMethodDto.kt`: كائن نقل البيانات لجدول `public.payment_methods`.
- `data/models/ProtectionRequestDto.kt`: كائن نقل البيانات لجدول `public.protection_requests`.
- `data/models/ProtectionDto.kt`: كائن نقل البيانات لجدول `public.protections`.
- `data/models/RpcProtectionResultDto.kt`: كائن نتائج استدعاءات إجراءات الحماية.

#### ثالثاً: المستودعات وربط Supabase (Repositories):
- `data/repository/ProtectionPlanRepository.kt` & `ProtectionPlanRepositoryImpl.kt`: جلب باقات الحماية وطرق الدفع وتصفيتها بحسب شركة الاتصالات المشغلة.
- `data/repository/ProtectionRequestRepository.kt` & `ProtectionRequestRepositoryImpl.kt`: إرسال الطلب عبر `rpc_create_protection_request`، جلب طلبات العميل، جلب الطلبات المعلقة للإدارة، قبول الطلب عبر `rpc_approve_protection_request`، ورفض الطلب عبر `rpc_reject_protection_request`.
- `data/repository/ProtectionRepository.kt` & `ProtectionRepositoryImpl.kt`: جلب الحمايات النشطة للعميل وللإدارة، والتحقق من عدم تكرار الحماية النشطة.

#### رابعاً: واجهات وشاشات Jetpack Compose (Presentation):
- `presentation/protection/CustomerProtectionViewModel.kt` & `CustomerProtectionUiState.kt`: إدارة دورة حياة إنشاء ومتابعة الطلبات للعميل.
- `presentation/admin/AdminProtectionViewModel.kt`: إدارة مراجعة واعتماد ورفض طلبات الحماية للمشرف.
- `presentation/protection/screens/PlansCatalogScreen.kt`: استعراض باقات الحماية وأسعارها ومددها.
- `presentation/protection/screens/CreateProtectionRequestScreen.kt`: نموذج تقديم طلب الحماية مع فحص التعارض واختيار وسيلة الدفع ومرجع الحوالة.
- `presentation/protection/screens/MyRequestsAndProtectionsScreen.kt`: استعراض الحمايات النشطة والطلبات السابقة وحالاتها وأسباب الرفض إن وجدت.
- `presentation/admin/screens/AdminProtectionRequestsScreen.kt`: لوحة تحكم المشرف للمراجعة، والاعتماد الفوري، ونافذة توضيح سبب الرفض.
- `presentation/screens/CustomerHomeScreen.kt` & `AdminHomeScreen.kt`: الربط والتكامل المباشر مع واجهات المراحل السابقة.
- `src/App.tsx`: المحاكي التفاعلي المتكامل على المنفذ 3000 للاختبار الفوري لدورة العميل والمشرف.

---

### 3. الإجراءات الموثوقة (RPCs) المعتمدة في المرحلة
1. **إنشاء الطلب:**
   `rpc_create_protection_request(p_customer_number_id, p_package_id, p_payment_method_id, p_transfer_reference, p_customer_note)`
   - يضمن التحقق من عدم وجود حماية نشطة مسبقاً (`ACTIVE_PROTECTION_EXISTS`).
   - ينشئ سجل في `protection_requests` بحالة `pending`.
   - يسجل بيانات الدفع اليدوي في `manual_payment_logs`.
   - يرسل إشعاراً للمشرف في `admin_notifications` ويوثق العملية في `audit_logs`.
2. **اعتماد الطلب من المشرف:**
   `rpc_approve_protection_request(p_request_id)`
   - يتحقق من صلاحية المشرف `is_admin()`.
   - يؤكد التحويل المالي في `manual_payment_logs`.
   - ينشئ الحماية في `protections` مع حفظ لقطات السعر والمدة واسم الباقة.
   - يجدول المهام في `protection_tasks` ويسجل قيد مالي في `transactions`.
   - يرفض تلقائياً أي طلبات أخرى منافسة لنفس الرقم (`تمت حماية الرقم بطلب آخر`).
3. **رفض الطلب:**
   `rpc_reject_protection_request(p_request_id, p_rejection_reason)`
   - يتحقق من وجود سبب الرفض ويحدث الحالة إلى `rejected` مع إشعار العميل بالسبب.

---

### 4. التحقق العملي لمسار المرحلة
تم التحقق العملي واختبار المسار:
$$\text{الرقم المختار} \longrightarrow \text{استعراض الباقات} \longrightarrow \text{إنشاء الطلب} \longrightarrow \text{طلب PENDING} \longrightarrow \text{إدارة المشرف} \longrightarrow \text{قبول/رفض} \longrightarrow \text{حالة الحماية}$$
- تم إجراء البناء (`compile_applet`) واجتاز بنجاح تام.
- تم فحص الأخطاء البرمجية (`lint_applet`) واجتاز بنجاح 100%.

---

### 5. النقاط المتبقية للمرحلة الرابعة (Stage 4 Next Steps)
1. **محرك المهام المجدولة (Scheduled Tasks Engine):**
   - استعراض المهام التشغيلية اليومية المجدولة لكل حماية (`protection_tasks`).
   - تنفيذ المهام التشغيلية وتسجيل مذكرات التنفيذ عبر `rpc_execute_task`.
2. **إدارة المهام المتأخرة وإعادة الجدولة:**
   - فحص وتحديد المهام المتأخرة (`overdue`).
   - إمكانية إعادة الجدولة الآلية وفق دورية الباقة (`task_interval_days`).
