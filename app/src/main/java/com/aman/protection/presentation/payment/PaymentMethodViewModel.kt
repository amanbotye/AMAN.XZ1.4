package com.aman.protection.presentation.payment

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aman.protection.core.AmanResult
import com.aman.protection.data.repository.PaymentMethodRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class PaymentMethodViewModel(
    private val paymentMethodRepository: PaymentMethodRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(PaymentMethodUiState())
    val uiState: StateFlow<PaymentMethodUiState> = _uiState.asStateFlow()

    fun loadPaymentMethods(forceRefresh: Boolean = false) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            when (val result = paymentMethodRepository.getPaymentMethods(forceRefresh)) {
                is AmanResult.Success -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            paymentMethods = result.data,
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

    fun setCopied(accountIdentifier: String) {
        _uiState.update { it.copy(copiedAccountId = accountIdentifier) }
    }
}
