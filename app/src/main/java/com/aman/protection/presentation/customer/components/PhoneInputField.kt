package com.aman.protection.presentation.customer.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aman.protection.data.service.PhoneDetectionResult
import com.aman.protection.presentation.theme.Emerald600
import com.aman.protection.presentation.theme.Navy900
import com.aman.protection.presentation.theme.Red600
import com.aman.protection.presentation.theme.Slate300
import com.aman.protection.presentation.theme.Slate50
import com.aman.protection.presentation.theme.Slate700
import com.aman.protection.presentation.theme.Slate900

@Composable
fun PhoneInputField(
    value: String,
    onValueChange: (String) -> Unit,
    detectionResult: PhoneDetectionResult?,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = "رقم الهاتف المحمول",
            color = Slate700,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium
        )

        Spacer(modifier = Modifier.height(6.dp))

        // Custom Phone Input Container with Country Code
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .background(Color.White, RoundedCornerShape(10.dp))
                .border(
                    width = 1.5.dp,
                    color = when {
                        detectionResult?.isValid == true -> Emerald600
                        detectionResult?.errorMessageAr != null && value.length >= 2 -> Red600
                        else -> Slate300
                    },
                    shape = RoundedCornerShape(10.dp)
                )
                .padding(horizontal = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Country Code Flag / Badge (Yemen +967)
            Box(
                modifier = Modifier
                    .background(Slate50, RoundedCornerShape(6.dp))
                    .padding(horizontal = 8.dp, vertical = 4.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "🇾🇪 +967",
                    color = Slate900,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.width(10.dp))

            // Phone digits input
            BasicTextField(
                value = value,
                onValueChange = { input ->
                    val digits = input.filter { it.isDigit() }
                    if (digits.length <= 9) {
                        onValueChange(digits)
                    }
                },
                modifier = Modifier.weight(1f),
                textStyle = TextStyle(
                    color = Slate900,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    textAlign = TextAlign.Start
                ),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                cursorBrush = SolidColor(Navy900),
                singleLine = true,
                decorationBox = { innerTextField ->
                    Box(contentAlignment = Alignment.CenterStart) {
                        if (value.isEmpty()) {
                            Text(
                                text = "77XXXXXXX",
                                color = Color(0xFF94A3B8),
                                fontSize = 16.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                        innerTextField()
                    }
                }
            )

            // Digit counter
            Text(
                text = "${value.length}/9",
                color = if (value.length == 9) Emerald600 else Color(0xFF94A3B8),
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Live Operator Detection Banner
        if (detectionResult != null && value.isNotEmpty()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        color = if (detectionResult.isValid) Color(0xFFECFDF5) else Color(0xFFFEF2F2),
                        shape = RoundedCornerShape(8.dp)
                    )
                    .padding(horizontal = 10.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                CompanyBadge(
                    companyCode = detectionResult.companyCode,
                    companyName = detectionResult.companyName
                )

                Spacer(modifier = Modifier.width(8.dp))

                Text(
                    text = if (detectionResult.isValid) {
                        "رقم صالح • ${detectionResult.companyName} (بادئة ${detectionResult.prefix})"
                    } else {
                        detectionResult.errorMessageAr ?: "يرجى إكمال الرقم"
                    },
                    color = if (detectionResult.isValid) Emerald600 else Red600,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}
