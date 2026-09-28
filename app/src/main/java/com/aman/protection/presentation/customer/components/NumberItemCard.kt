package com.aman.protection.presentation.customer.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.EditNote
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aman.protection.domain.models.CustomerNumber
import com.aman.protection.presentation.theme.Emerald600
import com.aman.protection.presentation.theme.Navy900
import com.aman.protection.presentation.theme.Red500
import com.aman.protection.presentation.theme.Slate100
import com.aman.protection.presentation.theme.Slate500
import com.aman.protection.presentation.theme.Slate600
import com.aman.protection.presentation.theme.Slate700
import com.aman.protection.presentation.theme.Slate900

/**
 * بطاقة عرض رقم العميل مع شارة المشغل وحالة الحماية الفعلية
 * مطابقة للبند 1.5.2 وتوجيهات المرحلة 03
 */
@Composable
fun NumberItemCard(
    number: CustomerNumber,
    onClick: () -> Unit,
    onEditNotes: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.5.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // أيقونة المشغل
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .background(
                        if (number.hasActiveProtection) Emerald600.copy(alpha = 0.12f) else Slate100,
                        CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (number.hasActiveProtection) Icons.Default.Shield else Icons.Default.PhoneAndroid,
                    contentDescription = null,
                    tint = if (number.hasActiveProtection) Emerald600 else Navy900,
                    modifier = Modifier.size(22.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            // البيانات الأساسية للرقم
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = number.formattedDisplayNumber,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    fontFamily = FontFamily.Monospace,
                    color = Slate900
                )

                Spacer(modifier = Modifier.height(4.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    CompanyBadge(
                        companyCode = number.company?.code ?: "OP",
                        companyName = number.company?.nameAr ?: "بادئة ${number.detectedPrefix}"
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    // شارة حالة الحماية الفعلية (محمي مقابل غير محمي)
                    if (number.hasActiveProtection) {
                        Box(
                            modifier = Modifier
                                .background(Color(0xFFDCFCE7), RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "محمي 🛡️",
                                color = Color(0xFF15803D),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    } else {
                        Box(
                            modifier = Modifier
                                .background(Color(0xFFF1F5F9), RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "غير محمي",
                                color = Slate600,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }

                if (!number.notes.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "ملاحظة: ${number.notes}",
                        fontSize = 11.sp,
                        color = Slate500,
                        maxLines = 1
                    )
                }
            }

            // أزرار الإجراءات
            Row {
                IconButton(onClick = onEditNotes) {
                    Icon(
                        imageVector = Icons.Default.EditNote,
                        contentDescription = "تعديل الملاحظة",
                        tint = Slate700,
                        modifier = Modifier.size(20.dp)
                    )
                }
                // الحذف متاح فقط للأرقام غير المحمية بحماية نشطة
                if (!number.hasActiveProtection) {
                    IconButton(onClick = onDelete) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "حذف الرقم",
                            tint = Red500,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}
