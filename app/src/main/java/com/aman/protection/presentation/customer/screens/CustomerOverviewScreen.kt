package com.aman.protection.presentation.customer.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aman.protection.domain.models.Protection
import com.aman.protection.domain.models.ProtectionStatus
import com.aman.protection.domain.models.User
import com.aman.protection.presentation.theme.Amber500
import com.aman.protection.presentation.theme.Emerald600
import com.aman.protection.presentation.theme.Navy900
import com.aman.protection.presentation.theme.Red600
import com.aman.protection.presentation.theme.Slate100
import com.aman.protection.presentation.theme.Slate50
import com.aman.protection.presentation.theme.Slate500
import com.aman.protection.presentation.theme.Slate600
import com.aman.protection.presentation.theme.Slate700
import com.aman.protection.presentation.theme.Slate900
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

/**
 * الشاشة الرئيسية للعميل (الرئيسية) وفق البند 1.5.1 وتوجيهات المرحلة 02
 * تعرض ملخص حالة الحماية والاشتراك دون أي تفاصيل تشغيلية داخلية
 */
@Composable
fun CustomerOverviewScreen(
    user: User,
    activeProtections: List<Protection>,
    totalNumbersCount: Int,
    pendingRequestsCount: Int,
    isLoading: Boolean,
    errorMessage: String? = null,
    onRetry: () -> Unit,
    onNavigateToNumbers: () -> Unit,
    onNavigateToProtections: () -> Unit,
    onNavigateToPlans: () -> Unit,
    onNavigateToNotifications: () -> Unit,
    onNavigateToAccount: () -> Unit
) {
    if (isLoading && activeProtections.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Slate50),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                CircularProgressIndicator(color = Navy900, strokeWidth = 3.dp)
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "جاري تحميل بيانات حسابك...",
                    color = Slate600,
                    fontSize = 13.sp
                )
            }
        }
        return
    }

    if (errorMessage != null && activeProtections.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Slate50)
                .padding(20.dp),
            contentAlignment = Alignment.Center
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        tint = Red600,
                        modifier = Modifier.size(44.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "تعذر تحميل بيانات الرئيسية",
                        color = Navy900,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = errorMessage,
                        color = Slate600,
                        fontSize = 12.sp,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(18.dp))
                    Button(
                        onClick = onRetry,
                        colors = ButtonDefaults.buttonColors(containerColor = Navy900),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("إعادة المحاولة", color = Color.White, fontSize = 13.sp)
                    }
                }
            }
        }
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // بطاقة الترحيب ببيانات العميل الحقيقية
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Navy900)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(18.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(Emerald600),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(26.dp)
                    )
                }

                Spacer(modifier = Modifier.width(14.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "أهلاً بك، ${user.displayName} 👋",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "نظام أمان لحماية ومتابعة أرقام الهواتف",
                        color = Color(0xFF94A3B8),
                        fontSize = 12.sp
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // إحصائيات سريعة للعميل
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MetricCard(
                title = "أرقامي",
                value = "$totalNumbersCount",
                icon = Icons.Default.Phone,
                color = Navy900,
                modifier = Modifier.weight(1f),
                onClick = onNavigateToNumbers
            )
            MetricCard(
                title = "الحمايات النشطة",
                value = "${activeProtections.size}",
                icon = Icons.Default.Security,
                color = Emerald600,
                modifier = Modifier.weight(1f),
                onClick = onNavigateToProtections
            )
            MetricCard(
                title = "طلبات بالانتظار",
                value = "$pendingRequestsCount",
                icon = Icons.Default.DateRange,
                color = if (pendingRequestsCount > 0) Amber500 else Slate500,
                modifier = Modifier.weight(1f),
                onClick = onNavigateToProtections
            )
        }

        Spacer(modifier = Modifier.height(18.dp))

        // حالة الحماية الحالية
        Text(
            text = "حالة الحماية الحالية",
            color = Navy900,
            fontWeight = FontWeight.Bold,
            fontSize = 15.sp
        )

        Spacer(modifier = Modifier.height(10.dp))

        val primaryProtection = activeProtections.firstOrNull()

        if (primaryProtection != null) {
            // عرض بطاقة الحماية النشطة الحقيقية
            ActiveProtectionCard(
                protection = primaryProtection,
                onViewAll = onNavigateToProtections
            )
        } else {
            // Empty State عندما لا توجد حماية نشطة
            EmptyProtectionCard(
                totalNumbers = totalNumbersCount,
                onAddNumber = onNavigateToNumbers,
                onRequestProtection = onNavigateToProtections
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // إجراءات سريعة
        Text(
            text = "إجراءات سريعة",
            color = Navy900,
            fontWeight = FontWeight.Bold,
            fontSize = 15.sp
        )

        Spacer(modifier = Modifier.height(10.dp))

        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            QuickActionItem(
                title = "قائمة أرقامي",
                subtitle = "استعراض هواتف الحساب وإضافة أرقام جديدة للمتابعة",
                icon = Icons.Default.Phone,
                iconColor = Navy900,
                onClick = onNavigateToNumbers
            )

            QuickActionItem(
                title = "طلبات وحمايات الحساب",
                subtitle = "متابعة الحمايات النشطة، المنتهية، والطلبات قيد المراجعة",
                icon = Icons.Default.Security,
                iconColor = Emerald600,
                onClick = onNavigateToProtections
            )

            QuickActionItem(
                title = "دليل باقات الحماية",
                subtitle = "الاطلاع على الباقات والأسعار والمدد المتوفرة",
                icon = Icons.Default.Star,
                iconColor = Amber500,
                onClick = onNavigateToPlans
            )

            QuickActionItem(
                title = "إشعارات النظام",
                subtitle = "تنبيهات حالة الحماية، مواعيد التجديد، والاعتمادات",
                icon = Icons.Default.Notifications,
                iconColor = Color(0xFF6366F1),
                onClick = onNavigateToNotifications
            )

            QuickActionItem(
                title = "إعدادات حسابي",
                subtitle = "تعديل الاسم والاطلاع على تفاصيل الملف الشخصي",
                icon = Icons.Default.Person,
                iconColor = Slate700,
                onClick = onNavigateToAccount
            )
        }
    }
}

