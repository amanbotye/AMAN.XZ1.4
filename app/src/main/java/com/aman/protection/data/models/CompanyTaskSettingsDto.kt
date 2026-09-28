package com.aman.protection.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * كائن نقل البيانات لجدول public.company_task_settings
 */
@Serializable
data class CompanyTaskSettingsDto(
    @SerialName("id")
    val id: String,

    @SerialName("company_id")
    val companyId: String,

    @SerialName("task_amount")
    val taskAmount: Double = 0.0,

    @SerialName("task_currency")
    val taskCurrency: String = "YER",

    @SerialName("task_interval_days")
    val taskIntervalDays: Int = 30,

    @SerialName("enable_first_task")
    val enableFirstTask: Boolean = true,

    @SerialName("enable_recurring_tasks")
    val enableRecurringTasks: Boolean = true,

    @SerialName("due_visibility_days")
    val dueVisibilityDays: Int = 7,

    @SerialName("allow_reschedule")
    val allowReschedule: Boolean = true,

    @SerialName("allow_after_expiry")
    val allowAfterExpiry: Boolean = false,

    @SerialName("max_days_after_expiry")
    val maxDaysAfterExpiry: Int = 0,

    @SerialName("is_active")
    val isActive: Boolean = true
)
