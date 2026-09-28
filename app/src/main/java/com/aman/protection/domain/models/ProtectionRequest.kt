package com.aman.protection.domain.models

/**
 * كيان طلب الحماية (Protection Request Domain Model)
 */
data class ProtectionRequest(
    val id: String,
    val customerId: String,
    val customerNumberId: String,
    val companyId: String,
    val packageId: String,
    val paymentMethodId: String,
    val status: RequestStatus = RequestStatus.PENDING,
    val requestedPrice: Double,
    val requestedCurrency: String = "YER",
    val requestedDurationDays: Int = 30,
    val paymentTransferReference: String? = null,
    val customerNote: String? = null,
    val rejectionReason: String? = null,
    val reviewedBy: String? = null,
    val reviewedAt: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null,

    // العلاقات المربوطة للعرض
    val customerNumber: CustomerNumber? = null,
    val company: Company? = null,
    val packagePlan: ProtectionPlan? = null,
    val paymentMethod: PaymentMethod? = null,
    val customerName: String? = null
) {
    val isPending: Boolean get() = status == RequestStatus.PENDING
    val isApproved: Boolean get() = status == RequestStatus.APPROVED
    val isRejected: Boolean get() = status == RequestStatus.REJECTED
    val isCancelled: Boolean get() = status == RequestStatus.CANCELLED
}

enum class RequestStatus {
    PENDING,
    APPROVED,
    REJECTED,
    CANCELLED
}
