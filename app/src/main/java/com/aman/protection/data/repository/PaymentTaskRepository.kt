package com.aman.protection.data.repository

import com.aman.protection.core.AmanResult
import com.aman.protection.domain.models.PaymentTask
import com.aman.protection.domain.models.TaskStatus
import kotlinx.coroutines.flow.StateFlow

/**
 * واجهة مستودع المهام المالية والتشغيلية (Payment/Protection Tasks)
 * يربط مباشرة بجدول public.protection_tasks والإجراءات rpc_execute_task و rpc_reschedule_task
 */
interface PaymentTaskRepository {
    val tasksList: StateFlow<List<PaymentTask>>
    suspend fun fetchTasksForProtection(protectionId: String): AmanResult<List<PaymentTask>>
    suspend fun fetchTasksForCustomer(customerId: String): AmanResult<List<PaymentTask>>
    suspend fun fetchAllAdminTasks(): AmanResult<List<PaymentTask>>
    suspend fun executeTask(taskId: String, executionNote: String?): AmanResult<String>
    suspend fun rescheduleTask(taskId: String, newScheduledAt: String, reason: String?): AmanResult<Unit>
}
