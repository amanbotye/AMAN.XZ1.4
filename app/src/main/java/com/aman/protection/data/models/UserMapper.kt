package com.aman.protection.data.models

import com.aman.protection.domain.models.Customer
import com.aman.protection.domain.models.User
import com.aman.protection.domain.models.UserStatus as DomainUserStatus
import com.aman.protection.domain.models.UserType as DomainUserType

fun UserDto.toDomain(): User = User(
    id = id,
    email = email,
    username = username,
    fullName = fullName,
    userType = when (userType) {
        UserType.ADMIN -> DomainUserType.ADMIN
        UserType.CUSTOMER -> DomainUserType.CUSTOMER
    },
    status = when (status) {
        UserStatus.ACTIVE -> DomainUserStatus.ACTIVE
        UserStatus.SUSPENDED -> DomainUserStatus.SUSPENDED
        UserStatus.DISABLED -> DomainUserStatus.DISABLED
    },
    isDeleted = isDeleted,
    createdAt = createdAt,
    updatedAt = updatedAt
)

fun User.toCustomer(totalNumbers: Int = 0, activeProtections: Int = 0): Customer = Customer(
    user = this,
    totalNumbersCount = totalNumbers,
    activeProtectionsCount = activeProtections
)
