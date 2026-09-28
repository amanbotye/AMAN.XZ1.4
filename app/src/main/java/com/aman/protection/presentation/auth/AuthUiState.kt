package com.aman.protection.presentation.auth

/**
 * أوضاع شاشة المصادقة
 */
enum class AuthMode {
    LOGIN,
    SIGN_UP,
    FORGOT_PASSWORD
}

/**
 * حالة واجهة شاشة المصادقة وفق متطلبات المرحلة 01
 */
data class AuthUiState(
    val mode: AuthMode = AuthMode.LOGIN,
    val email: String = "",
    val password: String = "",
    val confirmPassword: String = "",
    val fullName: String = "",
    val isPasswordVisible: Boolean = false,
    val isConfirmPasswordVisible: Boolean = false,
    val fullNameError: String? = null,
    val emailError: String? = null,
    val passwordError: String? = null,
    val confirmPasswordError: String? = null,
    val generalError: String? = null,
    val successMessage: String? = null,
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false
) {
    val isSignUpMode: Boolean get() = mode == AuthMode.SIGN_UP
    val isForgotPasswordMode: Boolean get() = mode == AuthMode.FORGOT_PASSWORD
    val isLoginMode: Boolean get() = mode == AuthMode.LOGIN
}
