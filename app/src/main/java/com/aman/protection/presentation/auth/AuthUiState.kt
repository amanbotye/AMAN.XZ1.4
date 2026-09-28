package com.aman.protection.presentation.auth

/**
 * أوضاع شاشة المصادقة والحسابات
 * مطابقة للبنود AUTH-01 إلى AUTH-04
 */
enum class AuthMode {
    LOGIN,           // AUTH-01 تسجيل الدخول
    SIGN_UP,         // AUTH-02 إنشاء حساب
    FORGOT_PASSWORD, // AUTH-03 استعادة كلمة المرور
    CHANGE_PASSWORD  // AUTH-04 تغيير كلمة المرور
}

/**
 * حالة واجهة شاشات المصادقة والحسابات (AUTH-01 إلى AUTH-04 + ADM-LOGIN)
 */
data class AuthUiState(
    val mode: AuthMode = AuthMode.LOGIN,
    val isAdminLogin: Boolean = false, // طبقة ADM-LOGIN لدخول الإدارة

    // AUTH-01 & AUTH-02 & AUTH-03
    val email: String = "",
    val password: String = "",
    val confirmPassword: String = "",
    val fullName: String = "",
    val username: String = "",

    // AUTH-04 تغيير كلمة المرور
    val currentPassword: String = "",
    val newPassword: String = "",
    val confirmNewPassword: String = "",

    // إظهار/إخفاء كلمات المرور
    val isPasswordVisible: Boolean = false,
    val isConfirmPasswordVisible: Boolean = false,
    val isCurrentPasswordVisible: Boolean = false,
    val isNewPasswordVisible: Boolean = false,
    val isConfirmNewPasswordVisible: Boolean = false,

    // رسائل الأخطاء للحقول (الحقول ناقصة / تحقق)
    val emailError: String? = null,
    val passwordError: String? = null,
    val confirmPasswordError: String? = null,
    val fullNameError: String? = null,
    val usernameError: String? = null,
    val currentPasswordError: String? = null,
    val newPasswordError: String? = null,
    val confirmNewPasswordError: String? = null,

    // رسائل النظام العامة والحالات التشغيلية
    val generalError: String? = null,
    val successMessage: String? = null,
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false
) {
    val isLoginMode: Boolean get() = mode == AuthMode.LOGIN
    val isSignUpMode: Boolean get() = mode == AuthMode.SIGN_UP
    val isForgotPasswordMode: Boolean get() = mode == AuthMode.FORGOT_PASSWORD
    val isChangePasswordMode: Boolean get() = mode == AuthMode.CHANGE_PASSWORD
}
