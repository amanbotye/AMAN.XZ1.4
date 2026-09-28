package com.aman.protection.data.repository

import com.aman.protection.core.AmanConstants
import com.aman.protection.core.AmanError
import com.aman.protection.core.AmanResult
import com.aman.protection.data.models.UserDto
import com.aman.protection.data.models.toCustomer
import com.aman.protection.data.models.toDomain
import com.aman.protection.data.remote.SupabaseProvider
import com.aman.protection.domain.models.Customer
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/**
 * تنفيذ مستودع العميل بالاتصال بـ Supabase
 */
class CustomerRepositoryImpl : CustomerRepository {

    private val _currentCustomer = MutableStateFlow<Customer?>(null)
    override val currentCustomer: StateFlow<Customer?> = _currentCustomer.asStateFlow()

    override suspend fun getCustomer(userId: String): AmanResult<Customer> = withContext(Dispatchers.IO) {
        try {
            // 1. جلب بيانات المستخدم من users
            val userDto = SupabaseProvider.postgrest.from(AmanConstants.TABLE_USERS)
                .select {
                    filter {
                        eq("id", userId)
                    }
                }
                .decodeSingle<UserDto>()

            val user = userDto.toDomain()

            // 2. حساب عدد الأرقام المسجلة
            val numbersCount = try {
                val list = SupabaseProvider.postgrest.from(AmanConstants.TABLE_CUSTOMER_NUMBERS)
                    .select {
                        filter {
                            eq("customer_id", userId)
                            eq("is_deleted", false)
                        }
                    }
                    .decodeList<UserDto>()
                list.size
            } catch (_: Exception) {
                0
            }

            val customer = user.toCustomer(totalNumbers = numbersCount)
            _currentCustomer.value = customer
            AmanResult.Success(customer)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override suspend fun updateCustomerName(userId: String, fullName: String): AmanResult<Unit> = withContext(Dispatchers.IO) {
        try {
            SupabaseProvider.postgrest.from(AmanConstants.TABLE_USERS)
                .update(
                    update = buildJsonObject {
                        put("full_name", fullName.trim())
                    }
                ) {
                    filter {
                        eq("id", userId)
                    }
                }

            // تحديث الكاش المحلي
            _currentCustomer.value?.let { current ->
                _currentCustomer.value = current.copy(
                    user = current.user.copy(fullName = fullName.trim())
                )
            }

            AmanResult.Success(Unit)
        } catch (e: Exception) {
            AmanResult.Error(AmanError.fromThrowable(e))
        }
    }

    override fun clearCustomer() {
        _currentCustomer.value = null
    }
}
