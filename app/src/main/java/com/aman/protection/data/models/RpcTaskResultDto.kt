package com.aman.protection.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * نتيجة تنفيذ إجراءات المهام المخزنة rpc_execute_task و rpc_reschedule_task
 */
@Serializable
data class RpcTaskResultDto(
    @SerialName("success")
    val success: Boolean = false,

    @SerialName("next_task_id")
    val nextTaskId: String? = null,

    @SerialName("error_code")
    val errorCode: String? = null
)
