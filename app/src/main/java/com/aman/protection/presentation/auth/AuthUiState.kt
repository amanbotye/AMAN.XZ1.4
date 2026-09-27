package com.aman.protection.presentation.auth

import com.aman.protection.core.AmanError

/**
 * حالة واجهة شاشة المصادقة
 */
data class AuthUiState(
    val email: String = "",
    val password: String = "",
    val fullName: String = "",
    val isSignUpMode: Boolean = false,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val isSuccess: Boolean = false
)
