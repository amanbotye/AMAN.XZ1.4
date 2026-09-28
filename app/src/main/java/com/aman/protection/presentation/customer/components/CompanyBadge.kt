package com.aman.protection.presentation.customer.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun CompanyBadge(
    companyCode: String?,
    companyName: String?,
    modifier: Modifier = Modifier
) {
    val (bgColor, textColor) = when (companyCode?.uppercase()) {
        "YM", "YEMEN_MOBILE" -> Color(0xFFFEE2E2) to Color(0xFFDC2626) // Yemen Mobile Red
        "YOU", "MTN" -> Color(0xFFFEF3C7) to Color(0xFFB45309) // YOU Yellow/Amber
        "SABAFON" -> Color(0xFFDBEAFE) to Color(0xFF1D4ED8) // Sabafon Blue
        "Y", "Y_TELECOM" -> Color(0xFFD1FAE5) to Color(0xFF047857) // Y Telecom Emerald
        else -> Color(0xFFF1F5F9) to Color(0xFF475569)
    }

    val display = companyName ?: companyCode ?: "شركة اتصالات"

    Box(
        modifier = modifier
            .background(bgColor, RoundedCornerShape(6.dp))
            .padding(horizontal = 8.dp, vertical = 3.dp)
    ) {
        Text(
            text = display,
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
