package com.aman.protection.presentation.customer

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aman.protection.core.AmanResult
import com.aman.protection.data.repository.CustomerNumberRepository
import com.aman.protection.data.repository.CustomerRepository
import com.aman.protection.data.service.PhoneValidationService
import com.aman.protection.domain.models.CustomerNumber
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel المخصص لإدارة هوية العميل وأرقام الهواتف
 * وفق متطلبات المرحلة الثانية من AMAN.XZ.txt
 */
class CustomerViewModel(
    private val customerRepository: CustomerRepository,
    private val customerNumberRepository: CustomerNumberRepository,
    private val phoneValidationService: PhoneValidationService
) : ViewModel() {

    private val _uiState = MutableStateFlow(CustomerUiState())
    val uiState: StateFlow<CustomerUiState> = _uiState.asStateFlow()

    init {
        observeNumbersList()
    }

    private fun observeNumbersList() {
        viewModelScope.launch {
            customerNumberRepository.numbersList.collect { list ->
                val filtered = applyFilterAndSearch(list, _uiState.value.searchQuery, _uiState.value.selectedCompanyFilter)
                _uiState.value = _uiState.value.copy(
                    numbers = list,
                    filteredNumbers = filtered
                )
            }
        }
    }

    fun loadData(userId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)

            // 1. جلب بيانات العميل
            customerRepository.getCustomer(userId)

            // 2. جلب أرقام العميل
            when (val result = customerNumberRepository.fetchCustomerNumbers()) {
                is AmanResult.Success -> {
                    val filtered = applyFilterAndSearch(result.data, _uiState.value.searchQuery, _uiState.value.selectedCompanyFilter)
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        numbers = result.data,
                        filteredNumbers = filtered
                    )
                }
                is AmanResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = result.error.messageAr
                    )
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
            }
        }
    }

    fun setTab(tab: CustomerScreenTab) {
        _uiState.value = _uiState.value.copy(
            currentTab = tab,
            errorMessage = null,
            successMessage = null
        )
    }

    fun onSearchQueryChanged(query: String) {
        val filtered = applyFilterAndSearch(_uiState.value.numbers, query, _uiState.value.selectedCompanyFilter)
        _uiState.value = _uiState.value.copy(searchQuery = query, filteredNumbers = filtered)
    }

    fun onCompanyFilterSelected(companyCode: String?) {
        val filtered = applyFilterAndSearch(_uiState.value.numbers, _uiState.value.searchQuery, companyCode)
        _uiState.value = _uiState.value.copy(selectedCompanyFilter = companyCode, filteredNumbers = filtered)
    }

    /**
     * التحقق اللحظي من رقم الهاتف واستنتاج شركة الاتصالات والبادئة
     */
    fun onPhoneInputChanged(input: String) {
        val cleanDigits = input.filter { it.isDigit() }
        _uiState.value = _uiState.value.copy(
            phoneInput = cleanDigits,
            errorMessage = null,
            successMessage = null
        )

        viewModelScope.launch {
            if (cleanDigits.length >= 2) {
                val detection = phoneValidationService.detectAndValidate(cleanDigits)
                _uiState.value = _uiState.value.copy(detectionResult = detection)
            } else {
                _uiState.value = _uiState.value.copy(detectionResult = null)
            }
        }
    }

    /**
     * حفظ الرقم عبر العملية الموثوقة rpc_add_customer_number
     * (حفظ الرقم فقط دون إنشاء حماية تلقائيًا)
     */
    fun submitAddCustomerNumber() {
        val state = _uiState.value
        val detection = state.detectionResult

        if (detection == null || !detection.isValid) {
            _uiState.value = state.copy(
                errorMessage = detection?.errorMessageAr ?: "يرجى إدخال رقم هاتف صحيح مكون من 9 أرقام"
            )
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSubmittingAdd = true, errorMessage = null)

            val result = customerNumberRepository.addCustomerNumber(detection.normalizedNumber)

            when (result) {
                is AmanResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isSubmittingAdd = false,
                        phoneInput = "",
                        detectionResult = null,
                        currentTab = CustomerScreenTab.MY_NUMBERS,
                        successMessage = "تم حفظ الرقم بنجاح في حسابك، وأصبح جاهزًا لطلب الحماية.",
                        addSuccessId = result.data
                    )
                }
                is AmanResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isSubmittingAdd = false,
                        errorMessage = result.error.messageAr
                    )
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isSubmittingAdd = false)
                }
            }
        }
    }

    fun selectNumberForDetails(number: CustomerNumber?) {
        _uiState.value = _uiState.value.copy(
            selectedNumberDetails = number,
            editingNotesText = number?.notes ?: ""
        )
    }

    fun onEditingNotesChanged(text: String) {
        _uiState.value = _uiState.value.copy(editingNotesText = text)
    }

    fun saveNotes() {
        val selected = _uiState.value.selectedNumberDetails ?: return
        val notes = _uiState.value.editingNotesText

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isUpdatingNotes = true, errorMessage = null)

            when (val result = customerNumberRepository.updateNotes(selected.id, notes)) {
                is AmanResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isUpdatingNotes = false,
                        selectedNumberDetails = null,
                        successMessage = "تم تحديث ملاحظات الرقم بنجاح"
                    )
                }
                is AmanResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isUpdatingNotes = false,
                        errorMessage = result.error.messageAr
                    )
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isUpdatingNotes = false)
                }
            }
        }
    }

    fun deleteNumber(numberId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)

            when (val result = customerNumberRepository.deleteCustomerNumber(numberId)) {
                is AmanResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        selectedNumberDetails = null,
                        successMessage = "تم حذف الرقم من القائمة"
                    )
                }
                is AmanResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = result.error.messageAr
                    )
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
            }
        }
    }

    fun dismissFeedback() {
        _uiState.value = _uiState.value.copy(successMessage = null, errorMessage = null)
    }

    private fun applyFilterAndSearch(
        list: List<CustomerNumber>,
        query: String,
        companyCode: String?
    ): List<CustomerNumber> {
        return list.filter { item ->
            val matchesQuery = query.isBlank() ||
                item.phoneNumber.contains(query) ||
                item.normalizedPhoneNumber.contains(query) ||
                (item.notes?.contains(query, ignoreCase = true) == true)

            val matchesCompany = companyCode == null ||
                item.company?.code.equals(companyCode, ignoreCase = true) ||
                item.detectedPrefix.startsWith(companyCode)

            matchesQuery && matchesCompany
        }
    }
}
