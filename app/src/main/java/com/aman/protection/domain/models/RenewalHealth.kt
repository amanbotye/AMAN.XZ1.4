package com.aman.protection.domain.models

import java.time.Instant
import java.time.temporal.ChronoUnit

/**
 * حساب حالة التجديد وصحة الحماية للعميل وفق المدد المحددة في المرجع AMAN.XZ.txt:
 * 🟢 آمن (Safe) -> أكثر من 14 يوماً
 * 🟡 قريب (Soon) -> بين 7 إلى 14 يوماً
 * 🔴 خطر (Danger) -> أقل من 7 أيام
 * ⚫ منتهي (Expired) -> 0 أو أقل
 */
enum class RenewalHealth(
    val code: String,
    val labelAr: String,
    val symbol: String,
    val description: String
) {
    SAFE("safe", "آمن", "🟢", "الرقم محمي وفترة الصلاحية كافية"),
    SOON("soon", "قريب", "🟡", "اقترب موعد التجديد، يفضل التمديد قريباً"),
    DANGER("danger", "خطر", "🔴", "الحماية على وشك الانتهاء، يرجى التجديد فوراً"),
    EXPIRED("expired", "منتهي", "⚫", "انتهت فترة الحماية وتوقف التمديد الآلي");

    companion object {
        fun calculate(endAtStr: String?): Pair<RenewalHealth, Long> {
            if (endAtStr.isNullOrBlank()) return Pair(EXPIRED, 0L)
            return try {
                val now = Instant.now()
                val endAt = Instant.parse(endAtStr)
                val daysRemaining = ChronoUnit.DAYS.between(now, endAt)

                val health = when {
                    daysRemaining <= 0L -> EXPIRED
                    daysRemaining < 7L -> DANGER
                    daysRemaining <= 14L -> SOON
                    else -> SAFE
                }
                Pair(health, daysRemaining.coerceAtLeast(0L))
            } catch (e: Exception) {
                Pair(EXPIRED, 0L)
            }
        }
    }
}
