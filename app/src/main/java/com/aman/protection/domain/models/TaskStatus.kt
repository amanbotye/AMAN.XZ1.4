package com.aman.protection.domain.models

import java.time.Instant
import java.time.temporal.ChronoUnit

/**
 * حالات المهام التشغيلية وفق المرجع الأساسي AMAN.XZ.txt
 * UPCOMING → DUE_SOON → DUE → OVERDUE → COMPLETED / CANCELLED
 */
enum class TaskStatus(
    val rawValue: String,
    val labelAr: String,
    val labelEn: String
) {
    UPCOMING("scheduled", "قادمة / مجدولة", "Upcoming"),
    DUE_SOON("due_soon", "مستحقة قريباً", "Due Soon"),
    DUE("due", "مستحقة الآن", "Due Now"),
    OVERDUE("overdue", "متأخرة", "Overdue"),
    COMPLETED("completed", "مكتملة", "Completed"),
    CANCELLED("cancelled", "ملغاة", "Cancelled");

    companion object {
        fun resolve(
            rawStatus: String,
            scheduledAtStr: String?,
            dueAtStr: String?
        ): TaskStatus {
            if (rawStatus.equals("completed", ignoreCase = true)) return COMPLETED
            if (rawStatus.equals("cancelled", ignoreCase = true)) return CANCELLED

            val now = Instant.now()
            val dueAt = try {
                if (!dueAtStr.isNullOrBlank()) Instant.parse(dueAtStr) else null
            } catch (e: Exception) {
                null
            }

            if (dueAt != null) {
                if (now.isAfter(dueAt)) {
                    return OVERDUE
                }
                val hoursRemaining = ChronoUnit.HOURS.between(now, dueAt)
                if (hoursRemaining in 0..24) {
                    return DUE
                }
                if (hoursRemaining in 25..72) {
                    return DUE_SOON
                }
            }

            return UPCOMING
        }
    }
}
