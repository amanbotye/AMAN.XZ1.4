package com.aman.protection.presentation.tasks

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aman.protection.core.AmanResult
import com.aman.protection.data.repository.PaymentTaskRepository
import com.aman.protection.domain.models.PaymentTask
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class AdminTasksViewModel(
    private val paymentTaskRepository: PaymentTaskRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminTasksUiState())
    val uiState: StateFlow<AdminTasksUiState> = _uiState.asStateFlow()

    fun loadTasks() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            when (val result = paymentTaskRepository.fetchAllAdminTasks()) {
                is AmanResult.Success -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            tasks = result.data,
                            errorMessage = null
                        )
                    }
                }
                is AmanResult.Error -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = result.error.messageAr
                        )
                    }
                }
                else -> Unit
            }
        }
    }

    fun setFilter(tab: TaskFilterTab) {
        _uiState.update { it.copy(selectedFilter = tab) }
    }

    fun setSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    fun openExecuteDialog(task: PaymentTask) {
        _uiState.update {
            it.copy(
                executingTask = task,
                executionNote = "",
                errorMessage = null,
                successMessage = null
            )
        }
    }

    fun closeExecuteDialog() {
        _uiState.update { it.copy(executingTask = null, executionNote = "") }
    }

    fun setExecutionNote(note: String) {
        _uiState.update { it.copy(executionNote = note) }
    }

    fun executeCurrentTask() {
        val task = _uiState.value.executingTask ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isExecuting = true, errorMessage = null) }
            when (val result = paymentTaskRepository.executeTask(task.id, _uiState.value.executionNote)) {
                is AmanResult.Success -> {
                    _uiState.update {
                        it.copy(
                            isExecuting = false,
                            executingTask = null,
                            executionNote = "",
                            successMessage = "تم تنفيذ المهمة التشغيلية بنجاح وتسجيل القيد المالي والجدولة التالية"
                        )
                    }
                    loadTasks()
                }
                is AmanResult.Error -> {
                    _uiState.update {
                        it.copy(
                            isExecuting = false,
                            errorMessage = result.error.messageAr
                        )
                    }
                }
                else -> Unit
            }
        }
    }

    fun openRescheduleDialog(task: PaymentTask) {
        _uiState.update {
            it.copy(
                reschedulingTask = task,
                rescheduleNewDate = "",
                rescheduleReason = "",
                errorMessage = null,
                successMessage = null
            )
        }
    }

    fun closeRescheduleDialog() {
        _uiState.update {
            it.copy(
                reschedulingTask = null,
                rescheduleNewDate = "",
                rescheduleReason = ""
            )
        }
    }

    fun setRescheduleDate(date: String) {
        _uiState.update { it.copy(rescheduleNewDate = date) }
    }

    fun setRescheduleReason(reason: String) {
        _uiState.update { it.copy(rescheduleReason = reason) }
    }

    fun submitReschedule() {
        val task = _uiState.value.reschedulingTask ?: return
        val newDate = _uiState.value.rescheduleNewDate.trim()
        if (newDate.isBlank()) {
            _uiState.update { it.copy(errorMessage = "يرجى تحديد التاريخ الجديد للمهمة") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isRescheduling = true, errorMessage = null) }
            when (val result = paymentTaskRepository.rescheduleTask(task.id, newDate, _uiState.value.rescheduleReason)) {
                is AmanResult.Success -> {
                    _uiState.update {
                        it.copy(
                            isRescheduling = false,
                            reschedulingTask = null,
                            rescheduleNewDate = "",
                            rescheduleReason = "",
                            successMessage = "تمت إعادة جدولة المهمة وتحديث الخطط المستقبلية وتوثيق السجل"
                        )
                    }
                    loadTasks()
                }
                is AmanResult.Error -> {
                    _uiState.update {
                        it.copy(
                            isRescheduling = false,
                            errorMessage = result.error.messageAr
                        )
                    }
                }
                else -> Unit
            }
        }
    }

    fun clearMessages() {
        _uiState.update { it.copy(errorMessage = null, successMessage = null) }
    }
}
