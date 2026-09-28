package com.aman.protection.presentation.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
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
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Email
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
 * شاشة المصادقة الرئيسية (تسجيل الدخول، إنشاء حساب، استعادة كلمة المرور)
 * مطابقة للمرجع الوظيفي AMAN.XZ.txt — البنود 1.4.1 و 1.4.2 و 1.4.3
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
                        .background(Navy900),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Security,
                        contentDescription = "شعار أمان",
                        tint = Amber500,
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
                    text = when (uiState.mode) {
                        AuthMode.LOGIN -> "تسجيل الدخول إلى حسابك في أمان"
                        AuthMode.SIGN_UP -> "إنشاء حساب عميل جديد"
                        AuthMode.FORGOT_PASSWORD -> "استعادة الوصول إلى حسابك"
                    },
                    color = Slate600,
                    fontSize = 13.sp,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(20.dp))

                // بطاقة رسائل النجاح العامة (مثل استعادة كلمة المرور)
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

                // بطاقة رسائل الخطأ العامة (فشل الاتصال، خطأ الخادم، الحساب موقوف)
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
                }
            }
        }
    }
}

/**
 * نموذج تسجيل الدخول — البند 1.4.1
 */
@Composable
private fun LoginForm(
    viewModel: AuthViewModel,
    uiState: AuthUiState
) {
    Column(modifier = Modifier.fillMaxWidth()) {
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

        Spacer(modifier = Modifier.height(10.dp))

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

        // رابط نسيت كلمة المرور
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End
        ) {
            TextButton(onClick = { viewModel.setMode(AuthMode.FORGOT_PASSWORD) }) {
                Text(
                    text = "نسيت كلمة المرور؟",
                    color = Slate700,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // زر الدخول
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
                    text = "تسجيل الدخول",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // الانتقال لإنشاء حساب جديد
        TextButton(
            onClick = { viewModel.setMode(AuthMode.SIGN_UP) },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "ليس لديك حساب؟ إنشاء حساب عميل جديد",
                color = Navy900,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

/**
 * نموذج إنشاء الحساب — البند 1.4.2
 */
@Composable
private fun SignUpForm(
    viewModel: AuthViewModel,
    uiState: AuthUiState
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        // الاسم الكامل
        OutlinedTextField(
            value = uiState.fullName,
            onValueChange = viewModel::onFullNameChanged,
            label = { Text("الاسم الكامل") },
            placeholder = { Text("الاسم الثلاثي أو الرباعي") },
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
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Navy900,
                focusedLabelColor = Navy900
            )
        )

        Spacer(modifier = Modifier.height(8.dp))

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

        Spacer(modifier = Modifier.height(8.dp))

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

        // زر إنشاء الحساب
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
                    text = "إنشاء الحساب",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // العودة لتسجيل الدخول
        TextButton(
            onClick = { viewModel.setMode(AuthMode.LOGIN) },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "لديك حساب بالفعل؟ تسجيل الدخول",
                color = Navy900,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

/**
 * نموذج استعادة كلمة المرور — البند 1.4.3
 */
@Composable
private fun ForgotPasswordForm(
    viewModel: AuthViewModel,
    uiState: AuthUiState
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "أدخل بريدك الإلكتروني المسجل في النظام وسنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك.",
            color = Slate600,
            fontSize = 12.sp,
            lineHeight = 18.sp,
            textAlign = TextAlign.Start,
            modifier = Modifier.padding(bottom = 12.dp)
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

        // زر إرسال الرابط
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
                    text = "إرسال رابط الاستعادة",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // العودة لتسجيل الدخول
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
