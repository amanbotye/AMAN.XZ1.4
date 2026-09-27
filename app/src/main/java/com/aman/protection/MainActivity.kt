package com.aman.protection

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.aman.protection.presentation.auth.AuthViewModel
import com.aman.protection.presentation.main.MainViewModel
import com.aman.protection.presentation.screens.AmanMainApp

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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AmanMainApp(
                mainViewModel = mainViewModel,
                authViewModel = authViewModel
            )
        }
    }
}
