package com.aman.protection.presentation.payment

import com.aman.protection.domain.models.PaymentMethod

data class PaymentMethodUiState(
    val isLoading: Boolean = false,
    val paymentMethods: List<PaymentMethod> = emptyList(),
    val errorMessage: String? = null,
    val copiedAccountId: String? = null
)
