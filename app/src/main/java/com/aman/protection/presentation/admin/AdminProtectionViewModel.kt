package com.aman.protection.presentation.admin

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aman.protection.core.AmanResult
import com.aman.protection.data.repository.ProtectionRepository
import com.aman.protection.data.repository.ProtectionRequestRepository
import com.aman.protection.domain.models.Protection
import com.aman.protection.domain.models.ProtectionRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AdminProtectionUiState(
    val isLoading: Boolean = false,
    val pendingRequests: List<ProtectionRequest> = emptyList(),
    val allProtections: List<Protection> = emptyList(),
    val isProcessingAction: Boolean = false,
    val selectedRequestForReject: ProtectionRequest? = null,
    val rejectReasonText: String = "",
    val successMessage: String? = null,
    val errorMessage: String? = null
)

class AdminProtectionViewModel(
    private val protectionRequestRepository: ProtectionRequestRepository,
    private val protectionRepository: ProtectionRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminProtectionUiState())
    val uiState: StateFlow<AdminProtectionUiState> = _uiState.asStateFlow()

    init {
        loadAdminData()
    }

    fun loadAdminData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            protectionRequestRepository.fetchPendingRequestsAdmin()
            protectionRepository.fetchAllProtectionsAdmin()

            _uiState.value = _uiState.value.copy(
                isLoading = false,
                pendingRequests = protectionRequestRepository.pendingRequestsAdmin.value,
                allProtections = protectionRepository.customerProtections.value
            )
        }
    }

    /**
     * قبول واعتماد طلب الحماية عبر rpc_approve_protection_request
     */
    fun approveRequest(requestId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isProcessingAction = true, errorMessage = null)

            val result = protectionRequestRepository.approveRequest(requestId)

            when (result) {
                is AmanResult.Success -> {
                    loadAdminData()
                    _uiState.value = _uiState.value.copy(
                        isProcessingAction = false,
                        successMessage = "تم قبول طلب الحماية وتفعيل الحماية للرقم بنجاح."
                    )
                }
                is AmanResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isProcessingAction = false,
                        errorMessage = result.error.messageAr
                    )
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isProcessingAction = false)
                }
            }
        }
    }

    fun openRejectDialog(request: ProtectionRequest) {
        _uiState.value = _uiState.value.copy(
            selectedRequestForReject = request,
            rejectReasonText = ""
        )
    }

    fun closeRejectDialog() {
        _uiState.value = _uiState.value.copy(
            selectedRequestForReject = null,
            rejectReasonText = ""
        )
    }

    fun onRejectReasonChanged(reason: String) {
        _uiState.value = _uiState.value.copy(rejectReasonText = reason)
    }

    /**
     * رفض طلب الحماية عبر rpc_reject_protection_request مع تسجيل السبب
     */
    fun submitReject() {
        val selected = _uiState.value.selectedRequestForReject ?: return
        val reason = _uiState.value.rejectReasonText

        if (reason.isBlank()) {
            _uiState.value = _uiState.value.copy(errorMessage = "يرجى كتابة سبب رفض الطلب")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isProcessingAction = true, errorMessage = null)

            val result = protectionRequestRepository.rejectRequest(selected.id, reason)

            when (result) {
                is AmanResult.Success -> {
                    loadAdminData()
                    _uiState.value = _uiState.value.copy(
                        isProcessingAction = false,
                        selectedRequestForReject = null,
                        successMessage = "تم رفض طلب الحماية وتوثيق السبب في النظام."
                    )
                }
                is AmanResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isProcessingAction = false,
                        errorMessage = result.error.messageAr
                    )
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isProcessingAction = false)
                }
            }
        }
    }

    fun dismissFeedback() {
        _uiState.value = _uiState.value.copy(successMessage = null, errorMessage = null)
    }
}
