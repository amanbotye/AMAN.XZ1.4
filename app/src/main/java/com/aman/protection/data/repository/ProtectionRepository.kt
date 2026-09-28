package com.aman.protection.data.repository

import com.aman.protection.core.AmanResult
import com.aman.protection.domain.models.Protection
import kotlinx.coroutines.flow.StateFlow

interface ProtectionRepository {
    val customerProtections: StateFlow<List<Protection>>

    suspend fun fetchCustomerProtections(): AmanResult<List<Protection>>
    suspend fun fetchAllProtectionsAdmin(): AmanResult<List<Protection>>
    fun hasActiveProtectionForNumber(customerNumberId: String): Boolean
}
