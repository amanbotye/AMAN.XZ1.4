package com.aman.protection.presentation.protection

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aman.protection.core.AmanResult
import com.aman.protection.data.repository.ProtectionPlanRepository
import com.aman.protection.data.repository.ProtectionRepository
import com.aman.protection.data.repository.ProtectionRequestRepository
import com.aman.protection.domain.models.CustomerNumber
import com.aman.protection.domain.models.PaymentMethod
import com.aman.protection.domain.models.Protection
import com.aman.protection.domain.models.ProtectionPlan
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class CustomerProtectionViewModel(
    private val protectionPlanRepository: ProtectionPlanRepository,
    private val protectionRequestRepository: ProtectionRequestRepository,
    private val protectionRepository: ProtectionRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CustomerProtectionUiState())
    val uiState: StateFlow<CustomerProtectionUiState> = _uiState.asStateFlow()

    init {
        loadBaseData()
    }

    fun loadBaseData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            // 1. جلب باقات الحماية
            protectionPlanRepository.fetchPlans()

            // 2. جلب طرق الدفع
            protectionPlanRepository.fetchPaymentMethods()

            // 3. جلب طلبات الحماية للعميل
            protectionRequestRepository.fetchCustomerRequests()

            // 4. جلب الحمايات النشطة
            protectionRepository.fetchCustomerProtections()

            _uiState.value = _uiState.value.copy(
                isLoading = false,
                allPlans = protectionPlanRepository.plansList.value,
                paymentMethods = protectionPlanRepository.paymentMethodsList.value,
                requests = protectionRequestRepository.customerRequests.value,
                protections = protectionRepository.customerProtections.value
            )
        }
    }

    fun setTab(tab: CustomerProtectionTab) {
        _uiState.value = _uiState.value.copy(
            currentTab = tab,
            errorMessage = null,
            successMessage = null,
            validationWarning = null
        )
    }

    /**
     * إعداد نموذج طلب حماية جديد لرقم معين مع فحص التعارض
     */
    fun startRequestForNumber(number: CustomerNumber) {
        val hasActive = protectionRepository.hasActiveProtectionForNumber(number.id)
        val hasPending = protectionRequestRepository.hasPendingRequestForNumber(number.id)

        val warning = when {
            hasActive -> "هذا الرقم محمي بالفعل بحماية نشطة ولا يحتاج لطلب حماية جديد."
            hasPending -> "يوجد طلب حماية قيد المراجعة لهذا الرقم حالياً. يرجى انتظار قرار الإدارة."
            else -> null
        }

        val availablePlans = protectionPlanRepository.getPlansForCompany(number.companyId)
        val defaultPlan = availablePlans.firstOrNull() ?: protectionPlanRepository.plansList.value.firstOrNull()
        val defaultPm = protectionPlanRepository.paymentMethodsList.value.firstOrNull()

        _uiState.value = _uiState.value.copy(
            selectedNumber = number,
            selectedPlan = defaultPlan,
            selectedPaymentMethod = defaultPm,
            transferReference = "",
            customerNote = "",
            validationWarning = warning,
            currentTab = CustomerProtectionTab.CREATE_REQUEST,
            errorMessage = null,
            successMessage = null
        )
    }

    /**
     * بدء عملية التجديد لحماية حالية (CUS-05)
     */
    fun startRenewalForProtection(protection: Protection) {
        val availablePlans = protectionPlanRepository.getPlansForCompany(protection.companyId)
        val defaultPlan = availablePlans.find { it.id == protection.packageId }
            ?: availablePlans.firstOrNull()
            ?: protectionPlanRepository.plansList.value.firstOrNull()
        val defaultPm = protectionPlanRepository.paymentMethodsList.value.firstOrNull()

        _uiState.value = _uiState.value.copy(
            selectedProtectionForRenewal = protection,
            selectedPlan = defaultPlan,
            selectedPaymentMethod = defaultPm,
            transferReference = "",
            customerNote = "",
            currentTab = CustomerProtectionTab.RENEWAL,
            errorMessage = null,
            successMessage = null
        )
    }

    fun onPlanSelected(plan: ProtectionPlan) {
        _uiState.value = _uiState.value.copy(selectedPlan = plan)
    }

    fun onPaymentMethodSelected(pm: PaymentMethod) {
        _uiState.value = _uiState.value.copy(selectedPaymentMethod = pm)
    }

    fun onTransferRefChanged(ref: String) {
        _uiState.value = _uiState.value.copy(transferReference = ref, errorMessage = null)
    }

    fun onCustomerNoteChanged(note: String) {
        _uiState.value = _uiState.value.copy(customerNote = note)
    }

    /**
     * إرسال طلب الحماية عبر rpc_create_protection_request
     */
    fun submitProtectionRequest() {
        val state = _uiState.value

        // إذا كان في وضع التجديد
        if (state.currentTab == CustomerProtectionTab.RENEWAL && state.selectedProtectionForRenewal != null) {
            submitRenewalRequest()
            return
        }

        val number = state.selectedNumber ?: return
        val plan = state.selectedPlan ?: return
        val pm = state.selectedPaymentMethod ?: return

        if (state.validationWarning != null) {
            _uiState.value = state.copy(errorMessage = state.validationWarning)
            return
        }

        if (state.transferReference.isBlank()) {
            _uiState.value = state.copy(errorMessage = "يرجى إدخال رقم مرجع الحوالة أو إشعار الإيداع")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSubmittingRequest = true, errorMessage = null)
            val result = protectionRequestRepository.createProtectionRequest(
                customerNumberId = number.id,
                packageId = plan.id,
                paymentMethodId = pm.id,
                transferReference = state.transferReference,
                customerNote = state.customerNote.takeIf { it.isNotBlank() }
            )

            when (result) {
                is AmanResult.Success -> {
                    loadBaseData()
                    _uiState.value = _uiState.value.copy(
                        isSubmittingRequest = false,
                        currentTab = CustomerProtectionTab.MY_REQUESTS,
                        successMessage = "تم إرسال طلب الحماية بنجاح، وهو الآن بحالة (قيد المراجعة PENDING) لدى الإدارة."
                    )
                }
                is AmanResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isSubmittingRequest = false,
                        errorMessage = result.error.messageAr
                    )
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isSubmittingRequest = false)
                }
            }
        }
    }

    /**
     * إرسال طلب التجديد لحماية نشطة (CUS-05) عبر rpc_create_renewal_request
     */
    fun submitRenewalRequest() {
        val state = _uiState.value
        val protection = state.selectedProtectionForRenewal ?: return
        val plan = state.selectedPlan ?: return
        val pm = state.selectedPaymentMethod ?: return

        if (state.transferReference.isBlank()) {
            _uiState.value = state.copy(errorMessage = "يرجى إدخال رقم مرجع الحوالة")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSubmittingRequest = true, errorMessage = null)
            val result = protectionRepository.createRenewalRequest(
                protectionId = protection.id,
                packageId = plan.id,
                paymentMethodId = pm.id,
                transferReference = state.transferReference,
                customerNote = state.customerNote.takeIf { it.isNotBlank() }
            )

            when (result) {
                is AmanResult.Success -> {
                    loadBaseData()
                    _uiState.value = _uiState.value.copy(
                        isSubmittingRequest = false,
                        currentTab = CustomerProtectionTab.MY_PROTECTIONS,
                        selectedProtectionForRenewal = null,
                        successMessage = "تم إرسال طلب التجديد بنجاح، وسيتم تمديد الحماية فور مراجعة الإدارة."
                    )
                }
                is AmanResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isSubmittingRequest = false,
                        errorMessage = result.error.messageAr
                    )
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isSubmittingRequest = false)
                }
            }
        }
    }

    fun dismissFeedback() {
        _uiState.value = _uiState.value.copy(successMessage = null, errorMessage = null)
    }
}
