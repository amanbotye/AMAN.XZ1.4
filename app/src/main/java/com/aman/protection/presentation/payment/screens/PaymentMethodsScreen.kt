package com.aman.protection.presentation.payment.screens

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aman.protection.domain.models.PaymentMethod
import com.aman.protection.presentation.payment.PaymentMethodViewModel
import com.aman.protection.presentation.theme.Amber500
import com.aman.protection.presentation.theme.Emerald600
import com.aman.protection.presentation.theme.Navy900
import com.aman.protection.presentation.theme.Slate100
import com.aman.protection.presentation.theme.Slate200
import com.aman.protection.presentation.theme.Slate500
import com.aman.protection.presentation.theme.Slate600
import com.aman.protection.presentation.theme.Slate700
import com.aman.protection.presentation.theme.Slate900

@Composable
fun PaymentMethodsScreen(
    viewModel: PaymentMethodViewModel
) {
    val state by viewModel.uiState.collectAsState()
    val clipboardManager = LocalClipboardManager.current

    LaunchedEffect(Unit) {
        viewModel.loadPaymentMethods()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        // رأس الشاشة
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "طرق الدفع والتحويل المعتمدة",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Navy900
                )
                Text(
                    text = "حسابات الخدمة الرسمية لتحويل رسوم الحماية والتجديد",
                    fontSize = 12.sp,
                    color = Slate600
                )
            }
            IconButton(
                onClick = { viewModel.loadPaymentMethods(forceRefresh = true) }
            ) {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "تحديث",
                    tint = Navy900
                )
            }
        }

        // بطاقة تنبيه التعليمات
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp),
            shape = RoundedCornerShape(10.dp),
            colors = CardDefaults.cardColors(containerColor = Slate100)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Info,
                    contentDescription = null,
                    tint = Amber500,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = "هام: بعد إتمام الحوالة، يرجى الاحتفاظ برقم المرجع أو إشعار التحويل لتدوينه في طلب الحماية أو التجديد ليتم تدقيقه واعتماده.",
                    fontSize = 12.sp,
                    color = Slate700,
                    lineHeight = 18.sp
                )
            }
        }

        if (state.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Emerald600)
            }
        } else if (state.paymentMethods.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "لا توجد طرق دفع متاحة حالياً",
                    fontSize = 14.sp,
                    color = Slate500
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(state.paymentMethods) { method ->
                    PaymentMethodItemCard(
                        method = method,
                        isCopied = state.copiedAccountId == method.accountIdentifier,
                        onCopyAccount = { id ->
                            clipboardManager.setText(AnnotatedString(id))
                            viewModel.setCopied(id)
                        }
                    )
                }
                item {
                    Spacer(modifier = Modifier.height(24.dp))
                }
            }
        }
    }
}

@Composable
fun PaymentMethodItemCard(
    method: PaymentMethod,
    isCopied: Boolean,
    onCopyAccount: (String) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .clip(CircleShape)
                        .background(Emerald600.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.AccountBalance,
                        contentDescription = null,
                        tint = Emerald600,
                        modifier = Modifier.size(22.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = method.nameAr,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Navy900
                    )
                    if (method.nameEn.isNotBlank()) {
                        Text(
                            text = method.nameEn,
                            fontSize = 12.sp,
                            color = Slate500
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // الحساب والمستفيد
            if (!method.accountIdentifier.isNullOrBlank()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Slate100)
                        .padding(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "رقم الحساب / المحفظة",
                                fontSize = 11.sp,
                                color = Slate500
                            )
                            Text(
                                text = method.accountIdentifier ?: "",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = Navy900
                            )
                            if (!method.accountName.isNullOrBlank()) {
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "اسم المستفيد: ${method.accountName}",
                                    fontSize = 12.sp,
                                    color = Slate700
                                )
                            }
                        }

                        OutlinedButton(
                            onClick = { onCopyAccount(method.accountIdentifier ?: "") },
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Icon(
                                imageVector = if (isCopied) Icons.Default.Check else Icons.Default.ContentCopy,
                                contentDescription = "نسخ",
                                tint = if (isCopied) Emerald600 else Navy900,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = if (isCopied) "تم النسخ" else "نسخ",
                                fontSize = 12.sp,
                                color = if (isCopied) Emerald600 else Navy900
                            )
                        }
                    }
                }
            }

            if (!method.instructions.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = method.instructions,
                    fontSize = 12.sp,
                    color = Slate600,
                    lineHeight = 17.sp
                )
            }
        }
    }
}
