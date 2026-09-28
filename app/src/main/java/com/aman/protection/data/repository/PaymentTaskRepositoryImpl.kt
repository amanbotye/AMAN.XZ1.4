package com.aman.protection.data.repository

import com.aman.protection.core.AmanConstants
import com.aman.protection.core.AmanError
import com.aman.protection.core.AmanResult
import com.aman.protection.data.models.PaymentTaskDto
import com.aman.protection.data.models.RpcTaskResultDto
import com.aman.protection.data.models.toDomain
import com.aman.protection.data.remote.SupabaseProvider
import com.aman.protection.domain.models.PaymentTask
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Order
import io.github.jan.supabase.postgrest.rpc
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/**
 * تطبيق مستودع المهام المالية والتشغيلية المعتمد على Supabase
 */
class PaymentTaskRepositoryImpl(
    private val customerNumberRepository: CustomerNumberRepository
) : PaymentTaskRepository {

    private val _tasksList = MutableStateFlow<List<PaymentTask>>(emptyList())
    override val tasksList: StateFlow<List<PaymentTask>> = _tasksList.asStateFlow()

    override suspend fun fetchTasksForProtection(protectionId: String): AmanResult<List<PaymentTask>> = withContext(Dispatchers.IO) {
        try {
            val dtoList = SupabaseProvider.postgrest.from(AmanConstants.TABLE_PROTECTION_TASKS)
                .select {
                    filter {
                        eq("protection_id", protectionId)
                    }
                    order("task_number", Order.ASCENDING)
                }
                .decodeList<PaymentTaskDto>()

            val domainList = dtoList.map { dto ->
                val number = customerNumberRepository.numbersList.value.find { it.id == dto.customerNumberId }
                dto.toDomain(phoneNumber = number?.phoneNumber, companyName = number?.companyName)
            }
            AmanResult.Success(domainList)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.Network(e.message ?: "Failed to fetch protection tasks"))
        }
    }

    override suspend fun fetchTasksForCustomer(customerId: String): AmanResult<List<PaymentTask>> = withContext(Dispatchers.IO) {
        try {
            val dtoList = SupabaseProvider.postgrest.from(AmanConstants.TABLE_PROTECTION_TASKS)
                .select {
                    filter {
                        eq("customer_id", customerId)
                    }
                    order("due_at", Order.ASCENDING)
                }
                .decodeList<PaymentTaskDto>()

            val domainList = dtoList.map { dto ->
                val number = customerNumberRepository.numbersList.value.find { it.id == dto.customerNumberId }
                dto.toDomain(phoneNumber = number?.phoneNumber, companyName = number?.companyName)
            }
            _tasksList.value = domainList
            AmanResult.Success(domainList)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.Network(e.message ?: "Failed to fetch customer tasks"))
        }
    }

    override suspend fun fetchAllAdminTasks(): AmanResult<List<PaymentTask>> = withContext(Dispatchers.IO) {
        try {
            val dtoList = SupabaseProvider.postgrest.from(AmanConstants.TABLE_PROTECTION_TASKS)
                .select {
                    order("due_at", Order.ASCENDING)
                }
                .decodeList<PaymentTaskDto>()

            val domainList = dtoList.map { dto ->
                val number = customerNumberRepository.numbersList.value.find { it.id == dto.customerNumberId }
                dto.toDomain(phoneNumber = number?.phoneNumber, companyName = number?.companyName)
            }
            _tasksList.value = domainList
            AmanResult.Success(domainList)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.Network(e.message ?: "Failed to fetch admin tasks"))
        }
    }

    override suspend fun executeTask(taskId: String, executionNote: String?): AmanResult<String> = withContext(Dispatchers.IO) {
        try {
            val params = buildJsonObject {
                put("p_task_id", taskId)
                if (!executionNote.isNullOrBlank()) {
                    put("p_execution_note", executionNote)
                }
            }

            val result = SupabaseProvider.postgrest.rpc(
                function = "rpc_execute_task",
                parameters = params
            ).decodeAs<RpcTaskResultDto>()

            if (result.success) {
                // تحديث القائمة فورياً
                fetchAllAdminTasks()
                AmanResult.Success(result.nextTaskId ?: "")
            } else {
                val error = AmanError.fromCode(result.errorCode ?: "EXECUTION_FAILED")
                AmanResult.Error(error)
            }
        } catch (e: Exception) {
            AmanResult.Error(AmanError.Network("خطأ في الاتصال بقاعدة البيانات أثناء تنفيذ المهمة: ${e.message}"))
        }
    }

    override suspend fun rescheduleTask(taskId: String, newScheduledAt: String, reason: String?): AmanResult<Unit> = withContext(Dispatchers.IO) {
        try {
            val params = buildJsonObject {
                put("p_task_id", taskId)
                put("p_new_scheduled_at", newScheduledAt)
                if (!reason.isNullOrBlank()) {
                    put("p_reason", reason)
                }
            }

            val result = SupabaseProvider.postgrest.rpc(
                function = "rpc_reschedule_task",
                parameters = params
            ).decodeAs<RpcTaskResultDto>()

            if (result.success) {
                fetchAllAdminTasks()
                AmanResult.Success(Unit)
            } else {
                val error = AmanError.fromCode(result.errorCode ?: "RESCHEDULE_FAILED")
                AmanResult.Error(error)
            }
        } catch (e: Exception) {
            AmanResult.Error(AmanError.Network("خطأ في الاتصال بقاعدة البيانات أثناء إعادة الجدولة: ${e.message}"))
        }
    }
}
