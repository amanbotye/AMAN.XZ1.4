package com.aman.protection.presentation.admin

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aman.protection.core.AmanResult
import com.aman.protection.data.repository.AdminManagementRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class AdminManagementViewModel(
    private val adminManagementRepository: AdminManagementRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminManagementUiState())
    val uiState: StateFlow<AdminManagementUiState> = _uiState.asStateFlow()

    fun loadAllManagementData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }

            // 1. Stats
            when (val res = adminManagementRepository.fetchDashboardStats()) {
                is AmanResult.Success -> _uiState.update { it.copy(stats = res.data) }
                else -> Unit
            }

            // 2. Users
            when (val res = adminManagementRepository.fetchAllUsers()) {
                is AmanResult.Success -> _uiState.update { it.copy(users = res.data) }
                else -> Unit
            }

            // 3. Companies
            when (val res = adminManagementRepository.fetchAllCompanies()) {
                is AmanResult.Success -> _uiState.update { it.copy(companies = res.data) }
                else -> Unit
            }

            // 4. Plans
            when (val res = adminManagementRepository.fetchAllPlans()) {
                is AmanResult.Success -> _uiState.update { it.copy(plans = res.data) }
                else -> Unit
            }

            // 5. Payment Methods
            when (val res = adminManagementRepository.fetchAllPaymentMethods()) {
                is AmanResult.Success -> _uiState.update { it.copy(paymentMethods = res.data) }
                else -> Unit
            }

            // 6. Settings
            when (val res = adminManagementRepository.fetchSystemSettings()) {
                is AmanResult.Success -> _uiState.update { it.copy(settings = res.data) }
                else -> Unit
            }

            // 7. Audit Logs
            when (val res = adminManagementRepository.fetchAuditLogs()) {
                is AmanResult.Success -> _uiState.update { it.copy(auditLogs = res.data) }
                else -> Unit
            }

            _uiState.update { it.copy(isLoading = false) }
        }
    }

    fun updateUserStatus(userId: String, newStatus: String) {
        viewModelScope.launch {
            when (adminManagementRepository.updateUserStatus(userId, newStatus)) {
                is AmanResult.Success -> {
                    _uiState.update {
                        it.copy(
                            users = it.users.map { u -> if (u.id == userId) u.copy(status = newStatus) else u },
                            successMessage = "تم تحديث حالة المستخدم بنجاح"
                        )
                    }
                }
                is AmanResult.Error -> {
                    _uiState.update { it.copy(errorMessage = "فشل تحديث حالة المستخدم") }
                }
                else -> Unit
            }
        }
    }

    fun updatePlan(planId: String, price: Double, durationDays: Int, isActive: Boolean, isVisible: Boolean) {
        viewModelScope.launch {
            when (adminManagementRepository.updatePlan(planId, price, durationDays, isActive, isVisible)) {
                is AmanResult.Success -> {
                    _uiState.update {
                        it.copy(
                            plans = it.plans.map { p ->
                                if (p.id == planId) p.copy(price = price, durationDays = durationDays, isActive = isActive, isVisible = isVisible) else p
                            },
                            successMessage = "تم تحديث باقة الحماية بنجاح"
                        )
                    }
                }
                is AmanResult.Error -> {
                    _uiState.update { it.copy(errorMessage = "فشل تعديل باقة الحماية") }
                }
                else -> Unit
            }
        }
    }

    fun togglePaymentMethod(id: String, currentActive: Boolean) {
        viewModelScope.launch {
            val newActive = !currentActive
            when (adminManagementRepository.updatePaymentMethodStatus(id, newActive)) {
                is AmanResult.Success -> {
                    _uiState.update {
                        it.copy(
                            paymentMethods = it.paymentMethods.map { pm ->
                                if (pm.id == id) pm.copy(isActive = newActive) else pm
                            },
                            successMessage = "تم تعديل حالة طريقة الدفع بنجاح"
                        )
                    }
                }
                is AmanResult.Error -> {
                    _uiState.update { it.copy(errorMessage = "فشل تعديل طريقة الدفع") }
                }
                else -> Unit
            }
        }
    }

    fun updateSetting(id: String, newValue: String) {
        viewModelScope.launch {
            when (adminManagementRepository.updateSystemSetting(id, newValue)) {
                is AmanResult.Success -> {
                    _uiState.update {
                        it.copy(
                            settings = it.settings.map { s -> if (s.id == id) s.copy(value = newValue) else s },
                            successMessage = "تم تحديث الإعداد بنجاح"
                        )
                    }
                }
                is AmanResult.Error -> {
                    _uiState.update { it.copy(errorMessage = "فشل تحديث الإعداد") }
                }
                else -> Unit
            }
        }
    }

    fun clearMessages() {
        _uiState.update { it.copy(errorMessage = null, successMessage = null) }
    }
}
