package com.aman.protection.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * نموذج المستخدم الممثل لجدول public.users
 */
@Serializable
data class UserDto(
    @SerialName("id")
    val id: String,

    @SerialName("email")
    val email: String? = null,

    @SerialName("username")
    val username: String? = null,

    @SerialName("full_name")
    val fullName: String? = null,

    @SerialName("user_type")
    val userType: UserType = UserType.CUSTOMER,

    @SerialName("status")
    val status: UserStatus = UserStatus.ACTIVE,

    @SerialName("is_deleted")
    val isDeleted: Boolean = false,

    @SerialName("created_at")
    val createdAt: String? = null,

    @SerialName("updated_at")
    val updatedAt: String? = null
)
