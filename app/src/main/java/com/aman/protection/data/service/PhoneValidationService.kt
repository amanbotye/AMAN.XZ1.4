package com.aman.protection.data.service

import com.aman.protection.core.AmanResult
import com.aman.protection.data.models.CompanyDto
import com.aman.protection.data.models.DetectedCompanyDto
import com.aman.protection.domain.models.Company

data class PhoneDetectionResult(
    val rawInput: String,
    val normalizedNumber: String,
    val prefix: String,
    val companyId: String,
    val companyName: String,
    val companyCode: String,
    val expectedLength: Int = 9,
    val isValid: Boolean = false,
    val errorMessageAr: String? = null
)

interface PhoneValidationService {
    /**
     * تطبيع رقم الهاتف وفق معيار normalize_phone في AMAN.XZ.txt
     */
    fun normalize(rawPhone: String): String

    /**
     * فحص رقم الهاتف واكتشاف شركة الاتصالات والبادئة المعتمدة
     */
    suspend fun detectAndValidate(rawPhone: String): PhoneDetectionResult

    /**
     * جلب قائمة الشركات المدعومة المخزنة
     */
    suspend fun getSupportedCompanies(): List<Company>
}
