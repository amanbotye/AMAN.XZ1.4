package com.aman.protection.data.repository

import com.aman.protection.core.AmanResult
import com.aman.protection.domain.models.PaymentMethod
import kotlinx.coroutines.flow.StateFlow

/**
 * واجهة مستودع طرق الدفع المعتمدة (PaymentMethodRepository)
 * يربط مباشرة بجدول public.payment_methods في Supabase Live
 */
interface PaymentMethodRepository {
    val paymentMethods: StateFlow<List<PaymentMethod>>
    suspend fun getPaymentMethods(forceRefresh: Boolean = false): AmanResult<List<PaymentMethod>>
    suspend fun getPaymentMethodById(id: String): PaymentMethod?
}
