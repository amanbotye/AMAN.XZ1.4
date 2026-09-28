package com.aman.protection.navigation

/**
 * مسارات ووجهات التنقل لنظام AMAN (أمان)
 * متوافقة مع مصفوفة الشاشات المعتمدة AMAN_XZ1_Screen_Matrix_COMPREHENSIVE.xlsx
 * تغطي الشاشات الـ 22 الفعلية + الطبقات التكميلية
 */
sealed class AmanDestination(val route: String) {
    // 00 - التهيئة
    object Splash : AmanDestination("splash")

    // المصادقة (AUTH-01 إلى AUTH-04)
    object Auth : AmanDestination("auth")
    object Login : AmanDestination("auth_login")
    object SignUp : AmanDestination("auth_signup")
    object ForgotPassword : AmanDestination("auth_forgot")
    object ChangePassword : AmanDestination("auth_change_password")

    // العميل (CUS-01 إلى CUS-07 + CUS-MORE)
    object CustomerHome : AmanDestination("customer_home")
    object CustomerNumbers : AmanDestination("customer_numbers")
    object AddCustomerNumber : AmanDestination("customer_add_number")
    object CustomerProtectionRequests : AmanDestination("customer_requests")
    object CreateProtectionRequest : AmanDestination("customer_create_request")
    object CustomerProtections : AmanDestination("customer_protections")
    object CustomerRenewal : AmanDestination("customer_renewal")
    object CustomerNotifications : AmanDestination("customer_notifications")
    object CustomerAccount : AmanDestination("customer_account")
    object CustomerMore : AmanDestination("customer_more")

    // الإدارة (ADM-01 إلى ADM-11 + ADM-LOGIN)
    object AdminLogin : AmanDestination("admin_login")
    object AdminHome : AmanDestination("admin_home")
    object AdminDashboard : AmanDestination("admin_dashboard")
    object AdminCustomers : AmanDestination("admin_customers")
    object AdminCustomerNumbers : AmanDestination("admin_customer_numbers")
    object AdminProtectionRequests : AmanDestination("admin_requests")
    object AdminProtections : AmanDestination("admin_protections")
    object AdminTasks : AmanDestination("admin_tasks")
    object AdminCompanies : AmanDestination("admin_companies")
    object AdminPlans : AmanDestination("admin_plans")
    object AdminPaymentMethods : AmanDestination("admin_payment_methods")
    object AdminNotifications : AmanDestination("admin_notifications")
    object AdminAuditLogs : AmanDestination("admin_audit_logs")
    object AdminSettings : AmanDestination("admin_settings")

    val isAdminRoute: Boolean
        get() = when (this) {
            is AdminHome, is AdminDashboard, is AdminCustomers, is AdminCustomerNumbers,
            is AdminProtectionRequests, is AdminProtections, is AdminTasks, is AdminCompanies,
            is AdminPlans, is AdminPaymentMethods, is AdminNotifications, is AdminAuditLogs,
            is AdminSettings, is AdminLogin -> true
            else -> false
        }

    val isCustomerRoute: Boolean
        get() = when (this) {
            is CustomerHome, is CustomerNumbers, is AddCustomerNumber, is CustomerProtectionRequests,
            is CreateProtectionRequest, is CustomerProtections, is CustomerRenewal,
            is CustomerNotifications, is CustomerAccount, is CustomerMore -> true
            else -> false
        }

    val isAuthRoute: Boolean
        get() = when (this) {
            is Auth, is Login, is SignUp, is ForgotPassword, is ChangePassword -> true
            else -> false
        }

    companion object {
        fun fromRoute(route: String?): AmanDestination = when (route) {
            "splash" -> Splash
            "auth" -> Auth
            "auth_login" -> Login
            "auth_signup" -> SignUp
            "auth_forgot" -> ForgotPassword
            "auth_change_password" -> ChangePassword
            "customer_home" -> CustomerHome
            "customer_numbers" -> CustomerNumbers
            "customer_add_number" -> AddCustomerNumber
            "customer_requests" -> CustomerProtectionRequests
            "customer_create_request" -> CreateProtectionRequest
            "customer_protections" -> CustomerProtections
            "customer_renewal" -> CustomerRenewal
            "customer_notifications" -> CustomerNotifications
            "customer_account" -> CustomerAccount
            "customer_more" -> CustomerMore
            "admin_login" -> AdminLogin
            "admin_home" -> AdminHome
            "admin_dashboard" -> AdminDashboard
            "admin_customers" -> AdminCustomers
            "admin_customer_numbers" -> AdminCustomerNumbers
            "admin_requests" -> AdminProtectionRequests
            "admin_protections" -> AdminProtections
            "admin_tasks" -> AdminTasks
            "admin_companies" -> AdminCompanies
            "admin_plans" -> AdminPlans
            "admin_payment_methods" -> AdminPaymentMethods
            "admin_notifications" -> AdminNotifications
            "admin_audit_logs" -> AdminAuditLogs
            "admin_settings" -> AdminSettings
            else -> Splash
        }
    }
}
