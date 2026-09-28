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

    /**
     * تسجيل الدخول بواسطة البريد الإلكتروني أو اسم المستخدم (AUTH-01)
     */
    suspend fun signInWithEmail(identifier: String, password: String): AmanResult<UserSession>

    /**
     * إنشاء حساب جديد بالبريد الإلكتروني والاسم الكامل واسم المستخدم (AUTH-02)
     */
    suspend fun signUpWithEmail(email: String, password: String, fullName: String, username: String): AmanResult<UserSession>

    /**
     * إرسال طلب استعادة كلمة المرور عبر البريد الإلكتروني (AUTH-03)
     */
    suspend fun resetPasswordForEmail(email: String): AmanResult<Unit>

    /**
     * تغيير كلمة المرور للمستخدم المسجل حالياً (AUTH-04)
     */
    suspend fun changePassword(currentPassword: String?, newPassword: String): AmanResult<Unit>

    /**
     * تنفيذ تسجيل الخروج وإنهاء الجلسة (AUTH-01 / تسجيل الخروج)
     */
    suspend fun signOut(): AmanResult<Unit>

    /**
     * استعادة الجلسة والتحقق من حالة المستخدم (AUTH-01)
     */
    suspend fun restoreSession(): AmanResult<UserSession?>
}
