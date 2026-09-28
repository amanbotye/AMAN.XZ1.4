package com.aman.protection.data.models

import com.aman.protection.domain.models.ProtectionRequest
import com.aman.protection.domain.models.RequestStatus
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * كائن نقل البيانات لجدول public.protection_requests
 */
@Serializable
data class ProtectionRequestDto(
    @SerialName("id")
    val id: String,

    @SerialName("customer_id")
    val customerId: String,

    @SerialName("customer_number_id")
    val customerNumberId: String,

    @SerialName("company_id")
    val companyId: String,

    @SerialName("package_id")
    val packageId: String,

    @SerialName("payment_method_id")
    val paymentMethodId: String,

    @SerialName("status")
    val status: String = "pending",

    @SerialName("requested_price")
    val requestedPrice: Double = 0.0,

    @SerialName("requested_currency")
    val requestedCurrency: String = "YER",

    @SerialName("requested_duration_days")
    val requestedDurationDays: Int = 30,

    @SerialName("payment_transfer_reference")
    val paymentTransferReference: String? = null,

    @SerialName("customer_note")
    val customerNote: String? = null,

    @SerialName("rejection_reason")
    val rejectionReason: String? = null,

    @SerialName("reviewed_by")
    val reviewedBy: String? = null,

    @SerialName("reviewed_at")
    val reviewedAt: String? = null,

    @SerialName("created_at")
    val createdAt: String? = null,

    @SerialName("updated_at")
    val updatedAt: String? = null
) {
    fun toDomain(): ProtectionRequest = ProtectionRequest(
        id = id,
        customerId = customerId,
        customerNumberId = customerNumberId,
        companyId = companyId,
        packageId = packageId,
        paymentMethodId = paymentMethodId,
        status = when (status.lowercase()) {
            "approved" -> RequestStatus.APPROVED
            "rejected" -> RequestStatus.REJECTED
            "cancelled" -> RequestStatus.CANCELLED
            else -> RequestStatus.PENDING
        },
        requestedPrice = requestedPrice,
        requestedCurrency = requestedCurrency,
        requestedDurationDays = requestedDurationDays,
        paymentTransferReference = paymentTransferReference,
        customerNote = customerNote,
        rejectionReason = rejectionReason,
        reviewedBy = reviewedBy,
        reviewedAt = reviewedAt,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}
