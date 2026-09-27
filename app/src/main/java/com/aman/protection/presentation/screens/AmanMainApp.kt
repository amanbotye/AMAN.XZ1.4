package com.aman.protection.presentation.screens

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.aman.protection.navigation.AmanDestination
import com.aman.protection.presentation.auth.AuthViewModel
import com.aman.protection.presentation.main.MainViewModel
import com.aman.protection.presentation.theme.AmanTheme

/**
 * نقطة العرض والربط الرئيسية للتطبيق:
 * App -> Session -> Auth -> public.users -> User State -> Navigation
 */
@Composable
fun AmanMainApp(
    mainViewModel: MainViewModel,
    authViewModel: AuthViewModel
) {
    val uiState by mainViewModel.uiState.collectAsState()

    AmanTheme {
        when {
            uiState.isLoading -> {
                SplashScreen()
            }
            uiState.destination == AmanDestination.AdminHome && uiState.currentUser != null -> {
                AdminHomeScreen(
                    user = uiState.currentUser!!,
                    onSignOut = mainViewModel::signOut
                )
            }
            uiState.destination == AmanDestination.CustomerHome && uiState.currentUser != null -> {
                CustomerHomeScreen(
                    user = uiState.currentUser!!,
                    onSignOut = mainViewModel::signOut
                )
            }
            else -> {
                AuthScreen(viewModel = authViewModel)
            }
        }
    }
}
