package com.aman.protection.data.repository

import com.aman.protection.core.AmanConstants
import com.aman.protection.core.AmanError
import com.aman.protection.core.AmanResult
import com.aman.protection.data.models.ProtectionDto
import com.aman.protection.data.remote.SupabaseProvider
import com.aman.protection.domain.models.Protection
import com.aman.protection.domain.models.ProtectionStatus
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext

class ProtectionRepositoryImpl(
    private val customerNumberRepository: CustomerNumberRepository
) : ProtectionRepository {

    private val _customerProtections = MutableStateFlow<List<Protection>>(emptyList())
    override val customerProtections: StateFlow<List<Protection>> = _customerProtections.asStateFlow()

    override suspend fun fetchCustomerProtections(): AmanResult<List<Protection>> = withContext(Dispatchers.IO) {
        try {
            val user = SupabaseProvider.auth.currentSessionOrNull()?.user
                ?: return@withContext AmanResult.Error(AmanError.SessionExpired())

            val dtoList = SupabaseProvider.postgrest.from(AmanConstants.TABLE_PROTECTIONS)
                .select {
                    filter {
                        eq("customer_id", user.id)
                        eq("is_deleted", false)
                    }
                    order("created_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                }
                .decodeList<ProtectionDto>()

            val numbersMap = customerNumberRepository.numbersList.value.associateBy { it.id }

            val domainList = dtoList.map { dto ->
                dto.toDomain().copy(
                    customerNumber = numbersMap[dto.customerNumberId]
                )
            }

            _customerProtections.value = domainList
            AmanResult.Success(domainList)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun fetchAllProtectionsAdmin(): AmanResult<List<Protection>> = withContext(Dispatchers.IO) {
        try {
            val dtoList = SupabaseProvider.postgrest.from(AmanConstants.TABLE_PROTECTIONS)
                .select {
                    filter {
                        eq("is_deleted", false)
                    }
                    order("created_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                }
                .decodeList<ProtectionDto>()

            val domainList = dtoList.map { it.toDomain() }
            AmanResult.Success(domainList)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override fun hasActiveProtectionForNumber(customerNumberId: String): Boolean {
        return _customerProtections.value.any {
            it.customerNumberId == customerNumberId && it.status == ProtectionStatus.ACTIVE && !it.isDeleted
        }
    }
}
