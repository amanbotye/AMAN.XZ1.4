package com.aman.protection.auth.repository

import com.aman.protection.auth.model.AuthState
import com.aman.protection.auth.model.UserSession
import com.aman.protection.core.AmanConstants
import com.aman.protection.core.AmanError
import com.aman.protection.core.AmanResult
import com.aman.protection.data.remote.SupabaseProvider
import com.aman.protection.data.repository.UserRepository
import io.github.jan.supabase.gotrue.providers.builtin.Email
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/**
 * تنفيذ مستودع المصادقة وجلسات Supabase
 */
class AuthRepositoryImpl(
    private val userRepository: UserRepository
) : AuthRepository {

    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    override val authState: StateFlow<AuthState> = _authState.asStateFlow()

    override suspend fun signInWithEmail(identifier: String, password: String): AmanResult<UserSession> = withContext(Dispatchers.IO) {
        _authState.value = AuthState.Loading
        try {
            val trimmed = identifier.trim()
            val targetEmail = if (trimmed.contains("@")) {
                trimmed
            } else {
                // البحث عن البريد الإلكتروني المقترن باسم المستخدم
                val lookupResult = userRepository.findEmailByUsername(trimmed)
                if (lookupResult is AmanResult.Success && !lookupResult.data.isNullOrBlank()) {
                    lookupResult.data!!
                } else {
                    trimmed
                }
            }

            SupabaseProvider.auth.signInWith(Email) {
                this.email = targetEmail
                this.password = password
            }

            val currentSession = SupabaseProvider.auth.currentSessionOrNull()
            if (currentSession != null) {
                val userId = currentSession.user?.id ?: ""
                val session = UserSession(
                    userId = userId,
                    email = currentSession.user?.email,
                    accessToken = currentSession.accessToken,
                    refreshToken = currentSession.refreshToken,
                    expiresAt = currentSession.expiresAt?.epochSeconds
                )

                // قراءة بيانات المستخدم الفعلية من public.users
                val userResult = userRepository.fetchUserProfile(userId)
                if (userResult is AmanResult.Success) {
                    val userProfile = userResult.data
                    if (userProfile.status.canAccess && !userProfile.isDeleted) {
                        _authState.value = AuthState.Authenticated(session, userProfile)
                        AmanResult.Success(session)
                    } else {
                        // الحساب غير مسموح له بالدخول أو تم إيقافه
                        try { SupabaseProvider.auth.signOut() } catch (_: Exception) {}
                        userRepository.clearUserProfile()
                        val error = AmanError.AccountSuspended("الحساب غير مسموح له بالدخول أو تم إيقافه")
                        _authState.value = AuthState.Error(error)
                        AmanResult.Error(error)
                    }
                } else {
                    val error = (userResult as AmanResult.Error).error
                    _authState.value = AuthState.Error(error)
                    AmanResult.Error(error)
                }
            } else {
                val error = AmanError.InvalidCredentials("بيانات غير صحيحة. يرجى التحقق من البريد الإلكتروني أو اسم المستخدم وكلمة المرور")
                _authState.value = AuthState.Error(error)
                AmanResult.Error(error)
            }
        } catch (e: Exception) {
            val error = AmanError.fromThrowable(e)
            _authState.value = AuthState.Error(error)
            AmanResult.Error(error)
        }
    }

    override suspend fun signUpWithEmail(
        email: String,
        password: String,
        fullName: String,
        username: String
    ): AmanResult<UserSession> = withContext(Dispatchers.IO) {
        _authState.value = AuthState.Loading
        try {
            SupabaseProvider.auth.signUpWith(Email) {
                this.email = email.trim()
                this.password = password
                data = buildJsonObject {
                    put("full_name", fullName.trim())
                    put("username", username.trim())
                    put("user_type", "customer")
                }
            }

            // بعد التسجيل، تسجيل الدخول وتحديث البيانات في جدول users
            val signInResult = signInWithEmail(email, password)
            if (signInResult is AmanResult.Success) {
                try {
                    userRepository.updateUserProfile(
                        userId = signInResult.data.userId,
                        fullName = fullName.trim(),
                        username = username.trim()
                    )
                } catch (_: Exception) {}
            }
            signInResult
        } catch (e: Exception) {
            val error = AmanError.fromThrowable(e)
            _authState.value = AuthState.Error(error)
            AmanResult.Error(error)
        }
    }

    override suspend fun resetPasswordForEmail(email: String): AmanResult<Unit> = withContext(Dispatchers.IO) {
        try {
            SupabaseProvider.auth.resetPasswordForEmail(email.trim())
            AmanResult.Success(Unit)
        } catch (e: Exception) {
            val error = AmanError.fromThrowable(e)
            AmanResult.Error(error)
        }
    }

    override suspend fun changePassword(
        currentPassword: String?,
        newPassword: String
    ): AmanResult<Unit> = withContext(Dispatchers.IO) {
        try {
            val currentSession = SupabaseProvider.auth.currentSessionOrNull()
            val email = currentSession?.user?.email

            // التحقق من كلمة المرور الحالية إذا قُدمت
            if (!currentPassword.isNullOrBlank() && !email.isNullOrBlank()) {
                try {
                    SupabaseProvider.auth.signInWith(Email) {
                        this.email = email
                        this.password = currentPassword
                    }
                } catch (e: Exception) {
                    return@withContext AmanResult.Error(
                        AmanError.InvalidCredentials("كلمة المرور الحالية غير صحيحة")
                    )
                }
            }

            SupabaseProvider.auth.modifyUser {
                this.password = newPassword
            }

            AmanResult.Success(Unit)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun signOut(): AmanResult<Unit> = withContext(Dispatchers.IO) {
        try {
            SupabaseProvider.auth.signOut()
            userRepository.clearUserProfile()
            _authState.value = AuthState.Unauthenticated
            AmanResult.Success(Unit)
        } catch (e: Exception) {
            userRepository.clearUserProfile()
            _authState.value = AuthState.Unauthenticated
            AmanResult.Success(Unit)
        }
    }

    override suspend fun restoreSession(): AmanResult<UserSession?> = withContext(Dispatchers.IO) {
        _authState.value = AuthState.Loading
        try {
            val currentSession = SupabaseProvider.auth.currentSessionOrNull()
            if (currentSession != null) {
                val userId = currentSession.user?.id ?: ""
                val session = UserSession(
                    userId = userId,
                    email = currentSession.user?.email,
                    accessToken = currentSession.accessToken,
                    refreshToken = currentSession.refreshToken,
                    expiresAt = currentSession.expiresAt?.epochSeconds
                )

                // جلب بيانات المستخدم الفعلية من public.users
                val userResult = userRepository.fetchUserProfile(userId)
                if (userResult is AmanResult.Success) {
                    val userProfile = userResult.data
                    if (userProfile.status.canAccess && !userProfile.isDeleted) {
                        _authState.value = AuthState.Authenticated(session, userProfile)
                        AmanResult.Success(session)
                    } else {
                        try { SupabaseProvider.auth.signOut() } catch (_: Exception) {}
                        userRepository.clearUserProfile()
                        val error = AmanError.AccountSuspended("الحساب غير مسموح له بالدخول أو تم إيقافه")
                        _authState.value = AuthState.Error(error)
                        AmanResult.Error(error)
                    }
                } else {
                    val error = (userResult as AmanResult.Error).error
                    _authState.value = AuthState.Error(error)
                    AmanResult.Error(error)
                }
            } else {
                _authState.value = AuthState.Unauthenticated
                AmanResult.Success(null)
            }
        } catch (e: Exception) {
            val error = AmanError.fromThrowable(e)
            _authState.value = AuthState.Error(error)
            AmanResult.Error(error)
        }
    }
}
