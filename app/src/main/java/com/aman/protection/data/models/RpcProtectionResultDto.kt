package com.aman.protection.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * نتيجة استدعاء إجراءات طلبات الحماية في Supabase
 */
@Serializable
data class RpcProtectionResultDto(
    @SerialName("success")
    val success: Boolean,

    @SerialName("id")
    val id: String? = null,

    @SerialName("protection_id")
    val protectionId: String? = null,

    @SerialName("error_code")
    val errorCode: String? = null,

    @SerialName("message")
    val message: String? = null
)
