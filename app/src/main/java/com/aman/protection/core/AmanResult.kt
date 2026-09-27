package com.aman.protection.core

/**
 * فئة إدارة النتائج وحالات العمليات
 */
sealed class AmanResult<out T> {
    data class Success<out T>(val data: T) : AmanResult<T>()
    data class Error(val error: AmanError) : AmanResult<Nothing>()
    object Loading : AmanResult<Nothing>()
    object Idle : AmanResult<Nothing>()

    val isSuccess: Boolean get() = this is Success
    val isError: Boolean get() = this is Error
    val isLoading: Boolean get() = this is Loading

    fun getOrNull(): T? = when (this) {
        is Success -> data
        else -> null
    }
}
