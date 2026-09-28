package com.aman.protection.data.models

import com.aman.protection.domain.models.Company
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * كائن نقل البيانات لجدول public.companies
 */
@Serializable
data class CompanyDto(
    @SerialName("id")
    val id: String,

    @SerialName("name_ar")
    val nameAr: String,

    @SerialName("name_en")
    val nameEn: String,

    @SerialName("code")
    val code: String,

    @SerialName("description")
    val description: String? = null,

    @SerialName("display_order")
    val displayOrder: Int? = 0,

    @SerialName("is_active")
    val isActive: Boolean = true,

    @SerialName("is_deleted")
    val isDeleted: Boolean = false,

    @SerialName("created_at")
    val createdAt: String? = null,

    @SerialName("updated_at")
    val updatedAt: String? = null
) {
    fun toDomain(): Company = Company(
        id = id,
        nameAr = nameAr,
        nameEn = nameEn,
        code = code,
        description = description,
        displayOrder = displayOrder ?: 0,
        isActive = isActive,
        isDeleted = isDeleted
    )
}
