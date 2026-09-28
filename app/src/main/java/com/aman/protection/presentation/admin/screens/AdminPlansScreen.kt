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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aman.protection.data.models.ProtectionPlanDto
import com.aman.protection.presentation.admin.AdminManagementViewModel
import com.aman.protection.presentation.theme.Emerald600
import com.aman.protection.presentation.theme.Navy900
import com.aman.protection.presentation.theme.Slate100
import com.aman.protection.presentation.theme.Slate500
import com.aman.protection.presentation.theme.Slate600

@Composable
fun AdminPlansScreen(
    viewModel: AdminManagementViewModel
) {
    val state by viewModel.uiState.collectAsState()
    var editingPlan by remember { mutableStateOf<ProtectionPlanDto?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
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
                    text = "إدارة باقات الحماية والأسعار",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Navy900
                )
                Text(
                    text = "تعديل أسعار ومدد الباقات والظهور للعملاء",
                    fontSize = 12.sp,
                    color = Slate600
                )
            }
            IconButton(onClick = { viewModel.loadAllManagementData() }) {
                Icon(Icons.Default.Refresh, contentDescription = "تحديث", tint = Navy900)
            }
        }

        if (state.isLoading) {
            Box(modifier = Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Emerald600)
            }
        } else if (state.plans.isEmpty()) {
            Box(modifier = Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                Text("لا توجد باقات متاحة", fontSize = 13.sp, color = Slate500)
            }
        } else {
            LazyColumn(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(state.plans) { plan ->
                    AdminPlanCard(
                        plan = plan,
                        onEdit = { editingPlan = plan }
                    )
                }
            }
        }
    }

    if (editingPlan != null) {
        val plan = editingPlan!!
        var priceInput by remember { mutableStateOf(plan.price.toInt().toString()) }
        var durationInput by remember { mutableStateOf(plan.durationDays.toString()) }
        var isActive by remember { mutableStateOf(plan.isActive) }
        var isVisible by remember { mutableStateOf(plan.isVisible) }

        AlertDialog(
            onDismissRequest = { editingPlan = null },
            title = { Text("تعديل الباقة: ${plan.nameAr}", fontSize = 15.sp, fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    OutlinedTextField(
                        value = priceInput,
                        onValueChange = { priceInput = it },
                        label = { Text("السعر (${plan.currency})") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = durationInput,
                        onValueChange = { durationInput = it },
                        label = { Text("مدة الحماية (بالأيام)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("مفعلة (Active)", fontSize = 12.sp)
                        Switch(checked = isActive, onCheckedChange = { isActive = it })
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("ظاهرة للعميل (Visible)", fontSize = 12.sp)
                        Switch(checked = isVisible, onCheckedChange = { isVisible = it })
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val p = priceInput.toDoubleOrNull() ?: plan.price
                        val d = durationInput.toIntOrNull() ?: plan.durationDays
                        viewModel.updatePlan(plan.id, p, d, isActive, isVisible)
                        editingPlan = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald600)
                ) {
                    Text("حفظ التعديل")
                }
            },
            dismissButton = {
                TextButton(onClick = { editingPlan = null }) {
                    Text("إلغاء")
                }
            }
        )
    }
}

@Composable
fun AdminPlanCard(
    plan: ProtectionPlanDto,
    onEdit: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
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
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Emerald600.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Layers, contentDescription = null, tint = Emerald600, modifier = Modifier.size(20.dp))
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(text = plan.nameAr, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Navy900)
                        Text(text = "المدة: ${plan.durationDays} يوم", fontSize = 11.sp, color = Slate500)
                    }
                }

                Text(
                    text = "${plan.price.toInt()} ${plan.currency}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = Emerald600
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(if (plan.isActive) Color(0xFFDCFCE7) else Slate100)
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(text = if (plan.isActive) "مفعلة" else "معطلة", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = if (plan.isActive) Color(0xFF15803D) else Slate500)
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(if (plan.isVisible) Color(0xFFE0E7FF) else Slate100)
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(text = if (plan.isVisible) "ظاهرة" else "مخفية", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = if (plan.isVisible) Color(0xFF4338CA) else Slate500)
                    }
                }

                OutlinedButton(
                    onClick = onEdit,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.height(30.dp)
                ) {
                    Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(12.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "تعديل", fontSize = 10.sp)
                }
            }
        }
    }
}
