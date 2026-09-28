package com.aman.protection.domain.models

/**
 * كيان الحماية الفعلية (Active Protection Domain Model)
 * تم إنشاؤها عبر اعتماد المشرف مع حفظ الـ Snapshots المطلوبة
 */
data class Protection(
    val id: String,
    val customerId: String,
    val customerNumberId: String,
    val companyId: String,
    val sourceRequestId: String? = null,
    val packageId: String,
    val packageNameSnapshot: String,
    val priceSnapshot: Double,
    val currencySnapshot: String = "YER",
    val durationDaysSnapshot: Int = 30,
    val taskAmountSnapshot: Double? = null,
    val taskIntervalDaysSnapshot: Int? = null,
    val taskCurrencySnapshot: String? = null,
    val startAt: String,
    val endAt: String,
    val status: ProtectionStatus = ProtectionStatus.ACTIVE,
    val renewalCount: Int = 0,
    val isDeleted: Boolean = false,
    val createdAt: String? = null,
    val updatedAt: String? = null,

    // العلاقات المربوطة
    val customerNumber: CustomerNumber? = null,
    val company: Company? = null
) {
    val isLiveActive: Boolean get() = status == ProtectionStatus.ACTIVE && !isDeleted
}

enum class ProtectionStatus {
    ACTIVE,
    EXPIRED,
    CANCELLED,
    PENDING_RENEWAL
}
