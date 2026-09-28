package com.aman.protection.presentation.admin

import com.aman.protection.data.models.CompanyDto
import com.aman.protection.data.models.PaymentMethodDto
import com.aman.protection.data.models.ProtectionPlanDto
import com.aman.protection.data.models.UserDto
import com.aman.protection.domain.models.AdminDashboardStats
import com.aman.protection.domain.models.AuditLog
import com.aman.protection.domain.models.CustomerNumber
import com.aman.protection.domain.models.Protection
import com.aman.protection.domain.models.SystemSetting

data class AdminManagementUiState(
    val isLoading: Boolean = false,
    val stats: AdminDashboardStats = AdminDashboardStats(),
    val users: List<UserDto> = emptyList(),
    val customerNumbers: List<CustomerNumber> = emptyList(),
    val protections: List<Protection> = emptyList(),
    val companies: List<CompanyDto> = emptyList(),
    val plans: List<ProtectionPlanDto> = emptyList(),
    val paymentMethods: List<PaymentMethodDto> = emptyList(),
    val settings: List<SystemSetting> = emptyList(),
    val auditLogs: List<AuditLog> = emptyList(),
    val errorMessage: String? = null,
    val successMessage: String? = null
)
