package com.aman.protection.data.repository

import com.aman.protection.core.AmanResult
import com.aman.protection.domain.models.PaymentMethod
import com.aman.protection.domain.models.ProtectionPlan
import kotlinx.coroutines.flow.StateFlow

interface ProtectionPlanRepository {
    val plansList: StateFlow<List<ProtectionPlan>>
    val paymentMethodsList: StateFlow<List<PaymentMethod>>

    suspend fun fetchPlans(): AmanResult<List<ProtectionPlan>>
    suspend fun fetchPaymentMethods(): AmanResult<List<PaymentMethod>>
    fun getPlansForCompany(companyId: String): List<ProtectionPlan>
}
