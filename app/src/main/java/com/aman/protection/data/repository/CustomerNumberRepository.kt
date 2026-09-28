package com.aman.protection.data.repository

import com.aman.protection.core.AmanResult
import com.aman.protection.domain.models.CustomerNumber
import kotlinx.coroutines.flow.StateFlow

/**
 * واجهة مستودع إدارة أرقام العميل
 */
interface CustomerNumberRepository {
    val numbersList: StateFlow<List<CustomerNumber>>

    /**
     * جلب كافة أرقام العميل الحالية من Supabase مع ربط الشركات المكتشفة
     */
    suspend fun fetchCustomerNumbers(): AmanResult<List<CustomerNumber>>

    /**
     * إضافة رقم هاتف جديد للعميل عبر العملية الموثوقة rpc_add_customer_number
     * (حفظ الرقم فقط دون إنشاء حماية تلقائيًا)
     */
    suspend fun addCustomerNumber(phoneNumber: String): AmanResult<String>

    /**
     * تعديل ملاحظات رقم العميل عبر الإجراء rpc_update_customer_number_notes
     */
    suspend fun updateNotes(customerNumberId: String, notes: String): AmanResult<Unit>

    /**
     * حذف الرقم منطقياً وفق الصلاحيات (Soft delete: is_deleted = true)
     */
    suspend fun deleteCustomerNumber(customerNumberId: String): AmanResult<Unit>

    /**
     * تفريغ القائمة عند تسجيل الخروج
     */
    fun clearCache()
}
