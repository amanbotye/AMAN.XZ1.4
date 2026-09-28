package com.aman.protection.presentation.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Person
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
import com.aman.protection.data.models.UserDto
import com.aman.protection.data.models.toDomain
import com.aman.protection.navigation.AmanDestination
import com.aman.protection.presentation.customer.CustomerViewModel
import com.aman.protection.presentation.customer.screens.CustomerAccountScreen
import com.aman.protection.presentation.customer.screens.CustomerNumbersScreen
import com.aman.protection.presentation.customer.screens.CustomerOverviewScreen
import com.aman.protection.presentation.notifications.NotificationsViewModel
import com.aman.protection.presentation.notifications.screens.CustomerNotificationsScreen
import com.aman.protection.presentation.payment.PaymentMethodViewModel
import com.aman.protection.presentation.payment.screens.PaymentMethodsScreen
import com.aman.protection.presentation.protection.CustomerProtectionTab
import com.aman.protection.presentation.protection.CustomerProtectionViewModel
import com.aman.protection.presentation.protection.screens.CreateProtectionRequestScreen
import com.aman.protection.presentation.protection.screens.CustomerProtectionsScreen
import com.aman.protection.presentation.protection.screens.CustomerRenewalScreen
import com.aman.protection.presentation.protection.screens.CustomerRequestsScreen
import com.aman.protection.presentation.protection.screens.PlansCatalogScreen
import com.aman.protection.presentation.theme.Emerald600
import com.aman.protection.presentation.theme.Navy900
import com.aman.protection.presentation.theme.Slate50

/**
 * الشاشة الرئيسية لتطبيق العميل (بوابة العميل)
 * مطابقة لمصفوفة الشاشات AMAN_XZ1_Screen_Matrix_COMPREHENSIVE.xlsx:
 * - CUS-01: الرئيسية (ملخص الأرقام، ملخص الحمايات، الإجراءات، الإشعارات)
 * - CUS-02: أرقامي (قائمة، تفاصيل، إضافة، تحقق، كشف الشركة، ملاحظات، حذف)
 * - CUS-03: طلبات الحماية (قائمة الطلبات، إنشاء طلب، مراجعة، PENDING)
 * - CUS-04: حماياتي (نشطة، تحتاج تجديد، منتهية، تفاصيل الحماية)
 * - CUS-05: التجديد
 * - CUS-06: الإشعارات
 * - CUS-07: حسابي
 */
