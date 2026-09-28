package com.aman.protection.data.models

import com.aman.protection.domain.models.SystemSetting
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

/**
 * كائن نقل البيانات لجدول public.system_settings
 */
@Serializable
data class SystemSettingDto(
    @SerialName("id")
    val id: String,

    @SerialName("setting_key")
    val settingKey: String,

    @SerialName("setting_value")
    val settingValue: JsonElement? = null,

    @SerialName("description")
    val description: String? = null,

    @SerialName("is_active")
    val isActive: Boolean = true,

    @SerialName("created_at")
    val createdAt: String
)

fun SystemSettingDto.toDomain(): SystemSetting {
    return SystemSetting(
        id = id,
        key = settingKey,
        value = settingValue?.toString() ?: "",
        description = description,
        isActive = isActive,
        createdAt = createdAt
    )
}
