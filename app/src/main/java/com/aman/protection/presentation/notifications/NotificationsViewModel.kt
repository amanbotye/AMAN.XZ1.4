package com.aman.protection.presentation.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aman.protection.core.AmanResult
import com.aman.protection.data.repository.NotificationRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class NotificationsViewModel(
    private val notificationRepository: NotificationRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(NotificationsUiState())
    val uiState: StateFlow<NotificationsUiState> = _uiState.asStateFlow()

    fun loadClientNotifications(userId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            when (val result = notificationRepository.fetchClientNotifications(userId)) {
                is AmanResult.Success -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            notifications = result.data,
                            unreadCount = result.data.count { n -> !n.isRead },
                            errorMessage = null
                        )
                    }
                }
                is AmanResult.Error -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = result.error.messageAr
                        )
                    }
                }
                else -> Unit
            }
        }
    }

    fun loadAdminNotifications() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            when (val result = notificationRepository.fetchAdminNotifications()) {
                is AmanResult.Success -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            notifications = result.data,
                            unreadCount = result.data.count { n -> !n.isRead },
                            errorMessage = null
                        )
                    }
                }
                is AmanResult.Error -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = result.error.messageAr
                        )
                    }
                }
                else -> Unit
            }
        }
    }

    fun markClientNotificationAsRead(notificationId: String) {
        viewModelScope.launch {
            notificationRepository.markClientNotificationRead(notificationId)
            val updated = _uiState.value.notifications.map {
                if (it.id == notificationId) it.copy(isRead = true) else it
            }
            _uiState.update {
                it.copy(
                    notifications = updated,
                    unreadCount = updated.count { n -> !n.isRead }
                )
            }
        }
    }

    fun markAdminNotificationAsRead(notificationId: String) {
        viewModelScope.launch {
            notificationRepository.markAdminNotificationRead(notificationId)
            val updated = _uiState.value.notifications.map {
                if (it.id == notificationId) it.copy(isRead = true) else it
            }
            _uiState.update {
                it.copy(
                    notifications = updated,
                    unreadCount = updated.count { n -> !n.isRead }
                )
            }
        }
    }
}
