package com.aman.protection.presentation.protection.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Autorenew
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import com.aman.protection.presentation.protection.CustomerProtectionTab
import com.aman.protection.presentation.protection.CustomerProtectionViewModel
import com.aman.protection.presentation.theme.Amber500
import com.aman.protection.presentation.theme.Emerald600
import com.aman.protection.presentation.theme.Navy900

/**
 * شاشة تجديد الحماية CUS-05 (Customer Renewal Screen)
 * وفق بنود المرجع 1.5.5 ومصفوفة الشاشات AMAN_XZ1_Screen_Matrix_COMPREHENSIVE.xlsx
 * تمديد الحماية الحالية ومنع إنشاء حماية ثانية مكررة
 */
@Composable
fun CustomerRenewalScreen(
    protection: Protection,
    viewModel: CustomerProtectionViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()

    var selectedPlanId by remember { mutableStateOf(protection.packageId) }
    var selectedPmId by remember { mutableStateOf(uiState.paymentMethods.firstOrNull()?.id ?: "") }
    var transferRef by remember { mutableStateOf("") }
    var note by remember { mutableStateOf("") }
    var errorText by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { viewModel.setTab(CustomerProtectionTab.MY_PROTECTIONS) }) {
                Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "رجوع", tint = Navy900)
            }
            Spacer(modifier = Modifier.width(6.dp))
            Column {
                Text(
                    text = "طلب تجديد الحماية (1.5.5)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = Navy900
                )
                Text(
                    text = "تمديد الاشتراك الحالي وتحديث خطة المهام التشغيلية",
                    fontSize = 11.sp,
                    color = Color(0xFF64748B)
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Protection Info Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = Icons.Default.Shield, contentDescription = null, tint = Emerald600, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = protection.customerNumber?.formattedDisplayNumber ?: "الرقم المحمي",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        fontFamily = FontFamily.Monospace,
                        color = Navy900
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "الباقة الحالية: ${protection.packageNameSnapshot} (${protection.durationDaysSnapshot} يوم)",
                    fontSize = 12.sp,
                    color = Color(0xFF475569)
                )
                Text(
                    text = "تاريخ الانتهاء الحالي: ${protection.endAt.take(10)}",
                    fontSize = 12.sp,
                    color = Color(0xFF475569)
                )
                Text(
                    text = "مرات التجديد السابقة: ${protection.renewalCount}",
                    fontSize = 11.sp,
                    color = Amber500,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Select Renewal Package
        Text("اختر باقة التجديد:", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Navy900)
        Spacer(modifier = Modifier.height(8.dp))

        val companyPlans = uiState.allPlans.filter { it.companyId == protection.companyId }
        val displayPlans = if (companyPlans.isNotEmpty()) companyPlans else uiState.allPlans

        displayPlans.forEach { plan ->
            val isSelected = plan.id == selectedPlanId
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clickable { selectedPlanId = plan.id },
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (isSelected) Color(0xFFECFDF5) else Color.White
                ),
                border = if (isSelected) androidx.compose.foundation.BorderStroke(1.5.dp, Emerald600) else null
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(text = plan.nameAr, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Navy900)
                        Text(text = "المدة: ${plan.durationDays} يوماً", fontSize = 11.sp, color = Color(0xFF64748B))
                    }
                    Text(
                        text = "${plan.price.toInt()} ${plan.currency}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = Emerald600
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Select Payment Method
        Text("طريقة التحويل / السداد:", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Navy900)
        Spacer(modifier = Modifier.height(8.dp))

        uiState.paymentMethods.forEach { pm ->
            val isSelected = pm.id == selectedPmId
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clickable { selectedPmId = pm.id },
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (isSelected) Color(0xFFEFF6FF) else Color.White
                ),
                border = if (isSelected) androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFF2563EB)) else null
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(text = pm.nameAr, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Navy900)
                    if (!pm.accountIdentifier.isNullOrBlank()) {
                        Text(text = "رقم الحساب: ${pm.accountIdentifier} (${pm.accountName ?: ""})", fontSize = 11.sp, fontFamily = FontFamily.Monospace, color = Color(0xFF2563EB))
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Transfer Reference
        Text("بيانات الحوالة البنكية:", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Navy900)
        Spacer(modifier = Modifier.height(6.dp))
        OutlinedTextField(
            value = transferRef,
            onValueChange = {
                transferRef = it
                errorText = null
            },
            placeholder = { Text("أدخل رقم الحوالة أو السند المالي...", fontSize = 12.sp) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Customer Note
        Text("ملاحظات إضافية (اختياري):", fontSize = 12.sp, color = Color(0xFF475569))
        Spacer(modifier = Modifier.height(4.dp))
        OutlinedTextField(
            value = note,
            onValueChange = { note = it },
            placeholder = { Text("أي توضيحات بخصوص الحوالة...", fontSize = 12.sp) },
            modifier = Modifier.fillMaxWidth(),
            maxLines = 2
        )

        if (errorText != null) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = errorText!!, color = Color(0xFFDC2626), fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Submit Button
        Button(
            onClick = {
                if (transferRef.isBlank()) {
                    errorText = "يرجى إدخال رقم مرجع الحوالة لإتمام طلب التجديد"
                    return@Button
                }
                viewModel.onTransferRefChanged(transferRef)
                viewModel.onCustomerNoteChanged(note)
                viewModel.submitProtectionRequest()
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(46.dp),
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
            enabled = !uiState.isSubmittingRequest
        ) {
            if (uiState.isSubmittingRequest) {
                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
            } else {
                Icon(imageVector = Icons.Default.Autorenew, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("إرسال طلب التجديد", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
        }
    }
}
