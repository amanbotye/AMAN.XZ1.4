package com.aman.protection.domain.models

/**
 * كيان إعدادات النظام العامة (System Setting Domain Model)
 * يربط بجدول public.system_settings
 */
data class SystemSetting(
    val id: String,
    val key: String,
    val value: String,
    val description: String? = null,
    val isActive: Boolean = true,
    val createdAt: String
)
