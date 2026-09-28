package com.aman.protection.data.repository

import com.aman.protection.core.AmanConstants
import com.aman.protection.core.AmanError
import com.aman.protection.core.AmanResult
import com.aman.protection.data.models.UserDto
import com.aman.protection.data.remote.SupabaseProvider
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/**
 * تنفيذ مستودع المستخدم بالاتصال المباشر بجدول public.users
 */
class UserRepositoryImpl : UserRepository {

    private val _currentUserProfile = MutableStateFlow<UserDto?>(null)
    override val currentUserProfile: StateFlow<UserDto?> = _currentUserProfile.asStateFlow()

    override suspend fun fetchUserProfile(userId: String): AmanResult<UserDto> = withContext(Dispatchers.IO) {
        try {
            val user = SupabaseProvider.postgrest.from(AmanConstants.TABLE_USERS)
                .select {
                    filter {
                        eq("id", userId)
                    }
                }
                .decodeSingle<UserDto>()

            _currentUserProfile.value = user
            AmanResult.Success(user)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun findEmailByUsername(username: String): AmanResult<String?> = withContext(Dispatchers.IO) {
        try {
            val trimmed = username.trim()
            if (trimmed.isBlank()) {
                return@withContext AmanResult.Success(null)
            }
            val users = SupabaseProvider.postgrest.from(AmanConstants.TABLE_USERS)
                .select {
                    filter {
                        eq("username", trimmed)
                        eq("is_deleted", false)
                    }
                    limit(1)
                }
                .decodeList<UserDto>()

            val email = users.firstOrNull()?.email
            AmanResult.Success(email)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun updateUserProfile(
        userId: String,
        fullName: String?,
        username: String?
    ): AmanResult<UserDto> = withContext(Dispatchers.IO) {
        try {
            val updatePayload = buildJsonObject {
                fullName?.let { put("full_name", it.trim()) }
                username?.let { put("username", it.trim()) }
            }

            SupabaseProvider.postgrest.from(AmanConstants.TABLE_USERS)
                .update(updatePayload) {
                    filter {
                        eq("id", userId)
                    }
                }

            fetchUserProfile(userId)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override fun clearUserProfile() {
        _currentUserProfile.value = null
    }
}
