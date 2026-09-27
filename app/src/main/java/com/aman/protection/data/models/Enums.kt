package com.aman.protection.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class UserType {
    @SerialName("customer")
    CUSTOMER,

    @SerialName("admin")
    ADMIN;

    val isCustomer: Boolean get() = this == CUSTOMER
    val isAdmin: Boolean get() = this == ADMIN
}

@Serializable
enum class UserStatus {
    @SerialName("active")
    ACTIVE,

    @SerialName("suspended")
    SUSPENDED,

    @SerialName("disabled")
    DISABLED;

    val canAccess: Boolean get() = this == ACTIVE
}
