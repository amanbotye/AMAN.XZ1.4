package com.aman.protection.data.repository

import com.aman.protection.core.AmanResult
import com.aman.protection.domain.models.Customer
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.StateFlow

/**
 * واجهة مستودع إدارة بيانات العميل
 */
interface CustomerRepository {
    val currentCustomer: StateFlow<Customer?>

    /**
     * جلب ملف العميل الكامل مع عدد الأرقام والحمايات
     */
    suspend fun getCustomer(userId: String): AmanResult<Customer>

    /**
     * تحديث بيانات الملف الشخصي للعميل في جدول public.users
     */
    suspend fun updateCustomerName(userId: String, fullName: String): AmanResult<Unit>

    /**
     * مسح بيانات العميل عند تسجيل الخروج
     */
    fun clearCustomer()
}
