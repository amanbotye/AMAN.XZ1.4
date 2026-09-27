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

    override fun clearUserProfile() {
        _currentUserProfile.value = null
    }
}
