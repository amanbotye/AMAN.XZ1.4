package com.aman.protection.presentation.tasks

import com.aman.protection.domain.models.PaymentTask
import com.aman.protection.domain.models.TaskStatus

enum class TaskFilterTab(val labelAr: String) {
    ALL("الكل"),
    DUE("المستحقة"),
    OVERDUE("المتأخرة"),
    UPCOMING("المجدولة"),
    COMPLETED("المكتملة")
}

data class AdminTasksUiState(
    val isLoading: Boolean = false,
    val tasks: List<PaymentTask> = emptyList(),
    val selectedFilter: TaskFilterTab = TaskFilterTab.ALL,
    val searchQuery: String = "",
    val errorMessage: String? = null,
    val successMessage: String? = null,
    // نوافذ الحوار (Dialogs)
    val executingTask: PaymentTask? = null,
    val executionNote: String = "",
    val isExecuting: Boolean = false,
    val reschedulingTask: PaymentTask? = null,
    val rescheduleNewDate: String = "",
    val rescheduleReason: String = "",
    val isRescheduling: Boolean = false
) {
    val filteredTasks: List<PaymentTask>
        get() {
            var list = when (selectedFilter) {
                TaskFilterTab.ALL -> tasks
                TaskFilterTab.DUE -> tasks.filter { it.status == TaskStatus.DUE || it.status == TaskStatus.DUE_SOON }
                TaskFilterTab.OVERDUE -> tasks.filter { it.status == TaskStatus.OVERDUE }
                TaskFilterTab.UPCOMING -> tasks.filter { it.status == TaskStatus.UPCOMING }
                TaskFilterTab.COMPLETED -> tasks.filter { it.status == TaskStatus.COMPLETED }
            }

            if (searchQuery.isNotBlank()) {
                val q = searchQuery.trim()
                list = list.filter {
                    (it.phoneNumber?.contains(q) == true) ||
                    (it.companyName?.contains(q) == true) ||
                    (it.taskNumber.toString() == q)
                }
            }
            return list
        }

    val dueCount: Int get() = tasks.count { it.status == TaskStatus.DUE || it.status == TaskStatus.DUE_SOON }
    val overdueCount: Int get() = tasks.count { it.status == TaskStatus.OVERDUE }
    val upcomingCount: Int get() = tasks.count { it.status == TaskStatus.UPCOMING }
    val completedCount: Int get() = tasks.count { it.status == TaskStatus.COMPLETED }
}
