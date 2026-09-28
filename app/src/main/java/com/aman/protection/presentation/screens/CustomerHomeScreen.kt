package com.aman.protection.presentation.screens

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import com.aman.protection.data.models.UserDto
import com.aman.protection.data.models.toDomain
import com.aman.protection.presentation.customer.CustomerViewModel
import com.aman.protection.presentation.customer.screens.CustomerNumbersScreen

@Composable
fun CustomerHomeScreen(
    user: UserDto,
    customerViewModel: CustomerViewModel,
    onSignOut: () -> Unit
) {
    val domainUser = user.toDomain()

    LaunchedEffect(user.id) {
        customerViewModel.loadData(user.id)
    }

    CustomerNumbersScreen(
        user = domainUser,
        viewModel = customerViewModel,
        onSignOut = onSignOut
    )
}
