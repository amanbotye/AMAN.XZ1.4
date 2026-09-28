package com.aman.protection.presentation.protection.screens

import androidx.compose.foundation.background
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
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Autorenew
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.HourglassEmpty
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aman.protection.domain.models.Protection
import com.aman.protection.domain.models.ProtectionRequest
import com.aman.protection.domain.models.RenewalHealth
import com.aman.protection.domain.models.RequestStatus
import com.aman.protection.presentation.protection.CustomerProtectionTab
import com.aman.protection.presentation.protection.CustomerProtectionViewModel
import com.aman.protection.presentation.theme.Amber500
import com.aman.protection.presentation.theme.Emerald600
import com.aman.protection.presentation.theme.Navy900
import com.aman.protection.presentation.theme.Red600
import com.aman.protection.presentation.theme.Slate50
import com.aman.protection.presentation.theme.Slate700
import com.aman.protection.presentation.theme.Slate900

/**
 * شاشة متابعة الطلبات والحمايات CUS-03 & CUS-04
 * مع دعم شاشة التجديد CUS-05
 */
@Composable
fun MyRequestsAndProtectionsScreen(
    viewModel: CustomerProtectionViewModel,
    onBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedTab by remember { mutableIntStateOf(0) } // 0: Requests, 1: Protections

    // إذا كان المستخدم في وضع إنشاء طلب
    if (uiState.currentTab == CustomerProtectionTab.CREATE_REQUEST) {
        CreateProtectionRequestScreen(viewModel = viewModel)
        return
    }

    // إذا كان المستخدم في وضع طلب التجديد (CUS-05)
    if (uiState.currentTab == CustomerProtectionTab.RENEWAL && uiState.selectedProtectionForRenewal != null) {
        CustomerRenewalScreen(
            protection = uiState.selectedProtectionForRenewal!!,
            viewModel = viewModel
        )
        return
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "رجوع",
                        tint = Navy900
                    )
                }
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "متابعة الحمايات والطلبات (1.5.3 & 1.5.4)",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = Navy900
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Tab Selector
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color.White,
                contentColor = Navy900
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("طلبات الحماية (${uiState.requests.size})", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("حماياتي النشطة (${uiState.protections.size})", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Content List
            if (uiState.isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Emerald600)
                }
            } else if (selectedTab == 0) {
                // Requests List
                if (uiState.requests.isEmpty()) {
                    EmptyStateCard(title = "لا توجد طلبات حماية حالياً", desc = "يمكنك تقديم طلب حماية جديد من شاشة أرقامي.")
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(uiState.requests, key = { it.id }) { req ->
                            RequestItemCard(request = req)
                        }
                    }
                }
            } else {
                // Protections List
                if (uiState.protections.isEmpty()) {
                    EmptyStateCard(title = "لا توجد حمايات نشطة حالياً", desc = "بمجرد قبول ومراجعة طلب الحماية من الإدارة، ستبدأ فترة الحماية تلقائياً.")
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(uiState.protections, key = { it.id }) { prot ->
                            ProtectionItemCard(
                                protection = prot,
                                onRenewalClick = { viewModel.startRenewalForProtection(prot) }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun RequestItemCard(request: ProtectionRequest) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
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
                Text(
                    text = request.customerNumber?.formattedDisplayNumber ?: "رقم الهاتف",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    fontFamily = FontFamily.Monospace,
                    color = Slate900,
                    modifier = Modifier.weight(1f)
                )

                // Status Badge
                val (statusText, statusBg, statusColor) = when (request.status) {
                    RequestStatus.PENDING -> Triple("قيد المراجعة PENDING", Color(0xFFFEF3C7), Color(0xFFB45309))
                    RequestStatus.APPROVED -> Triple("معتمد APPROVED", Color(0xFFECFDF5), Emerald600)
                    RequestStatus.REJECTED -> Triple("مرفوض REJECTED", Color(0xFFFEE2E2), Red600)
                    RequestStatus.CANCELLED -> Triple("ملغي", Color(0xFFF1F5F9), Slate700)
                }

                Box(
                    modifier = Modifier
                        .background(statusBg, RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = statusText,
                        color = statusColor,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "الباقة: ${request.packagePlan?.nameAr ?: "باقة حماية"} (${request.requestedPrice.toInt()} ${request.requestedCurrency})",
                fontSize = 12.sp,
                color = Slate700
            )

            Text(
                text = "مرجع الحوالة: ${request.paymentTransferReference ?: "-"}",
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                color = Slate900
            )

            if (!request.rejectionReason.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFFEF2F2), RoundedCornerShape(6.dp))
                        .padding(8.dp)
                ) {
                    Text(
                        text = "سبب الرفض: ${request.rejectionReason}",
                        color = Red600,
                        fontSize = 11.sp
                    )
                }
            }
        }
    }
}

@Composable
private fun ProtectionItemCard(
    protection: Protection,
    onRenewalClick: () -> Unit
) {
    val (health, daysRemaining) = RenewalHealth.calculate(protection.endAt)
    val (badgeBg, badgeText) = when (health) {
        RenewalHealth.SAFE -> Pair(Color(0xFFDCFCE7), Color(0xFF15803D))
        RenewalHealth.SOON -> Pair(Color(0xFFFEF3C7), Color(0xFFD97706))
        RenewalHealth.DANGER -> Pair(Color(0xFFFEE2E2), Color(0xFFDC2626))
        RenewalHealth.EXPIRED -> Pair(Color(0xFFF1F5F9), Color(0xFF334155))
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
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
                    tint = Emerald600,
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

            Text(
                text = "الباقة المثبتة: ${protection.packageNameSnapshot} (${protection.durationDaysSnapshot} يوماً)",
                fontSize = 12.sp,
                color = Slate700
            )

            Text(
                text = "تاريخ البداية: ${protection.startAt.take(10)} | تاريخ الانتهاء: ${protection.endAt.take(10)}",
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                color = Slate900
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = health.description,
                fontSize = 11.sp,
                color = badgeText
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Renewal action button
            OutlinedButton(
                onClick = onRenewalClick,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(36.dp),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Emerald600)
            ) {
                Icon(imageVector = Icons.Default.Autorenew, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("طلب تجديد الحماية (1.5.5)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun EmptyStateCard(title: String, desc: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Default.HourglassEmpty,
                contentDescription = null,
                tint = Color(0xFF94A3B8),
                modifier = Modifier.size(36.dp)
            )
            Spacer(modifier = Modifier.height(10.dp))
            Text(title, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Slate900)
            Spacer(modifier = Modifier.height(4.dp))
            Text(desc, fontSize = 11.sp, color = Slate700, lineHeight = 16.sp)
        }
    }
}
