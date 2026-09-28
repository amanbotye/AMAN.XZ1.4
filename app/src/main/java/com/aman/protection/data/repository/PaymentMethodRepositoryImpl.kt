package com.aman.protection.data.repository

import com.aman.protection.core.AmanConstants
import com.aman.protection.core.AmanError
import com.aman.protection.core.AmanResult
import com.aman.protection.data.models.PaymentMethodDto
import com.aman.protection.data.models.toDomain
import com.aman.protection.data.remote.SupabaseProvider
import com.aman.protection.domain.models.PaymentMethod
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext

/**
 * تطبيق مستودع طرق الدفع المعتمدة المرتبط بـ Supabase PostgREST
 * خالي من البيانات الوهمية والفولباك
 */
class PaymentMethodRepositoryImpl : PaymentMethodRepository {

    private val _paymentMethods = MutableStateFlow<List<PaymentMethod>>(emptyList())
    override val paymentMethods: StateFlow<List<PaymentMethod>> = _paymentMethods.asStateFlow()

    override suspend fun getPaymentMethods(forceRefresh: Boolean): AmanResult<List<PaymentMethod>> = withContext(Dispatchers.IO) {
        if (!forceRefresh && _paymentMethods.value.isNotEmpty()) {
            return@withContext AmanResult.Success(_paymentMethods.value)
        }

        try {
            val dtoList = SupabaseProvider.postgrest.from(AmanConstants.TABLE_PAYMENT_METHODS)
                .select {
                    filter {
                        eq("is_active", true)
                        eq("is_deleted", false)
                    }
                    order("display_order", Order.ASCENDING)
                }
                .decodeList<PaymentMethodDto>()

            val domainList = dtoList.map { it.toDomain() }
            _paymentMethods.value = domainList
            AmanResult.Success(domainList)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun getPaymentMethodById(id: String): PaymentMethod? {
        return _paymentMethods.value.find { it.id == id }
    }
}
