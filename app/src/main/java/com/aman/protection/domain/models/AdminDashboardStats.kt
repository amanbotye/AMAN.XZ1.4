package com.aman.protection.domain.models

/**
 * مقاييس وإحصائيات لوحة تحكم المشرف (Dashboard Stats)
 * وفق محددات البند 1.6.2 الرئيسية في AMAN.XZ.txt
 */
data class AdminDashboardStats(
    val pendingRequestsCount: Int = 0,
    val activeProtectionsCount: Int = 0,
    val renewalNeededCount: Int = 0,
    val dueTasksCount: Int = 0,
    val overdueTasksCount: Int = 0,
    val totalCustomersCount: Int = 0,
    val unreadNotificationsCount: Int = 0
)
