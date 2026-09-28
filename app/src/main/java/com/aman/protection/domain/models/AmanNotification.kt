package com.aman.protection.domain.models

/**
 * كيان الإشعار (Notification Domain Model)
 * يمثل إشعارات العملاء والإدارة وفق جدولي client_notifications و admin_notifications
 */
data class AmanNotification(
    val id: String,
    val userId: String? = null,
    val notificationType: String? = null,
    val title: String,
    val body: String,
    val relatedRequestId: String? = null,
    val relatedProtectionId: String? = null,
    val relatedTaskId: String? = null,
    val isRead: Boolean = false,
    val readAt: String? = null,
    val createdAt: String
)
