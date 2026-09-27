package com.aman.protection.auth.model

import com.aman.protection.core.AmanError
import com.aman.protection.data.models.UserDto

/**
 * حالات المصادقة والجلسة للتطبيق
 */
sealed interface AuthState {
    object Idle : AuthState
    object Loading : AuthState
    object Unauthenticated : AuthState

    data class Authenticated(
        val session: UserSession,
        val userProfile: UserDto
    ) : AuthState

    data class Error(val error: AmanError) : AuthState
}
