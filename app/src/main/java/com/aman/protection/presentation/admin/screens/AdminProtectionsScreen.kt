package com.aman.protection.presentation.admin.screens

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
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
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
import com.aman.protection.domain.models.RenewalHealth
import com.aman.protection.presentation.admin.AdminManagementViewModel
import com.aman.protection.presentation.theme.Amber500
import com.aman.protection.presentation.theme.Emerald600
import com.aman.protection.presentation.theme.Navy900
import com.aman.protection.presentation.theme.Slate700
import com.aman.protection.presentation.theme.Slate900

/**
 * شاشة إدارة الحمايات ADM-05 (Admin Protections Screen)
 * وفق بنود المرجع 1.6.6 ومصفوفة الشاشات AMAN_XZ1_Screen_Matrix_COMPREHENSIVE.xlsx
 */
@Composable
fun AdminProtectionsScreen(
    viewModel: AdminManagementViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    var searchQuery by remember { mutableStateOf("") }

    val filteredProtections = remember(uiState.protections, searchQuery) {
        if (searchQuery.isBlank()) {
            uiState.protections
        } else {
            val q = searchQuery.trim()
            uiState.protections.filter {
                it.packageNameSnapshot.contains(q) ||
                (it.customerNumber?.phoneNumber?.contains(q) == true) ||
                it.customerId.contains(q)
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "سجل الحمايات الشامل (1.6.6)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = Navy900
                )
                Text(
                    text = "إجمالي الحمايات: ${uiState.protections.size}",
                    fontSize = 11.sp,
                    color = Slate700
                )
            }
            IconButton(onClick = viewModel::loadAllManagementData) {
                Icon(imageVector = Icons.Default.Refresh, contentDescription = "تحديث", tint = Navy900)
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("بحث بالباقة أو رقم الهاتف أو معرف العميل...", fontSize = 12.sp) },
            leadingIcon = { Icon(imageVector = Icons.Default.Search, contentDescription = null, tint = Slate700) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            shape = RoundedCornerShape(10.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        if (uiState.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Emerald600)
            }
        } else if (filteredProtections.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("لا توجد حمايات مسجلة", color = Slate700, fontSize = 13.sp)
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredProtections, key = { it.id }) { prot ->
                    AdminProtectionCard(protection = prot)
                }
            }
        }
    }
}

@Composable
private fun AdminProtectionCard(protection: Protection) {
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
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Shield,
                    contentDescription = null,
                    tint = Emerald600,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = protection.customerNumber?.formattedDisplayNumber ?: "حماية رقمية",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    fontFamily = FontFamily.Monospace,
                    color = Slate900,
                    modifier = Modifier.weight(1f)
                )
                Box(
                    modifier = Modifier
                        .background(badgeBg, RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = "${health.symbol} ${health.labelAr} ($daysRemaining يوماً)",
                        color = badgeText,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "الباقة: ${protection.packageNameSnapshot} (${protection.durationDaysSnapshot} يوم)",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = Navy900
            )

            Text(
                text = "البداية: ${protection.startAt.take(10)} | النهاية: ${protection.endAt.take(10)}",
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                color = Slate700
            )

            Text(
                text = "معرف العميل: ${protection.customerId.take(8)}... | التجديدات: ${protection.renewalCount}",
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                color = Color(0xFF64748B)
            )
        }
    }
}
