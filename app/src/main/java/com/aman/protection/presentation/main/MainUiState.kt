package com.aman.protection.presentation.main

import com.aman.protection.core.AmanError
import com.aman.protection.data.models.UserDto
import com.aman.protection.navigation.AmanDestination

/**
 * حالة التطبيق العامة وتنسيق التنقل مع المستخدم والجلسة
 */
data class MainUiState(
    val isLoading: Boolean = true,
    val destination: AmanDestination = AmanDestination.Splash,
    val currentUser: UserDto? = null,
    val error: AmanError? = null
)
