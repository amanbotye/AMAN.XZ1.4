package com.aman.protection.auth.repository

import com.aman.protection.auth.model.AuthState
import com.aman.protection.auth.model.UserSession
import com.aman.protection.core.AmanResult
import kotlinx.coroutines.flow.StateFlow

/**
 * واجهة إدارة المصادقة وجلسة Supabase
 */
interface AuthRepository {
    val authState: StateFlow<AuthState>

    suspend fun signInWithEmail(email: String, password: String): AmanResult<UserSession>
    suspend fun signUpWithEmail(email: String, password: String, fullName: String): AmanResult<UserSession>
    suspend fun resetPasswordForEmail(email: String): AmanResult<Unit>
    suspend fun signOut(): AmanResult<Unit>
    suspend fun restoreSession(): AmanResult<UserSession?>
}
