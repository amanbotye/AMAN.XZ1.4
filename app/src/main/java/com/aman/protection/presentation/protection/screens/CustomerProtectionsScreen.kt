package com.aman.protection.presentation.protection.screens

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Autorenew
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.HourglassEmpty
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.aman.protection.domain.models.Protection
import com.aman.protection.domain.models.ProtectionStatus
import com.aman.protection.domain.models.RenewalHealth
import com.aman.protection.presentation.customer.components.CompanyBadge
import com.aman.protection.presentation.protection.CustomerProtectionViewModel
import com.aman.protection.presentation.theme.Amber500
import com.aman.protection.presentation.theme.Emerald600
import com.aman.protection.presentation.theme.Navy900
import com.aman.protection.presentation.theme.Red600
import com.aman.protection.presentation.theme.Slate100
import com.aman.protection.presentation.theme.Slate50
import com.aman.protection.presentation.theme.Slate600
import com.aman.protection.presentation.theme.Slate700
import com.aman.protection.presentation.theme.Slate900

/**
 * شاشة حماياتي وفق مصفوفة الشاشات CUS-04 (البند 1.5.4)
 * تتضمن: قوائم الحمايات (نشطة، تحتاج تجديد، منتهية)، تفاصيل الحماية الشاملة، وزر التجديد عند تحقق شروطه
 */
