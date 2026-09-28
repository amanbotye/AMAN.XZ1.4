package com.aman.protection

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.aman.protection.presentation.admin.AdminProtectionViewModel
import com.aman.protection.presentation.auth.AuthViewModel
import com.aman.protection.presentation.customer.CustomerViewModel
import com.aman.protection.presentation.main.MainViewModel
import com.aman.protection.presentation.notifications.NotificationsViewModel
import com.aman.protection.presentation.payment.PaymentMethodViewModel
import com.aman.protection.presentation.protection.CustomerProtectionViewModel
import com.aman.protection.presentation.screens.AmanMainApp
import com.aman.protection.presentation.tasks.AdminTasksViewModel

/**
 * MainActivity - نقطة البداية لتطبيق Android الأصلي
 */
class MainActivity : ComponentActivity() {

    private val mainViewModel: MainViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val app = AmanApplication.instance
                @Suppress("UNCHECKED_CAST")
                return MainViewModel(app.authRepository, app.appNavigator) as T
            }
        }
    }

    private val authViewModel: AuthViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val app = AmanApplication.instance
                @Suppress("UNCHECKED_CAST")
                return AuthViewModel(app.authRepository) as T
            }
        }
    }

    private val customerViewModel: CustomerViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val app = AmanApplication.instance
                @Suppress("UNCHECKED_CAST")
                return CustomerViewModel(
                    app.customerRepository,
                    app.customerNumberRepository,
                    app.phoneValidationService,
                    app.authRepository
                ) as T
            }
        }
    }

    private val customerProtectionViewModel: CustomerProtectionViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val app = AmanApplication.instance
                @Suppress("UNCHECKED_CAST")
                return CustomerProtectionViewModel(
                    app.protectionPlanRepository,
                    app.protectionRequestRepository,
                    app.protectionRepository
                ) as T
            }
        }
    }

    private val adminProtectionViewModel: AdminProtectionViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val app = AmanApplication.instance
                @Suppress("UNCHECKED_CAST")
                return AdminProtectionViewModel(
                    app.protectionRequestRepository,
                    app.protectionRepository
                ) as T
            }
        }
    }

    private val paymentMethodViewModel: PaymentMethodViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val app = AmanApplication.instance
                @Suppress("UNCHECKED_CAST")
                return PaymentMethodViewModel(app.paymentMethodRepository) as T
            }
        }
    }

    private val adminTasksViewModel: AdminTasksViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val app = AmanApplication.instance
                @Suppress("UNCHECKED_CAST")
                return AdminTasksViewModel(app.paymentTaskRepository) as T
            }
        }
    }

    private val notificationsViewModel: NotificationsViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val app = AmanApplication.instance
                @Suppress("UNCHECKED_CAST")
                return NotificationsViewModel(app.notificationRepository) as T
            }
        }
    }

    private val adminManagementViewModel: com.aman.protection.presentation.admin.AdminManagementViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val app = AmanApplication.instance
                @Suppress("UNCHECKED_CAST")
                return com.aman.protection.presentation.admin.AdminManagementViewModel(app.adminManagementRepository) as T
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AmanMainApp(
                mainViewModel = mainViewModel,
                authViewModel = authViewModel,
                customerViewModel = customerViewModel,
                protectionViewModel = customerProtectionViewModel,
                adminProtectionViewModel = adminProtectionViewModel,
                paymentMethodViewModel = paymentMethodViewModel,
                adminTasksViewModel = adminTasksViewModel,
                notificationsViewModel = notificationsViewModel,
                adminManagementViewModel = adminManagementViewModel
            )
        }
    }
}
