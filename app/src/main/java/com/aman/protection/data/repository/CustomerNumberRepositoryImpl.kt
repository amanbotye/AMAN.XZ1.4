package com.aman.protection.data.repository

import com.aman.protection.core.AmanConstants
import com.aman.protection.core.AmanError
import com.aman.protection.core.AmanResult
import com.aman.protection.data.models.CompanyDto
import com.aman.protection.data.models.CustomerNumberDto
import com.aman.protection.data.models.RpcAddNumberResultDto
import com.aman.protection.data.remote.SupabaseProvider
import com.aman.protection.data.service.PhoneValidationService
import com.aman.protection.domain.models.Company
import com.aman.protection.domain.models.CustomerNumber
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.rpc
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/**
 * تنفيذ مستودع أرقام العميل بالاتصال بـ Supabase
 */
class CustomerNumberRepositoryImpl(
    private val phoneValidationService: PhoneValidationService
) : CustomerNumberRepository {

    private val _numbersList = MutableStateFlow<List<CustomerNumber>>(emptyList())
    override val numbersList: StateFlow<List<CustomerNumber>> = _numbersList.asStateFlow()

    override suspend fun fetchCustomerNumbers(): AmanResult<List<CustomerNumber>> = withContext(Dispatchers.IO) {
        try {
            val user = SupabaseProvider.auth.currentSessionOrNull()?.user
            if (user == null) {
                return@withContext AmanResult.Error(AmanError.SessionExpired())
            }

            // 1. جلب قائمة الشركات المدعومة لربط تفاصيل الشركة بالرقم
            val companiesMap = phoneValidationService.getSupportedCompanies().associateBy { it.id }

            // 2. قراءة أرقام العميل من جدول customer_numbers
            val dtoList = SupabaseProvider.postgrest.from(AmanConstants.TABLE_CUSTOMER_NUMBERS)
                .select {
                    filter {
                        eq("customer_id", user.id)
                        eq("is_deleted", false)
                    }
                    order("created_at", io.github.jan.supabase.postgrest.query.Order.DESCENDING)
                }
                .decodeList<CustomerNumberDto>()

            val domainList = dtoList.map { dto ->
                val company = companiesMap[dto.companyId]
                dto.toDomain().copy(company = company)
            }

            _numbersList.value = domainList
            AmanResult.Success(domainList)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun addCustomerNumber(phoneNumber: String): AmanResult<String> = withContext(Dispatchers.IO) {
        try {
            val currentSession = SupabaseProvider.auth.currentSessionOrNull()
            if (currentSession == null) {
                return@withContext AmanResult.Error(AmanError.SessionExpired())
            }

            // استدعاء الإجراء المخزن الموثوق rpc_add_customer_number
            val rpcResult = SupabaseProvider.postgrest.rpc(
                function = "rpc_add_customer_number",
                parameters = buildJsonObject {
                    put("p_phone_number", phoneNumber.trim())
                }
            ).decodeSingle<RpcAddNumberResultDto>()

            if (rpcResult.success && rpcResult.id != null) {
                // تحديث القائمة فوراً
                fetchCustomerNumbers()
                AmanResult.Success(rpcResult.id)
            } else {
                val errorCode = rpcResult.errorCode ?: "UNKNOWN_ERROR"
                val errorMsg = when (errorCode) {
                    "DUPLICATE_OPERATION" -> "هذا الرقم مسجل مسبقًا في حسابك"
                    "COMPANY_NOT_FOUND" -> "بادئة الرقم غير تابعة لأي شركة اتصالات مدعومة في اليمن"
                    "INVALID_PHONE_LENGTH" -> "طول رقم الهاتف غير صحيح، يجب أن يتكون من 9 أرقام"
                    "INVALID_PHONE" -> "صيغة رقم الهاتف المدخل غير صالحة"
                    "FORBIDDEN" -> "الحساب غير مؤهل لإضافة أرقام جديدة حاليًا"
                    "UNAUTHORIZED" -> "يجب تسجيل الدخول لإتمام العملية"
                    else -> rpcResult.message ?: "فشلت عملية إضافة الرقم"
                }

                AmanResult.Error(AmanError.DatabaseError(errorMsg, errorCode))
            }
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun updateNotes(customerNumberId: String, notes: String): AmanResult<Unit> = withContext(Dispatchers.IO) {
        try {
            val rpcResult = SupabaseProvider.postgrest.rpc(
                function = "rpc_update_customer_number_notes",
                parameters = buildJsonObject {
                    put("p_customer_number_id", customerNumberId)
                    put("p_notes", notes.trim())
                }
            ).decodeSingle<RpcAddNumberResultDto>()

            if (rpcResult.success) {
                fetchCustomerNumbers()
                AmanResult.Success(Unit)
            } else {
                AmanResult.Error(AmanError.DatabaseError(rpcResult.message ?: "فشل تحديث الملاحظات"))
            }
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun deleteCustomerNumber(customerNumberId: String): AmanResult<Unit> = withContext(Dispatchers.IO) {
        try {
            val user = SupabaseProvider.auth.currentSessionOrNull()?.user
                ?: return@withContext AmanResult.Error(AmanError.SessionExpired())

            SupabaseProvider.postgrest.from(AmanConstants.TABLE_CUSTOMER_NUMBERS)
                .update(
                    update = buildJsonObject {
                        put("is_deleted", true)
                        put("status", "inactive")
                    }
                ) {
                    filter {
                        eq("id", customerNumberId)
                        eq("customer_id", user.id)
                    }
                }

            fetchCustomerNumbers()
            AmanResult.Success(Unit)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override fun clearCache() {
        _numbersList.value = emptyList()
    }
}