@Composable
fun CustomerProtectionsScreen(
    viewModel: CustomerProtectionViewModel,
    onStartRenewal: (Protection) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedFilterIndex by remember { mutableIntStateOf(0) } // 0: الكل, 1: نشطة, 2: تحتاج تجديد, 3: منتهية
    var selectedProtectionDetails by remember { mutableStateOf<Protection?>(null) }

    val filteredProtections = when (selectedFilterIndex) {
        1 -> uiState.protections.filter {
            val (health, _) = RenewalHealth.calculate(it.endAt)
            it.status == ProtectionStatus.ACTIVE && health == RenewalHealth.SAFE
        }
        2 -> uiState.protections.filter {
            val (health, _) = RenewalHealth.calculate(it.endAt)
            health == RenewalHealth.SOON || health == RenewalHealth.DANGER
        }
        3 -> uiState.protections.filter {
            val (health, _) = RenewalHealth.calculate(it.endAt)
            health == RenewalHealth.EXPIRED || it.status == ProtectionStatus.EXPIRED
        }
        else -> uiState.protections
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
            .padding(16.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Header Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "حماياتي (CUS-04)",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = Navy900
                    )
                    Text(
                        text = "اشتراكات الحماية المفعلة وفترات الصلاحية والتجديد",
                        fontSize = 11.sp,
                        color = Slate600
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Sub-filter tabs: الكل, نشطة, تحتاج تجديد, منتهية
            ScrollableTabRow(
                selectedTabIndex = selectedFilterIndex,
                containerColor = Color.White,
                contentColor = Navy900,
                edgePadding = 0.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Tab(
                    selected = selectedFilterIndex == 0,
                    onClick = { selectedFilterIndex = 0 },
                    text = { Text("الكل (${uiState.protections.size})", fontSize = 12.sp, fontWeight = FontWeight.Bold) }
                )
                Tab(
                    selected = selectedFilterIndex == 1,
                    onClick = { selectedFilterIndex = 1 },
                    text = {
                        val count = uiState.protections.count {
                            val (health, _) = RenewalHealth.calculate(it.endAt)
                            it.status == ProtectionStatus.ACTIVE && health == RenewalHealth.SAFE
                        }
                        Text("نشطة ($count)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                )
                Tab(
                    selected = selectedFilterIndex == 2,
                    onClick = { selectedFilterIndex = 2 },
                    text = {
                        val count = uiState.protections.count {
                            val (health, _) = RenewalHealth.calculate(it.endAt)
                            health == RenewalHealth.SOON || health == RenewalHealth.DANGER
                        }
                        Text("تحتاج تجديد ($count)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                )
                Tab(
                    selected = selectedFilterIndex == 3,
                    onClick = { selectedFilterIndex = 3 },
                    text = {
                        val count = uiState.protections.count {
                            val (health, _) = RenewalHealth.calculate(it.endAt)
                            health == RenewalHealth.EXPIRED || it.status == ProtectionStatus.EXPIRED
                        }
                        Text("منتهية ($count)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Content
            when {
                uiState.isLoading && uiState.protections.isEmpty() -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Emerald600)
                    }
                }
                filteredProtections.isEmpty() -> {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Shield,
                                contentDescription = null,
                                tint = Color(0xFF94A3B8),
                                modifier = Modifier.size(40.dp)
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = "لا توجد حمايات في هذا التصنيف",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = Slate900
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "يتم تفعيل الحماية فور اعتماد طلب الحماية ومطابقة التحويل من قبل الإدارة.",
                                fontSize = 11.sp,
                                color = Slate600,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
                else -> {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(filteredProtections, key = { it.id }) { prot ->
                            CustomerProtectionCard(
                                protection = prot,
                                onClick = { selectedProtectionDetails = prot },
                                onRenewalClick = { onStartRenewal(prot) }
                            )
                        }
                    }
                }
            }
        }

        // تفاصيل الحماية (نافذة حوارية CUS-04)
        if (selectedProtectionDetails != null) {
            ProtectionDetailsDialog(
                protection = selectedProtectionDetails!!,
                onDismiss = { selectedProtectionDetails = null },
                onRenewalClick = {
                    val p = selectedProtectionDetails!!
                    selectedProtectionDetails = null
                    onStartRenewal(p)
                }
            )
        }
    }
}

/**
 * بطاقة عرض الحماية
 */
@Composable
private fun CustomerProtectionCard(
    protection: Protection,
    onClick: () -> Unit,
    onRenewalClick: () -> Unit
) {
    val (health, daysRemaining) = RenewalHealth.calculate(protection.endAt)
    val (badgeBg, badgeText) = when (health) {
        RenewalHealth.SAFE -> Pair(Color(0xFFDCFCE7), Color(0xFF15803D))
        RenewalHealth.SOON -> Pair(Color(0xFFFEF3C7), Color(0xFFD97706))
        RenewalHealth.DANGER -> Pair(Color(0xFFFEE2E2), Color(0xFFDC2626))
        RenewalHealth.EXPIRED -> Pair(Color(0xFFF1F5F9), Color(0xFF334155))
    }

    // شرط ظهور زر التجديد وفق البند 229 في المصفوفة: عند تحقق شروط ظهوره (SOON, DANGER, أو EXPIRED)
    val canShowRenewal = health == RenewalHealth.SOON || health == RenewalHealth.DANGER || health == RenewalHealth.EXPIRED

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.5.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Shield,
                    contentDescription = null,
                    tint = if (health == RenewalHealth.SAFE) Emerald600 else Amber500,
                    modifier = Modifier.size(22.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = protection.customerNumber?.formattedDisplayNumber ?: "رقم الهاتف",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    fontFamily = FontFamily.Monospace,
                    color = Slate900,
                    modifier = Modifier.weight(1f)
                )

                Box(
                    modifier = Modifier
                        .background(badgeBg, RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "${health.symbol} ${health.labelAr} (${daysRemaining} يوم)",
                        color = badgeText,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                CompanyBadge(
                    companyCode = protection.customerNumber?.company?.code ?: "OP",
                    companyName = protection.customerNumber?.company?.nameAr ?: "شركة الاتصالات"
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "الباقة المثبتة: ${protection.packageNameSnapshot} (${protection.durationDaysSnapshot} يوم)",
                    fontSize = 12.sp,
                    color = Slate700
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "الفترة: ${protection.startAt.take(10)} إلى ${protection.endAt.take(10)}",
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                color = Slate900
            )

            // إظهار زر التجديد فقط عند تحقق شروط ظهوره وفق المصفوفة
            if (canShowRenewal) {
                Spacer(modifier = Modifier.height(10.dp))
                Button(
                    onClick = onRenewalClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(38.dp),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald600)
                ) {
                    Icon(
                        imageVector = Icons.Default.Autorenew,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "طلب تجديد الحماية الآن (CUS-05)",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

/**
 * نافذة تفاصيل الحماية وفق المصفوفة CUS-04 (البند 1.5.4 تفاصيل الحماية)
 */
@Composable
private fun ProtectionDetailsDialog(
    protection: Protection,
    onDismiss: () -> Unit,
    onRenewalClick: () -> Unit
) {
    val (health, daysRemaining) = RenewalHealth.calculate(protection.endAt)
    val canShowRenewal = health == RenewalHealth.SOON || health == RenewalHealth.DANGER || health == RenewalHealth.EXPIRED

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "تفاصيل الحماية (CUS-04)",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = Navy900,
                        modifier = Modifier.weight(1f)
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "إغلاق", tint = Slate700)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Slate50, RoundedCornerShape(8.dp))
                        .padding(12.dp)
                ) {
                    Column {
                        Text(
                            text = protection.customerNumber?.formattedDisplayNumber ?: "رقم الهاتف",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            fontFamily = FontFamily.Monospace,
                            color = Slate900
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "المعرف المرجعي للحماية: ${protection.id.take(8)}...",
                            fontSize = 11.sp,
                            color = Slate500
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                DetailItem(label = "الشركة", value = protection.customerNumber?.company?.nameAr ?: "-")
                DetailItem(label = "الباقة المثبتة", value = protection.packageNameSnapshot)
                DetailItem(label = "قيمة الحماية", value = "${protection.priceSnapshot.toInt()} ${protection.currencySnapshot}")
                DetailItem(label = "مدة الحماية", value = "${protection.durationDaysSnapshot} يوماً")
                DetailItem(label = "تاريخ البداية", value = protection.startAt.take(10))
                DetailItem(label = "تاريخ النهاية", value = protection.endAt.take(10))
                DetailItem(label = "الأيام المتبقية", value = "$daysRemaining يوماً (${health.labelAr})")
                DetailItem(label = "مرات التجديد", value = "${protection.renewalCount} مرات")
                DetailItem(label = "حالة الحماية", value = protection.status.name)

                if (canShowRenewal) {
                    Spacer(modifier = Modifier.height(14.dp))
                    Button(
                        onClick = onRenewalClick,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Emerald600)
                    ) {
                        Icon(Icons.Default.Autorenew, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("طلب تجديد الحماية", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Button(
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Navy900)
                ) {
                    Text("إغلاق", fontSize = 13.sp)
                }
            }
        }
    }
}

@Composable
private fun DetailItem(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = "$label:", fontSize = 12.sp, color = Slate600, modifier = Modifier.width(115.dp))
        Text(text = value, fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Slate900)
    }
}
