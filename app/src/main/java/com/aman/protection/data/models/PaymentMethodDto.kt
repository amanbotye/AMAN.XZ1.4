package com.aman.protection.data.models

import com.aman.protection.domain.models.PaymentMethod
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * كائن نقل البيانات لجدول public.payment_methods
 */
@Serializable
data class PaymentMethodDto(
    @SerialName("id")
    val id: String,

    @SerialName("name_ar")
    val nameAr: String,

    @SerialName("name_en")
    val nameEn: String = "",

    @SerialName("code")
    val code: String = "",

    @SerialName("instructions")
    val instructions: String? = null,

    @SerialName("account_name")
    val accountName: String? = null,

    @SerialName("account_identifier")
    val accountIdentifier: String? = null,

    @SerialName("display_order")
    val displayOrder: Int? = 0,

    @SerialName("is_active")
    val isActive: Boolean = true,

    @SerialName("is_deleted")
    val isDeleted: Boolean = false
) {
    fun toDomain(): PaymentMethod = PaymentMethod(
        id = id,
        nameAr = nameAr,
        nameEn = nameEn,
        code = code,
        instructions = instructions,
        accountName = accountName,
        accountIdentifier = accountIdentifier,
        displayOrder = displayOrder ?: 0,
        isActive = isActive,
        isDeleted = isDeleted
    )
}
