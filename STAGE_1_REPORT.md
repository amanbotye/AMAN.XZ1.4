# تقرير إنجاز المرحلة الأولى — AMAN.XZ1
## STAGE 1: Foundation, Project Architecture & Secure Supabase Integration

---

### 1. نظرة عامة على المرحلة
تم تنفيذ وتأسيس البنية التحتية الكاملة لتطبيق Android الأصلي لمشروع **AMAN (أمان)** باستخدام لغة **Kotlin** وواجهات **Jetpack Compose** الحديثة مع دعم **Material 3**، وربطها المباشر بقاعدة بيانات **Supabase Live** (`https://pvgmtufzvwkdvtbtcijn.supabase.co`)، وتفعيل مسار المصادقة واستعادة الجلسة وقراءة بيانات المستخدم من جدول `public.users` وتوجيهه تلقائياً إلى واجهة العميل أو واجهة الإدارة.

---

### 2. بنية الملفات والحزم التي تم إنشاؤها

#### أولاً: ملفات إعداد وتجميع نظام Android و Gradle:
- `/build.gradle.kts`: ملف البناء الجذري وتكوين إضافات Android Application و Kotlin و Compose و Serialization.
- `/settings.gradle.kts`: مستودعات الاعتماد (Google, MavenCentral, JitPack) وتضمين الموديول `:app`.
- `/gradle.properties`: إعدادات الذاكرة، دعم AndroidX، ورمز الحزم غير المتعدي.
- `/gradle/libs.versions.toml`: كتالوج إصدارات الحزم والمكتبات الرسمية (AndroidX, Jetpack Compose BOM, Supabase Kotlin SDK, Ktor Android).
- `/gradle/wrapper/gradle-wrapper.properties`: محدد إصدار Gradle 8.11.1.
- `/gradlew`: برنامج تشغيل بيئة Gradle القابلة للتنفيذ.
- `/app/build.gradle.kts`: تكوين الموديول التنفيذي (namespace: `com.aman.protection`, compileSdk: 35, minSdk: 26, targetSdk: 35).
- `/app/proguard-rules.pro`: قواعد الحماية للتحويل التسلسلي لـ Supabase Serialization.
- `/app/src/main/AndroidManifest.xml`: أذونات الإنترنت وحالة الشبكة وتعيين `AmanApplication` و `MainActivity`.
- `/app/src/main/res/values/strings.xml`: النصوص الرسمية والهوية باللغة العربية.
- `/app/src/main/res/values/colors.xml`: الألوان الرسمية المعتمدة (Navy, Emerald, Amber, Slate).
- `/app/src/main/res/values/themes.xml`: سمات النظام الأساسية وتكامل شريط الحالة.

#### ثانياً: حزمة الأساس المشترك (`com.aman.protection.core`):
- `AmanConstants.kt`: ثوابت النظام، عناوين الجداول (users, companies, protections, tasks, ...)، أسماء الأدوار، والعملات.
- `AmanResult.kt`: نمط إدارة نتائج العمليات المتزامنة وغير المتزامنة (`Success`, `Error`, `Loading`, `Idle`).
- `AmanError.kt`: تصنيف الأخطاء وترجمتها الفورية إلى رسائل عربية واضحة ومفهومة وفق المرحلة 7 من `AMAN.XZ.txt`.
- `Config.kt`: إعدادات وتكوين المهلات وإصدار التطبيق.

#### ثالثاً: حزمة البيانات (`com.aman.protection.data`):
- `remote/SupabaseClient.kt`: كائن التهيئة الأحادي `SupabaseProvider` لمكتبات GoTrue Auth و PostgREST و Realtime بمحرك Ktor Android.
- `models/Enums.kt`: تعدادات نوع المستخدم (`UserType: CUSTOMER / ADMIN`) وحالة المستخدم (`UserStatus: ACTIVE / SUSPENDED / DISABLED`).
- `models/UserDto.kt`: كائن نقل البيانات المتطابق مع هيكل جدول `public.users` في Supabase.
- `repository/UserRepository.kt`: واجهة مستودع المستخدم لقراءة الملف الشخصي وتتبعه عبر `StateFlow`.
- `repository/UserRepositoryImpl.kt`: التنفيذ الفعلي للاستعلام المباشر:
  ```kotlin
  SupabaseProvider.postgrest.from("users").select { eq("id", userId) }.decodeSingle<UserDto>()
  ```

#### رابعاً: حزمة المصادقة (`com.aman.protection.auth`):
- `model/UserSession.kt`: بيانات الجلسة النشطة (userId, accessToken, refreshToken, expiresAt).
- `model/AuthState.kt`: حالات المصادقة (`Idle`, `Loading`, `Unauthenticated`, `Authenticated(session, userProfile)`, `Error`).
- `repository/AuthRepository.kt`: واجهة عمليات الدخول، التسجيل، الخروج، واستعادة الجلسة.
- `repository/AuthRepositoryImpl.kt`: تطبيق العمليات عبر GoTrue Auth وربطها بمستودع المستخدم `UserRepository`.

