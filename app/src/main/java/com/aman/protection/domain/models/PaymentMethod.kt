package com.aman.protection.domain.models

/**
 * كيان طريقة الدفع اليدوية (Payment Method Domain Model)
 */
data class PaymentMethod(
    val id: String,
    val nameAr: String,
    val nameEn: String,
    val code: String,
    val instructions: String? = null,
    val accountName: String? = null,
    val accountIdentifier: String? = null,
    val displayOrder: Int = 0,
    val isActive: Boolean = true,
    val isDeleted: Boolean = false
) {
    val displayTitle: String get() = "$nameAr ($accountIdentifier)"
}
