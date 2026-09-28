package com.aman.protection.presentation.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aman.protection.auth.repository.AuthRepository
import com.aman.protection.core.AmanError
import com.aman.protection.core.AmanResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel الخاص بعمليات المصادقة والحسابات:
 * - AUTH-01: تسجيل الدخول (البريد الإلكتروني أو اسم المستخدم + كلمة المرور)
 * - AUTH-02: إنشاء حساب (الاسم، اسم المستخدم، البريد، كلمة المرور وتأكيدها)
 * - AUTH-03: استعادة كلمة المرور (البريد الإلكتروني)
 * - AUTH-04: تغيير كلمة المرور (كلمة المرور الحالية، الجديدة، وتأكيدها)
 * - تسجيل الخروج المرتبط بـ AUTH-01
 */
class AuthViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    private val emailPattern = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$".toRegex()
    private val usernamePattern = "^[a-zA-Z0-9_]{3,30}$".toRegex()

    fun onEmailChanged(email: String) {
        _uiState.value = _uiState.value.copy(
            email = email,
            emailError = null,
            generalError = null
        )
    }

    fun onUsernameChanged(username: String) {
        _uiState.value = _uiState.value.copy(
            username = username,
            usernameError = null,
            generalError = null
        )
    }

    fun onFullNameChanged(name: String) {
        _uiState.value = _uiState.value.copy(
            fullName = name,
            fullNameError = null,
            generalError = null
        )
    }

    fun onPasswordChanged(password: String) {
        _uiState.value = _uiState.value.copy(
            password = password,
            passwordError = null,
            generalError = null
        )
    }

    fun onConfirmPasswordChanged(password: String) {
        _uiState.value = _uiState.value.copy(
            confirmPassword = password,
            confirmPasswordError = null,
            generalError = null
        )
    }

    fun onCurrentPasswordChanged(password: String) {
        _uiState.value = _uiState.value.copy(
            currentPassword = password,
            currentPasswordError = null,
            generalError = null
        )
    }

    fun onNewPasswordChanged(password: String) {
        _uiState.value = _uiState.value.copy(
            newPassword = password,
            newPasswordError = null,
            generalError = null
        )
    }

    fun onConfirmNewPasswordChanged(password: String) {
        _uiState.value = _uiState.value.copy(
            confirmNewPassword = password,
            confirmNewPasswordError = null,
            generalError = null
        )
    }

    fun togglePasswordVisibility() {
        _uiState.value = _uiState.value.copy(
            isPasswordVisible = !_uiState.value.isPasswordVisible
        )
    }

    fun toggleConfirmPasswordVisibility() {
        _uiState.value = _uiState.value.copy(
            isConfirmPasswordVisible = !_uiState.value.isConfirmPasswordVisible
        )
    }

    fun toggleCurrentPasswordVisibility() {
        _uiState.value = _uiState.value.copy(
            isCurrentPasswordVisible = !_uiState.value.isCurrentPasswordVisible
        )
    }

    fun toggleNewPasswordVisibility() {
        _uiState.value = _uiState.value.copy(
            isNewPasswordVisible = !_uiState.value.isNewPasswordVisible
        )
    }

    fun toggleConfirmNewPasswordVisibility() {
        _uiState.value = _uiState.value.copy(
            isConfirmNewPasswordVisible = !_uiState.value.isConfirmNewPasswordVisible
        )
    }

    fun setMode(mode: AuthMode) {
        _uiState.value = _uiState.value.copy(
            mode = mode,
            fullNameError = null,
            usernameError = null,
            emailError = null,
            passwordError = null,
            confirmPasswordError = null,
            currentPasswordError = null,
            newPasswordError = null,
            confirmNewPasswordError = null,
            generalError = null,
            successMessage = null
        )
    }

    fun toggleMode() {
        val newMode = if (_uiState.value.isSignUpMode) AuthMode.LOGIN else AuthMode.SIGN_UP
        setMode(newMode)
    }

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(
            generalError = null,
            successMessage = null
        )
    }

    fun submit() {
        when (_uiState.value.mode) {
            AuthMode.LOGIN -> performLogin()
            AuthMode.SIGN_UP -> performSignUp()
            AuthMode.FORGOT_PASSWORD -> performResetPassword()
            AuthMode.CHANGE_PASSWORD -> performChangePassword()
        }
    }

    /**
     * AUTH-01: تسجيل الدخول
     * الحقول: البريد الإلكتروني أو اسم المستخدم + كلمة المرور
     * الأزرار: دخول، إنشاء حساب، استعادة كلمة المرور
     * الحالات: عادية، حقول ناقصة، بيانات غير صحيحة، تحميل، نجاح، فشل الاتصال، الحساب غير مسموح له بالدخول
     */
    private fun performLogin() {
        val state = _uiState.value
        val identifier = state.email.trim()
        val password = state.password

        var hasError = false
        var emailError: String? = null
        var passwordError: String? = null

        // فحص حالة: الحقول ناقصة
        if (identifier.isBlank()) {
            emailError = "البريد الإلكتروني أو اسم المستخدم مطلوب"
            hasError = true
        }

        if (password.isBlank()) {
            passwordError = "كلمة المرور مطلوبة"
            hasError = true
        }

        if (hasError) {
            _uiState.value = state.copy(
                emailError = emailError,
                passwordError = passwordError,
                generalError = null
            )
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, generalError = null, successMessage = null)

            val result = authRepository.signInWithEmail(identifier, password)

            when (result) {
                is AmanResult.Success -> {
                    _uiState.value = _uiState.value.copy(isLoading = false, isSuccess = true)
                }
                is AmanResult.Error -> {
                    val errorMessage = when (val err = result.error) {
                        is AmanError.AccountSuspended -> "الحساب غير مسموح له بالدخول أو تم إيقافه"
                        is AmanError.NetworkError -> "تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت"
                        is AmanError.InvalidCredentials -> "بيانات غير صحيحة. يرجى التحقق من البريد الإلكتروني أو اسم المستخدم وكلمة المرور"
                        else -> err.messageAr
                    }
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        generalError = errorMessage
                    )
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
            }
        }
    }

    /**
     * AUTH-02: إنشاء حساب
     * الحقول: البريد الإلكتروني، كلمة المرور، تأكيد كلمة المرور، الاسم الكامل، اسم المستخدم
     * الأزرار: إنشاء حساب، العودة إلى تسجيل الدخول
     * القيود: لا يوجد رقم هاتف إلزامي، لا يوجد OTP، لا يوجد تحقق من ملكية رقم
     */
    private fun performSignUp() {
        val state = _uiState.value
        val fullName = state.fullName.trim()
        val username = state.username.trim()
        val email = state.email.trim()
        val password = state.password
        val confirmPassword = state.confirmPassword

        var hasError = false
        var nameError: String? = null
        var userError: String? = null
        var emailError: String? = null
        var passwordError: String? = null
        var confirmPasswordError: String? = null

        if (fullName.isBlank()) {
            nameError = "الاسم الكامل مطلوب"
            hasError = true
        } else if (fullName.length < 3) {
            nameError = "الاسم يجب أن لا يقل عن 3 أحرف"
            hasError = true
        }

        if (username.isBlank()) {
            userError = "اسم المستخدم مطلوب"
            hasError = true
        } else if (!usernamePattern.matches(username)) {
            userError = "اسم المستخدم يجب أن يكون بالإنجليزية من 3 إلى 30 حرفًا أو رقمًا"
            hasError = true
        }

        if (email.isBlank()) {
            emailError = "البريد الإلكتروني مطلوب"
            hasError = true
        } else if (!emailPattern.matches(email)) {
            emailError = "يرجى إدخال بريد إلكتروني صالح (مثال: name@domain.com)"
            hasError = true
        }

        if (password.isBlank()) {
            passwordError = "كلمة المرور مطلوبة"
            hasError = true
        } else if (password.length < 6) {
            passwordError = "كلمة المرور يجب أن لا تقل عن 6 أحرف"
            hasError = true
        }

        if (confirmPassword.isBlank()) {
            confirmPasswordError = "يرجى تأكيد كلمة المرور"
            hasError = true
        } else if (confirmPassword != password) {
            confirmPasswordError = "كلمتا المرور غير متطابقتين"
            hasError = true
        }

        if (hasError) {
            _uiState.value = state.copy(
                fullNameError = nameError,
                usernameError = userError,
                emailError = emailError,
                passwordError = passwordError,
                confirmPasswordError = confirmPasswordError,
                generalError = null
            )
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, generalError = null, successMessage = null)

            val result = authRepository.signUpWithEmail(email, password, fullName, username)

            when (result) {
                is AmanResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isSuccess = true,
                        successMessage = "تم إنشاء الحساب بنجاح!"
                    )
                }
                is AmanResult.Error -> {
                    val isAlreadyExists = result.error is AmanError.UserAlreadyExists
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        emailError = if (isAlreadyExists) "البريد الإلكتروني مسجل مسبقًا في النظام" else null,
                        generalError = result.error.messageAr
                    )
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
            }
        }
    }

    /**
     * AUTH-03: استعادة كلمة المرور
     * الحقول: البريد الإلكتروني
     * الأزرار: إرسال طلب الاستعادة، العودة إلى تسجيل الدخول
     * الحالات: تحميل، نجاح، فشل
     */
    private fun performResetPassword() {
        val state = _uiState.value
        val email = state.email.trim()

        if (email.isBlank()) {
            _uiState.value = state.copy(emailError = "البريد الإلكتروني مطلوب")
            return
        } else if (!emailPattern.matches(email)) {
            _uiState.value = state.copy(emailError = "يرجى إدخال بريد إلكتروني صالح")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, generalError = null, successMessage = null)

            val result = authRepository.resetPasswordForEmail(email)

            when (result) {
                is AmanResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح."
                    )
                }
                is AmanResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        generalError = result.error.messageAr
                    )
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
            }
        }
    }

    /**
     * AUTH-04: تغيير كلمة المرور
     * الحقول: كلمة المرور الحالية عند طلبها، كلمة المرور الجديدة، تأكيد كلمة المرور الجديدة
     * الأزرار: حفظ
     * الحالات: تحميل، نجاح، فشل
     */
    private fun performChangePassword() {
        val state = _uiState.value
        val currentPassword = state.currentPassword
        val newPassword = state.newPassword
        val confirmNewPassword = state.confirmNewPassword

        var hasError = false
        var newError: String? = null
        var confirmError: String? = null

        if (newPassword.isBlank()) {
            newError = "كلمة المرور الجديدة مطلوبة"
            hasError = true
        } else if (newPassword.length < 6) {
            newError = "كلمة المرور يجب أن لا تقل عن 6 أحرف"
            hasError = true
        }

        if (confirmNewPassword.isBlank()) {
            confirmError = "يرجى تأكيد كلمة المرور الجديدة"
            hasError = true
        } else if (confirmNewPassword != newPassword) {
            confirmError = "كلمتا المرور غير متطابقتين"
            hasError = true
        }

        if (hasError) {
            _uiState.value = state.copy(
                newPasswordError = newError,
                confirmNewPasswordError = confirmError,
                generalError = null
            )
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, generalError = null, successMessage = null)

            val result = authRepository.changePassword(
                currentPassword = currentPassword.ifBlank { null },
                newPassword = newPassword
            )

            when (result) {
                is AmanResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        currentPassword = "",
                        newPassword = "",
                        confirmNewPassword = "",
                        successMessage = "تم تغيير كلمة المرور بنجاح!"
                    )
                }
                is AmanResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        generalError = result.error.messageAr
                    )
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
            }
        }
    }
}
