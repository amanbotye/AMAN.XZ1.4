package com.aman.protection.data.models

import com.aman.protection.domain.models.CustomerNumber
import com.aman.protection.domain.models.NumberStatus
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * كائن نقل البيانات لجدول public.customer_numbers
 */
@Serializable
data class CustomerNumberDto(
    @SerialName("id")
    val id: String,

    @SerialName("customer_id")
    val customerId: String,

    @SerialName("phone_number")
    val phoneNumber: String,

    @SerialName("normalized_phone_number")
    val normalizedPhoneNumber: String,

    @SerialName("company_id")
    val companyId: String,

    @SerialName("detected_prefix")
    val detectedPrefix: String,

    @SerialName("status")
    val status: String = "active",

    @SerialName("notes")
    val notes: String? = null,

    @SerialName("is_deleted")
    val isDeleted: Boolean = false,

    @SerialName("created_at")
    val createdAt: String? = null,

    @SerialName("updated_at")
    val updatedAt: String? = null
) {
    fun toDomain(companyDto: CompanyDto? = null): CustomerNumber = CustomerNumber(
        id = id,
        customerId = customerId,
        phoneNumber = phoneNumber,
        normalizedPhoneNumber = normalizedPhoneNumber,
        companyId = companyId,
        company = companyDto?.toDomain(),
        detectedPrefix = detectedPrefix,
        status = if (status.equals("inactive", ignoreCase = true)) NumberStatus.INACTIVE else NumberStatus.ACTIVE,
        notes = notes,
        isDeleted = isDeleted,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}
