package com.aman.protection.auth.repository

import com.aman.protection.auth.model.AuthState
import com.aman.protection.auth.model.UserSession
import com.aman.protection.core.AmanError
import com.aman.protection.core.AmanResult
import com.aman.protection.data.remote.SupabaseProvider
import com.aman.protection.data.repository.UserRepository
import io.github.jan.supabase.gotrue.providers.builtin.Email
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

    override suspend fun signInWithEmail(email: String, password: String): AmanResult<UserSession> = withContext(Dispatchers.IO) {
        _authState.value = AuthState.Loading
        try {
            SupabaseProvider.auth.signInWith(Email) {
                this.email = email.trim()
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
                    if (userProfile.status.canAccess) {
                        _authState.value = AuthState.Authenticated(session, userProfile)
                        AmanResult.Success(session)
                    } else {
                        val error = AmanError.AccountSuspended()
                        _authState.value = AuthState.Error(error)
                        AmanResult.Error(error)
                    }
                } else {
                    val error = (userResult as AmanResult.Error).error
                    _authState.value = AuthState.Error(error)
                    AmanResult.Error(error)
                }
            } else {
                val error = AmanError.InvalidCredentials()
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
        fullName: String
    ): AmanResult<UserSession> = withContext(Dispatchers.IO) {
        _authState.value = AuthState.Loading
        try {
            SupabaseProvider.auth.signUpWith(Email) {
                this.email = email.trim()
                this.password = password
                data = buildJsonObject {
                    put("full_name", fullName.trim())
                    put("user_type", "customer")
                }
            }

            // بعد التسجيل محاولة تسجيل الدخول مباشرة
            signInWithEmail(email, password)
        } catch (e: Exception) {
            val error = AmanError.fromThrowable(e)
            _authState.value = AuthState.Error(error)
            AmanResult.Error(error)
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
                    if (userProfile.status.canAccess) {
                        _authState.value = AuthState.Authenticated(session, userProfile)
                        AmanResult.Success(session)
                    } else {
                        val error = AmanError.AccountSuspended()
                        _authState.value = AuthState.Error(error)
                        AmanResult.Error(error)
                    }
                } else {
                    _authState.value = AuthState.Unauthenticated
                    AmanResult.Success(null)
                }
            } else {
                _authState.value = AuthState.Unauthenticated
                AmanResult.Success(null)
            }
        } catch (e: Exception) {
            _authState.value = AuthState.Unauthenticated
            AmanResult.Success(null)
        }
    }
}
