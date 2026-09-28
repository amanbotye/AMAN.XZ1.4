package com.aman.protection.presentation.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aman.protection.presentation.auth.AuthMode
import com.aman.protection.presentation.auth.AuthUiState
import com.aman.protection.presentation.auth.AuthViewModel
import com.aman.protection.presentation.theme.Amber500
import com.aman.protection.presentation.theme.Emerald600
import com.aman.protection.presentation.theme.Navy900
import com.aman.protection.presentation.theme.Red600
import com.aman.protection.presentation.theme.Slate100
import com.aman.protection.presentation.theme.Slate50
import com.aman.protection.presentation.theme.Slate500
import com.aman.protection.presentation.theme.Slate600
import com.aman.protection.presentation.theme.Slate700
import com.aman.protection.presentation.theme.Slate900

/**
 * شاشة المصادقة الرئيسية والحسابات (Android Native Jetpack Compose):
 * - AUTH-01: تسجيل الدخول (البريد الإلكتروني أو اسم المستخدم + كلمة المرور)
 * - ADM-LOGIN: طبقة دخول الإدارة والتحقق الصارم من الحساب الإداري
 * - AUTH-02: إنشاء حساب (الاسم، اسم المستخدم، البريد، كلمة المرور وتأكيدها)
 * - AUTH-03: استعادة كلمة المرور
 * - AUTH-04: تغيير كلمة المرور
 */
@Composable
fun AuthScreen(viewModel: AuthViewModel) {
    val uiState by viewModel.uiState.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate50)
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState()),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // الشعار والهوية البصرية
                Box(
                    modifier = Modifier
                        .size(60.dp)
                        .clip(CircleShape)
                        .background(if (uiState.isAdminLogin && uiState.isLoginMode) Amber500 else Navy900),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (uiState.isAdminLogin && uiState.isLoginMode) Icons.Default.AdminPanelSettings else Icons.Default.Security,
                        contentDescription = "شعار أمان",
                        tint = if (uiState.isAdminLogin && uiState.isLoginMode) Navy900 else Amber500,
                        modifier = Modifier.size(34.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "AMAN — أمان",
                    color = Navy900,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = when {
                        uiState.isLoginMode && uiState.isAdminLogin -> "بوابة دخول إدارة النظام (ADM-LOGIN)"
                        uiState.isLoginMode -> "تسجيل الدخول إلى حسابك في أمان"
                        uiState.isSignUpMode -> "إنشاء حساب عميل جديد"
                        uiState.isForgotPasswordMode -> "استعادة كلمة المرور"
                        uiState.isChangePasswordMode -> "تغيير كلمة المرور الخاصة بحسابك"
                        else -> "تسجيل الدخول"
                    },
                    color = if (uiState.isAdminLogin && uiState.isLoginMode) Amber500 else Slate600,
                    fontSize = 13.sp,
                    fontWeight = if (uiState.isAdminLogin && uiState.isLoginMode) FontWeight.Bold else FontWeight.Normal,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(20.dp))

                // بطاقة رسائل النجاح العامة (مثل استعادة كلمة المرور أو إنشاء الحساب)
                AnimatedVisibility(
                    visible = !uiState.successMessage.isNullOrBlank(),
                    enter = fadeIn(),
                    exit = fadeOut()
                ) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFDCFCE7))
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = Emerald600,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = uiState.successMessage ?: "",
                                color = Color(0xFF15803D),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }

                // بطاقة رسائل الخطأ العامة (فشل الاتصال، خطأ الخادم، الحساب موقوف، رفض غير الإداري)
                AnimatedVisibility(
                    visible = !uiState.generalError.isNullOrBlank(),
                    enter = fadeIn(),
                    exit = fadeOut()
                ) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp),
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFEE2E2))
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = null,
                                tint = Red600,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = uiState.generalError ?: "",
                                color = Red600,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }

                // حقول النموذج حسب الوضع
                when (uiState.mode) {
                    AuthMode.LOGIN -> LoginForm(viewModel = viewModel, uiState = uiState)
                    AuthMode.SIGN_UP -> SignUpForm(viewModel = viewModel, uiState = uiState)
                    AuthMode.FORGOT_PASSWORD -> ForgotPasswordForm(viewModel = viewModel, uiState = uiState)
                    AuthMode.CHANGE_PASSWORD -> ChangePasswordForm(viewModel = viewModel, uiState = uiState)
                }
            }
        }
    }
}

/**
 * نموذج تسجيل الدخول — البند 1.4.1 (AUTH-01) مع طبقة ADM-LOGIN لدخول الإدارة
 */
