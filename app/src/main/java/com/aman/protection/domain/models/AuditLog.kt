package com.aman.protection.domain.models

/**
 * كيان سجل التدقيق والرقابة (Audit Log Domain Model)
 * يربط بجدول public.audit_logs
 */
data class AuditLog(
    val id: String,
    val actorUserId: String? = null,
    val action: String,
    val entityType: String,
    val entityId: String? = null,
    val oldData: String? = null,
    val newData: String? = null,
    val metadata: String? = null,
    val createdAt: String
)
