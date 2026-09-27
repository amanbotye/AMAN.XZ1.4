package com.aman.protection.presentation.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection

private val LightColorScheme = lightColorScheme(
    primary = Navy900,
    onPrimary = Color.White,
    primaryContainer = Navy50,
    onPrimaryContainer = Navy900,
    secondary = Emerald600,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFD1FAE5),
    onSecondaryContainer = Emerald700,
    tertiary = Amber500,
    onTertiary = Color.White,
    background = Slate50,
    onBackground = Slate900,
    surface = Color.White,
    onSurface = Slate900,
    surfaceVariant = Slate100,
    onSurfaceVariant = Slate700,
    outline = Slate300,
    error = Red600,
    onError = Color.White
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF90CAF9),
    onPrimary = Navy900,
    primaryContainer = Navy800,
    onPrimaryContainer = Color.White,
    secondary = Emerald500,
    onSecondary = Navy900,
    secondaryContainer = Emerald700,
    onSecondaryContainer = Color.White,
    tertiary = Amber500,
    onTertiary = Navy900,
    background = Color(0xFF0B132B),
    onBackground = Color.White,
    surface = Color(0xFF1C2541),
    onSurface = Color.White,
    surfaceVariant = Color(0xFF263255),
    onSurfaceVariant = Color(0xFFE2E8F0),
    outline = Color(0xFF475569),
    error = Red500,
    onError = Color.White
)

@Composable
fun AmanTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    // تثبيت دعم اللغة العربية واتجاه اليمين إلى اليسار (RTL First) وفق AMAN.XZ.txt
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = AmanTypography,
            content = content
        )
    }
}
