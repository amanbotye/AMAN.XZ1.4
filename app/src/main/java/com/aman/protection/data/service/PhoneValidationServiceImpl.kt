package com.aman.protection.data.service

import com.aman.protection.core.AmanConstants
import com.aman.protection.data.models.CompanyDto
import com.aman.protection.data.models.DetectedCompanyDto
import com.aman.protection.data.remote.SupabaseProvider
import com.aman.protection.domain.models.Company
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.rpc
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/**
 * خدمة التحقق من رقم الهاتف وتحديد شركة الاتصالات
 * وفق دوال قاعدة البيانات المباشرة detect_company_from_phone و normalize_phone
 */
class PhoneValidationServiceImpl : PhoneValidationService {

    // قائمة الشركات المعتمدة الثابتة في قاعدة البيانات لاستخدامها كمرجع فوري
    private val knownCompanies = mapOf(
        "77" to CompanyInfo("4262d66c-f6b2-437b-9f45-02123e2306d4", "يمن موبايل", "Yemen Mobile", "YM", 9),
        "78" to CompanyInfo("4262d66c-f6b2-437b-9f45-02123e2306d4", "يمن موبايل", "Yemen Mobile", "YM", 9),
        "73" to CompanyInfo("193c9f07-2781-44e0-96f6-eead97fca93a", "يو للاتصالات", "YOU Telecom", "YOU", 9),
        "71" to CompanyInfo("cdeb5fe5-4733-4732-b678-9dd101f11d88", "سبأفون", "Sabafon", "SABAFON", 9),
        "70" to CompanyInfo("69a82a6d-345f-44a1-b46a-33e8098b8c64", "واي للاتصالات", "Y Telecom", "Y", 9)
    )

    private data class CompanyInfo(
        val id: String,
        val nameAr: String,
        val nameEn: String,
        val code: String,
        val length: Int
    )

    override fun normalize(rawPhone: String): String {
        var clean = rawPhone.replace(Regex("[^0-9]"), "")
        if (clean.startsWith("00967")) {
            clean = clean.substring(5)
        } else if (clean.startsWith("967")) {
            clean = clean.substring(3)
        }
        if (clean.startsWith("0") && clean.length > 1) {
            clean = clean.substring(1)
        }
        return clean
    }

    override suspend fun detectAndValidate(rawPhone: String): PhoneDetectionResult = withContext(Dispatchers.IO) {
        val normalized = normalize(rawPhone)

        if (normalized.length < 2) {
            return@withContext PhoneDetectionResult(
                rawInput = rawPhone,
                normalizedNumber = normalized,
                prefix = "",
                companyId = "",
                companyName = "",
                companyCode = "",
                isValid = false,
                errorMessageAr = "أدخل رقم الهاتف للتحقق"
            )
        }

        val prefixCandidate = normalized.substring(0, 2)
        val known = knownCompanies[prefixCandidate]

        // 1. محاولة الاستعلام الحي من RPC detect_company_from_phone
        try {
            val rpcResult = SupabaseProvider.postgrest.rpc(
                function = "detect_company_from_phone",
                parameters = buildJsonObject {
                    put("p_normalized_phone", normalized)
                }
            ).decodeList<DetectedCompanyDto>()

            if (rpcResult.isNotEmpty()) {
                val detected = rpcResult.first()
                val companyName = known?.nameAr ?: "شركة معتمدة"
                val companyCode = known?.code ?: "OPERATOR"
                val isLengthValid = normalized.length == detected.numberLength

                return@withContext PhoneDetectionResult(
                    rawInput = rawPhone,
                    normalizedNumber = normalized,
                    prefix = detected.prefix,
                    companyId = detected.companyId,
                    companyName = companyName,
                    companyCode = companyCode,
                    expectedLength = detected.numberLength,
                    isValid = isLengthValid,
                    errorMessageAr = if (!isLengthValid) {
                        "طول الرقم غير مكتمل (${normalized.length} من أصل ${detected.numberLength} أرقام)"
                    } else null
                )
            }
        } catch (_: Exception) {
            // في حالة وجود قيود شبكة أو صلاحيات، الاعتماد على بيانات البادئات المعتمدة
        }

        // 2. استخدام التعيين المحلي المعتمد المطابق لقاعدة البيانات
        if (known != null) {
            val isLengthValid = normalized.length == known.length
            return@withContext PhoneDetectionResult(
                rawInput = rawPhone,
                normalizedNumber = normalized,
                prefix = prefixCandidate,
                companyId = known.id,
                companyName = known.nameAr,
                companyCode = known.code,
                expectedLength = known.length,
                isValid = isLengthValid,
                errorMessageAr = if (!isLengthValid) {
                    "طول الرقم غير مكتمل (${normalized.length} من أصل ${known.length} أرقام)"
                } else null
            )
        }

        // بادئة غير مدعومة
        PhoneDetectionResult(
            rawInput = rawPhone,
            normalizedNumber = normalized,
            prefix = prefixCandidate,
            companyId = "",
            companyName = "شركة غير مدعومة",
            companyCode = "UNKNOWN",
            isValid = false,
            errorMessageAr = "بادئة الرقم ($prefixCandidate) غير مدعومة في نظام AMAN"
        )
    }

    override suspend fun getSupportedCompanies(): List<Company> = withContext(Dispatchers.IO) {
        try {
            val list = SupabaseProvider.postgrest.from(AmanConstants.TABLE_COMPANIES)
                .select {
                    filter {
                        eq("is_active", true)
                        eq("is_deleted", false)
                    }
                }
                .decodeList<CompanyDto>()

            list.map { it.toDomain() }
        } catch (_: Exception) {
            // بيانات الشركات المعتمدة في النظام
            knownCompanies.values.distinctBy { it.id }.map {
                Company(
                    id = it.id,
                    nameAr = it.nameAr,
                    nameEn = it.nameEn,
                    code = it.code,
                    isActive = true
                )
            }
        }
    }
}
