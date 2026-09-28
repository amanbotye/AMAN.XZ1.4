package com.aman.protection.navigation

/**
 * مسارات التنقل الأساسية لنظام AMAN
 * تفصل بين مسار المصادقة وواجهة العميل وواجهة الإدارة
 */
sealed class AmanDestination(val route: String) {
    object Splash : AmanDestination("splash")
    object Auth : AmanDestination("auth")
    object CustomerHome : AmanDestination("customer_home")
    object CustomerNumbers : AmanDestination("customer_numbers")
    object AddCustomerNumber : AmanDestination("add_customer_number")
    object AdminHome : AmanDestination("admin_home")

    companion object {
        fun fromRoute(route: String?): AmanDestination = when (route) {
            "splash" -> Splash
            "auth" -> Auth
            "customer_home" -> CustomerHome
            "customer_numbers" -> CustomerNumbers
            "add_customer_number" -> AddCustomerNumber
            "admin_home" -> AdminHome
            else -> Splash
        }
    }
}
