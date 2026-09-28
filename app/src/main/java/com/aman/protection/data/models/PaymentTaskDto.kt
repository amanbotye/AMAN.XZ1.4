package com.aman.protection.data.models

import com.aman.protection.domain.models.PaymentTask
import com.aman.protection.domain.models.TaskStatus
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * كائن نقل البيانات لجدول public.protection_tasks
 */
@Serializable
data class PaymentTaskDto(
    @SerialName("id")
    val id: String,

    @SerialName("protection_id")
    val protectionId: String,

    @SerialName("customer_id")
    val customerId: String,

    @SerialName("customer_number_id")
    val customerNumberId: String,

    @SerialName("company_id")
    val companyId: String,

    @SerialName("task_number")
    val taskNumber: Int,

    @SerialName("task_type")
    val taskType: String = "operational",

    @SerialName("amount")
    val amount: Double = 0.0,

    @SerialName("currency")
    val currency: String = "YER",

    @SerialName("scheduled_at")
    val scheduledAt: String,

    @SerialName("due_at")
    val dueAt: String,

    @SerialName("status")
    val status: String,

    @SerialName("completed_at")
    val completedAt: String? = null,

    @SerialName("completed_by")
    val completedBy: String? = null,

    @SerialName("execution_note")
    val executionNote: String? = null,

    @SerialName("source_task_interval_days")
    val sourceTaskIntervalDays: Int = 30,

    @SerialName("created_at")
    val createdAt: String,

    @SerialName("updated_at")
    val updatedAt: String
)

fun PaymentTaskDto.toDomain(phoneNumber: String? = null, companyName: String? = null): PaymentTask {
    return PaymentTask(
        id = id,
        protectionId = protectionId,
        customerId = customerId,
        customerNumberId = customerNumberId,
        companyId = companyId,
        taskNumber = taskNumber,
        taskType = taskType,
        amount = amount,
        currency = currency,
        scheduledAt = scheduledAt,
        dueAt = dueAt,
        rawStatus = status,
        status = TaskStatus.resolve(status, scheduledAt, dueAt),
        completedAt = completedAt,
        completedBy = completedBy,
        executionNote = executionNote,
        sourceTaskIntervalDays = sourceTaskIntervalDays,
        createdAt = createdAt,
        updatedAt = updatedAt,
        phoneNumber = phoneNumber,
        companyName = companyName
    )
}
