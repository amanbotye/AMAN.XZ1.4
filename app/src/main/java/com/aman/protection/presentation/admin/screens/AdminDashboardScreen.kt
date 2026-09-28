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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AssignmentLate
import androidx.compose.material.icons.filled.HourglassTop
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aman.protection.presentation.admin.AdminManagementViewModel
import com.aman.protection.presentation.theme.Amber500
import com.aman.protection.presentation.theme.Emerald600
import com.aman.protection.presentation.theme.Navy900
import com.aman.protection.presentation.theme.Slate100
import com.aman.protection.presentation.theme.Slate500
import com.aman.protection.presentation.theme.Slate600
import com.aman.protection.presentation.theme.Slate700

@Composable
fun AdminDashboardScreen(
    viewModel: AdminManagementViewModel,
    onNavigateTab: (Int) -> Unit
) {
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadAllManagementData()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "ملخص النظام والعمليات",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Navy900
                )
                Text(
                    text = "المؤشرات التشغيلية اللحظية المتصلة بقاعدة البيانات",
                    fontSize = 12.sp,
                    color = Slate600
                )
            }
            IconButton(onClick = { viewModel.loadAllManagementData() }) {
                Icon(Icons.Default.Refresh, contentDescription = "تحديث", tint = Navy900)
            }
        }

        if (state.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Emerald600)
            }
        } else {
            // Metrics Grid
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricSummaryCard(
                    title = "طلبات معلقة",
                    value = "${state.stats.pendingRequestsCount}",
                    subtitle = "تحتاج مراجعة المشرف",
                    icon = Icons.Default.HourglassTop,
                    iconBg = Amber500.copy(alpha = 0.15f),
                    iconTint = Amber500,
                    modifier = Modifier.weight(1f)
                )
                MetricSummaryCard(
                    title = "حمايات نشطة",
                    value = "${state.stats.activeProtectionsCount}",
                    subtitle = "أرقام محمية حالياً",
                    icon = Icons.Default.Shield,
                    iconBg = Emerald600.copy(alpha = 0.15f),
                    iconTint = Emerald600,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricSummaryCard(
                    title = "مهام مستحقة",
                    value = "${state.stats.dueTasksCount}",
                    subtitle = "تتطلب تنفيذ تشغيلي",
                    icon = Icons.Default.AssignmentLate,
                    iconBg = Color(0xFFFEF3C7),
                    iconTint = Color(0xFFD97706),
                    modifier = Modifier.weight(1f)
                )
                MetricSummaryCard(
                    title = "مهام متأخرة",
                    value = "${state.stats.overdueTasksCount}",
                    subtitle = "تجاوزت وقت الاستحقاق",
                    icon = Icons.Default.Warning,
                    iconBg = Color(0xFFFEE2E2),
                    iconTint = Color(0xFFDC2626),
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricSummaryCard(
                    title = "إجمالي العملاء",
                    value = "${state.stats.totalCustomersCount}",
                    subtitle = "حسابات مسجلة نشطة",
                    icon = Icons.Default.People,
                    iconBg = Navy900.copy(alpha = 0.1f),
                    iconTint = Navy900,
                    modifier = Modifier.weight(1f)
                )
                MetricSummaryCard(
                    title = "إشعارات غير مقروءة",
                    value = "${state.stats.unreadNotificationsCount}",
                    subtitle = "تنبيهات إدارية جديدة",
                    icon = Icons.Default.Notifications,
                    iconBg = Color(0xFFE0E7FF),
                    iconTint = Color(0xFF4F46E5),
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // System Readiness Banner
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Slate100)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "حالة التشغيل والأمان (Backend Status)",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = Navy900
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "كافة العمليات الحساسة (الاعتماد، التنفيذ، التجديد، وإعادة الجدولة) موثوقة ومحمية بسياسات RLS وإجراءات PL/pgSQL الذرية المتصلة بقاعدة البيانات الحية.",
                        fontSize = 11.sp,
                        color = Slate700,
                        lineHeight = 16.sp
                    )
                }
            }
        }
    }
}

@Composable
fun MetricSummaryCard(
    title: String,
    value: String,
    subtitle: String,
    icon: ImageVector,
    iconBg: Color,
    iconTint: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = title, fontSize = 12.sp, color = Slate600, fontWeight = FontWeight.Medium)
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(iconBg),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(imageVector = icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(18.dp))
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = value, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Navy900)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = subtitle, fontSize = 10.sp, color = Slate500)
        }
    }
}
