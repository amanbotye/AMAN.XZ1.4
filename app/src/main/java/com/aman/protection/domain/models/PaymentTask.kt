package com.aman.protection.domain.models

/**
 * كيان المهمة التشغيلية والمالية (Payment/Protection Task Domain Model)
 * يمثل المهام المرتبطة بالحمايات النشطة وفق جدول public.protection_tasks
 */
data class PaymentTask(
    val id: String,
    val protectionId: String,
    val customerId: String,
    val customerNumberId: String,
    val companyId: String,
    val taskNumber: Int,
    val taskType: String,
    val amount: Double,
    val currency: String,
    val scheduledAt: String,
    val dueAt: String,
    val rawStatus: String,
    val status: TaskStatus,
    val completedAt: String? = null,
    val completedBy: String? = null,
    val executionNote: String? = null,
    val sourceTaskIntervalDays: Int,
    val createdAt: String,
    val updatedAt: String,
    // بيانات إضافية للعرض
    val phoneNumber: String? = null,
    val companyName: String? = null
) {
    val isExecutable: Boolean get() = status != TaskStatus.COMPLETED && status != TaskStatus.CANCELLED
    val formattedAmount: String get() = "${amount.toInt()} $currency"
}
