package com.aman.protection.data.repository

import com.aman.protection.core.AmanConstants
import com.aman.protection.core.AmanError
import com.aman.protection.core.AmanResult
import com.aman.protection.data.models.NotificationDto
import com.aman.protection.data.models.toDomain
import com.aman.protection.data.remote.SupabaseProvider
import com.aman.protection.domain.models.AmanNotification
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import io.github.jan.supabase.postgrest.rpc
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/**
 * تطبيق مستودع الإشعارات المتصل بقاعدة بيانات Supabase
 */
class NotificationRepositoryImpl : NotificationRepository {

    private val _clientNotifications = MutableStateFlow<List<AmanNotification>>(emptyList())
    override val clientNotifications: StateFlow<List<AmanNotification>> = _clientNotifications.asStateFlow()

    private val _adminNotifications = MutableStateFlow<List<AmanNotification>>(emptyList())
    override val adminNotifications: StateFlow<List<AmanNotification>> = _adminNotifications.asStateFlow()

    private val _unreadClientCount = MutableStateFlow(0)
    override val unreadClientCount: StateFlow<Int> = _unreadClientCount.asStateFlow()

    private val _unreadAdminCount = MutableStateFlow(0)
    override val unreadAdminCount: StateFlow<Int> = _unreadAdminCount.asStateFlow()

    override suspend fun fetchClientNotifications(userId: String): AmanResult<List<AmanNotification>> = withContext(Dispatchers.IO) {
        try {
            val dtoList = SupabaseProvider.postgrest.from(AmanConstants.TABLE_CLIENT_NOTIFICATIONS)
                .select {
                    filter {
                        eq("user_id", userId)
                    }
                    order("created_at", Order.DESCENDING)
                }
                .decodeList<NotificationDto>()

            val domainList = dtoList.map { it.toDomain() }
            _clientNotifications.value = domainList
            _unreadClientCount.value = domainList.count { !it.isRead }
            AmanResult.Success(domainList)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.Network("تعذر جلب الإشعارات: ${e.message}"))
        }
    }

    override suspend fun fetchAdminNotifications(): AmanResult<List<AmanNotification>> = withContext(Dispatchers.IO) {
        try {
            val dtoList = SupabaseProvider.postgrest.from(AmanConstants.TABLE_ADMIN_NOTIFICATIONS)
                .select {
                    order("created_at", Order.DESCENDING)
                }
                .decodeList<NotificationDto>()

            val domainList = dtoList.map { it.toDomain() }
            _adminNotifications.value = domainList
            _unreadAdminCount.value = domainList.count { !it.isRead }
            AmanResult.Success(domainList)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.Network("تعذر جلب إشعارات الإدارة: ${e.message}"))
        }
    }

    override suspend fun markClientNotificationRead(notificationId: String): AmanResult<Unit> = withContext(Dispatchers.IO) {
        try {
            val params = buildJsonObject {
                put("p_notification_id", notificationId)
            }
            SupabaseProvider.postgrest.rpc(
                function = "rpc_mark_notification_read",
                parameters = params
            )

            // تحديث محلي فوري
            val updated = _clientNotifications.value.map {
                if (it.id == notificationId) it.copy(isRead = true) else it
            }
            _clientNotifications.value = updated
            _unreadClientCount.value = updated.count { !it.isRead }
            AmanResult.Success(Unit)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.Network("تعذر تحديث حالة الإشعار: ${e.message}"))
        }
    }

    override suspend fun markAdminNotificationRead(notificationId: String): AmanResult<Unit> = withContext(Dispatchers.IO) {
        try {
            val params = buildJsonObject {
                put("p_notification_id", notificationId)
            }
            SupabaseProvider.postgrest.rpc(
                function = "rpc_mark_admin_notification_read",
                parameters = params
            )

            val updated = _adminNotifications.value.map {
                if (it.id == notificationId) it.copy(isRead = true) else it
            }
            _adminNotifications.value = updated
            _unreadAdminCount.value = updated.count { !it.isRead }
            AmanResult.Success(Unit)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.Network("تعذر تحديث حالة إشعار الإدارة: ${e.message}"))
        }
    }
}
