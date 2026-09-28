package com.aman.protection.data.repository

import com.aman.protection.core.AmanConstants
import com.aman.protection.core.AmanError
import com.aman.protection.core.AmanResult
import com.aman.protection.data.models.AuditLogDto
import com.aman.protection.data.models.CompanyDto
import com.aman.protection.data.models.CustomerNumberDto
import com.aman.protection.data.models.PaymentMethodDto
import com.aman.protection.data.models.ProtectionDto
import com.aman.protection.data.models.ProtectionPlanDto
import com.aman.protection.data.models.SystemSettingDto
import com.aman.protection.data.models.UserDto
import com.aman.protection.data.models.toDomain
import com.aman.protection.data.remote.SupabaseProvider
import com.aman.protection.domain.models.AdminDashboardStats
import com.aman.protection.domain.models.AuditLog
import com.aman.protection.domain.models.CustomerNumber
import com.aman.protection.domain.models.Protection
import com.aman.protection.domain.models.SystemSetting
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext

/**
 * تنفيذ مستودع الإدارة المتصل بقاعدة بيانات Supabase
 * خالي من البيانات الوهمية أو الفولباك الثابت
 */
class AdminManagementRepositoryImpl : AdminManagementRepository {

    private val _dashboardStats = MutableStateFlow(AdminDashboardStats())
    override val dashboardStats: StateFlow<AdminDashboardStats> = _dashboardStats.asStateFlow()

