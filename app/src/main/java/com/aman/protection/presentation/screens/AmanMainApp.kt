package com.aman.protection.presentation.screens

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.aman.protection.data.models.UserType
import com.aman.protection.data.models.toDomain
import com.aman.protection.navigation.AmanDestination
import com.aman.protection.presentation.admin.AdminManagementViewModel
import com.aman.protection.presentation.admin.AdminProtectionViewModel
import com.aman.protection.presentation.auth.AuthViewModel
import com.aman.protection.presentation.customer.CustomerViewModel
import com.aman.protection.presentation.main.MainViewModel
import com.aman.protection.presentation.notifications.NotificationsViewModel
import com.aman.protection.presentation.payment.PaymentMethodViewModel
import com.aman.protection.presentation.protection.CustomerProtectionViewModel
import com.aman.protection.presentation.tasks.AdminTasksViewModel
import com.aman.protection.presentation.theme.AmanTheme

/**
 * نقطة العرض والربط الرئيسية لتطبيق أمان (Android Native Jetpack Compose)
 * إدارة الجلسة والمصادقة والفصل المعماري الصارم بين العميل والإدارة
 */
@Composable
fun AmanMainApp(
    mainViewModel: MainViewModel,
    authViewModel: AuthViewModel,
    customerViewModel: CustomerViewModel,
    protectionViewModel: CustomerProtectionViewModel,
    adminProtectionViewModel: AdminProtectionViewModel,
    paymentMethodViewModel: PaymentMethodViewModel,
    adminTasksViewModel: AdminTasksViewModel,
    notificationsViewModel: NotificationsViewModel,
    adminManagementViewModel: AdminManagementViewModel
) {
    val uiState by mainViewModel.uiState.collectAsState()

    AmanTheme {
        when {
            uiState.isLoading -> {
                SplashScreen()
            }
            uiState.currentUser != null && (uiState.currentUser!!.userType == UserType.ADMIN || uiState.destination.isAdminRoute) -> {
                AdminHomeScreen(
                    user = uiState.currentUser!!.toDomain(),
                    adminProtectionViewModel = adminProtectionViewModel,
                    adminTasksViewModel = adminTasksViewModel,
                    notificationsViewModel = notificationsViewModel,
                    adminManagementViewModel = adminManagementViewModel,
                    onSignOut = mainViewModel::signOut
                )
            }
            uiState.currentUser != null && (uiState.currentUser!!.userType == UserType.CUSTOMER || uiState.destination.isCustomerRoute) -> {
                CustomerHomeScreen(
                    user = uiState.currentUser!!,
                    customerViewModel = customerViewModel,
                    protectionViewModel = protectionViewModel,
                    paymentMethodViewModel = paymentMethodViewModel,
                    notificationsViewModel = notificationsViewModel,
                    onSignOut = mainViewModel::signOut
                )
            }
            else -> {
                AuthScreen(viewModel = authViewModel)
            }
        }
    }
}
