package com.aman.protection.presentation.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aman.protection.auth.model.AuthState
import com.aman.protection.auth.repository.AuthRepository
import com.aman.protection.data.models.UserType
import com.aman.protection.navigation.AmanDestination
import com.aman.protection.navigation.AppNavigator
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel الرئيسي المنسق لدورة حياة التطبيق:
 * App -> Session -> Auth -> public.users -> User State -> Navigation
 */
class MainViewModel(
    private val authRepository: AuthRepository,
    private val appNavigator: AppNavigator
) : ViewModel() {

    private val _uiState = MutableStateFlow(MainUiState())
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()

    init {
        observeAuthState()
        observeNavigationEvents()
        initializeApplication()
    }

    private fun observeAuthState() {
        viewModelScope.launch {
            authRepository.authState.collect { authState ->
                when (authState) {
                    is AuthState.Loading -> {
                        _uiState.value = _uiState.value.copy(isLoading = true)
                    }
                    is AuthState.Authenticated -> {
                        val user = authState.userProfile
                        val destination = if (user.userType == UserType.ADMIN) {
                            AmanDestination.AdminHome
                        } else {
                            AmanDestination.CustomerHome
                        }

                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            currentUser = user,
                            destination = destination,
                            error = null
                        )
                    }
                    is AuthState.Unauthenticated -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            currentUser = null,
                            destination = AmanDestination.Auth,
                            error = null
                        )
                    }
                    is AuthState.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = authState.error,
                            destination = AmanDestination.Auth
                        )
                    }
                    is AuthState.Idle -> Unit
                }
            }
        }
    }

    private fun observeNavigationEvents() {
        viewModelScope.launch {
            appNavigator.navigationEvents.collect { dest ->
                _uiState.value = _uiState.value.copy(destination = dest)
            }
        }
    }

    /**
     * بدء فحص الجلسة واستعادتها من Supabase
     */
    fun initializeApplication() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            authRepository.restoreSession()
        }
    }

    fun signOut() {
        viewModelScope.launch {
            authRepository.signOut()
            appNavigator.navigateTo(AmanDestination.Auth)
        }
    }
}
