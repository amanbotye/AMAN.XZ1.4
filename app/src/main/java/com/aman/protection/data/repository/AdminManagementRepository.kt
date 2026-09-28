package com.aman.protection.data.repository

import com.aman.protection.core.AmanResult
import com.aman.protection.data.models.CompanyDto
import com.aman.protection.data.models.PaymentMethodDto
import com.aman.protection.data.models.ProtectionPlanDto
import com.aman.protection.data.models.UserDto
import com.aman.protection.domain.models.AdminDashboardStats
import com.aman.protection.domain.models.AuditLog
import com.aman.protection.domain.models.CustomerNumber
import com.aman.protection.domain.models.Protection
import com.aman.protection.domain.models.SystemSetting
import kotlinx.coroutines.flow.StateFlow

/**
 * مستودع العمليات الإدارية الشاملة (AdminManagementRepository)
 * يربط مباشرة بجداول users, companies, company_packages, payment_methods, system_settings, audit_logs, customer_numbers, protections
 */
interface AdminManagementRepository {
    val dashboardStats: StateFlow<AdminDashboardStats>
    suspend fun fetchDashboardStats(): AmanResult<AdminDashboardStats>
    suspend fun fetchAllUsers(): AmanResult<List<UserDto>>
    suspend fun updateUserStatus(userId: String, newStatus: String): AmanResult<Unit>
    suspend fun fetchAllCustomerNumbers(): AmanResult<List<CustomerNumber>>
    suspend fun fetchAllProtections(): AmanResult<List<Protection>>
    suspend fun fetchAllCompanies(): AmanResult<List<CompanyDto>>
    suspend fun fetchAllPlans(): AmanResult<List<ProtectionPlanDto>>
    suspend fun updatePlan(planId: String, price: Double, durationDays: Int, isActive: Boolean, isVisible: Boolean): AmanResult<Unit>
    suspend fun fetchAllPaymentMethods(): AmanResult<List<PaymentMethodDto>>
    suspend fun updatePaymentMethodStatus(id: String, isActive: Boolean): AmanResult<Unit>
    suspend fun fetchSystemSettings(): AmanResult<List<SystemSetting>>
    suspend fun updateSystemSetting(id: String, newValue: String): AmanResult<Unit>
    suspend fun fetchAuditLogs(): AmanResult<List<AuditLog>>
}
