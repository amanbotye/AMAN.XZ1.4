package com.aman.protection.presentation.admin.screens

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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.EditCalendar
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aman.protection.domain.models.PaymentTask
import com.aman.protection.domain.models.TaskStatus
import com.aman.protection.presentation.tasks.AdminTasksUiState
import com.aman.protection.presentation.tasks.AdminTasksViewModel
import com.aman.protection.presentation.tasks.TaskFilterTab
import com.aman.protection.presentation.theme.Amber500
import com.aman.protection.presentation.theme.Emerald600
import com.aman.protection.presentation.theme.Navy900
import com.aman.protection.presentation.theme.Slate100
import com.aman.protection.presentation.theme.Slate200
import com.aman.protection.presentation.theme.Slate500
import com.aman.protection.presentation.theme.Slate600
import com.aman.protection.presentation.theme.Slate700
import com.aman.protection.presentation.theme.Slate900

@Composable
fun AdminTasksScreen(
    viewModel: AdminTasksViewModel
) {
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadTasks()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        // رأس الشاشة
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "إدارة المهام التشغيلية والمالية",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Navy900
                )
                Text(
                    text = "متابعة تنفيذ المهام وتوثيق المصروفات والجدولة التلقائية",
                    fontSize = 12.sp,
                    color = Slate600
                )
            }
            IconButton(onClick = { viewModel.loadTasks() }) {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "تحديث",
                    tint = Navy900
                )
            }
        }

        // شريط البحث
        OutlinedTextField(
            value = state.searchQuery,
            onValueChange = { viewModel.setSearchQuery(it) },
            placeholder = { Text("بحث برقم الهاتف أو الشركة...", fontSize = 13.sp) },
            leadingIcon = {
                Icon(Icons.Default.Search, contentDescription = null, tint = Slate500, modifier = Modifier.size(20.dp))
            },
            trailingIcon = {
                if (state.searchQuery.isNotBlank()) {
                    IconButton(onClick = { viewModel.setSearchQuery("") }) {
                        Icon(Icons.Default.Close, contentDescription = "مسح", tint = Slate500, modifier = Modifier.size(18.dp))
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 10.dp),
            shape = RoundedCornerShape(10.dp),
            singleLine = true
        )

        // شرائح التصفية (Filter Chips)
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(TaskFilterTab.values()) { tab ->
                val count = when (tab) {
                    TaskFilterTab.ALL -> state.tasks.size
                    TaskFilterTab.DUE -> state.dueCount
                    TaskFilterTab.OVERDUE -> state.overdueCount
                    TaskFilterTab.UPCOMING -> state.upcomingCount
                    TaskFilterTab.COMPLETED -> state.completedCount
                }
                FilterChip(
                    selected = state.selectedFilter == tab,
                    onClick = { viewModel.setFilter(tab) },
                    label = {
                        Text("${tab.labelAr} ($count)", fontSize = 12.sp)
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = Navy900,
                        selectedLabelColor = Color.White
                    )
                )
            }
        }

        // رسائل النجاح أو الخطأ
        if (!state.successMessage.isNullOrBlank()) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 10.dp),
                shape = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(containerColor = Emerald600.copy(alpha = 0.1f))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Emerald600, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = state.successMessage ?: "", fontSize = 12.sp, color = Emerald600, modifier = Modifier.weight(1f))
                    IconButton(onClick = { viewModel.clearMessages() }, modifier = Modifier.size(20.dp)) {
                        Icon(Icons.Default.Close, contentDescription = null, tint = Emerald600, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }

        if (!state.errorMessage.isNullOrBlank()) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 10.dp),
                shape = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFEE2E2))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Warning, contentDescription = null, tint = Color(0xFFDC2626), modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = state.errorMessage ?: "", fontSize = 12.sp, color = Color(0xFFDC2626), modifier = Modifier.weight(1f))
                    IconButton(onClick = { viewModel.clearMessages() }, modifier = Modifier.size(20.dp)) {
                        Icon(Icons.Default.Close, contentDescription = null, tint = Color(0xFFDC2626), modifier = Modifier.size(16.dp))
                    }
                }
            }
        }

        // قائمة المهام
        if (state.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Emerald600)
            }
        } else if (state.filteredTasks.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "لا توجد مهام مطابقة للتصفية المحددة",
                    fontSize = 14.sp,
                    color = Slate500
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(state.filteredTasks) { task ->
                    AdminTaskItemCard(
                        task = task,
                        onExecuteClick = { viewModel.openExecuteDialog(task) },
                        onRescheduleClick = { viewModel.openRescheduleDialog(task) }
                    )
                }
                item {
                    Spacer(modifier = Modifier.height(24.dp))
                }
            }
        }
    }

    // نافذة تأكيد تنفيذ المهمة التشغيلية
    if (state.executingTask != null) {
        val task = state.executingTask!!
        AlertDialog(
            onDismissRequest = { viewModel.closeExecuteDialog() },
            title = {
                Text("توثيق تنفيذ المهمة التشغيلية #${task.taskNumber}", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            },
            text = {
                Column {
                    Text(
                        text = "الرقم: ${task.phoneNumber ?: "غير محدد"}",
                        fontSize = 13.sp,
                        color = Slate700
                    )
                    Text(
                        text = "المبلغ المسجل: ${task.formattedAmount}",
                        fontSize = 13.sp,
                        color = Slate700
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "سيؤدي التنفيذ إلى تسجيل مصروف مالي وإنشاء المهمة الدورية التالية تلقائياً إذا كانت ضمن فترة الحماية.",
                        fontSize = 12.sp,
                        color = Slate500
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = state.executionNote,
                        onValueChange = { viewModel.setExecutionNote(it) },
                        label = { Text("ملاحظات التنفيذ (اختياري)", fontSize = 12.sp) },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 3
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { viewModel.executeCurrentTask() },
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                    enabled = !state.isExecuting
                ) {
                    if (state.isExecuting) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(16.dp))
                    } else {
                        Text("تأكيد التنفيذ", color = Color.White)
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.closeExecuteDialog() }) {
                    Text("إلغاء")
                }
            }
        )
    }

    // نافذة إعادة جدولة المهمة
    if (state.reschedulingTask != null) {
        val task = state.reschedulingTask!!
        AlertDialog(
            onDismissRequest = { viewModel.closeRescheduleDialog() },
            title = {
                Text("إعادة جدولة المهمة #${task.taskNumber}", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            },
            text = {
                Column {
                    Text(
                        text = "تاريخ الاستحقاق الحالي: ${task.dueAt.take(10)}",
                        fontSize = 13.sp,
                        color = Slate700
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = state.rescheduleNewDate,
                        onValueChange = { viewModel.setRescheduleDate(it) },
                        label = { Text("التاريخ الجديد (YYYY-MM-DD)", fontSize = 12.sp) },
                        placeholder = { Text("2026-10-15") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = state.rescheduleReason,
                        onValueChange = { viewModel.setRescheduleReason(it) },
                        label = { Text("سبب إعادة الجدولة", fontSize = 12.sp) },
                        placeholder = { Text("طلب العميل / عطل فني في المشغل...") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 2
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { viewModel.submitReschedule() },
                    colors = ButtonDefaults.buttonColors(containerColor = Navy900),
                    enabled = !state.isRescheduling
                ) {
                    if (state.isRescheduling) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(16.dp))
                    } else {
                        Text("حفظ الجدولة", color = Color.White)
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.closeRescheduleDialog() }) {
                    Text("إلغاء")
                }
            }
        )
    }
}

@Composable
fun AdminTaskItemCard(
    task: PaymentTask,
    onExecuteClick: () -> Unit,
    onRescheduleClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            // شريط العنوان والشارة
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(Navy900.copy(alpha = 0.1f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "#${task.taskNumber}",
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            color = Navy900
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = task.phoneNumber ?: "رقم غير محدد",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = Navy900
                        )
                        if (!task.companyName.isNullOrBlank()) {
                            Text(
                                text = task.companyName,
                                fontSize = 11.sp,
                                color = Slate500
                            )
                        }
                    }
                }

                // شارة الحالة
                TaskStatusBadge(status = task.status)
            }

            Spacer(modifier = Modifier.height(10.dp))

            // تفاصيل التواريخ والمبلغ
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(Slate100)
                    .padding(10.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(text = "تاريخ الاستحقاق", fontSize = 11.sp, color = Slate500)
                    Text(
                        text = task.dueAt.take(10),
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 12.sp,
                        color = Navy900
                    )
                }
                Column {
                    Text(text = "قيمة المهمة", fontSize = 11.sp, color = Slate500)
                    Text(
                        text = task.formattedAmount,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 12.sp,
                        color = Emerald600
                    )
                }
                Column {
                    Text(text = "الدورية", fontSize = 11.sp, color = Slate500)
                    Text(
                        text = "كل ${task.sourceTaskIntervalDays} يوم",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 12.sp,
                        color = Slate700
                    )
                }
            }

            if (task.status == TaskStatus.COMPLETED && !task.executionNote.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "ملاحظة التنفيذ: ${task.executionNote}",
                    fontSize = 11.sp,
                    color = Slate600
                )
            }

            // أزرار العمليات إذا كانت المهمة غير مكتملة
            if (task.isExecutable) {
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    OutlinedButton(
                        onClick = onRescheduleClick,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.height(34.dp)
                    ) {
                        Icon(Icons.Default.EditCalendar, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "إعادة جدولة", fontSize = 11.sp)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = onExecuteClick,
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                        modifier = Modifier.height(34.dp)
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color.White)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "تنفيذ المهمة", fontSize = 11.sp, color = Color.White)
                    }
                }
            }
        }
    }
}

@Composable
fun TaskStatusBadge(status: TaskStatus) {
    val (bgColor, textColor) = when (status) {
        TaskStatus.UPCOMING -> Pair(Color(0xFFE2E8F0), Color(0xFF475569))
        TaskStatus.DUE_SOON -> Pair(Color(0xFFFEF3C7), Color(0xFFD97706))
        TaskStatus.DUE -> Pair(Color(0xFFFDE68A), Color(0xFFB45309))
        TaskStatus.OVERDUE -> Pair(Color(0xFFFEE2E2), Color(0xFFDC2626))
        TaskStatus.COMPLETED -> Pair(Color(0xFFD1FAE5), Color(0xFF059669))
        TaskStatus.CANCELLED -> Pair(Color(0xFFF1F5F9), Color(0xFF64748B))
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(
            text = status.labelAr,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = textColor
        )
    }
}
