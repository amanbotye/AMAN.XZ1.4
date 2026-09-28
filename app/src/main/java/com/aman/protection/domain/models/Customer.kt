package com.aman.protection.domain.models

/**
 * كيان العميل (Customer Domain Model)
 */
data class Customer(
    val user: User,
    val totalNumbersCount: Int = 0,
    val activeProtectionsCount: Int = 0
) {
    val id: String get() = user.id
    val email: String? get() = user.email
    val fullName: String? get() = user.fullName
}
