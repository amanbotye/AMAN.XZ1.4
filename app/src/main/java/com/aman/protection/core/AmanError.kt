package com.aman.protection.core

/**
 * فئات الأخطاء وإدارتها وترجمتها للعربية وفق المرحلة 7 من AMAN.XZ.txt
 */
sealed class AmanError(
    val messageAr: String,
    val technicalMessage: String? = null,
    val code: String? = null
) {
    class NetworkError(technicalMessage: String? = null) : AmanError(
        messageAr = "تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت",
        technicalMessage = technicalMessage,
        code = "NETWORK_ERROR"
    )

    class InvalidCredentials(
        messageAr: String = "بيانات غير صحيحة. يرجى التحقق من البريد الإلكتروني أو اسم المستخدم وكلمة المرور",
        technicalMessage: String? = null
    ) : AmanError(
        messageAr = messageAr,
        technicalMessage = technicalMessage,
        code = "INVALID_CREDENTIALS"
    )

    class AccountSuspended(
        messageAr: String = "الحساب غير مسموح له بالدخول أو تم إيقافه"
    ) : AmanError(
        messageAr = messageAr,
        code = "ACCOUNT_SUSPENDED"
    )

    class UserNotFound : AmanError(
        messageAr = "لم يتم العثور على بيانات المستخدم في النظام",
        code = "USER_NOT_FOUND"
    )

    class UserAlreadyExists(technicalMessage: String? = null) : AmanError(
        messageAr = "البريد الإلكتروني مسجل مسبقًا في النظام",
        technicalMessage = technicalMessage,
        code = "USER_ALREADY_EXISTS"
    )

    class ValidationError(messageAr: String) : AmanError(
        messageAr = messageAr,
        code = "VALIDATION_ERROR"
    )

    class SessionExpired : AmanError(
        messageAr = "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا",
        code = "SESSION_EXPIRED"
    )

    class DatabaseError(message: String?, code: String? = null) : AmanError(
        messageAr = "حدث خطأ أثناء معالجة البيانات في قاعدة البيانات",
        technicalMessage = message,
        code = code ?: "DATABASE_ERROR"
    )

    class UnknownError(message: String?) : AmanError(
        messageAr = "حدث خطأ غير متوقع، يرجى المحاولة لاحقًا",
        technicalMessage = message,
        code = "UNKNOWN_ERROR"
    )

    // Alias for Network
    typealias Network = NetworkError

    companion object {
        fun fromThrowable(throwable: Throwable): AmanError {
            val msg = throwable.message?.lowercase() ?: ""
            return when {
                msg.contains("network") || msg.contains("connect") || msg.contains("timeout") || msg.contains("unreachable") ->
                    NetworkError(throwable.message)
                msg.contains("already registered") || msg.contains("already exists") || msg.contains("user_already_exists") ->
                    UserAlreadyExists(throwable.message)
                msg.contains("invalid login") || msg.contains("invalid_credentials") || msg.contains("grant_error") ->
                    InvalidCredentials(throwable.message)
                msg.contains("session") || msg.contains("jwt") || msg.contains("expired") ->
                    SessionExpired()
                else ->
                    UnknownError(throwable.message)
            }
        }

        fun fromCode(code: String, message: String? = null): AmanError {
            return when (code) {
                "NETWORK_ERROR" -> NetworkError(message)
                "INVALID_CREDENTIALS" -> InvalidCredentials(message)
                "ACCOUNT_SUSPENDED" -> AccountSuspended()
                "USER_NOT_FOUND" -> UserNotFound()
                "USER_ALREADY_EXISTS" -> UserAlreadyExists(message)
                "SESSION_EXPIRED" -> SessionExpired()
                "VALIDATION_ERROR" -> ValidationError(message ?: "بيانات غير صالحة")
                else -> DatabaseError(message, code)
            }
        }
    }
}
