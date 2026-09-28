package com.aman.protection.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * نتيجة دالة اكتشاف شركة الاتصالات detect_company_from_phone
 */
@Serializable
data class DetectedCompanyDto(
    @SerialName("company_id")
    val companyId: String,

    @SerialName("prefix")
    val prefix: String,

    @SerialName("number_length")
    val numberLength: Int = 9
)

/**
 * نتيجة استدعاء الإجراء المخزن الموثوق rpc_add_customer_number
 */
@Serializable
data class RpcAddNumberResultDto(
    @SerialName("success")
    val success: Boolean,

    @SerialName("id")
    val id: String? = null,

    @SerialName("error_code")
    val errorCode: String? = null,

    @SerialName("message")
    val message: String? = null
)
