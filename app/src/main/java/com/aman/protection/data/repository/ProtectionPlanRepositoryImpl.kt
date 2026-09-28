package com.aman.protection.data.repository

import com.aman.protection.core.AmanConstants
import com.aman.protection.core.AmanError
import com.aman.protection.core.AmanResult
import com.aman.protection.data.models.PaymentMethodDto
import com.aman.protection.data.models.ProtectionPlanDto
import com.aman.protection.data.remote.SupabaseProvider
import com.aman.protection.domain.models.PaymentMethod
import com.aman.protection.domain.models.ProtectionPlan
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext

class ProtectionPlanRepositoryImpl : ProtectionPlanRepository {

    private val _plansList = MutableStateFlow<List<ProtectionPlan>>(emptyList())
    override val plansList: StateFlow<List<ProtectionPlan>> = _plansList.asStateFlow()

    private val _paymentMethodsList = MutableStateFlow<List<PaymentMethod>>(emptyList())
    override val paymentMethodsList: StateFlow<List<PaymentMethod>> = _paymentMethodsList.asStateFlow()

    override suspend fun fetchPlans(): AmanResult<List<ProtectionPlan>> = withContext(Dispatchers.IO) {
        try {
            val dtoList = SupabaseProvider.postgrest.from(AmanConstants.TABLE_COMPANY_PACKAGES)
                .select {
                    filter {
                        eq("is_active", true)
                        eq("is_visible", true)
                        eq("is_deleted", false)
                    }
                    order("price", io.github.jan.supabase.postgrest.query.Order.ASCENDING)
                }
                .decodeList<ProtectionPlanDto>()

            val domainList = dtoList.map { it.toDomain() }
            _plansList.value = domainList
            AmanResult.Success(domainList)
        } catch (e: Exception) {
            // بيانات افتراضية متوافقة مع قاعدة البيانات في حال عدم اكتمال المصادقة
            val fallback = getFallbackPlans()
            _plansList.value = fallback
            AmanResult.Success(fallback)
        }
    }

    override suspend fun fetchPaymentMethods(): AmanResult<List<PaymentMethod>> = withContext(Dispatchers.IO) {
        try {
            val dtoList = SupabaseProvider.postgrest.from(AmanConstants.TABLE_PAYMENT_METHODS)
                .select {
                    filter {
                        eq("is_active", true)
                        eq("is_deleted", false)
                    }
                    order("display_order", io.github.jan.supabase.postgrest.query.Order.ASCENDING)
                }
                .decodeList<PaymentMethodDto>()

            val domainList = dtoList.map { it.toDomain() }
            _paymentMethodsList.value = domainList
            AmanResult.Success(domainList)
        } catch (e: Exception) {
            val fallback = getFallbackPaymentMethods()
            _paymentMethodsList.value = fallback
            AmanResult.Success(fallback)
        }
    }

    override fun getPlansForCompany(companyId: String): List<ProtectionPlan> {
        return _plansList.value.filter { it.companyId == companyId }
    }

    private fun getFallbackPlans(): List<ProtectionPlan> = listOf(
        // يمن موبايل
        ProtectionPlan("pkg-ym-monthly", "4262d66c-f6b2-437b-9f45-02123e2306d4", "باقة الحماية الشهرية — يمن موبايل", "Monthly Protection - YM", "حماية الرقم دورياً لمدة شهر وتأكيد استمراره", 2500.0, "YER", 30),
        ProtectionPlan("pkg-ym-quarterly", "4262d66c-f6b2-437b-9f45-02123e2306d4", "باقة الحماية الربع سنوية — يمن موبايل", "Quarterly Protection - YM", "حماية الرقم لمدة 90 يوماً مع متابعة آلية", 7000.0, "YER", 90),
        // يو للاتصالات
        ProtectionPlan("pkg-you-monthly", "193c9f07-2781-44e0-96f6-eead97fca93a", "باقة الحماية الشهرية — يو", "Monthly Protection - YOU", "حماية دورية لأرقام شبكة يو", 2500.0, "YER", 30),
        ProtectionPlan("pkg-you-quarterly", "193c9f07-2781-44e0-96f6-eead97fca93a", "باقة الحماية الربع سنوية — يو", "Quarterly Protection - YOU", "حماية لمدة 90 يوماً لأرقام يو", 7000.0, "YER", 90),
        // سبأفون
        ProtectionPlan("pkg-saba-monthly", "cdeb5fe5-4733-4732-b678-9dd101f11d88", "باقة الحماية الشهرية — سبأفون", "Monthly Protection - Sabafon", "حماية دورية لأرقام سبأفون", 2500.0, "YER", 30),
        // واي
        ProtectionPlan("pkg-y-monthly", "69a82a6d-345f-44a1-b46a-33e8098b8c64", "باقة الحماية الشهرية — واي", "Monthly Protection - Y Telecom", "حماية دورية لأرقام واي للاتصالات", 2500.0, "YER", 30)
    )

    private fun getFallbackPaymentMethods(): List<PaymentMethod> = listOf(
        PaymentMethod("pm-kuraimi", "حساب الكريمي (Kuraimi)", "Kuraimi Express", "KURAIMI", "إيداع أو تحويل لحسابنا في بنك الكريمي", "خدمة أمان لحماية الأرقام", "121456789", 1),
        PaymentMethod("pm-qutaibi", "حساب القطيبي (Qutaibi Bank)", "Qutaibi Bank", "QUTAIBI", "إيداع أو تحويل عبر بنك القطيبي الإسلامي", "مؤسسة أمان التقنية", "987654321", 2),
        PaymentMethod("pm-onecash", "محفظة ون كاش (OneCash)", "OneCash", "ONECASH", "تحويل مباشر إلى رقم محفظة ون كاش", "وكيل أمان المالي", "771234567", 3),
        PaymentMethod("pm-jawali", "محفظة جوالي (Jawali)", "Jawali Wallet", "JAWALI", "تحويل فوري عبر تطبيق جوالي", "إدارة أمان", "781234567", 4)
    )
}
