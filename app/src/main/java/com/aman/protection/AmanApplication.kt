package com.aman.protection

import android.app.Application
import com.aman.protection.auth.repository.AuthRepository
import com.aman.protection.auth.repository.AuthRepositoryImpl
import com.aman.protection.data.repository.CustomerNumberRepository
import com.aman.protection.data.repository.CustomerNumberRepositoryImpl
import com.aman.protection.data.repository.CustomerRepository
import com.aman.protection.data.repository.CustomerRepositoryImpl
import com.aman.protection.data.repository.NotificationRepository
import com.aman.protection.data.repository.NotificationRepositoryImpl
import com.aman.protection.data.repository.PaymentMethodRepository
import com.aman.protection.data.repository.PaymentMethodRepositoryImpl
import com.aman.protection.data.repository.PaymentTaskRepository
import com.aman.protection.data.repository.PaymentTaskRepositoryImpl
import com.aman.protection.data.repository.ProtectionPlanRepository
import com.aman.protection.data.repository.ProtectionPlanRepositoryImpl
import com.aman.protection.data.repository.ProtectionRepository
import com.aman.protection.data.repository.ProtectionRepositoryImpl
import com.aman.protection.data.repository.ProtectionRequestRepository
import com.aman.protection.data.repository.ProtectionRequestRepositoryImpl
import com.aman.protection.data.repository.UserRepository
import com.aman.protection.data.repository.UserRepositoryImpl
import com.aman.protection.data.service.PhoneValidationService
import com.aman.protection.data.service.PhoneValidationServiceImpl
import com.aman.protection.navigation.AppNavigator

/**
 * نقطة انطلاق التطبيق وتثبيت الـ Service Locator / Dependency Graph
 */
class AmanApplication : Application() {

    lateinit var userRepository: UserRepository
        private set

    lateinit var authRepository: AuthRepository
        private set

    lateinit var phoneValidationService: PhoneValidationService
        private set

    lateinit var customerRepository: CustomerRepository
        private set

    lateinit var customerNumberRepository: CustomerNumberRepository
        private set

    lateinit var protectionPlanRepository: ProtectionPlanRepository
        private set

    lateinit var protectionRequestRepository: ProtectionRequestRepository
        private set

    lateinit var protectionRepository: ProtectionRepository
        private set

    lateinit var paymentMethodRepository: PaymentMethodRepository
        private set

    lateinit var paymentTaskRepository: PaymentTaskRepository
        private set

    lateinit var notificationRepository: NotificationRepository
        private set

    lateinit var adminManagementRepository: AdminManagementRepository
        private set

    lateinit var appNavigator: AppNavigator
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        userRepository = UserRepositoryImpl()
        authRepository = AuthRepositoryImpl(userRepository)
        phoneValidationService = PhoneValidationServiceImpl()
        customerRepository = CustomerRepositoryImpl()
        customerNumberRepository = CustomerNumberRepositoryImpl(phoneValidationService)
        protectionPlanRepository = ProtectionPlanRepositoryImpl()
        protectionRequestRepository = ProtectionRequestRepositoryImpl(protectionPlanRepository, customerNumberRepository)
        protectionRepository = ProtectionRepositoryImpl(customerNumberRepository)
        paymentMethodRepository = PaymentMethodRepositoryImpl()
        paymentTaskRepository = PaymentTaskRepositoryImpl(customerNumberRepository)
        notificationRepository = NotificationRepositoryImpl()
        adminManagementRepository = AdminManagementRepositoryImpl()
        appNavigator = AppNavigator()
    }

    companion object {
        lateinit var instance: AmanApplication
            private set
    }
}