/**
 * بطاقة الحماية النشطة الفعلية للعميل
 */
@Composable
private fun ActiveProtectionCard(
    protection: Protection,
    onViewAll: () -> Unit
) {
    val remainingDays = calculateRemainingDays(protection.endAt)
    val isExpired = remainingDays <= 0
    val isSoonExpiring = remainingDays in 1..7

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // شريط العنوان والحالة
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(
                                when {
                                    isExpired -> Red600
                                    isSoonExpiring -> Amber500
                                    else -> Emerald600
                                }
                            )
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = when {
                            isExpired -> "الحماية منتهية"
                            isSoonExpiring -> "الحماية قاربت على الانتهاء"
                            else -> "حماية نشطة وفعالة"
                        },
                        color = Navy900,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }

                // شارة الشركة المشغلة
                val companyName = protection.company?.nameAr ?: protection.company?.name ?: "اتصالات"
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(Slate100)
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = companyName,
                        color = Navy900,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 11.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // رقم الهاتف المحمي
            val phoneNumber = protection.customerNumber?.phoneNumber ?: "—"
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(Slate50)
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("الرقم المحمي", color = Slate500, fontSize = 11.sp)
                    Text(
                        text = phoneNumber,
                        color = Navy900,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                }

                // الباقة
                Column(horizontalAlignment = Alignment.End) {
                    Text("باقة الحماية", color = Slate500, fontSize = 11.sp)
                    Text(
                        text = protection.packageNameSnapshot,
                        color = Navy900,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 13.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // التواريخ والأيام المتبقية
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("تاريخ البداية", color = Slate500, fontSize = 11.sp)
                    Text(
                        text = formatIsoDate(protection.startAt),
                        color = Slate700,
                        fontWeight = FontWeight.Medium,
                        fontSize = 12.sp
                    )
                }

                Column {
                    Text("تاريخ الانتهاء", color = Slate500, fontSize = 11.sp)
                    Text(
                        text = formatIsoDate(protection.endAt),
                        color = Slate700,
                        fontWeight = FontWeight.Medium,
                        fontSize = 12.sp
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text("الأيام المتبقية", color = Slate500, fontSize = 11.sp)
                    Text(
                        text = if (isExpired) "منتهية" else "$remainingDays يوم",
                        color = when {
                            isExpired -> Red600
                            isSoonExpiring -> Amber500
                            else -> Emerald600
                        },
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                }
            }
        }
    }
}

/**
 * بطاقة الحالة الفارغة (عند عدم وجود حماية نشطة)
 */
@Composable
private fun EmptyProtectionCard(
    totalNumbers: Int,
    onAddNumber: () -> Unit,
    onRequestProtection: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(54.dp)
                    .clip(CircleShape)
                    .background(Slate100),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Security,
                    contentDescription = null,
                    tint = Slate500,
                    modifier = Modifier.size(28.dp)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "لا توجد حماية نشطة حالياً",
                color = Navy900,
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "احمِ أرقامك من السقوط أو الإلغاء باشتراك دوري منتظم ومتابعة مستمرة.",
                color = Slate600,
                fontSize = 12.sp,
                textAlign = TextAlign.Center,
                lineHeight = 18.sp
            )

            Spacer(modifier = Modifier.height(14.dp))

            if (totalNumbers == 0) {
                Button(
                    onClick = onAddNumber,
                    colors = ButtonDefaults.buttonColors(containerColor = Navy900),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Phone, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("إضافة رقم هاتف أولاً", color = Color.White, fontSize = 13.sp)
                }
            } else {
                Button(
                    onClick = onRequestProtection,
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Security, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("طلب حماية جديدة", color = Color.White, fontSize = 13.sp)
                }
            }
        }
    }
}

/**
 * عنصر إجراء سريع
 */
@Composable
private fun QuickActionItem(
    title: String,
    subtitle: String,
    icon: ImageVector,
    iconColor: Color,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(iconColor.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconColor,
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    color = Navy900,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
                Text(
                    text = subtitle,
                    color = Slate500,
                    fontSize = 11.sp,
                    maxLines = 1
                )
            }

            Icon(
                imageVector = Icons.Default.ArrowBack,
                contentDescription = null,
                tint = Slate500,
                modifier = Modifier.size(16.dp)
            )
        }
    }
}

/**
 * بطاقة إحصائية مصغرة
 */
@Composable
private fun MetricCard(
    title: String,
    value: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier.clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = value,
                color = Navy900,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )
            Text(
                text = title,
                color = Slate500,
                fontSize = 10.sp,
                textAlign = TextAlign.Center
            )
        }
    }
}

private fun calculateRemainingDays(endAt: String): Long {
    return try {
        val endInstant = Instant.parse(endAt)
        val now = Instant.now()
        val diffSeconds = endInstant.epochSecond - now.epochSecond
        if (diffSeconds <= 0) 0L else diffSeconds / 86400L
    } catch (_: Exception) {
        0L
    }
}

private fun formatIsoDate(isoString: String): String {
    return try {
        val instant = Instant.parse(isoString)
        val formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd").withZone(ZoneId.systemDefault())
        formatter.format(instant)
    } catch (_: Exception) {
        isoString.take(10)
    }
}
