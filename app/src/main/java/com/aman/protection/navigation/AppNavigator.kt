package com.aman.protection.navigation

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow

/**
 * موجه التنقل المركزي للتطبيق
 */
class AppNavigator {
    private val _navigationEvents = MutableSharedFlow<AmanDestination>(extraBufferCapacity = 1)
    val navigationEvents: SharedFlow<AmanDestination> = _navigationEvents.asSharedFlow()

    fun navigateTo(destination: AmanDestination) {
        _navigationEvents.tryEmit(destination)
    }
}
