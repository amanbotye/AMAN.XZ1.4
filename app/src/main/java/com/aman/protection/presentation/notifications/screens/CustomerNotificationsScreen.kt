package com.aman.protection.presentation.notifications.screens

import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.NotificationsNone
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aman.protection.domain.models.AmanNotification
import com.aman.protection.presentation.notifications.NotificationsViewModel
import com.aman.protection.presentation.theme.Amber500
import com.aman.protection.presentation.theme.Emerald600
import com.aman.protection.presentation.theme.Navy900
import com.aman.protection.presentation.theme.Slate100
import com.aman.protection.presentation.theme.Slate500
import com.aman.protection.presentation.theme.Slate600
import com.aman.protection.presentation.theme.Slate700
import com.aman.protection.presentation.theme.Slate900

@Composable
fun CustomerNotificationsScreen(
    userId: String,
    viewModel: NotificationsViewModel
) {
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(userId) {
        viewModel.loadClientNotifications(userId)
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
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "مركز الإشعارات",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Navy900
                    )
                    if (state.unreadCount > 0) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(Color(0xFFEF4444))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "${state.unreadCount} جديدة",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }
                Text(
                    text = "تنبيهات حالة الحمايات والتجديد وإنجاز المهام الدورية",
                    fontSize = 12.sp,
                    color = Slate600
                )
            }
            IconButton(onClick = { viewModel.loadClientNotifications(userId) }) {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "تحديث",
                    tint = Navy900
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
        } else if (state.notifications.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.NotificationsNone,
                        contentDescription = null,
                        tint = Slate500,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "لا توجد إشعارات حالياً",
                        fontSize = 14.sp,
                        color = Slate500
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(state.notifications) { notif ->
                    NotificationItemCard(
                        notification = notif,
                        onClick = {
                            if (!notif.isRead) {
                                viewModel.markClientNotificationAsRead(notif.id)
                            }
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
fun NotificationItemCard(
    notification: AmanNotification,
    onClick: () -> Unit
) {
    val (icon, iconColor) = when {
        notification.notificationType?.contains("approve", ignoreCase = true) == true ->
            Pair(Icons.Default.CheckCircle, Emerald600)
        notification.notificationType?.contains("reject", ignoreCase = true) == true ->
            Pair(Icons.Default.Warning, Color(0xFFEF4444))
        notification.notificationType?.contains("task", ignoreCase = true) == true ->
            Pair(Icons.Default.Shield, Navy900)
        else -> Pair(Icons.Default.Info, Amber500)
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (notification.isRead) Color.White else Color(0xFFF0FDF4)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = if (notification.isRead) 1.dp else 3.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.Top
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(iconColor.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconColor,
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = notification.title,
                        fontWeight = if (notification.isRead) FontWeight.SemiBold else FontWeight.Bold,
                        fontSize = 14.sp,
                        color = Navy900
                    )
                    if (!notification.isRead) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(Emerald600)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = notification.body,
                    fontSize = 12.sp,
                    color = Slate700,
                    lineHeight = 17.sp
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = notification.createdAt.take(16).replace("T", " "),
                    fontSize = 10.sp,
                    color = Slate500
                )
            }
        }
    }
}