@Composable
fun CustomerHomeScreen(
    user: UserDto,
    initialDestination: AmanDestination? = null,
    customerViewModel: CustomerViewModel,
    protectionViewModel: CustomerProtectionViewModel,
    paymentMethodViewModel: PaymentMethodViewModel,
    notificationsViewModel: NotificationsViewModel,
    onSignOut: () -> Unit
) {
    val domainUser = user.toDomain()
    val customerState by customerViewModel.uiState.collectAsState()
    val protectionState by protectionViewModel.uiState.collectAsState()
    val notifState by notificationsViewModel.uiState.collectAsState()

    // 0: الرئيسية (CUS-01), 1: أرقامي (CUS-02), 2: طلبات الحماية (CUS-03), 3: حماياتي (CUS-04), 4: دليل الباقات, 5: طرق الدفع, 6: الإشعارات (CUS-06), 7: حسابي (CUS-07)
    val defaultTab = when (initialDestination) {
        AmanDestination.CustomerHome -> 0
        AmanDestination.CustomerNumbers -> 1
        AmanDestination.CustomerRequests -> 2
        AmanDestination.CustomerProtections -> 3
        AmanDestination.CustomerNotifications -> 6
        AmanDestination.CustomerAccount -> 7
        else -> 0
    }
    var selectedTopTab by remember(initialDestination) { mutableIntStateOf(defaultTab) }

    LaunchedEffect(user.id) {
        customerViewModel.loadData(user.id)
        protectionViewModel.loadBaseData()
        paymentMethodViewModel.loadPaymentMethods()
        notificationsViewModel.loadClientNotifications(user.id)
    }

    // عرض شاشة إنشاء طلب حماية عند طلبها
    if (protectionState.currentTab == CustomerProtectionTab.CREATE_REQUEST) {
        CreateProtectionRequestScreen(
            viewModel = protectionViewModel,
            onBack = { protectionViewModel.setTab(CustomerProtectionTab.MY_REQUESTS) }
        )
        return
    }

    // عرض شاشة التجديد عند طلبها
    if (protectionState.currentTab == CustomerProtectionTab.RENEWAL && protectionState.selectedProtectionForRenewal != null) {
        CustomerRenewalScreen(
            protection = protectionState.selectedProtectionForRenewal!!,
            viewModel = protectionViewModel
        )
        return
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // شريط العنوان العلوي للعميل
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Navy900)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .background(Emerald600, CircleShape)
                            .clickable { selectedTopTab = 7 },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "الملف الشخصي",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedTopTab = 7 }
                    ) {
                        Text(
                            text = customerState.customer?.user?.displayName ?: domainUser.displayName,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                        Text(
                            text = "بوابة العميل • AMAN Protection",
                            color = Color(0xFF94A3B8),
                            fontSize = 10.sp
                        )
                    }

                    IconButton(onClick = onSignOut) {
                        Icon(
                            imageVector = Icons.Default.ExitToApp,
                            contentDescription = "تسجيل الخروج",
                            tint = Color(0xFFEF4444)
                        )
                    }
                }
            }

            // شريط التبويبات العلوي للعميل (وفق مصفوفة الشاشات)
            ScrollableTabRow(
                selectedTabIndex = selectedTopTab,
                containerColor = Color.White,
                contentColor = Navy900,
                edgePadding = 12.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Tab(
                    selected = selectedTopTab == 0,
                    onClick = { selectedTopTab = 0 },
                    text = { Text("الرئيسية", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTopTab == 1,
                    onClick = { selectedTopTab = 1 },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("أرقامي", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            if (customerState.numbers.isNotEmpty()) {
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "(${customerState.numbers.size})",
                                    fontSize = 11.sp,
                                    color = Emerald600
                                )
                            }
                        }
                    }
                )
                Tab(
                    selected = selectedTopTab == 2,
                    onClick = { selectedTopTab = 2 },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("طلبات الحماية", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            val pendingCount = protectionState.requests.count { it.isPending }
                            if (pendingCount > 0) {
                                Spacer(modifier = Modifier.width(4.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(CircleShape)
                                        .background(Color(0xFFF59E0B))
                                        .padding(horizontal = 5.dp, vertical = 1.dp)
                                ) {
                                    Text(
                                        text = "$pendingCount",
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
                    selected = selectedTopTab == 3,
                    onClick = { selectedTopTab = 3 },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("حماياتي", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            val activeCount = protectionState.protections.count { it.isLiveActive }
                            if (activeCount > 0) {
                                Spacer(modifier = Modifier.width(4.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(CircleShape)
                                        .background(Emerald600)
                                        .padding(horizontal = 5.dp, vertical = 1.dp)
                                ) {
                                    Text(
                                        text = "$activeCount",
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
                    selected = selectedTopTab == 4,
                    onClick = { selectedTopTab = 4 },
                    text = { Text("دليل الباقات", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTopTab == 5,
                    onClick = { selectedTopTab = 5 },
                    text = { Text("طرق الدفع", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTopTab == 6,
                    onClick = { selectedTopTab = 6 },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("الإشعارات", fontWeight = FontWeight.Bold, fontSize = 12.sp)
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
                Tab(
                    selected = selectedTopTab == 7,
                    onClick = { selectedTopTab = 7 },
                    text = { Text("حسابي", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
            }

            // محتوى التبويب المختار
            Box(modifier = Modifier.weight(1f)) {
                when (selectedTopTab) {
                    0 -> {
                        CustomerOverviewScreen(
                            user = customerState.customer?.user ?: domainUser,
                            activeProtections = protectionState.protections.filter { it.isLiveActive },
                            totalNumbersCount = customerState.numbers.size,
                            pendingRequestsCount = protectionState.requests.count { it.isPending },
                            isLoading = customerState.isLoading || protectionState.isLoading,
                            errorMessage = customerState.errorMessage ?: protectionState.errorMessage,
                            onRetry = {
                                customerViewModel.loadData(user.id)
                                protectionViewModel.loadBaseData()
                            },
                            onNavigateToNumbers = { selectedTopTab = 1 },
                            onNavigateToProtections = { selectedTopTab = 3 },
                            onNavigateToPlans = { selectedTopTab = 4 },
                            onNavigateToNotifications = { selectedTopTab = 6 },
                            onNavigateToAccount = { selectedTopTab = 7 }
                        )
                    }
                    1 -> {
                        CustomerNumbersScreen(
                            user = domainUser,
                            viewModel = customerViewModel,
                            requests = protectionState.requests,
                            protections = protectionState.protections,
                            onRequestProtectionForNumber = { num ->
                                protectionViewModel.startNewRequest(num)
                            },
                            onSignOut = onSignOut
                        )
                    }
                    2 -> {
                        CustomerRequestsScreen(
                            viewModel = protectionViewModel,
                            onCreateNewRequest = {
                                protectionViewModel.startNewRequest()
                            }
                        )
                    }
                    3 -> {
                        CustomerProtectionsScreen(
                            viewModel = protectionViewModel,
                            onStartRenewal = { prot ->
                                protectionViewModel.startRenewalForProtection(prot)
                            }
                        )
                    }
                    4 -> {
                        PlansCatalogScreen(
                            plans = protectionState.allPlans,
                            onBack = { selectedTopTab = 0 }
                        )
                    }
                    5 -> {
                        PaymentMethodsScreen(
                            viewModel = paymentMethodViewModel
                        )
                    }
                    6 -> {
                        CustomerNotificationsScreen(
                            userId = user.id,
                            viewModel = notificationsViewModel
                        )
                    }
                    7 -> {
                        CustomerAccountScreen(
                            user = customerState.customer?.user ?: domainUser,
                            viewModel = customerViewModel,
                            onSignOut = onSignOut
                        )
                    }
                }
            }
        }
    }
}