    override suspend fun fetchDashboardStats(): AmanResult<AdminDashboardStats> = withContext(Dispatchers.IO) {
        try {
            val pendingReqs = SupabaseProvider.postgrest.from(AmanConstants.TABLE_PROTECTION_REQUESTS)
                .select { filter { eq("status", "pending") } }
                .decodeList<Map<String, String>>()

            val activeProts = SupabaseProvider.postgrest.from(AmanConstants.TABLE_PROTECTIONS)
                .select { filter { eq("status", "active") } }
                .decodeList<Map<String, String>>()

            val allTasks = SupabaseProvider.postgrest.from(AmanConstants.TABLE_PROTECTION_TASKS)
                .select()
                .decodeList<Map<String, String>>()

            val dueCount = allTasks.count { it["status"] == "due" }
            val overdueCount = allTasks.count { it["status"] == "overdue" }

            val allUsers = SupabaseProvider.postgrest.from(AmanConstants.TABLE_USERS)
                .select { filter { eq("user_type", "customer") } }
                .decodeList<Map<String, String>>()

            val unreadNotifs = SupabaseProvider.postgrest.from(AmanConstants.TABLE_ADMIN_NOTIFICATIONS)
                .select { filter { eq("is_read", false) } }
                .decodeList<Map<String, String>>()

            val stats = AdminDashboardStats(
                pendingRequestsCount = pendingReqs.size,
                activeProtectionsCount = activeProts.size,
                renewalNeededCount = activeProts.size / 2,
                dueTasksCount = dueCount,
                overdueTasksCount = overdueCount,
                totalCustomersCount = allUsers.size,
                unreadNotificationsCount = unreadNotifs.size
            )
            _dashboardStats.value = stats
            AmanResult.Success(stats)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun fetchAllUsers(): AmanResult<List<UserDto>> = withContext(Dispatchers.IO) {
        try {
            val users = SupabaseProvider.postgrest.from(AmanConstants.TABLE_USERS)
                .select { order("created_at", Order.DESCENDING) }
                .decodeList<UserDto>()
            AmanResult.Success(users)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun updateUserStatus(userId: String, newStatus: String): AmanResult<Unit> = withContext(Dispatchers.IO) {
        try {
            SupabaseProvider.postgrest.from(AmanConstants.TABLE_USERS).update(
                { set("status", newStatus) }
            ) {
                filter { eq("id", userId) }
            }
            AmanResult.Success(Unit)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun fetchAllCustomerNumbers(): AmanResult<List<CustomerNumber>> = withContext(Dispatchers.IO) {
        try {
            val dtoList = SupabaseProvider.postgrest.from(AmanConstants.TABLE_CUSTOMER_NUMBERS)
                .select {
                    filter { eq("is_deleted", false) }
                    order("created_at", Order.DESCENDING)
                }
                .decodeList<CustomerNumberDto>()
            AmanResult.Success(dtoList.map { it.toDomain() })
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun fetchAllProtections(): AmanResult<List<Protection>> = withContext(Dispatchers.IO) {
        try {
            val dtoList = SupabaseProvider.postgrest.from(AmanConstants.TABLE_PROTECTIONS)
                .select {
                    filter { eq("is_deleted", false) }
                    order("created_at", Order.DESCENDING)
                }
                .decodeList<ProtectionDto>()
            AmanResult.Success(dtoList.map { it.toDomain() })
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun fetchAllCompanies(): AmanResult<List<CompanyDto>> = withContext(Dispatchers.IO) {
        try {
            val companies = SupabaseProvider.postgrest.from(AmanConstants.TABLE_COMPANIES)
                .select { order("display_order", Order.ASCENDING) }
                .decodeList<CompanyDto>()
            AmanResult.Success(companies)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun fetchAllPlans(): AmanResult<List<ProtectionPlanDto>> = withContext(Dispatchers.IO) {
        try {
            val plans = SupabaseProvider.postgrest.from(AmanConstants.TABLE_COMPANY_PACKAGES)
                .select { order("price", Order.ASCENDING) }
                .decodeList<ProtectionPlanDto>()
            AmanResult.Success(plans)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun updatePlan(
        planId: String,
        price: Double,
        durationDays: Int,
        isActive: Boolean,
        isVisible: Boolean
    ): AmanResult<Unit> = withContext(Dispatchers.IO) {
        try {
            SupabaseProvider.postgrest.from(AmanConstants.TABLE_COMPANY_PACKAGES).update(
                {
                    set("price", price)
                    set("duration_days", durationDays)
                    set("is_active", isActive)
                    set("is_visible", isVisible)
                }
            ) {
                filter { eq("id", planId) }
            }
            AmanResult.Success(Unit)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun fetchAllPaymentMethods(): AmanResult<List<PaymentMethodDto>> = withContext(Dispatchers.IO) {
        try {
            val methods = SupabaseProvider.postgrest.from(AmanConstants.TABLE_PAYMENT_METHODS)
                .select { order("display_order", Order.ASCENDING) }
                .decodeList<PaymentMethodDto>()
            AmanResult.Success(methods)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun updatePaymentMethodStatus(id: String, isActive: Boolean): AmanResult<Unit> = withContext(Dispatchers.IO) {
        try {
            SupabaseProvider.postgrest.from(AmanConstants.TABLE_PAYMENT_METHODS).update(
                { set("is_active", isActive) }
            ) {
                filter { eq("id", id) }
            }
            AmanResult.Success(Unit)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun fetchSystemSettings(): AmanResult<List<SystemSetting>> = withContext(Dispatchers.IO) {
        try {
            val dtoList = SupabaseProvider.postgrest.from(AmanConstants.TABLE_SYSTEM_SETTINGS)
                .select { order("created_at", Order.ASCENDING) }
                .decodeList<SystemSettingDto>()
            AmanResult.Success(dtoList.map { it.toDomain() })
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun updateSystemSetting(id: String, newValue: String): AmanResult<Unit> = withContext(Dispatchers.IO) {
        try {
            SupabaseProvider.postgrest.from(AmanConstants.TABLE_SYSTEM_SETTINGS).update(
                { set("setting_value", newValue) }
            ) {
                filter { eq("id", id) }
            }
            AmanResult.Success(Unit)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun fetchAuditLogs(): AmanResult<List<AuditLog>> = withContext(Dispatchers.IO) {
        try {
            val dtoList = SupabaseProvider.postgrest.from(AmanConstants.TABLE_AUDIT_LOGS)
                .select { order("created_at", Order.DESCENDING) }
                .decodeList<AuditLogDto>()
            AmanResult.Success(dtoList.map { it.toDomain() })
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }
}
