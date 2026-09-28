package com.aman.protection.presentation.protection

import com.aman.protection.domain.models.CustomerNumber
import com.aman.protection.domain.models.PaymentMethod
import com.aman.protection.domain.models.Protection
import com.aman.protection.domain.models.ProtectionPlan
import com.aman.protection.domain.models.ProtectionRequest

enum class CustomerProtectionTab {
    MY_PROTECTIONS,
    MY_REQUESTS,
    PLANS_CATALOG,
    CREATE_REQUEST,
    RENEWAL
}

data class CustomerProtectionUiState(
    val isLoading: Boolean = false,
    val currentTab: CustomerProtectionTab = CustomerProtectionTab.MY_PROTECTIONS,
    // Plans and Payment Methods
    val allPlans: List<ProtectionPlan> = emptyList(),
    val paymentMethods: List<PaymentMethod> = emptyList(),
    // Customer Numbers (اختيار الرقم للطلب CUS-03)
    val customerNumbers: List<CustomerNumber> = emptyList(),
    // Customer Requests & Protections
    val requests: List<ProtectionRequest> = emptyList(),
    val protections: List<Protection> = emptyList(),
    // New Request Form State (CUS-03)
    val selectedNumber: CustomerNumber? = null,
    val selectedPlan: ProtectionPlan? = null,
    val selectedPaymentMethod: PaymentMethod? = null,
    val transferReference: String = "",
    val customerNote: String = "",
    val isSubmittingRequest: Boolean = false,
    // Renewal State (CUS-05)
    val selectedProtectionForRenewal: Protection? = null,
    // Validation Alert
    val validationWarning: String? = null,
    // Feedback
    val successMessage: String? = null,
    val errorMessage: String? = null
)
