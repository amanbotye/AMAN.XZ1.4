package com.aman.protection.data.repository

import com.aman.protection.core.AmanResult
import com.aman.protection.domain.models.Protection
import kotlinx.coroutines.flow.StateFlow

interface ProtectionRepository {
    val customerProtections: StateFlow<List<Protection>>
    suspend fun fetchCustomerProtections(): AmanResult<List<Protection>>
    suspend fun fetchAllProtectionsAdmin(): AmanResult<List<Protection>>
    fun hasActiveProtectionForNumber(customerNumberId: String): Boolean

    // Renewal Operations (CUS-05 & Admin Renewal Approval)
    suspend fun createRenewalRequest(
        protectionId: String,
        packageId: String,
        paymentMethodId: String,
        transferReference: String,
        customerNote: String?
    ): AmanResult<String>

    suspend fun approveRenewal(renewalId: String): AmanResult<Unit>
    suspend fun rejectRenewal(renewalId: String, reason: String): AmanResult<Unit>
}
