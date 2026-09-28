package com.aman.protection.presentation.screens

import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aman.protection.domain.models.User
import com.aman.protection.presentation.admin.AdminManagementViewModel
import com.aman.protection.presentation.admin.AdminProtectionViewModel
import com.aman.protection.presentation.admin.screens.AdminAuditLogsScreen
import com.aman.protection.presentation.admin.screens.AdminCompaniesScreen
import com.aman.protection.presentation.admin.screens.AdminCustomerNumbersScreen
import com.aman.protection.presentation.admin.screens.AdminDashboardScreen
import com.aman.protection.presentation.admin.screens.AdminNotificationsScreen
import com.aman.protection.presentation.admin.screens.AdminPaymentMethodsScreen
import com.aman.protection.presentation.admin.screens.AdminPlansScreen
import com.aman.protection.presentation.admin.screens.AdminProtectionRequestsScreen
import com.aman.protection.presentation.admin.screens.AdminProtectionsScreen
import com.aman.protection.presentation.admin.screens.AdminSettingsScreen
import com.aman.protection.presentation.admin.screens.AdminTasksScreen
import com.aman.protection.presentation.admin.screens.AdminUsersScreen
import com.aman.protection.presentation.notifications.NotificationsViewModel
import com.aman.protection.presentation.tasks.AdminTasksViewModel
import com.aman.protection.presentation.theme.Amber500
import com.aman.protection.presentation.theme.Navy900
import com.aman.protection.presentation.theme.Slate50

/**
 * شاشة المشرف والإدارة العامة ADM (Admin Portal)
 * تتضمن الشاشات الإدارية الـ 11 كاملة وفق مصفوفة الشاشات المعتمدة
 */
@Composable
fun AdminHomeScreen(
    user: User,
    adminProtectionViewModel: AdminProtectionViewModel,
    adminTasksViewModel: AdminTasksViewModel,
    notificationsViewModel: NotificationsViewModel,
    adminManagementViewModel: AdminManagementViewModel,
    onSignOut: () -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val mgmtState by adminManagementViewModel.uiState.collectAsState()
    val tasksState by adminTasksViewModel.uiState.collectAsState()
    val notifState by notificationsViewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        adminManagementViewModel.loadAllManagementData()
        adminProtectionViewModel.loadPendingRequests()
        adminTasksViewModel.loadAllTasks()
        notificationsViewModel.loadAdminNotifications()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Admin Top Bar
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Navy900),
                shape = androidx.compose.ui.graphics.RectangleShape
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Amber500),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Security,
                            contentDescription = null,
                            tint = Navy900,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = user.fullName ?: user.email ?: "مدير النظام",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                        Text(
                            text = "لوحة تحكم المشرف الشاملة • AMAN Admin Portal",
                            color = Amber500,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                    IconButton(onClick = onSignOut) {
                        Icon(
                            imageVector = Icons.Default.ExitToApp,
                            contentDescription = "خروج",
                            tint = Color(0xFFEF4444)
                        )
                    }
                }
            }

            // Scrollable Tab Navigation across all 11 Admin screens
            ScrollableTabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color.White,
                contentColor = Navy900,
                edgePadding = 12.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("الرئيسية", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("طلبات الحماية", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            if (mgmtState.stats.pendingRequestsCount > 0) {
                                Spacer(modifier = Modifier.width(4.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(CircleShape)
                                        .background(Amber500)
                                        .padding(horizontal = 5.dp, vertical = 1.dp)
                                ) {
                                    Text(
                                        text = "${mgmtState.stats.pendingRequestsCount}",
                                        color = Navy900,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                )
                Tab(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("المهام التشغيلية", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            val alertCount = tasksState.dueCount + tasksState.overdueCount
                            if (alertCount > 0) {
                                Spacer(modifier = Modifier.width(4.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(CircleShape)
                                        .background(Color(0xFFEF4444))
                                        .padding(horizontal = 5.dp, vertical = 1.dp)
                                ) {
                                    Text(
                                        text = "$alertCount",
                                        color = Color.White,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                )
                Tab(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    text = { Text("العملاء", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTab == 4,
                    onClick = { selectedTab = 4 },
                    text = { Text("أرقام المشتركين", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTab == 5,
                    onClick = { selectedTab = 5 },
                    text = { Text("الحمايات والاشتراكات", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTab == 6,
                    onClick = { selectedTab = 6 },
                    text = { Text("الشركات والبادئات", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTab == 7,
                    onClick = { selectedTab = 7 },
                    text = { Text("باقات الحماية", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTab == 8,
                    onClick = { selectedTab = 8 },
                    text = { Text("طرق الدفع", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTab == 9,
                    onClick = { selectedTab = 9 },
                    text = { Text("سجل العمليات", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTab == 10,
                    onClick = { selectedTab = 10 },
                    text = { Text("إعدادات النظام", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTab == 11,
                    onClick = { selectedTab = 11 },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("الإشعارات الإدارية", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            if (notifState.unreadCount > 0) {
                                Spacer(modifier = Modifier.width(4.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(CircleShape)
                                        .background(Color(0xFFEF4444))
                                        .padding(horizontal = 5.dp, vertical = 1.dp)
                                ) {
                                    Text(
                                        text = "${notifState.unreadCount}",
                                        color = Color.White,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                )
            }

            // Tab Content
            Box(modifier = Modifier.weight(1f)) {
                when (selectedTab) {
                    0 -> AdminDashboardScreen(viewModel = adminManagementViewModel, onNavigateTab = { selectedTab = it })
                    1 -> AdminProtectionRequestsScreen(viewModel = adminProtectionViewModel, modifier = Modifier.fillMaxSize())
                    2 -> AdminTasksScreen(viewModel = adminTasksViewModel)
                    3 -> AdminUsersScreen(viewModel = adminManagementViewModel)
                    4 -> AdminCustomerNumbersScreen(viewModel = adminManagementViewModel)
                    5 -> AdminProtectionsScreen(viewModel = adminManagementViewModel)
                    6 -> AdminCompaniesScreen(viewModel = adminManagementViewModel)
                    7 -> AdminPlansScreen(viewModel = adminManagementViewModel)
                    8 -> AdminPaymentMethodsScreen(viewModel = adminManagementViewModel)
                    9 -> AdminAuditLogsScreen(viewModel = adminManagementViewModel)
                    10 -> AdminSettingsScreen(viewModel = adminManagementViewModel)
                    11 -> AdminNotificationsScreen(viewModel = notificationsViewModel)
                }
            }
        }
    }
}
