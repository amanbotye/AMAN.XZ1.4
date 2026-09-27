package com.aman.protection.auth.model

/**
 * بيانات جلسة المصادقة المباشرة
 */
data class UserSession(
    val userId: String,
    val email: String?,
    val accessToken: String,
    val refreshToken: String?,
    val expiresAt: Long?
)
