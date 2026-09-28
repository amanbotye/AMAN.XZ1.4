package com.aman.protection.presentation.customer

import com.aman.protection.data.service.PhoneDetectionResult
import com.aman.protection.domain.models.Customer
import com.aman.protection.domain.models.CustomerNumber

enum class CustomerScreenTab {
    MY_NUMBERS,
    ADD_NUMBER
}

/**
 * حالة واجهة العميل (إدارة الأرقام + الملف الشخصي والحساب)
 */
data class CustomerUiState(
    val isLoading: Boolean = false,
    val customer: Customer? = null,
    val numbers: List<CustomerNumber> = emptyList(),
    val filteredNumbers: List<CustomerNumber> = emptyList(),
    val currentTab: CustomerScreenTab = CustomerScreenTab.MY_NUMBERS,
    val searchQuery: String = "",
    val selectedCompanyFilter: String? = null,

    // Add Number state
    val phoneInput: String = "",
    val detectionResult: PhoneDetectionResult? = null,
    val isSubmittingAdd: Boolean = false,
    val addSuccessId: String? = null,

    // Details & Notes state
    val selectedNumberDetails: CustomerNumber? = null,
    val isUpdatingNotes: Boolean = false,
    val editingNotesText: String = "",

    // Account / Profile edit state
    val editFullName: String = "",
    val isSavingProfile: Boolean = false,
    val profileErrorMessage: String? = null,
    val profileSuccessMessage: String? = null,

    // Feedback
    val successMessage: String? = null,
    val errorMessage: String? = null
)
