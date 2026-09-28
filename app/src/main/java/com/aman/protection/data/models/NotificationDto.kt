package com.aman.protection.data.models

import com.aman.protection.domain.models.AmanNotification
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * كائن نقل البيانات لإشعارات العميل والإدارة
 * يتطابق مع جدولي public.client_notifications و public.admin_notifications
 */
@Serializable
data class NotificationDto(
    @SerialName("id")
    val id: String,

    @SerialName("user_id")
    val userId: String? = null,

    @SerialName("notification_type")
    val notificationType: String? = null,

    @SerialName("title")
    val title: String,

    @SerialName("body")
    val body: String,

    @SerialName("related_request_id")
    val relatedRequestId: String? = null,

    @SerialName("related_protection_id")
    val relatedProtectionId: String? = null,

    @SerialName("related_task_id")
    val relatedTaskId: String? = null,

    @SerialName("is_read")
    val isRead: Boolean = false,

    @SerialName("read_at")
    val readAt: String? = null,

    @SerialName("created_at")
    val createdAt: String
)

fun NotificationDto.toDomain(): AmanNotification {
    return AmanNotification(
        id = id,
        userId = userId,
        notificationType = notificationType,
        title = title,
        body = body,
        relatedRequestId = relatedRequestId,
        relatedProtectionId = relatedProtectionId,
        relatedTaskId = relatedTaskId,
        isRead = isRead,
        readAt = readAt,
        createdAt = createdAt
    )
}
