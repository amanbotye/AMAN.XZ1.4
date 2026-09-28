package com.aman.protection.data.models

import com.aman.protection.domain.models.ProtectionPlan
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * كائن نقل البيانات لجدول public.company_packages (باقات الحماية)
 */
@Serializable
data class ProtectionPlanDto(
    @SerialName("id")
    val id: String,

    @SerialName("company_id")
    val companyId: String,

    @SerialName("name_ar")
    val nameAr: String,

    @SerialName("name_en")
    val nameEn: String = "",

    @SerialName("description")
    val description: String? = null,

    @SerialName("price")
    val price: Double = 0.0,

    @SerialName("currency")
    val currency: String = "YER",

    @SerialName("duration_days")
    val durationDays: Int = 30,

    @SerialName("is_active")
    val isActive: Boolean = true,

    @SerialName("is_visible")
    val isVisible: Boolean = true,

    @SerialName("is_deleted")
    val isDeleted: Boolean = false,

    @SerialName("created_at")
    val createdAt: String? = null,

    @SerialName("updated_at")
    val updatedAt: String? = null
) {
    fun toDomain(): ProtectionPlan = ProtectionPlan(
        id = id,
        companyId = companyId,
        nameAr = nameAr,
        nameEn = nameEn,
        description = description,
        price = price,
        currency = currency,
        durationDays = durationDays,
        isActive = isActive,
        isVisible = isVisible,
        isDeleted = isDeleted
    )
}
