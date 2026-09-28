package com.aman.protection.presentation.customer.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aman.protection.domain.models.CustomerNumber
import com.aman.protection.domain.models.Protection
import com.aman.protection.domain.models.ProtectionRequest
import com.aman.protection.domain.models.User
import com.aman.protection.presentation.customer.CustomerScreenTab
import com.aman.protection.presentation.customer.CustomerViewModel
import com.aman.protection.presentation.customer.components.NumberDetailsDialog
import com.aman.protection.presentation.customer.components.NumberItemCard
import com.aman.protection.presentation.theme.Emerald600
import com.aman.protection.presentation.theme.Navy900
import com.aman.protection.presentation.theme.Red600
import com.aman.protection.presentation.theme.Slate100
import com.aman.protection.presentation.theme.Slate50
import com.aman.protection.presentation.theme.Slate600
import com.aman.protection.presentation.theme.Slate700
import com.aman.protection.presentation.theme.Slate900

/**
 * شاشة أرقامي للعميل — إدارة الأرقام المسجلة
 * وفق البند 1.5.2 وتوجيهات المرحلة 03 (CUS-02)
 */
@Composable
fun CustomerNumbersScreen(
    user: User,
    viewModel: CustomerViewModel,
    requests: List<ProtectionRequest> = emptyList(),
    protections: List<Protection> = emptyList(),
    onRequestProtectionForNumber: ((CustomerNumber) -> Unit)? = null,
    onSignOut: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    // التنقل إلى شاشة إضافة رقم
    if (uiState.currentTab == CustomerScreenTab.ADD_NUMBER) {
        AddNumberScreen(
            viewModel = viewModel,
            onBack = { viewModel.setTab(CustomerScreenTab.MY_NUMBERS) }
        )
        return
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // شريط العنوان العلوي لقسم الأرقام
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "أرقامي المسجلة",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = Navy900
                    )
                    Text(
                        text = "إدارة أرقام الهواتف وتجهيزها للحماية",
                        fontSize = 11.sp,
                        color = Slate600
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Navy900.copy(alpha = 0.08f))
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                ) {
                    Text(
                        text = "${uiState.numbers.size} أرقام",
                        color = Navy900,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // تنبيهات النجاح
            if (uiState.successMessage != null) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFDCFCE7))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = Emerald600,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = uiState.successMessage ?: "",
                            color = Color(0xFF15803D),
                            fontSize = 12.sp,
                            modifier = Modifier.weight(1f)
                        )
                        IconButton(
                            onClick = viewModel::dismissFeedback,
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "إغلاق",
                                tint = Emerald600,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }

            // تنبيهات الخطأ السطحية (عند وجود أرقام بالفعل)
            if (uiState.errorMessage != null && uiState.numbers.isNotEmpty()) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFEE2E2))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = null,
                            tint = Red600,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = uiState.errorMessage ?: "",
                            color = Red600,
                            fontSize = 12.sp,
                            modifier = Modifier.weight(1f)
                        )
                        IconButton(
                            onClick = viewModel::dismissFeedback,
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "إغلاق",
                                tint = Red600,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }

            // زر إضافة رقم هاتف جديد
            Button(
                onClick = { viewModel.setTab(CustomerScreenTab.ADD_NUMBER) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(46.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Emerald600)
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "إضافة رقم هاتف جديد",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // شريط البحث والتصفية
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = viewModel::onSearchQueryChanged,
                placeholder = { Text("بحث في الأرقام أو الملاحظات...", fontSize = 12.sp) },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "بحث",
                        tint = Slate700,
                        modifier = Modifier.size(18.dp)
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(10.dp),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(10.dp))

            // أزرار تصفية المشغلين (الكل، يمن موبايل، يو، سبأفون، واي)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                val filters = listOf(
                    null to "الكل",
                    "YM" to "يمن موبايل",
                    "YOU" to "يو",
                    "SABAFON" to "سبأفون",
                    "Y" to "واي"
                )

                filters.forEach { (code, label) ->
                    val selected = uiState.selectedCompanyFilter == code
                    FilterChip(
                        selected = selected,
                        onClick = { viewModel.onCompanyFilterSelected(code) },
                        label = { Text(label, fontSize = 11.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Navy900,
                            selectedLabelColor = Color.White,
                            containerColor = Color.White,
                            labelColor = Slate700
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // معالجة حالات الواجهة: تحميل، خطأ، حالة فارغة، أو قائمة الأرقام
            when {
                uiState.isLoading && uiState.numbers.isEmpty() -> {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CircularProgressIndicator(
                                color = Emerald600,
                                modifier = Modifier.size(36.dp),
                                strokeWidth = 3.dp
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "جاري تحميل أرقامك...",
                                color = Slate600,
                                fontSize = 12.sp
                            )
                        }
                    }
                }

                // حالة الخطأ عند فشل الجلب وعدم وجود أرقام
                uiState.errorMessage != null && uiState.numbers.isEmpty() -> {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        shape = RoundedCornerShape(14.dp),
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
                                imageVector = Icons.Default.Warning,
                                contentDescription = null,
                                tint = Red600,
                                modifier = Modifier.size(40.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "تعذر تحميل قائمة الأرقام",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = Navy900
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = uiState.errorMessage ?: "حدث خطأ في الاتصال بقاعدة البيانات",
                                fontSize = 12.sp,
                                color = Slate600,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = { viewModel.loadData(user.id) },
                                colors = ButtonDefaults.buttonColors(containerColor = Navy900),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("إعادة المحاولة", color = Color.White, fontSize = 13.sp)
                            }
                        }
                    }
                }

                // حالة القائمة الفارغة بالكامل
                uiState.numbers.isEmpty() -> {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(60.dp)
                                    .background(Slate100, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.PhoneAndroid,
                                    contentDescription = null,
                                    tint = Color(0xFF94A3B8),
                                    modifier = Modifier.size(32.dp)
                                )
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "لا توجد أرقام مسجلة حتى الآن",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = Slate900
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "أضف أرقام هواتفك المحمولة للبدء في إدارتها وطلب الحماية لها.",
                                fontSize = 12.sp,
                                color = Slate700,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(horizontal = 16.dp),
                                lineHeight = 18.sp
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = { viewModel.setTab(CustomerScreenTab.ADD_NUMBER) },
                                colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("إضافة رقم جديد الآن", color = Color.White, fontSize = 13.sp)
                            }
                        }
                    }
                }

                // حالة عدم وجود نتائج بعد البحث أو التصفية
                uiState.filteredNumbers.isEmpty() -> {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Text(
                                text = "لا توجد نتائج مطابقة للبحث",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = Slate900
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "جرب البحث برقم آخر أو إلغاء تصفية المشغل.",
                                fontSize = 12.sp,
                                color = Slate600
                            )
                        }
                    }
                }

                // عرض القائمة الحقيقية للأرقام
                else -> {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(
                            items = uiState.filteredNumbers,
                            key = { it.id }
                        ) { item ->
                            NumberItemCard(
                                number = item,
                                onClick = { viewModel.selectNumberForDetails(item) },
                                onEditNotes = { viewModel.selectNumberForDetails(item) },
                                onDelete = { viewModel.deleteNumber(item.id) }
                            )
                        }
                    }
                }
            }
        }

        // نافذة عرض التفاصيل وتعديل الملاحظات وفق CUS-02
        if (uiState.selectedNumberDetails != null) {
            val currentNumber = uiState.selectedNumberDetails!!
            val relatedReqs = requests.filter { it.customerNumberId == currentNumber.id }
            val relatedProts = protections.filter { it.customerNumberId == currentNumber.id }

            NumberDetailsDialog(
                number = currentNumber,
                notesText = uiState.editingNotesText,
                onNotesChanged = viewModel::onEditingNotesChanged,
                onSaveNotes = viewModel::saveNotes,
                isUpdatingNotes = uiState.isUpdatingNotes,
                relatedRequests = relatedReqs,
                relatedProtections = relatedProts,
                onDelete = { viewModel.deleteNumber(currentNumber.id) },
                onRequestProtection = if (onRequestProtectionForNumber != null && !currentNumber.hasActiveProtection) {
                    {
                        viewModel.selectNumberForDetails(null)
                        onRequestProtectionForNumber(currentNumber)
                    }
                } else null,
                onDismiss = { viewModel.selectNumberForDetails(null) }
            )
        }
    }
}