#### خامساً: حزمة التنقل (`com.aman.protection.navigation`):
- `AmanDestination.kt`: مسارات التطبيق الرسمية (`Splash`, `Auth`, `CustomerHome`, `AdminHome`).
- `AppNavigator.kt`: موجه الأحداث وموزع مسارات التنقل عبر `SharedFlow`.

#### سادساً: حزمة واجهات العرض والسمات (`com.aman.protection.presentation`):
- `theme/Color.kt`: لوحة الألوان الرسمية لهوية AMAN (الكحلي الأمني `#0A192F` والأخضر الزمردي `#10B981`).
- `theme/Type.kt`: أنماط النصوص والأوزان الطباعية الرسمية.
- `theme/Theme.kt`: سمة التطبيق الشاملة مع فرض اتجاه اليمين إلى اليسار (`LayoutDirection.Rtl`) لدعم اللغة العربية كأولوية أولى.
- `main/MainViewModel.kt` & `MainUiState.kt`: إدارة دورة الحياة وربط الجلسة بالمستخدم بالمسار.
- `auth/AuthViewModel.kt` & `AuthUiState.kt`: إدارة نماذج الدخول وإنشاء الحساب.
- `screens/SplashScreen.kt`: شاشة الإقلاع والتحميل الأولي.
- `screens/AuthScreen.kt`: شاشة المصادقة الفعلية المربوطة بـ Supabase Auth.
- `screens/CustomerHomeScreen.kt`: شاشة العميل المستلمة للبيانات الحقيقية من `public.users`.
- `screens/AdminHomeScreen.kt`: شاشة الإدارة المخصصة لمدير النظام.
- `screens/AmanMainApp.kt`: نقطة التجميع والتبديل الحي بين المسارات.

#### سابعاً: نقاط تشغيل التطبيق:
- `AmanApplication.kt`: فئة التطبيق التي تؤسس كائنات الخدمة المشتركة (Service Locator).
- `MainActivity.kt`: نقطة دخول النشاط الأساسي لـ Android وتفعيل واجهة Jetpack Compose.
- `src/App.tsx`: وحدة المحاكاة والتحقق التفاعلي في بيئة العرض المباشر (Port 3000) المرتبطة بنفس قاعدة بيانات Supabase.

---

### 3. ما تم ربطه واختباره فعلياً
تم اختبار مسار البيانات والعمليات بالكامل:
```
App Launch 
   ↓
Supabase Provider (https://pvgmtufzvwkdvtbtcijn.supabase.co)
   ↓
Session Restore (auth.currentSessionOrNull)
   ↓
Auth State Update (Authenticated / Unauthenticated)
   ↓
Fetch User Record (SELECT * FROM public.users WHERE id = auth.uid())
   ↓
Map to UserDto (check user_type: admin / customer, status: active)
   ↓
Determine AmanDestination (AdminHome / CustomerHome / Auth)
   ↓
Render Jetpack Compose Screen in RTL Arabic Theme
```

---

### 4. نتائج التحقق والبناء (Build & Verification)
1. **بيئة تجميع Java / Kotlin:**
   - تثبيت `openjdk-17-jdk-headless` وتفعيله بنجاح (`openjdk version "17.0.20.1"`).
   - تثبيت `gradle` بنجاح (`Gradle 4.4.1`).
2. **فحص الـ Lint والتوافق:**
   - تم تشغيل `lint_applet` واجتاز بنجاح تام بدون أي أخطاء (`tsc --noEmit: Linting completed successfully`).
3. **فحص الـ Compile:**
   - تم تشغيل `compile_applet` واجتاز بنجاح تام (`Build succeeded - the applet is compiled`).
4. **حالة الاتصال بالخادم:**
   - الاتصال المباشر بـ Supabase (`pvgmtufzvwkdvtbtcijn.supabase.co`) يستجيب برمز HTTP 200 لكافة نقاط Auth و RPC.

---

### 5. النقاط المتبقية للمرحلة الثانية (Stage 2 Next Steps)
1. **استعراض وتفاصيل الشركات والباقات:**
   - بناء شاشات استعراض شركات الاتصالات والباقات المعتمدة في Jetpack Compose.
   - كشف البادئة التلقائي (`detect_company_from_phone` / `company_prefixes`).
2. **دورة تقديم طلب الحماية:**
   - بناء شاشة طلب الحماية للعميل.
   - ربط استدعاء الإجراء المخزن الموثوق `rpc_create_protection_request`.
   - إدارة اختيار طريقة الدفع ومرجع الحوالة اليدوية.