@Composable
private fun LoginForm(
    viewModel: AuthViewModel,
    uiState: AuthUiState
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        // مفتاح التبديل بين دخول العميل ودخول الإدارة (ADM-LOGIN كطبقة من AUTH-01)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp)
                .background(Slate100, RoundedCornerShape(10.dp))
                .padding(4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (!uiState.isAdminLogin) Navy900 else Color.Transparent)
                    .clickable { viewModel.setAdminLogin(false) }
                    .padding(vertical = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = null,
                        tint = if (!uiState.isAdminLogin) Color.White else Slate600,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "دخول العميل",
                        color = if (!uiState.isAdminLogin) Color.White else Slate700,
                        fontSize = 12.sp,
                        fontWeight = if (!uiState.isAdminLogin) FontWeight.Bold else FontWeight.Medium
                    )
                }
            }

            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (uiState.isAdminLogin) Amber500 else Color.Transparent)
                    .clickable { viewModel.setAdminLogin(true) }
                    .padding(vertical = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.AdminPanelSettings,
                        contentDescription = null,
                        tint = if (uiState.isAdminLogin) Navy900 else Slate600,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "دخول الإدارة",
                        color = if (uiState.isAdminLogin) Navy900 else Slate700,
                        fontSize = 12.sp,
                        fontWeight = if (uiState.isAdminLogin) FontWeight.Bold else FontWeight.Medium
                    )
                }
            }
        }

        // البريد الإلكتروني أو اسم المستخدم
        OutlinedTextField(
            value = uiState.email,
            onValueChange = viewModel::onEmailChanged,
            label = { Text("البريد الإلكتروني أو اسم المستخدم") },
            placeholder = { Text("example@domain.com أو اسم المستخدم") },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Default.Email,
                    contentDescription = null,
                    tint = if (uiState.isAdminLogin) Amber500 else Slate500,
                    modifier = Modifier.size(20.dp)
                )
            },
            isError = uiState.emailError != null,
            supportingText = {
                if (uiState.emailError != null) {
                    Text(text = uiState.emailError, color = Red600, fontSize = 11.sp)
                }
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Email,
                imeAction = ImeAction.Next
            ),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = if (uiState.isAdminLogin) Amber500 else Navy900,
                focusedLabelColor = if (uiState.isAdminLogin) Amber500 else Navy900
            )
        )

        Spacer(modifier = Modifier.height(10.dp))

        // كلمة المرور
        OutlinedTextField(
            value = uiState.password,
            onValueChange = viewModel::onPasswordChanged,
            label = { Text("كلمة المرور") },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Default.Lock,
                    contentDescription = null,
                    tint = if (uiState.isAdminLogin) Amber500 else Slate500,
                    modifier = Modifier.size(20.dp)
                )
            },
            trailingIcon = {
                IconButton(onClick = viewModel::togglePasswordVisibility) {
                    Icon(
                        imageVector = if (uiState.isPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                        contentDescription = "إظهار/إخفاء كلمة المرور",
                        tint = Slate500,
                        modifier = Modifier.size(20.dp)
                    )
                }
            },
            visualTransformation = if (uiState.isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            isError = uiState.passwordError != null,
            supportingText = {
                if (uiState.passwordError != null) {
                    Text(text = uiState.passwordError, color = Red600, fontSize = 11.sp)
                }
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Done
            ),
            keyboardActions = KeyboardActions(onDone = { viewModel.submit() }),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = if (uiState.isAdminLogin) Amber500 else Navy900,
                focusedLabelColor = if (uiState.isAdminLogin) Amber500 else Navy900
            )
        )

        // رابط نسيت كلمة المرور (استعادة كلمة المرور AUTH-03)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End
        ) {
            TextButton(onClick = { viewModel.setMode(AuthMode.FORGOT_PASSWORD) }) {
                Text(
                    text = "استعادة كلمة المرور",
                    color = Slate700,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // زر الدخول (دخول / دخول الإدارة)
        Button(
            onClick = viewModel::submit,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = if (uiState.isAdminLogin) Amber500 else Emerald600
            ),
            enabled = !uiState.isLoading
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(22.dp),
                    color = if (uiState.isAdminLogin) Navy900 else Color.White,
                    strokeWidth = 2.dp
                )
            } else {
                Text(
                    text = if (uiState.isAdminLogin) "دخول الإدارة" else "دخول",
                    color = if (uiState.isAdminLogin) Navy900 else Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // الانتقال لإنشاء حساب جديد (AUTH-02) للعملاء فقط
        if (!uiState.isAdminLogin) {
            TextButton(
                onClick = { viewModel.setMode(AuthMode.SIGN_UP) },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "ليس لديك حساب؟ إنشاء حساب",
                    color = Navy900,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        } else {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Slate100),
                shape = RoundedCornerShape(8.dp)
            ) {
                Row(
                    modifier = Modifier.padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        tint = Slate600,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "الدخول الإداري مخصص للمشرفين والمدراء المعتمدين في النظام.",
                        color = Slate600,
                        fontSize = 11.sp
                    )
                }
            }
        }
    }
}

