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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.HourglassEmpty
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import com.aman.protection.domain.models.ProtectionRequest
import com.aman.protection.domain.models.RequestStatus
import com.aman.protection.presentation.customer.components.CompanyBadge
import com.aman.protection.presentation.protection.CustomerProtectionTab
import com.aman.protection.presentation.protection.CustomerProtectionViewModel
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

/**
 * شاشة طلبات الحماية وفق مصفوفة الشاشات CUS-03 (البند 1.5.3)
 * تتضمن: قائمة الطلبات وحالاتها (قيد المراجعة، مقبولة، مرفوضة)، تفاصيل الطلب، وزر إنشاء طلب جديد
 */
@Composable
fun CustomerRequestsScreen(
    viewModel: CustomerProtectionViewModel,
    onCreateNewRequest: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedFilterIndex by remember { mutableIntStateOf(0) } // 0: الكل, 1: قيد المراجعة, 2: مقبولة, 3: مرفوضة
    var selectedRequestDetails by remember { mutableStateOf<ProtectionRequest?>(null) }

    val filteredRequests = when (selectedFilterIndex) {
        1 -> uiState.requests.filter { it.status == RequestStatus.PENDING }
        2 -> uiState.requests.filter { it.status == RequestStatus.APPROVED }
        3 -> uiState.requests.filter { it.status == RequestStatus.REJECTED }
        else -> uiState.requests
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
            .padding(16.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Header Row with Title and New Request Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "طلبات الحماية (CUS-03)",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = Navy900
                    )
                    Text(
                        text = "متابعة الطلبات المقدمة وحالات المراجعة والاعتماد",
                        fontSize = 11.sp,
                        color = Slate600
                    )
                }

                Button(
                    onClick = onCreateNewRequest,
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("طلب جديد", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Sub-filter tabs: الكل, قيد المراجعة, مقبولة, مرفوضة
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
                    text = { Text("الكل (${uiState.requests.size})", fontSize = 12.sp, fontWeight = FontWeight.Bold) }
                )
                Tab(
                    selected = selectedFilterIndex == 1,
                    onClick = { selectedFilterIndex = 1 },
                    text = {
                        val count = uiState.requests.count { it.status == RequestStatus.PENDING }
                        Text("قيد المراجعة ($count)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                )
                Tab(
                    selected = selectedFilterIndex == 2,
                    onClick = { selectedFilterIndex = 2 },
                    text = {
                        val count = uiState.requests.count { it.status == RequestStatus.APPROVED }
                        Text("مقبولة ($count)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                )
                Tab(
                    selected = selectedFilterIndex == 3,
                    onClick = { selectedFilterIndex = 3 },
                    text = {
                        val count = uiState.requests.count { it.status == RequestStatus.REJECTED }
                        Text("مرفوضة ($count)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Content List
            when {
                uiState.isLoading && uiState.requests.isEmpty() -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Emerald600)
                    }
                }
                filteredRequests.isEmpty() -> {
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
                                imageVector = Icons.Default.ReceiptLong,
                                contentDescription = null,
                                tint = Color(0xFF94A3B8),
                                modifier = Modifier.size(40.dp)
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = "لا توجد طلبات في هذا التصنيف",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = Slate900
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "يمكنك تقديم طلب حماية جديد لأي من أرقامك المسجلة.",
                                fontSize = 11.sp,
                                color = Slate600,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(14.dp))
                            Button(
                                onClick = onCreateNewRequest,
                                colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("إنشاء طلب حماية جديد", fontSize = 12.sp)
                            }
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
                        items(filteredRequests, key = { it.id }) { req ->
                            CustomerRequestCard(
                                request = req,
                                onClick = { selectedRequestDetails = req }
                            )
                        }
                    }
                }
            }
        }

        // تفاصيل الطلب (نافذة حوارية CUS-03)
        if (selectedRequestDetails != null) {
            RequestDetailsDialog(
                request = selectedRequestDetails!!,
                onDismiss = { selectedRequestDetails = null }
            )
        }
    }
}

/**
 * بطاقة عرض طلب الحماية في القائمة
 */
@Composable
private fun CustomerRequestCard(
    request: ProtectionRequest,
    onClick: () -> Unit
) {
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
                Text(
                    text = request.customerNumber?.formattedDisplayNumber ?: "رقم الهاتف",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    fontFamily = FontFamily.Monospace,
                    color = Slate900,
                    modifier = Modifier.weight(1f)
                )

                // شارة حالة الطلب
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

            Row(verticalAlignment = Alignment.CenterVertically) {
                CompanyBadge(
                    companyCode = request.customerNumber?.company?.code ?: "OP",
                    companyName = request.customerNumber?.company?.nameAr ?: "شركة الاتصالات"
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "الباقة: ${request.packagePlan?.nameAr ?: "باقة حماية"} (${request.requestedPrice.toInt()} ${request.requestedCurrency})",
                    fontSize = 12.sp,
                    color = Slate700
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "مرجع الحوالة: ${request.paymentTransferReference ?: "-"}",
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    color = Slate900
                )
                Text(
                    text = request.createdAt?.take(10) ?: "",
                    fontSize = 11.sp,
                    color = Slate500
                )
            }

            if (!request.rejectionReason.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFFEF2F2), RoundedCornerShape(6.dp))
                        .padding(8.dp)
                ) {
                    Text(
                        text = "سبب الرفض: ${request.rejectionReason}",
                        color = Red600,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}

/**
 * نافذة تفاصيل طلب الحماية وفق المصفوفة CUS-03 (البند 1.5.3 تفاصيل الطلب)
 */
@Composable
private fun RequestDetailsDialog(
    request: ProtectionRequest,
    onDismiss: () -> Unit
) {
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
                        text = "تفاصيل طلب الحماية",
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
                            text = request.customerNumber?.formattedDisplayNumber ?: "رقم الهاتف",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            fontFamily = FontFamily.Monospace,
                            color = Slate900
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "المعرف المرجعي للطلب: ${request.id.take(8)}...",
                            fontSize = 11.sp,
                            color = Slate500
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                DetailItem(label = "الشركة", value = request.customerNumber?.company?.nameAr ?: "-")
                DetailItem(label = "الباقة المختارة", value = request.packagePlan?.nameAr ?: "-")
                DetailItem(label = "قيمة الحماية", value = "${request.requestedPrice.toInt()} ${request.requestedCurrency}")
                DetailItem(label = "مدة الحماية", value = "${request.requestedDurationDays} يوماً")
                DetailItem(label = "طريقة الدفع", value = request.paymentMethod?.nameAr ?: "-")
                DetailItem(label = "رقم مرجع الحوالة", value = request.paymentTransferReference ?: "-")
                DetailItem(label = "حالة الطلب", value = request.status.name)
                DetailItem(label = "تاريخ التقديم", value = request.createdAt?.take(16)?.replace("T", " ") ?: "-")

                if (!request.customerNote.isNullOrBlank()) {
                    DetailItem(label = "ملاحظاتك", value = request.customerNote)
                }

                if (!request.rejectionReason.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFFEF2F2), RoundedCornerShape(6.dp))
                            .padding(10.dp)
                    ) {
                        Text(
                            text = "سبب الرفض: ${request.rejectionReason}",
                            color = Red600,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

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
