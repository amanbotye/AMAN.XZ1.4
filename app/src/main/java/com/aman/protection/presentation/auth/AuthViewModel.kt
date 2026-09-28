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
 * ViewModel الخاص بعمليات تسجيل الدخول وإنشاء الحساب واستعادة كلمة المرور
 * وفق المرحلة 01 ومعايير القبول في AMAN.XZ.txt
 */
class AuthViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    private val emailPattern = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$".toRegex()

    fun onEmailChanged(email: String) {
        _uiState.value = _uiState.value.copy(
            email = email,
            emailError = null,
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

    fun onFullNameChanged(name: String) {
        _uiState.value = _uiState.value.copy(
            fullName = name,
            fullNameError = null,
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

    fun setMode(mode: AuthMode) {
        _uiState.value = _uiState.value.copy(
            mode = mode,
            fullNameError = null,
            emailError = null,
            passwordError = null,
            confirmPasswordError = null,
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
        }
    }

    private fun performLogin() {
        val state = _uiState.value
        val email = state.email.trim()
        val password = state.password

        var hasError = false
        var emailError: String? = null
        var passwordError: String? = null

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

            val result = authRepository.signInWithEmail(email, password)

            when (result) {
                is AmanResult.Success -> {
                    _uiState.value = _uiState.value.copy(isLoading = false, isSuccess = true)
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

    private fun performSignUp() {
        val state = _uiState.value
        val fullName = state.fullName.trim()
        val email = state.email.trim()
        val password = state.password
        val confirmPassword = state.confirmPassword

        var hasError = false
        var nameError: String? = null
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
                emailError = emailError,
                passwordError = passwordError,
                confirmPasswordError = confirmPasswordError,
                generalError = null
            )
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, generalError = null, successMessage = null)

            val result = authRepository.signUpWithEmail(email, password, fullName)

            when (result) {
                is AmanResult.Success -> {
                    _uiState.value = _uiState.value.copy(isLoading = false, isSuccess = true)
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
}