/**
 * نموذج إنشاء حساب عميل جديد — البند 1.4.2 (AUTH-02)
 * القيود المعتمدة في المصفوفة:
 * - لا يوجد رقم هاتف إلزامي
 * - لا يوجد OTP
 * - لا يوجد تحقق من ملكية رقم
 */
@Composable
private fun SignUpForm(
    viewModel: AuthViewModel,
    uiState: AuthUiState
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        // شارة توضيحية لعدم اشتراط رقم هاتف أو OTP
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFEFF6FF)),
            shape = RoundedCornerShape(8.dp)
        ) {
            Row(
                modifier = Modifier.padding(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Info,
                    contentDescription = null,
                    tint = Navy900,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "التسجيل مباشر بالبريد الإلكتروني — لا يشترط رقم هاتف أو OTP.",
                    color = Navy900,
                    fontSize = 11.sp
                )
            }
        }

        // الاسم الكامل
        OutlinedTextField(
            value = uiState.fullName,
            onValueChange = viewModel::onFullNameChanged,
            label = { Text("الاسم الكامل") },
            placeholder = { Text("أدخل اسمك الثلاثي أو الرباعي") },
            leadingIcon = {
                Icon(Icons.Default.Person, contentDescription = null, tint = Slate500, modifier = Modifier.size(20.dp))
            },
            isError = uiState.fullNameError != null,
            supportingText = {
                if (uiState.fullNameError != null) {
                    Text(text = uiState.fullNameError, color = Red600, fontSize = 11.sp)
                }
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Text,
                imeAction = ImeAction.Next
            ),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Navy900,
                focusedLabelColor = Navy900
            )
        )

        Spacer(modifier = Modifier.height(6.dp))

        // اسم المستخدم
        OutlinedTextField(
            value = uiState.username,
            onValueChange = viewModel::onUsernameChanged,
            label = { Text("اسم المستخدم (Username)") },
            placeholder = { Text("username_123") },
            leadingIcon = {
                Icon(Icons.Default.Person, contentDescription = null, tint = Slate500, modifier = Modifier.size(20.dp))
            },
            isError = uiState.usernameError != null,
            supportingText = {
                if (uiState.usernameError != null) {
                    Text(text = uiState.usernameError, color = Red600, fontSize = 11.sp)
                } else {
                    Text("أحرف وأرقام إنجليزية فقط (3-30 حرف)", color = Slate500, fontSize = 10.sp)
                }
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Ascii,
                imeAction = ImeAction.Next
            ),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Navy900,
                focusedLabelColor = Navy900
            )
        )

        Spacer(modifier = Modifier.height(6.dp))

        // البريد الإلكتروني
        OutlinedTextField(
            value = uiState.email,
            onValueChange = viewModel::onEmailChanged,
            label = { Text("البريد الإلكتروني") },
            placeholder = { Text("example@domain.com") },
            leadingIcon = {
                Icon(Icons.Default.Email, contentDescription = null, tint = Slate500, modifier = Modifier.size(20.dp))
            },
            isError = uiState.emailError != null,
            supportingText = {
                if (uiState.emailError != null) {
                    Text(text = uiState.emailError, color = Red600, fontSize = 11.sp)
                }
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Email,
                imeAction = ImeAction.Next
            ),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Navy900,
                focusedLabelColor = Navy900
            )
        )

        Spacer(modifier = Modifier.height(6.dp))

        // كلمة المرور
        OutlinedTextField(
            value = uiState.password,
            onValueChange = viewModel::onPasswordChanged,
            label = { Text("كلمة المرور") },
            leadingIcon = {
                Icon(Icons.Default.Lock, contentDescription = null, tint = Slate500, modifier = Modifier.size(20.dp))
            },
            trailingIcon = {
                IconButton(onClick = viewModel::togglePasswordVisibility) {
                    Icon(
                        imageVector = if (uiState.isPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                        contentDescription = "إظهار/إخفاء كلمة المرور",
                        tint = Slate500,
                        modifier = Modifier.size(20.dp)
                    )
                }
            },
            visualTransformation = if (uiState.isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            isError = uiState.passwordError != null,
            supportingText = {
                if (uiState.passwordError != null) {
                    Text(text = uiState.passwordError, color = Red600, fontSize = 11.sp)
                } else {
                    Text("لا تقل عن 6 أحرف", color = Slate500, fontSize = 10.sp)
                }
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Next
            ),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Navy900,
                focusedLabelColor = Navy900
            )
        )

        Spacer(modifier = Modifier.height(6.dp))

        // تأكيد كلمة المرور
        OutlinedTextField(
            value = uiState.confirmPassword,
            onValueChange = viewModel::onConfirmPasswordChanged,
            label = { Text("تأكيد كلمة المرور") },
            leadingIcon = {
                Icon(Icons.Default.Lock, contentDescription = null, tint = Slate500, modifier = Modifier.size(20.dp))
            },
            trailingIcon = {
                IconButton(onClick = viewModel::toggleConfirmPasswordVisibility) {
                    Icon(
                        imageVector = if (uiState.isConfirmPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                        contentDescription = "إظهار/إخفاء تأكيد كلمة المرور",
                        tint = Slate500,
                        modifier = Modifier.size(20.dp)
                    )
                }
            },
            visualTransformation = if (uiState.isConfirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            isError = uiState.confirmPasswordError != null,
            supportingText = {
                if (uiState.confirmPasswordError != null) {
                    Text(text = uiState.confirmPasswordError, color = Red600, fontSize = 11.sp)
                }
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Done
            ),
            keyboardActions = KeyboardActions(onDone = { viewModel.submit() }),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Navy900,
                focusedLabelColor = Navy900
            )
        )

        Spacer(modifier = Modifier.height(16.dp))

        // زر إنشاء حساب
        Button(
            onClick = viewModel::submit,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
            enabled = !uiState.isLoading
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(22.dp),
                    color = Color.White,
                    strokeWidth = 2.dp
                )
            } else {
                Text(
                    text = "إنشاء حساب",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // زر العودة إلى تسجيل الدخول
        TextButton(
            onClick = { viewModel.setMode(AuthMode.LOGIN) },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "العودة إلى تسجيل الدخول",
                color = Navy900,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

/**
 * نموذج استعادة كلمة المرور — البند 1.4.3 (AUTH-03)
 */
@Composable
private fun ForgotPasswordForm(
    viewModel: AuthViewModel,
    uiState: AuthUiState
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "أدخل بريدك الإلكتروني المسجل في أمان وسنرسل إليك رابطاً فورياً لإعادة تعيين كلمة المرور.",
            color = Slate600,
            fontSize = 12.sp,
            lineHeight = 18.sp,
            textAlign = TextAlign.Start,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // البريد الإلكتروني
        OutlinedTextField(
            value = uiState.email,
            onValueChange = viewModel::onEmailChanged,
            label = { Text("البريد الإلكتروني") },
            placeholder = { Text("example@domain.com") },
            leadingIcon = {
                Icon(Icons.Default.Email, contentDescription = null, tint = Slate500, modifier = Modifier.size(20.dp))
            },
            isError = uiState.emailError != null,
            supportingText = {
                if (uiState.emailError != null) {
                    Text(text = uiState.emailError, color = Red600, fontSize = 11.sp)
                }
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Email,
                imeAction = ImeAction.Done
            ),
            keyboardActions = KeyboardActions(onDone = { viewModel.submit() }),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Navy900,
                focusedLabelColor = Navy900
            )
        )

        Spacer(modifier = Modifier.height(16.dp))

        // زر إرسال طلب الاستعادة
        Button(
            onClick = viewModel::submit,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Navy900),
            enabled = !uiState.isLoading
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(22.dp),
                    color = Color.White,
                    strokeWidth = 2.dp
                )
            } else {
                Text(
                    text = "إرسال طلب الاستعادة",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // العودة إلى تسجيل الدخول
        TextButton(
            onClick = { viewModel.setMode(AuthMode.LOGIN) },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "العودة إلى تسجيل الدخول",
                color = Navy900,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

/**
 * نموذج تغيير كلمة المرور — البند 1.4.4 (AUTH-04)
 */
@Composable
private fun ChangePasswordForm(
    viewModel: AuthViewModel,
    uiState: AuthUiState
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "قم بتعيين كلمة مرور جديدة لحسابك. يجب ألا تقل عن 6 أحرف أو أرقام.",
            color = Slate600,
            fontSize = 12.sp,
            lineHeight = 18.sp,
            textAlign = TextAlign.Start,
            modifier = Modifier.padding(bottom = 12.dp)
        )

        // كلمة المرور الحالية (عند طلبها)
        OutlinedTextField(
            value = uiState.currentPassword,
            onValueChange = viewModel::onCurrentPasswordChanged,
            label = { Text("كلمة المرور الحالية (عند طلبها)") },
            placeholder = { Text("أدخل كلمة المرور الحالية") },
            leadingIcon = {
                Icon(Icons.Default.Lock, contentDescription = null, tint = Slate500, modifier = Modifier.size(20.dp))
            },
            trailingIcon = {
                IconButton(onClick = viewModel::toggleCurrentPasswordVisibility) {
                    Icon(
                        imageVector = if (uiState.isCurrentPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                        contentDescription = "إظهار/إخفاء كلمة المرور الحالية",
                        tint = Slate500,
                        modifier = Modifier.size(20.dp)
                    )
                }
            },
            visualTransformation = if (uiState.isCurrentPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            isError = uiState.currentPasswordError != null,
            supportingText = {
                if (uiState.currentPasswordError != null) {
                    Text(text = uiState.currentPasswordError, color = Red600, fontSize = 11.sp)
                }
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Next
            ),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Navy900,
                focusedLabelColor = Navy900
            )
        )

        Spacer(modifier = Modifier.height(8.dp))

        // كلمة المرور الجديدة
        OutlinedTextField(
            value = uiState.newPassword,
            onValueChange = viewModel::onNewPasswordChanged,
            label = { Text("كلمة المرور الجديدة") },
            placeholder = { Text("كلمة المرور الجديدة") },
            leadingIcon = {
                Icon(Icons.Default.Lock, contentDescription = null, tint = Slate500, modifier = Modifier.size(20.dp))
            },
            trailingIcon = {
                IconButton(onClick = viewModel::toggleNewPasswordVisibility) {
                    Icon(
                        imageVector = if (uiState.isNewPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                        contentDescription = "إظهار/إخفاء كلمة المرور الجديدة",
                        tint = Slate500,
                        modifier = Modifier.size(20.dp)
                    )
                }
            },
            visualTransformation = if (uiState.isNewPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            isError = uiState.newPasswordError != null,
            supportingText = {
                if (uiState.newPasswordError != null) {
                    Text(text = uiState.newPasswordError, color = Red600, fontSize = 11.sp)
                } else {
                    Text("لا تقل عن 6 أحرف أو أرقام", color = Slate500, fontSize = 10.sp)
                }
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Next
            ),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Navy900,
                focusedLabelColor = Navy900
            )
        )

        Spacer(modifier = Modifier.height(8.dp))

        // تأكيد كلمة المرور الجديدة
        OutlinedTextField(
            value = uiState.confirmNewPassword,
            onValueChange = viewModel::onConfirmNewPasswordChanged,
            label = { Text("تأكيد كلمة المرور الجديدة") },
            placeholder = { Text("إعادة إدخال كلمة المرور الجديدة") },
            leadingIcon = {
                Icon(Icons.Default.Lock, contentDescription = null, tint = Slate500, modifier = Modifier.size(20.dp))
            },
            trailingIcon = {
                IconButton(onClick = viewModel::toggleConfirmNewPasswordVisibility) {
                    Icon(
                        imageVector = if (uiState.isConfirmNewPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                        contentDescription = "إظهار/إخفاء تأكيد كلمة المرور الجديدة",
                        tint = Slate500,
                        modifier = Modifier.size(20.dp)
                    )
                }
            },
            visualTransformation = if (uiState.isConfirmNewPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            isError = uiState.confirmNewPasswordError != null,
            supportingText = {
                if (uiState.confirmNewPasswordError != null) {
                    Text(text = uiState.confirmNewPasswordError, color = Red600, fontSize = 11.sp)
                }
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Done
            ),
            keyboardActions = KeyboardActions(onDone = { viewModel.submit() }),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Navy900,
                focusedLabelColor = Navy900
            )
        )

        Spacer(modifier = Modifier.height(16.dp))

        // زر الحفظ
        Button(
            onClick = viewModel::submit,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
            enabled = !uiState.isLoading
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(22.dp),
                    color = Color.White,
                    strokeWidth = 2.dp
                )
            } else {
                Text(
                    text = "حفظ",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // العودة إلى تسجيل الدخول
        TextButton(
            onClick = { viewModel.setMode(AuthMode.LOGIN) },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "العودة إلى تسجيل الدخول",
                color = Navy900,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}
