package com.aman.protection.domain.models

/**
 * كيان شركة الاتصالات (Company Domain Model)
 */
data class Company(
    val id: String,
    val nameAr: String,
    val nameEn: String,
    val code: String,
    val description: String? = null,
    val displayOrder: Int = 0,
    val isActive: Boolean = true,
    val isDeleted: Boolean = false
) {
    val displayName: String get() = nameAr
}
