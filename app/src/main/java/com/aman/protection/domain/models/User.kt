package com.aman.protection.domain.models

/**
 * الكيان الأساسي للمستخدم في النطاق (Domain Model)
 */
data class User(
    val id: String,
    val email: String?,
    val username: String?,
    val fullName: String?,
    val userType: UserType,
    val status: UserStatus,
    val isDeleted: Boolean = false,
    val createdAt: String? = null,
    val updatedAt: String? = null
) {
    val isCustomer: Boolean get() = userType == UserType.CUSTOMER
    val isAdmin: Boolean get() = userType == UserType.ADMIN
    val isActive: Boolean get() = status == UserStatus.ACTIVE && !isDeleted
    val displayName: String get() = fullName?.takeIf { it.isNotBlank() } ?: email ?: "مستخدم"
}

enum class UserType {
    CUSTOMER,
    ADMIN
}

enum class UserStatus {
    ACTIVE,
    SUSPENDED,
    DISABLED
}
