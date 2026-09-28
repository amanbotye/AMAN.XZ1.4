package com.aman.protection.data.models

import com.aman.protection.domain.models.Protection
import com.aman.protection.domain.models.ProtectionStatus
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * كائن نقل البيانات لجدول public.protections
 */
@Serializable
data class ProtectionDto(
    @SerialName("id")
    val id: String,

    @SerialName("customer_id")
    val customerId: String,

    @SerialName("customer_number_id")
    val customerNumberId: String,

    @SerialName("company_id")
    val companyId: String,

    @SerialName("source_request_id")
    val sourceRequestId: String? = null,

    @SerialName("package_id")
    val packageId: String,

    @SerialName("package_name_snapshot")
    val packageNameSnapshot: String = "",

    @SerialName("price_snapshot")
    val priceSnapshot: Double = 0.0,

    @SerialName("currency_snapshot")
    val currencySnapshot: String = "YER",

    @SerialName("duration_days_snapshot")
    val durationDaysSnapshot: Int = 30,

    @SerialName("task_amount_snapshot")
    val taskAmountSnapshot: Double? = null,

    @SerialName("task_interval_days_snapshot")
    val taskIntervalDaysSnapshot: Int? = null,

    @SerialName("task_currency_snapshot")
    val taskCurrencySnapshot: String? = null,

    @SerialName("start_at")
    val startAt: String,

    @SerialName("end_at")
    val endAt: String,

    @SerialName("status")
    val status: String = "active",

    @SerialName("renewal_count")
    val renewalCount: Int = 0,

    @SerialName("is_deleted")
    val isDeleted: Boolean = false,

    @SerialName("created_at")
    val createdAt: String? = null,

    @SerialName("updated_at")
    val updatedAt: String? = null
) {
    fun toDomain(): Protection = Protection(
        id = id,
        customerId = customerId,
        customerNumberId = customerNumberId,
        companyId = companyId,
        sourceRequestId = sourceRequestId,
        packageId = packageId,
        packageNameSnapshot = packageNameSnapshot,
        priceSnapshot = priceSnapshot,
        currencySnapshot = currencySnapshot,
        durationDaysSnapshot = durationDaysSnapshot,
        taskAmountSnapshot = taskAmountSnapshot,
        taskIntervalDaysSnapshot = taskIntervalDaysSnapshot,
        taskCurrencySnapshot = taskCurrencySnapshot,
        startAt = startAt,
        endAt = endAt,
        status = when (status.lowercase()) {
            "expired" -> ProtectionStatus.EXPIRED
            "cancelled" -> ProtectionStatus.CANCELLED
            "pending_renewal" -> ProtectionStatus.PENDING_RENEWAL
            else -> ProtectionStatus.ACTIVE
        },
        renewalCount = renewalCount,
        isDeleted = isDeleted,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}
