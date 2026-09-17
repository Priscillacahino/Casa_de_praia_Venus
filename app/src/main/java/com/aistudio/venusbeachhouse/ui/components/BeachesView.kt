package com.aistudio.venusbeachhouse.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Directions
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.venusbeachhouse.data.HouseData
import com.aistudio.venusbeachhouse.model.BeachItem
import com.aistudio.venusbeachhouse.ui.theme.*

@Composable
fun BeachesView(
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text(
            text = "Praias de Conde & Região",
            style = MaterialTheme.typography.headlineMedium,
            color = StoneText
        )
        Text(
            text = "Conde possui o litoral mais exuberante da Paraíba com falésias coloridas e águas mornas cristalinas.",
            fontSize = 13.sp,
            color = StoneSubtext,
            modifier = Modifier.padding(top = 2.dp, bottom = 14.dp)
        )

        // Featured Beaches with photos
        HouseData.BEACHES.forEach { beach ->
            BeachCard(beach = beach)
            Spacer(modifier = Modifier.height(14.dp))
        }

        Spacer(modifier = Modifier.height(6.dp))

        // Other nearby beaches list
        Text(
            text = "Outras Praias e Atrações Próximas",
            style = MaterialTheme.typography.titleLarge,
            color = StoneText
        )
        Spacer(modifier = Modifier.height(10.dp))

        HouseData.OTHER_BEACHES.forEach { guide ->
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = CardDefaults.outlinedCardBorder(),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .background(OceanLight, RoundedCornerShape(12.dp))
                            .padding(horizontal = 8.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = guide.distance,
                            color = OceanDark,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = guide.name,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = StoneText
                        )
                        Text(
                            text = guide.description,
                            fontSize = 12.sp,
                            color = StoneSubtext
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

@Composable
fun BeachCard(beach: BeachItem) {
    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = CardDefaults.outlinedCardBorder(),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(170.dp)
            ) {
                AssetImage(
                    assetPath = beach.assetPath,
                    contentDescription = beach.name,
                    modifier = Modifier.fillMaxSize(),
                    shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
                )

                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = OceanBlue,
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(12.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Directions,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = beach.distance,
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = beach.name,
                    style = MaterialTheme.typography.titleLarge,
                    color = StoneText
                )
                Text(
                    text = beach.description,
                    fontSize = 13.sp,
                    color = StoneSubtext,
                    modifier = Modifier.padding(top = 4.dp, bottom = 10.dp)
                )

                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    beach.highlights.forEach { tag ->
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = AmberContainer,
                            modifier = Modifier.padding(bottom = 4.dp)
                        ) {
                            Text(
                                text = tag,
                                color = OnAmberContainer,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
