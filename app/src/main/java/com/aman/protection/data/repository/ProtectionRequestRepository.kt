package com.aman.protection.data.repository

import com.aman.protection.core.AmanResult
import com.aman.protection.domain.models.ProtectionRequest
import kotlinx.coroutines.flow.StateFlow

interface ProtectionRequestRepository {
    val customerRequests: StateFlow<List<ProtectionRequest>>
    val pendingRequestsAdmin: StateFlow<List<ProtectionRequest>>

    suspend fun fetchCustomerRequests(): AmanResult<List<ProtectionRequest>>
    suspend fun fetchPendingRequestsAdmin(): AmanResult<List<ProtectionRequest>>

    suspend fun createProtectionRequest(
        customerNumberId: String,
        packageId: String,
        paymentMethodId: String,
        transferReference: String,
        customerNote: String? = null
    ): AmanResult<String>

    suspend fun approveRequest(requestId: String): AmanResult<String>

    suspend fun rejectRequest(requestId: String, reason: String): AmanResult<Unit>

    fun hasPendingRequestForNumber(customerNumberId: String): Boolean
}
