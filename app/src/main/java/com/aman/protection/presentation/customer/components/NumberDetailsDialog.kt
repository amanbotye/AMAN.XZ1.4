package com.aman.protection.presentation.customer.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Shield
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.aman.protection.domain.models.CustomerNumber
import com.aman.protection.domain.models.Protection
import com.aman.protection.domain.models.ProtectionRequest
import com.aman.protection.domain.models.RequestStatus
import com.aman.protection.presentation.theme.Emerald600
import com.aman.protection.presentation.theme.Navy900
import com.aman.protection.presentation.theme.Red600
import com.aman.protection.presentation.theme.Slate100
import com.aman.protection.presentation.theme.Slate50
import com.aman.protection.presentation.theme.Slate600
import com.aman.protection.presentation.theme.Slate700
import com.aman.protection.presentation.theme.Slate900

/**
 * نافذة تفاصيل الرقم والملاحظات وفق البند 1.5.2 (CUS-02)
 * تعرض:
 * - الرقم
 * - الشركة المكتشفة
 * - حالة الحماية
 * - الطلبات المرتبطة
 * - الحمايات المرتبطة
 * - تعديل الرقم (الملاحظات)
 * - حذف الرقم (وفق شروط المرجع)
 */
@Composable
fun NumberDetailsDialog(
    number: CustomerNumber,
    notesText: String,
    onNotesChanged: (String) -> Unit,
    onSaveNotes: () -> Unit,
    isUpdatingNotes: Boolean,
    relatedRequests: List<ProtectionRequest> = emptyList(),
    relatedProtections: List<Protection> = emptyList(),
    onDismiss: () -> Unit,
    onDelete: (() -> Unit)? = null,
    onRequestProtection: (() -> Unit)? = null
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(20.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "تفاصيل الرقم (CUS-02)",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = Navy900,
                        modifier = Modifier.weight(1f)
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "إغلاق",
                            tint = Slate700
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Number Display Box
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Slate50, RoundedCornerShape(10.dp))
                        .padding(14.dp)
                ) {
                    Column {
                        Text(
                            text = number.formattedDisplayNumber,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = Slate900
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            CompanyBadge(
                                companyCode = number.company?.code ?: "OP",
                                companyName = number.company?.nameAr ?: "بادئة ${number.detectedPrefix}"
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "البادئة: ${number.detectedPrefix}",
                                fontSize = 11.sp,
                                color = Slate700
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Detail Rows
                DetailRow(
                    label = "حالة الحماية",
                    value = if (number.hasActiveProtection) "محمي باشتراك نشط 🛡️" else "غير محمي حالياً"
                )
                DetailRow(label = "الشركة المكتشفة", value = number.company?.nameAr ?: "غير محددة")
                DetailRow(label = "الرقم المنمط", value = number.normalizedPhoneNumber)
                DetailRow(label = "حالة السجل", value = if (number.isLiveActive) "نشط" else "معطل")
                DetailRow(label = "تاريخ الإضافة", value = number.createdAt?.take(10) ?: "-")

                Spacer(modifier = Modifier.height(14.dp))

                // الحمايات المرتبطة بهذا الرقم (وفق CUS-02)
                Text(
                    text = "الحمايات المرتبطة (${relatedProtections.size}):",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Spacer(modifier = Modifier.height(4.dp))
                if (relatedProtections.isEmpty()) {
                    Text(
                        text = "لا توجد حمايات سابقة أو حالية مسجلة لهذا الرقم.",
                        fontSize = 11.sp,
                        color = Slate600
                    )
                } else {
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        relatedProtections.forEach { prot ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(Color(0xFFF8FAFC), RoundedCornerShape(6.dp))
                                    .padding(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Shield,
                                    contentDescription = null,
                                    tint = Emerald600,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = prot.packageNameSnapshot,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Slate900
                                    )
                                    Text(
                                        text = "من ${prot.startAt.take(10)} إلى ${prot.endAt.take(10)}",
                                        fontSize = 10.sp,
                                        color = Slate600
                                    )
                                }
                                Box(
                                    modifier = Modifier
                                        .background(Color(0xFFDCFCE7), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(prot.status.name, fontSize = 9.sp, color = Emerald600, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // الطلبات المرتبطة بهذا الرقم (وفق CUS-02)
                Text(
                    text = "الطلبات المرتبطة (${relatedRequests.size}):",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Spacer(modifier = Modifier.height(4.dp))
                if (relatedRequests.isEmpty()) {
                    Text(
                        text = "لا توجد طلبات حماية مرفوعة لهذا الرقم.",
                        fontSize = 11.sp,
                        color = Slate600
                    )
                } else {
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        relatedRequests.forEach { req ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(Color(0xFFF8FAFC), RoundedCornerShape(6.dp))
                                    .padding(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ReceiptLong,
                                    contentDescription = null,
                                    tint = Navy900,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = req.packagePlan?.nameAr ?: "باقة حماية",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Slate900
                                    )
                                    Text(
                                        text = "مرجع: ${req.paymentTransferReference ?: "-"}",
                                        fontSize = 10.sp,
                                        color = Slate600
                                    )
                                }
                                val statusLabel = when (req.status) {
                                    RequestStatus.PENDING -> "قيد المراجعة"
                                    RequestStatus.APPROVED -> "معتمد"
                                    RequestStatus.REJECTED -> "مرفوض"
                                    RequestStatus.CANCELLED -> "ملغي"
                                }
                                Box(
                                    modifier = Modifier
                                        .background(Color(0xFFFEF3C7), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(statusLabel, fontSize = 9.sp, color = Color(0xFFB45309), fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Notes Field (تعديل الرقم)
                Text(
                    text = "ملاحظات الرقم (تعديل):",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Spacer(modifier = Modifier.height(6.dp))
                OutlinedTextField(
                    value = notesText,
                    onValueChange = onNotesChanged,
                    placeholder = { Text("أدخل وصفاً أو ملاحظة للرقم...", fontSize = 12.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    maxLines = 2
                )

                Spacer(modifier = Modifier.height(10.dp))
                Button(
                    onClick = onSaveNotes,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(42.dp),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                    enabled = !isUpdatingNotes
                ) {
                    if (isUpdatingNotes) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(18.dp),
                            color = Color.White,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(
                            text = "حفظ الملاحظات",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }

                // طلب حماية للرقم إذا كان غير محمي
                if (!number.hasActiveProtection && onRequestProtection != null) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = onRequestProtection,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(42.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Navy900)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Security,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "طلب حماية لهذا الرقم (CUS-03)",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }

                // زر حذف الرقم (وفق قيود المرجع: متاح فقط إذا لم تكن هناك حماية نشطة)
                if (!number.hasActiveProtection && onDelete != null) {
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedButton(
                        onClick = onDelete,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(42.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Red600)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = null,
                            tint = Red600,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "حذف الرقم من الحساب",
                            color = Red600,
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
private fun DetailRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "$label:",
            fontSize = 12.sp,
            color = Slate700,
            modifier = Modifier.width(115.dp)
        )
        Text(
            text = value,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            color = Slate900
        )
    }
}
