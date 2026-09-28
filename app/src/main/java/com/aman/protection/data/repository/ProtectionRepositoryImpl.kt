package com.aman.protection.data.repository

import com.aman.protection.core.AmanConstants
import com.aman.protection.core.AmanError
import com.aman.protection.core.AmanResult
import com.aman.protection.data.models.ProtectionDto
import com.aman.protection.data.models.RpcProtectionResultDto
import com.aman.protection.data.remote.SupabaseProvider
import com.aman.protection.domain.models.Protection
import com.aman.protection.domain.models.ProtectionStatus
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.rpc
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

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

    override suspend fun createRenewalRequest(
        protectionId: String,
        packageId: String,
        paymentMethodId: String,
        transferReference: String,
        customerNote: String?
    ): AmanResult<String> = withContext(Dispatchers.IO) {
        try {
            if (transferReference.isBlank()) {
                return@withContext AmanResult.Error(AmanError.ValidationError("يرجى إدخال رقم مرجع الحوالة"))
            }

            val rpcResult = SupabaseProvider.postgrest.rpc(
                function = "rpc_create_renewal_request",
                parameters = buildJsonObject {
                    put("p_protection_id", protectionId)
                    put("p_package_id", packageId)
                    put("p_payment_method_id", paymentMethodId)
                    put("p_transfer_reference", transferReference.trim())
                    customerNote?.let { put("p_customer_note", it.trim()) }
                }
            ).decodeSingle<RpcProtectionResultDto>()

            if (rpcResult.success && rpcResult.id != null) {
                AmanResult.Success(rpcResult.id)
            } else {
                val errorMsg = rpcResult.message ?: "تعذر إرسال طلب التجديد"
                AmanResult.Error(AmanError.DatabaseError(errorMsg, rpcResult.errorCode))
            }
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun approveRenewal(renewalId: String): AmanResult<Unit> = withContext(Dispatchers.IO) {
        try {
            // تدقيق مالي مسبق
            try {
                SupabaseProvider.postgrest.rpc(
                    function = "rpc_verify_manual_payment",
                    parameters = buildJsonObject {
                        put("p_renewal_id", renewalId)
                        put("p_verification_status", "verified")
                        put("p_verification_note", "تم تدقيق حوالة التجديد واعتمادها")
                    }
                )
            } catch (_: Exception) {}

            val rpcResult = SupabaseProvider.postgrest.rpc(
                function = "rpc_approve_renewal",
                parameters = buildJsonObject {
                    put("p_renewal_id", renewalId)
                }
            ).decodeSingle<RpcProtectionResultDto>()

            if (rpcResult.success) {
                fetchCustomerProtections()
                AmanResult.Success(Unit)
            } else {
                val errorMsg = rpcResult.message ?: "فشل اعتماد التجديد"
                AmanResult.Error(AmanError.DatabaseError(errorMsg, rpcResult.errorCode))
            }
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun rejectRenewal(renewalId: String, reason: String): AmanResult<Unit> = withContext(Dispatchers.IO) {
        try {
            if (reason.isBlank()) {
                return@withContext AmanResult.Error(AmanError.ValidationError("يرجى كتابة سبب رفض التجديد"))
            }

            val rpcResult = SupabaseProvider.postgrest.rpc(
                function = "rpc_reject_renewal",
                parameters = buildJsonObject {
                    put("p_renewal_id", renewalId)
                    put("p_rejection_reason", reason.trim())
                }
            ).decodeSingle<RpcProtectionResultDto>()

            if (rpcResult.success) {
                AmanResult.Success(Unit)
            } else {
                val errorMsg = rpcResult.message ?: "فشل رفض طلب التجديد"
                AmanResult.Error(AmanError.DatabaseError(errorMsg, rpcResult.errorCode))
            }
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }
}
