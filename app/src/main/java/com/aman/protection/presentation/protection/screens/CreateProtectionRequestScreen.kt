package com.aman.protection.presentation.protection.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Refresh
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
import com.aman.protection.domain.models.CustomerNumber
import com.aman.protection.presentation.customer.components.CompanyBadge
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
 * شاشة إنشاء طلب حماية وفق متطلبات المصفوفة CUS-03 (البند 1.5.3)
 * تتضمن:
 * - اختيار الرقم
 * - الشركة المكتشفة
 * - الباقة والسعر والمدة
 * - طريقة الدفع وبيانات الدفع
 * - إدخال رقم التحويل
 * - مراجعة البيانات
 * - الإرسال والإلغاء قبل الإرسال
 * - تحويل الطلب إلى قيد المراجعة بعد الإرسال
 * - عدم إنشاء حماية عند إنشاء الطلب
 */
@Composable
fun CreateProtectionRequestScreen(
    viewModel: CustomerProtectionViewModel,
    onBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val number = uiState.selectedNumber
    var isSelectingNumberMode by remember { mutableStateOf(number == null) }

    val plans = uiState.allPlans.filter {
        number == null || it.companyId == number.companyId
    }.ifEmpty { uiState.allPlans }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // شريط العنوان العلوي
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "إلغاء والعودة",
                        tint = Navy900
                    )
                }
                Spacer(modifier = Modifier.width(4.dp))
                Column {
                    Text(
                        text = "إنشاء طلب حماية جديد (CUS-03)",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = Navy900
                    )
                    Text(
                        text = "اختر الرقم والباقة وسدد الرسوم لرفع الطلب للمراجعة",
                        fontSize = 11.sp,
                        color = Slate600
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // تنبيه خطة المرجع: عدم إنشاء حماية مباشرة
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFF0FDF4), RoundedCornerShape(10.dp))
                    .padding(12.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        tint = Emerald600,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "ملاحظة: عند إرسال الطلب، يتحول إلى (قيد المراجعة PENDING) ولا يتم إنشاء حماية مباشرة إلا بعد اعتماد المشرف ومطابقة الحوالة.",
                        fontSize = 11.sp,
                        color = Color(0xFF166534),
                        lineHeight = 16.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // 1. اختيار الرقم والشركة
            Text(
                text = "1. رقم الهاتف والشركة المشغلة:",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )
            Spacer(modifier = Modifier.height(6.dp))

            if (number != null && !isSelectingNumberMode) {
                // بطاقة الرقم المختار
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Navy900)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.PhoneAndroid,
                            contentDescription = null,
                            tint = Emerald600,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = number.formattedDisplayNumber,
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                text = "الشركة: ${number.company?.nameAr ?: "المشغل"} • بادئة ${number.detectedPrefix}",
                                color = Color(0xFF94A3B8),
                                fontSize = 11.sp
                            )
                        }
                        CompanyBadge(
                            companyCode = number.company?.code ?: "OP",
                            companyName = number.company?.nameAr
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        OutlinedButton(
                            onClick = { isSelectingNumberMode = true },
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                            shape = RoundedCornerShape(6.dp),
                            contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text("تغيير", fontSize = 11.sp, color = Color.White)
                        }
                    }
                }
            } else {
                // قائمة اختيار الرقم
                if (uiState.customerNumbers.isEmpty()) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "لا توجد أرقام مسجلة في حسابك",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = Slate900
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "يرجى إضافة رقم هاتف أولاً من شاشة أرقامي قبل طلب الحماية.",
                                fontSize = 11.sp,
                                color = Slate600
                            )
                        }
                    }
                } else {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        uiState.customerNumbers.forEach { cn ->
                            val isSelected = number?.id == cn.id
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        viewModel.onSelectNumber(cn)
                                        isSelectingNumberMode = false
                                    }
                                    .border(
                                        width = if (isSelected) 2.dp else 1.dp,
                                        color = if (isSelected) Emerald600 else Color(0xFFE2E8F0),
                                        shape = RoundedCornerShape(10.dp)
                                    ),
                                shape = RoundedCornerShape(10.dp),
                                colors = CardDefaults.cardColors(containerColor = if (isSelected) Color(0xFFECFDF5) else Color.White)
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.PhoneAndroid,
                                        contentDescription = null,
                                        tint = if (isSelected) Emerald600 else Slate700,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = cn.formattedDisplayNumber,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp,
                                            fontFamily = FontFamily.Monospace,
                                            color = Slate900
                                        )
                                        Text(
                                            text = "${cn.company?.nameAr ?: "المشغل"} • بادئة ${cn.detectedPrefix}",
                                            fontSize = 11.sp,
                                            color = Slate600
                                        )
                                    }
                                    if (cn.hasActiveProtection) {
                                        Box(
                                            modifier = Modifier
                                                .background(Color(0xFFDCFCE7), RoundedCornerShape(4.dp))
                                                .padding(horizontal = 6.dp, vertical = 2.dp)
                                        ) {
                                            Text("محمي", color = Emerald600, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // تنبيه التعارض إن وجد
            if (uiState.validationWarning != null) {
                Spacer(modifier = Modifier.height(10.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF3C7))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = null,
                            tint = Color(0xFFB45309),
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = uiState.validationWarning!!,
                            color = Color(0xFF92400E),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            // رسالة الخطأ
            if (uiState.errorMessage != null) {
                Spacer(modifier = Modifier.height(10.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFEE2E2))
                ) {
                    Text(
                        text = uiState.errorMessage!!,
                        color = Red600,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(12.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // 2. اختيار الباقة والسعر والمدة
            Text(
                text = "2. اختيار باقة الحماية (السعر والمدة):",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )
            Spacer(modifier = Modifier.height(8.dp))

            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                plans.forEach { plan ->
                    val isSelected = uiState.selectedPlan?.id == plan.id
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { viewModel.onPlanSelected(plan) }
                            .border(
                                width = if (isSelected) 2.dp else 1.dp,
                                color = if (isSelected) Emerald600 else Color(0xFFE2E8F0),
                                shape = RoundedCornerShape(10.dp)
                            ),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = if (isSelected) Color(0xFFECFDF5) else Color.White)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = plan.nameAr,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSelected) Emerald600 else Slate900
                                )
                                Text(
                                    text = "المدة: ${plan.formattedDuration}",
                                    fontSize = 11.sp,
                                    color = Slate700
                                )
                            }
                            Text(
                                text = plan.formattedPrice,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) Emerald600 else Slate900
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // 3. طريقة الدفع وبيانات الدفع
            Text(
                text = "3. طريقة الدفع وبيانات الحساب:",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )
            Spacer(modifier = Modifier.height(8.dp))

            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                uiState.paymentMethods.forEach { pm ->
                    val isSelected = uiState.selectedPaymentMethod?.id == pm.id
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { viewModel.onPaymentMethodSelected(pm) }
                            .border(
                                width = if (isSelected) 2.dp else 1.dp,
                                color = if (isSelected) Emerald600 else Color(0xFFE2E8F0),
                                shape = RoundedCornerShape(10.dp)
                            ),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = if (isSelected) Color(0xFFECFDF5) else Color.White)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = pm.nameAr,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSelected) Emerald600 else Slate900,
                                    modifier = Modifier.weight(1f)
                                )
                                Text(
                                    text = pm.accountIdentifier ?: "",
                                    fontSize = 12.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold,
                                    color = Slate900
                                )
                            }
                            if (!pm.instructions.isNullOrBlank()) {
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = pm.instructions,
                                    fontSize = 11.sp,
                                    color = Slate700
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // 4. إدخال رقم التحويل
            Text(
                text = "4. إدخال رقم مرجع التحويل أو الإيداع:",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = uiState.transferReference,
                onValueChange = viewModel::onTransferRefChanged,
                placeholder = { Text("أدخل رقم العملية أو إشعار الإيداع للتحقق", fontSize = 12.sp) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(12.dp))

            // ملاحظات إضافية (اختياري)
            Text(
                text = "ملاحظات إضافية للطلب (اختياري):",
                fontSize = 12.sp,
                color = Slate700
            )
            Spacer(modifier = Modifier.height(4.dp))
            OutlinedTextField(
                value = uiState.customerNote,
                onValueChange = viewModel::onCustomerNoteChanged,
                placeholder = { Text("أي توضيحات أو تفاصيل بخصوص التحويل...", fontSize = 12.sp) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp),
                maxLines = 2
            )

            Spacer(modifier = Modifier.height(18.dp))

            // 5. مراجعة البيانات قبل الإرسال (وفق البند 181 في المصفوفة)
            Text(
                text = "5. مراجعة البيانات قبل الإرسال:",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )
            Spacer(modifier = Modifier.height(6.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp)
                ) {
                    ReviewRow("الرقم المراد حمايته", number?.formattedDisplayNumber ?: "لم يتم التحديد")
                    ReviewRow("الشركة", number?.company?.nameAr ?: "-")
                    ReviewRow("الباقة المختارة", uiState.selectedPlan?.nameAr ?: "-")
                    ReviewRow("القيمة والمدة", "${uiState.selectedPlan?.formattedPrice ?: "-"} • ${uiState.selectedPlan?.formattedDuration ?: "-"}")
                    ReviewRow("طريقة الدفع", uiState.selectedPaymentMethod?.nameAr ?: "-")
                    ReviewRow("رقم الحساب المحول إليه", uiState.selectedPaymentMethod?.accountIdentifier ?: "-")
                    ReviewRow("رقم مرجع الحوالة", uiState.transferReference.ifBlank { "لم يدخل بعد" })
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // 6. الإرسال والإلغاء قبل الإرسال
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedButton(
                    onClick = onBack,
                    modifier = Modifier
                        .weight(1f)
                        .height(46.dp),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("إلغاء قبل الإرسال", color = Slate700, fontSize = 13.sp)
                }

                Spacer(modifier = Modifier.width(12.dp))

                Button(
                    onClick = viewModel::submitProtectionRequest,
                    modifier = Modifier
                        .weight(1.5f)
                        .height(46.dp),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                    enabled = number != null &&
                              uiState.selectedPlan != null &&
                              uiState.selectedPaymentMethod != null &&
                              uiState.transferReference.isNotBlank() &&
                              uiState.validationWarning == null &&
                              !uiState.isSubmittingRequest
                ) {
                    if (uiState.isSubmittingRequest) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = Color.White,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "إرسال الطلب للمراجعة",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ReviewRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, fontSize = 11.sp, color = Slate600)
        Text(text = value, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Slate900)
    }
}
