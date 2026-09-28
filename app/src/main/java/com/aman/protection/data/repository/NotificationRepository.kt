package com.aman.protection.data.repository

import com.aman.protection.core.AmanResult
import com.aman.protection.domain.models.AmanNotification
import kotlinx.coroutines.flow.StateFlow

/**
 * واجهة مستودع الإشعارات (NotificationRepository)
 * يربط بجدولي client_notifications و admin_notifications
 */
interface NotificationRepository {
    val clientNotifications: StateFlow<List<AmanNotification>>
    val adminNotifications: StateFlow<List<AmanNotification>>
    val unreadClientCount: StateFlow<Int>
    val unreadAdminCount: StateFlow<Int>

    suspend fun fetchClientNotifications(userId: String): AmanResult<List<AmanNotification>>
    suspend fun fetchAdminNotifications(): AmanResult<List<AmanNotification>>
    suspend fun markClientNotificationRead(notificationId: String): AmanResult<Unit>
    suspend fun markAdminNotificationRead(notificationId: String): AmanResult<Unit>
}
