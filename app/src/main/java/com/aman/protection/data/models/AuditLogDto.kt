package com.aman.protection.data.models

import com.aman.protection.domain.models.AuditLog
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

/**
 * كائن نقل البيانات لجدول public.audit_logs
 */
@Serializable
data class AuditLogDto(
    @SerialName("id")
    val id: String,

    @SerialName("actor_user_id")
    val actorUserId: String? = null,

    @SerialName("action")
    val action: String,

    @SerialName("entity_type")
    val entityType: String,

    @SerialName("entity_id")
    val entityId: String? = null,

    @SerialName("old_data")
    val oldData: JsonElement? = null,

    @SerialName("new_data")
    val newData: JsonElement? = null,

    @SerialName("metadata")
    val metadata: JsonElement? = null,

    @SerialName("created_at")
    val createdAt: String
)

fun AuditLogDto.toDomain(): AuditLog {
    return AuditLog(
        id = id,
        actorUserId = actorUserId,
        action = action,
        entityType = entityType,
        entityId = entityId,
        oldData = oldData?.toString(),
        newData = newData?.toString(),
        metadata = metadata?.toString(),
        createdAt = createdAt
    )
}
