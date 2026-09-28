package com.aman.protection.presentation.protection

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aman.protection.AmanApplication
import com.aman.protection.core.AmanResult
import com.aman.protection.data.repository.CustomerNumberRepository
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

/**
 * ViewModel المخصص لإدارة طلبات واشتراكات الحماية للعميل
 * وفق مصفوفة الشاشات: CUS-03 (طلبات الحماية) و CUS-04 (حماياتي) و CUS-05 (التجديد)
 */
class CustomerProtectionViewModel(
    private val protectionPlanRepository: ProtectionPlanRepository,
    private val protectionRequestRepository: ProtectionRequestRepository,
    private val protectionRepository: ProtectionRepository,
    private val customerNumberRepository: CustomerNumberRepository = AmanApplication.instance.customerNumberRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CustomerProtectionUiState())
    val uiState: StateFlow<CustomerProtectionUiState> = _uiState.asStateFlow()

    init {
        loadBaseData()
    }

    /**
     * تحميل البيانات التشغيلية للعميل من قاعدة البيانات الفعلية
     */
    fun loadBaseData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            // 1. جلب باقات الحماية
            protectionPlanRepository.fetchPlans()
            // 2. جلب طرق الدفع
            protectionPlanRepository.fetchPaymentMethods()
            // 3. جلب طلبات الحماية للعميل
            protectionRequestRepository.fetchCustomerRequests()
            // 4. جلب الحمايات النشطة
            protectionRepository.fetchCustomerProtections()
            // 5. جلب أرقام العميل لاختيار الرقم عند إنشاء طلب جديد
            customerNumberRepository.fetchCustomerNumbers()

            val numbers = customerNumberRepository.numbersList.value
            val plans = protectionPlanRepository.plansList.value
            val pms = protectionPlanRepository.paymentMethodsList.value
            val reqs = protectionRequestRepository.customerRequests.value
            val prots = protectionRepository.customerProtections.value

            _uiState.value = _uiState.value.copy(
                isLoading = false,
                allPlans = plans,
                paymentMethods = pms,
                customerNumbers = numbers,
                requests = reqs,
                protections = prots
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
     * فتح شاشة إنشاء طلب حماية جديد (CUS-03)
     */
    fun startNewRequest(number: CustomerNumber? = null) {
        val targetNumber = number ?: _uiState.value.customerNumbers.firstOrNull { !it.hasActiveProtection }
            ?: _uiState.value.customerNumbers.firstOrNull()

        if (targetNumber != null) {
            onSelectNumber(targetNumber)
        } else {
            val defaultPlan = _uiState.value.allPlans.firstOrNull()
            val defaultPm = _uiState.value.paymentMethods.firstOrNull()
            _uiState.value = _uiState.value.copy(
                selectedNumber = null,
                selectedPlan = defaultPlan,
                selectedPaymentMethod = defaultPm,
                transferReference = "",
                customerNote = "",
                validationWarning = null,
                currentTab = CustomerProtectionTab.CREATE_REQUEST,
                errorMessage = null,
                successMessage = null
            )
        }
    }

    /**
     * اختيار رقم هاتف لطلب الحماية مع فحص التعارض وفق المرجع
     */
    fun onSelectNumber(number: CustomerNumber) {
        val hasActive = protectionRepository.hasActiveProtectionForNumber(number.id) || number.hasActiveProtection
        val hasPending = protectionRequestRepository.hasPendingRequestForNumber(number.id)
        val warning = when {
            hasActive -> "هذا الرقم محمي بالفعل باشتراك نشط ولا يحتاج لطلب حماية جديد."
            hasPending -> "يوجد طلب حماية قيد المراجعة لهذا الرقم حالياً. يرجى انتظار قرار الإدارة."
            else -> null
        }

        val availablePlans = protectionPlanRepository.getPlansForCompany(number.companyId)
        val defaultPlan = availablePlans.firstOrNull() ?: _uiState.value.allPlans.firstOrNull()
        val defaultPm = _uiState.value.selectedPaymentMethod ?: _uiState.value.paymentMethods.firstOrNull()

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
            ?: _uiState.value.allPlans.firstOrNull()
        val defaultPm = _uiState.value.paymentMethods.firstOrNull()

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
     * - تحويل الطلب إلى قيد المراجعة (PENDING) بعد الإرسال
     * - عدم إنشاء حماية عند إنشاء الطلب
     */
    fun submitProtectionRequest() {
        val state = _uiState.value
        // إذا كان في وضع التجديد
        if (state.currentTab == CustomerProtectionTab.RENEWAL && state.selectedProtectionForRenewal != null) {
            submitRenewalRequest()
            return
        }

        val number = state.selectedNumber
        if (number == null) {
            _uiState.value = state.copy(errorMessage = "يرجى اختيار رقم الهاتف المراد حمايته")
            return
        }
        val plan = state.selectedPlan
        if (plan == null) {
            _uiState.value = state.copy(errorMessage = "يرجى اختيار باقة الحماية")
            return
        }
        val pm = state.selectedPaymentMethod
        if (pm == null) {
            _uiState.value = state.copy(errorMessage = "يرجى اختيار طريقة الدفع")
            return
        }

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
                transferReference = state.transferReference.trim(),
                customerNote = state.customerNote.trim().takeIf { it.isNotBlank() }
            )

            when (result) {
                is AmanResult.Success -> {
                    loadBaseData()
                    _uiState.value = _uiState.value.copy(
                        isSubmittingRequest = false,
                        currentTab = CustomerProtectionTab.MY_REQUESTS,
                        selectedNumber = null,
                        transferReference = "",
                        customerNote = "",
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
                transferReference = state.transferReference.trim(),
                customerNote = state.customerNote.trim().takeIf { it.isNotBlank() }
            )

            when (result) {
                is AmanResult.Success -> {
                    loadBaseData()
                    _uiState.value = _uiState.value.copy(
                        isSubmittingRequest = false,
                        currentTab = CustomerProtectionTab.MY_PROTECTIONS,
                        selectedProtectionForRenewal = null,
                        transferReference = "",
                        customerNote = "",
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
