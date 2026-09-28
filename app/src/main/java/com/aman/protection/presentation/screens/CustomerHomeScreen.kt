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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.ViewList
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aman.protection.data.models.UserDto
import com.aman.protection.data.models.toDomain
import com.aman.protection.presentation.customer.CustomerViewModel
import com.aman.protection.presentation.customer.screens.CustomerNumbersScreen
import com.aman.protection.presentation.protection.CustomerProtectionTab
import com.aman.protection.presentation.protection.CustomerProtectionViewModel
import com.aman.protection.presentation.protection.screens.CreateProtectionRequestScreen
import com.aman.protection.presentation.protection.screens.MyRequestsAndProtectionsScreen
import com.aman.protection.presentation.protection.screens.PlansCatalogScreen
import com.aman.protection.presentation.theme.Emerald600
import com.aman.protection.presentation.theme.Navy900
import com.aman.protection.presentation.theme.Slate50
import com.aman.protection.presentation.theme.Slate700

@Composable
fun CustomerHomeScreen(
    user: UserDto,
    customerViewModel: CustomerViewModel,
    protectionViewModel: CustomerProtectionViewModel,
    onSignOut: () -> Unit
) {
    val domainUser = user.toDomain()
    val protectionState by protectionViewModel.uiState.collectAsState()
    var selectedTopTab by remember { mutableIntStateOf(0) } // 0: Numbers, 1: Protections/Requests, 2: Plans Catalog

    LaunchedEffect(user.id) {
        customerViewModel.loadData(user.id)
        protectionViewModel.loadBaseData()
    }

    if (protectionState.currentTab == CustomerProtectionTab.CREATE_REQUEST) {
        CreateProtectionRequestScreen(
            viewModel = protectionViewModel,
            onBack = { protectionViewModel.setTab(CustomerProtectionTab.MY_PROTECTIONS) }
        )
        return
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Customer Header Bar
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
                            .background(Emerald600, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = domainUser.displayName,
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
                            contentDescription = "خروج",
                            tint = Color(0xFFEF4444)
                        )
                    }
                }
            }

            // Top Navigation Tab Bar
            TabRow(
                selectedTabIndex = selectedTopTab,
                containerColor = Color.White,
                contentColor = Navy900,
                modifier = Modifier.fillMaxWidth()
            ) {
                Tab(
                    selected = selectedTopTab == 0,
                    onClick = { selectedTopTab = 0 },
                    text = { Text("أرقامي", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTopTab == 1,
                    onClick = { selectedTopTab = 1 },
                    text = { Text("الحمايات والطلبات", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
                Tab(
                    selected = selectedTopTab == 2,
                    onClick = { selectedTopTab = 2 },
                    text = { Text("دليل الباقات", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                )
            }

            // Tab Content
            Box(modifier = Modifier.weight(1f)) {
                when (selectedTopTab) {
                    0 -> {
                        CustomerNumbersScreen(
                            user = domainUser,
                            viewModel = customerViewModel,
                            onSignOut = onSignOut
                        )
                    }
                    1 -> {
                        MyRequestsAndProtectionsScreen(
                            viewModel = protectionViewModel,
                            onBack = { selectedTopTab = 0 }
                        )
                    }
                    2 -> {
                        PlansCatalogScreen(
                            plans = protectionState.allPlans,
                            onBack = { selectedTopTab = 0 }
                        )
                    }
                }
            }
        }
    }
}
