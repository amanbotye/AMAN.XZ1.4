package com.aman.protection.domain.models

/**
 * كيان باقة الحماية (Protection Plan / Company Package Domain Model)
 */
data class ProtectionPlan(
    val id: String,
    val companyId: String,
    val nameAr: String,
    val nameEn: String,
    val description: String? = null,
    val price: Double,
    val currency: String = "YER",
    val durationDays: Int = 30,
    val isActive: Boolean = true,
    val isVisible: Boolean = true,
    val isDeleted: Boolean = false
) {
    val formattedPrice: String get() = "${price.toInt()} $currency"
    val formattedDuration: String get() = "$durationDays يوماً"
}
