package com.aistudio.venusbeachhouse.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.venusbeachhouse.data.HouseData
import com.aistudio.venusbeachhouse.ui.theme.*

@Composable
fun PropertyOverview(
    onOpenGallery: (Int) -> Unit,
    onNavigateToBooking: () -> Unit,
    onNavigateToRooms: () -> Unit,
    modifier: Modifier = Modifier
) {
    val house = HouseData.HOUSE_INFO

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        // Hero Image Card with Open Gallery Overlay
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(240.dp)
                .clickable { onOpenGallery(0) }
                .testTag("hero_photo_card")
        ) {
            Box(modifier = Modifier.fillMaxSize()) {
                AssetImage(
                    assetPath = house.heroMainAsset,
                    contentDescription = "Piscina em L e Churrasqueira na Vênus Beach House",
                    modifier = Modifier.fillMaxSize(),
                    shape = RoundedCornerShape(24.dp)
                )

                // Gallery count badge
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color.Black.copy(alpha = 0.7f),
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(14.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.PhotoLibrary,
                            contentDescription = "Fotos",
                            tint = Color.White,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "Ver todas as fotos (9)",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                // Superhost / Cat badge
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = AmberPrimary,
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(14.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                        Text(text = "⭐ 5.0", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Text(text = "• Refúgio em Conde - PB", color = Color.White, fontSize = 12.sp)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Property Title & Subtitle
        Text(
            text = house.name,
            style = MaterialTheme.typography.headlineMedium,
            color = StoneText
        )
        Text(
            text = house.tagline,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = AmberDark,
            modifier = Modifier.padding(top = 2.dp)
        )

        // Location line
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(top = 6.dp)
        ) {
            Icon(
                imageVector = Icons.Default.LocationOn,
                contentDescription = "Localização",
                tint = OceanBlue,
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = house.locationShort,
                fontSize = 13.sp,
                color = StoneSubtext
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Specs Row (Guests, bedrooms, beds, baths)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(Color.White)
                .border(1.dp, StoneBorder, RoundedCornerShape(16.dp))
                .padding(vertical = 12.dp, horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            SpecPill(icon = Icons.Default.Group, text = "${house.maxGuests} hóspedes")
            SpecPill(icon = Icons.Default.Bed, text = "${house.bedrooms} quartos")
            SpecPill(icon = Icons.Default.SingleBed, text = "${house.beds} camas")
            SpecPill(icon = Icons.Default.Bathtub, text = "${house.baths} banheiro")
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Quick Highlights Cards
        Text(
            text = "Destaques da Hospedagem",
            style = MaterialTheme.typography.titleLarge,
            color = StoneText
        )
        Spacer(modifier = Modifier.height(10.dp))

        HighlightItem(
            icon = Icons.Default.Pool,
            title = "Piscina Privativa em L & Churrasqueira",
            desc = "Área externa com piscina exclusiva, churrasqueira de tijolos, varanda colonial e plantas."
        )
        Spacer(modifier = Modifier.height(8.dp))

        HighlightItem(
            icon = Icons.Default.LaptopMac,
            title = "Home Office Completo",
            desc = "Quarto com mesa de trabalho, cadeira ergonômica, suporte para monitor e Wi-Fi de alta velocidade."
        )
        Spacer(modifier = Modifier.height(8.dp))

        HighlightItem(
            icon = Icons.Default.BeachAccess,
            title = "A Minutos das Melhores Praias",
            desc = "Perto de Tabatinga (5 min), Coqueirinho (8 min), Carapibus, Praia do Amor e Jacumã."
        )
        Spacer(modifier = Modifier.height(8.dp))

        HighlightItem(
            icon = Icons.Default.Pets,
            title = "Pet Friendly 🐾",
            desc = "Seu animalzinho de pequeno/médio porte é muito bem-vindo para curtir com você."
        )

        Spacer(modifier = Modifier.height(16.dp))

        // About Description Card
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = CardDefaults.outlinedCardBorder(),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Sobre o Refúgio",
                    style = MaterialTheme.typography.titleMedium,
                    color = StoneText
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = house.intro,
                    fontSize = 13.sp,
                    color = StoneSubtext,
                    lineHeight = 19.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = house.locationDetails,
                    fontSize = 13.sp,
                    color = StoneSubtext,
                    lineHeight = 19.sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onNavigateToRooms,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("tour_rooms_button")
                    ) {
                        Text("Ver Cômodos", fontSize = 12.sp)
                    }
                    Button(
                        onClick = onNavigateToBooking,
                        colors = ButtonDefaults.buttonColors(containerColor = AmberPrimary),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("simulate_booking_button")
                    ) {
                        Text("Simular Reserva", fontSize = 12.sp, color = Color.White)
                    }
                }
            }
        }
    }
}

@Composable
fun SpecPill(icon: ImageVector, text: String) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = AmberPrimary,
            modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = text,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = StoneText
        )
    }
}

@Composable
fun HighlightItem(
    icon: ImageVector,
    title: String,
    desc: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(1.dp, StoneBorder, RoundedCornerShape(16.dp))
            .padding(14.dp),
        verticalAlignment = Alignment.Top
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
                modifier = Modifier.size(20.dp)
            )
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = StoneText
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = desc,
                fontSize = 12.sp,
                color = StoneSubtext,
                lineHeight = 17.sp
            )
        }
    }
}
