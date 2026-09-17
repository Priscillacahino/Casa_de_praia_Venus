package com.aistudio.venusbeachhouse.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.venusbeachhouse.data.HouseData
import com.aistudio.venusbeachhouse.ui.VenusUiState
import com.aistudio.venusbeachhouse.ui.VenusViewModel
import com.aistudio.venusbeachhouse.ui.theme.*

@Composable
fun HostAndContactView(
    viewModel: VenusViewModel,
    state: VenusUiState,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val house = HouseData.HOUSE_INFO

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text(
            text = "Anfitriã & Contato",
            style = MaterialTheme.typography.headlineMedium,
            color = StoneText
        )
        Text(
            text = "Fale diretamente com quem cuida com carinho de cada detalhe da sua estadia.",
            fontSize = 13.sp,
            color = StoneSubtext,
            modifier = Modifier.padding(top = 2.dp, bottom = 14.dp)
        )

        // Vênus Mascot Card
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = AmberContainer.copy(alpha = 0.5f)),
            border = CardDefaults.outlinedCardBorder(),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(68.dp)
                        .clip(CircleShape)
                        .border(2.dp, AmberPrimary, CircleShape)
                ) {
                    AssetImage(
                        assetPath = house.catProfileAsset,
                        contentDescription = "Vênus Mascote",
                        modifier = Modifier.fillMaxSize(),
                        shape = RoundedCornerShape(50)
                    )
                }
                Spacer(modifier = Modifier.width(14.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Vênus Astronauta 🐾🚀",
                        style = MaterialTheme.typography.titleMedium,
                        color = AmberDark,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Mascote & Anfitriã Oficial",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = StoneText
                    )
                    Text(
                        text = "A gatinha cósmica que inspira a paz, o descanso e as boas energias deste refúgio praiano!",
                        fontSize = 11.sp,
                        color = StoneSubtext,
                        lineHeight = 15.sp,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Co-Host Priscila Info & Quick Action Buttons
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = CardDefaults.outlinedCardBorder(),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text(
                    text = "Priscila Cahino",
                    style = MaterialTheme.typography.titleLarge,
                    color = StoneText
                )
                Text(
                    text = "Superhost e Anfitriã dedicada",
                    fontSize = 12.sp,
                    color = StoneSubtext
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Action grid: WhatsApp, Telefone, Instagram, Google Maps
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    ContactActionButton(
                        icon = Icons.Default.Chat,
                        label = "WhatsApp",
                        color = WhatsAppGreen,
                        modifier = Modifier.weight(1f),
                        onClick = {
                            val url = "https://api.whatsapp.com/send?phone=${house.whatsappNumber}&text=${Uri.encode("Olá Priscila! Gostaria de tirar dúvidas sobre a Vênus Beach House.")}"
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                            context.startActivity(intent)
                        }
                    )
                    ContactActionButton(
                        icon = Icons.Default.Phone,
                        label = "Ligar",
                        color = AmberDark,
                        modifier = Modifier.weight(1f),
                        onClick = {
                            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${house.whatsappNumber}"))
                            context.startActivity(intent)
                        }
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    ContactActionButton(
                        icon = Icons.Default.CameraAlt,
                        label = "@venuscasadepraiapb",
                        color = Color(0xFFC13584),
                        modifier = Modifier.weight(1f),
                        onClick = {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(house.instagramUrl))
                            context.startActivity(intent)
                        }
                    )
                    ContactActionButton(
                        icon = Icons.Default.Map,
                        label = "Ver no Maps",
                        color = OceanBlue,
                        modifier = Modifier.weight(1f),
                        onClick = {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(house.googleMapsUrl))
                            context.startActivity(intent)
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Message Inquiry Form
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = CardDefaults.outlinedCardBorder(),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text(
                    text = "Envie uma Mensagem",
                    style = MaterialTheme.typography.titleLarge,
                    color = StoneText
                )
                Text(
                    text = "Tem alguma dúvida específica sobre datas, fotos ou comodidades? Escreva para nós.",
                    fontSize = 12.sp,
                    color = StoneSubtext,
                    modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
                )

                if (state.contactSentSuccess) {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = AmberContainer,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = AmberDark)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Mensagem enviada com sucesso! Responderemos em breve.",
                                fontSize = 12.sp,
                                color = OnAmberContainer,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }

                OutlinedTextField(
                    value = state.contactName,
                    onValueChange = { viewModel.updateContactForm(it, state.contactEmail, state.contactPhone, state.contactMessage) },
                    label = { Text("Seu Nome") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = state.contactEmail,
                    onValueChange = { viewModel.updateContactForm(state.contactName, it, state.contactPhone, state.contactMessage) },
                    label = { Text("E-mail") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = state.contactPhone,
                    onValueChange = { viewModel.updateContactForm(state.contactName, state.contactEmail, it, state.contactMessage) },
                    label = { Text("Telefone / WhatsApp") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = state.contactMessage,
                    onValueChange = { viewModel.updateContactForm(state.contactName, state.contactEmail, state.contactPhone, it) },
                    label = { Text("Sua Mensagem ou Dúvida") },
                    minLines = 3,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

                Button(
                    onClick = { viewModel.submitContactMessage() },
                    colors = ButtonDefaults.buttonColors(containerColor = AmberPrimary),
                    shape = RoundedCornerShape(12.dp),
                    enabled = state.contactName.isNotBlank() && state.contactMessage.isNotBlank(),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(46.dp)
                        .testTag("send_contact_message_button")
                ) {
                    Icon(imageVector = Icons.AutoMirrored.Filled.Send, contentDescription = null, tint = Color.White)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Enviar Mensagem", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun ContactActionButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    color: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(12.dp),
        color = color.copy(alpha = 0.12f),
        border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.3f)),
        modifier = modifier.height(44.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxSize().padding(horizontal = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = label,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = color,
                maxLines = 1
            )
        }
    }
}
