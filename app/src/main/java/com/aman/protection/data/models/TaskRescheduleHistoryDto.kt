package com.aman.protection.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * كائن نقل البيانات لجدول public.task_reschedule_history
 */
@Serializable
data class TaskRescheduleHistoryDto(
    @SerialName("id")
    val id: String,

    @SerialName("task_id")
    val taskId: String,

    @SerialName("protection_id")
    val protectionId: String,

    @SerialName("old_scheduled_at")
    val oldScheduledAt: String? = null,

    @SerialName("new_scheduled_at")
    val newScheduledAt: String? = null,

    @SerialName("old_due_at")
    val oldDueAt: String? = null,

    @SerialName("new_due_at")
    val newDueAt: String? = null,

    @SerialName("old_interval_days")
    val oldIntervalDays: Int? = null,

    @SerialName("new_interval_days")
    val newIntervalDays: Int? = null,

    @SerialName("reason")
    val reason: String? = null,

    @SerialName("changed_by")
    val changedBy: String? = null,

    @SerialName("created_at")
    val createdAt: String
)
