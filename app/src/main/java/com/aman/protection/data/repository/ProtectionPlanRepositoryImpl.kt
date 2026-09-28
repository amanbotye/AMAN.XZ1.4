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

/**
 * مستودع باقات الحماية وطرق الدفع
 * يستعلم حصرياً من Supabase بدون بيانات افتراضية وهمية
 */
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
            AmanResult.Error(AmanError.fromThrowable(e))
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
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override fun getPlansForCompany(companyId: String): List<ProtectionPlan> {
        return _plansList.value.filter { it.companyId == companyId }
    }
}
