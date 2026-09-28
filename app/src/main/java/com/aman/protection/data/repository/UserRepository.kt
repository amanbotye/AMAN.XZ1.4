package com.aman.protection.data.repository

import com.aman.protection.core.AmanResult
import com.aman.protection.data.models.UserDto
import kotlinx.coroutines.flow.StateFlow

/**
 * واجهة مستودع المستخدم الحالي
 */
interface UserRepository {
    val currentUserProfile: StateFlow<UserDto?>

    /**
     * قراءة بيانات المستخدم الفعلية من جدول public.users
     */
    suspend fun fetchUserProfile(userId: String): AmanResult<UserDto>

    /**
     * البحث عن البريد الإلكتروني للمستخدم بواسطة اسم المستخدم
     */
    suspend fun findEmailByUsername(username: String): AmanResult<String?>

    /**
     * تحديث بيانات المستخدم في جدول public.users (الاسم واسم المستخدم)
     */
    suspend fun updateUserProfile(userId: String, fullName: String?, username: String?): AmanResult<UserDto>

    /**
     * مسح الملف الشخصي المخزن محلياً عند تسجيل الخروج
     */
    fun clearUserProfile()
}
