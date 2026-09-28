package com.aman.protection.domain.models

/**
 * كيان أرقام العميل (Customer Number Domain Model)
 * مرتبط بالمستخدم الحالي والشركة المكتشفة في قاعدة البيانات
 */
data class CustomerNumber(
    val id: String,
    val customerId: String,
    val phoneNumber: String,
    val normalizedPhoneNumber: String,
    val companyId: String,
    val company: Company? = null,
    val detectedPrefix: String,
    val status: NumberStatus = NumberStatus.ACTIVE,
    val notes: String? = null,
    val isDeleted: Boolean = false,
    val createdAt: String? = null,
    val updatedAt: String? = null
) {
    val isLiveActive: Boolean get() = status == NumberStatus.ACTIVE && !isDeleted

    /**
     * تنسيق عرض الرقم بصيغة مقروءة (مثلاً: 771 234 567)
     */
    val formattedDisplayNumber: String
        get() {
            val clean = normalizedPhoneNumber
            return if (clean.length == 9) {
                "${clean.substring(0, 3)} ${clean.substring(3, 6)} ${clean.substring(6)}"
            } else {
                phoneNumber
            }
        }
}

enum class NumberStatus {
    ACTIVE,
    INACTIVE
}
