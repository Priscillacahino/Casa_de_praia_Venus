package com.aistudio.venusbeachhouse.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.venusbeachhouse.data.HouseData
import com.aistudio.venusbeachhouse.model.AmenityCategory
import com.aistudio.venusbeachhouse.model.AmenityItem
import com.aistudio.venusbeachhouse.ui.theme.*

@Composable
fun AmenitiesView(
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text(
            text = "Comodidades & Infraestrutura",
            style = MaterialTheme.typography.headlineMedium,
            color = StoneText
        )
        Text(
            text = "Tudo o que você precisa para uma estadia inesquecível e sem preocupações.",
            fontSize = 13.sp,
            color = StoneSubtext,
            modifier = Modifier.padding(top = 2.dp, bottom = 14.dp)
        )

        HouseData.AMENITIES.forEach { category ->
            AmenityCategoryCard(category = category)
            Spacer(modifier = Modifier.height(14.dp))
        }
    }
}

@Composable
fun AmenityCategoryCard(category: AmenityCategory) {
    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = CardDefaults.outlinedCardBorder(),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = category.title,
                style = MaterialTheme.typography.titleMedium,
                color = AmberDark,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(12.dp))

            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                category.items.forEach { item ->
                    AmenityRow(item = item)
                }
            }
        }
    }
}

@Composable
fun AmenityRow(item: AmenityItem) {
    val icon = when (item.iconName) {
        "pool" -> Icons.Default.Pool
        "grill" -> Icons.Default.OutdoorGrill
        "hammock" -> Icons.Default.WbSunny
        "garden" -> Icons.Default.Spa
        "work" -> Icons.Default.LaptopMac
        "movie" -> Icons.Default.Videocam
        "wifi" -> Icons.Default.Wifi
        "bed" -> Icons.Default.SingleBed
        "kitchen" -> Icons.Default.Kitchen
        "car" -> Icons.Default.DirectionsCar
        "laundry" -> Icons.Default.LocalLaundryService
        "fan" -> Icons.Default.Air
        "pet" -> Icons.Default.Pets
        else -> Icons.Default.Check
    }

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth()
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(AmberContainer),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = AmberDark,
                modifier = Modifier.size(18.dp)
            )
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = item.name,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = StoneText
            )
            Text(
                text = item.desc,
                fontSize = 12.sp,
                color = StoneSubtext,
                lineHeight = 16.sp
            )
        }
    }
}
