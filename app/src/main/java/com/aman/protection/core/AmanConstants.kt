package com.aman.protection.core

/**
 * الثوابت الأساسية لنظام AMAN — أمان
 * وفق محددات المرجع الأساسي AMAN.XZ.txt
 */
object AmanConstants {
    // Supabase Live Project
    const val SUPABASE_URL = "https://pvgmtufzvwkdvtbtcijn.supabase.co"
    const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2Z210dWZ6dndrZHZ0YnRjaWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NDgwMTYsImV4cCI6MjEwNjAyNDAxNn0.Pbn4vm5Zk2evWEhzEiV5buq4g9yLbu8t1orziq5UDeo"

    // Tables
    const val TABLE_USERS = "users"
    const val TABLE_COMPANIES = "companies"
    const val TABLE_COMPANY_PREFIXES = "company_prefixes"
    const val TABLE_COMPANY_PACKAGES = "company_packages"
    const val TABLE_CUSTOMER_NUMBERS = "customer_numbers"
    const val TABLE_PROTECTIONS = "protections"
    const val TABLE_PROTECTION_REQUESTS = "protection_requests"
    const val TABLE_PROTECTION_TASKS = "protection_tasks"
    const val TABLE_PROTECTION_RENEWALS = "protection_renewals"
    const val TABLE_PAYMENT_METHODS = "payment_methods"
    const val TABLE_MANUAL_PAYMENT_LOGS = "manual_payment_logs"
    const val TABLE_TRANSACTIONS = "transactions"
    const val TABLE_CLIENT_NOTIFICATIONS = "client_notifications"
    const val TABLE_ADMIN_NOTIFICATIONS = "admin_notifications"
    const val TABLE_AUDIT_LOGS = "audit_logs"
    const val TABLE_SYSTEM_SETTINGS = "system_settings"

    // Roles
    const val ROLE_CUSTOMER = "customer"
    const val ROLE_ADMIN = "admin"

    // User Statuses
    const val USER_STATUS_ACTIVE = "active"
    const val USER_STATUS_SUSPENDED = "suspended"
    const val USER_STATUS_DISABLED = "disabled"

    // Currencies
    const val CURRENCY_YER = "YER"
    const val CURRENCY_SAR = "SAR"
    const val CURRENCY_USD = "USD"
}
