package com.aistudio.venusbeachhouse.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = AmberPrimary,
    onPrimary = Color.White,
    primaryContainer = AmberContainer,
    onPrimaryContainer = OnAmberContainer,
    secondary = OceanBlue,
    onSecondary = Color.White,
    secondaryContainer = OceanLight,
    onSecondaryContainer = OceanDark,
    background = StoneBackground,
    onBackground = StoneText,
    surface = StoneSurface,
    onSurface = StoneText,
    surfaceVariant = StoneSurfaceVariant,
    onSurfaceVariant = StoneSubtext,
    outline = StoneBorder
)

@Composable
fun VenusBeachHouseTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography,
        content = content
    )
}
