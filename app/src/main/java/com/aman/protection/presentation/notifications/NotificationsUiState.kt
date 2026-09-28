package com.aman.protection.presentation.notifications

import com.aman.protection.domain.models.AmanNotification

data class NotificationsUiState(
    val isLoading: Boolean = false,
    val notifications: List<AmanNotification> = emptyList(),
    val unreadCount: Int = 0,
    val errorMessage: String? = null
)
