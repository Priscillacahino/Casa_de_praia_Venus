package com.aistudio.venusbeachhouse.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
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
import com.aistudio.venusbeachhouse.model.PricingTier
import com.aistudio.venusbeachhouse.ui.VenusUiState
import com.aistudio.venusbeachhouse.ui.VenusViewModel
import com.aistudio.venusbeachhouse.ui.theme.*

@Composable
fun PricingBookingView(
    viewModel: VenusViewModel,
    state: VenusUiState,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text(
            text = "Tarifas & Simulador de Reserva",
            style = MaterialTheme.typography.headlineMedium,
            color = StoneText
        )
        Text(
            text = "Transparência total. Simule o valor exato da sua estadia e solicite sua data diretamente com a anfitriã.",
            fontSize = 13.sp,
            color = StoneSubtext,
            modifier = Modifier.padding(top = 2.dp, bottom = 14.dp)
        )

        // Interactive Booking Card
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = CardDefaults.outlinedCardBorder(),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("booking_simulator_card")
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Calculate,
                        contentDescription = null,
                        tint = AmberPrimary,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Simulador de Diárias",
                        style = MaterialTheme.typography.titleLarge,
                        color = StoneText
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Date Inputs
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = state.checkInDate,
                        onValueChange = { viewModel.setDates(it, state.checkOutDate) },
                        label = { Text("Check-in", fontSize = 12.sp) },
                        placeholder = { Text("dd/mm/aaaa") },
                        singleLine = true,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("check_in_input")
                    )
                    OutlinedTextField(
                        value = state.checkOutDate,
                        onValueChange = { viewModel.setDates(state.checkInDate, it) },
                        label = { Text("Check-out", fontSize = 12.sp) },
                        placeholder = { Text("dd/mm/aaaa") },
                        singleLine = true,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("check_out_input")
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Guests selector & Pet toggle
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "Hóspedes",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = StoneText
                        )
                        Text(
                            text = "Até 6 pessoas",
                            fontSize = 11.sp,
                            color = StoneSubtext
                        )
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        FilledTonalIconButton(
                            onClick = { viewModel.setGuests(state.guestsCount - 1) },
                            enabled = state.guestsCount > 1,
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(Icons.Default.Remove, contentDescription = "Diminuir")
                        }
                        Text(
                            text = "${state.guestsCount}",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = StoneText,
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )
                        FilledTonalIconButton(
                            onClick = { viewModel.setGuests(state.guestsCount + 1) },
                            enabled = state.guestsCount < HouseData.HOUSE_INFO.maxGuests,
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Aumentar")
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Pet friendly toggle
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(StoneSurfaceVariant)
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Pets,
                            contentDescription = null,
                            tint = AmberDark,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Levo pet de pequeno porte",
                            fontSize = 12.sp,
                            color = StoneText
                        )
                    }
                    Switch(
                        checked = state.hasPet,
                        onCheckedChange = { viewModel.setHasPet(it) },
                        modifier = Modifier.testTag("pet_switch")
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Breakdown of calculated quote
                state.quote?.let { quote ->
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(AmberContainer.copy(alpha = 0.5f))
                            .border(1.dp, AmberPrimary.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
                            .padding(16.dp)
                    ) {
                        Text(
                            text = "Resumo da Estadia (${quote.nights} noites)",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = OnAmberContainer
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        if (quote.weekdayNights > 0) {
                            QuoteRow(label = "${quote.weekdayNights}x diária semana (R$ 280)", value = "R$ ${quote.weekdayNights * 280}")
                        }
                        if (quote.weekendNights > 0) {
                            QuoteRow(label = "${quote.weekendNights}x diária fim de semana (R$ 350)", value = "R$ ${quote.weekendNights * 350}")
                        }
                        QuoteRow(label = "Taxa única de limpeza", value = "R$ ${quote.cleaningFee}")

                        Divider(modifier = Modifier.padding(vertical = 8.dp), color = AmberPrimary.copy(alpha = 0.2f))

                        QuoteRow(label = "Valor Total da Estadia", value = "R$ ${quote.total}", isBold = true)
                        QuoteRow(
                            label = "Sinal na Reserva (20%)",
                            value = "R$ ${quote.deposit}",
                            isBold = true,
                            highlightColor = AmberDark
                        )
                        Text(
                            text = "O saldo restante (80%) é pago no momento do check-in via Pix.",
                            fontSize = 11.sp,
                            color = StoneSubtext,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Action to send WhatsApp reservation request
                Button(
                    onClick = {
                        val message = viewModel.generateWhatsAppBookingMessage()
                        val url = "https://api.whatsapp.com/send?phone=${HouseData.HOUSE_INFO.whatsappNumber}&text=${Uri.encode(message)}"
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        context.startActivity(intent)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = WhatsAppGreen),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                        .testTag("whatsapp_booking_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Chat,
                        contentDescription = null,
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Solicitar Reserva via WhatsApp",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Pricing Tiers list
        Text(
            text = "Tabela de Temporadas",
            style = MaterialTheme.typography.titleLarge,
            color = StoneText
        )
        Spacer(modifier = Modifier.height(10.dp))

        HouseData.PRICING_TIERS.forEach { tier ->
            PricingTierCard(tier = tier)
            Spacer(modifier = Modifier.height(10.dp))
        }

        Spacer(modifier = Modifier.height(10.dp))

        // House rules
        Card(
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = CardDefaults.outlinedCardBorder(),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Regras e Condições",
                    style = MaterialTheme.typography.titleMedium,
                    color = StoneText
                )
                Spacer(modifier = Modifier.height(8.dp))
                BulletRule("Check-in a partir das 14:00h | Check-out até às 11:00h")
                BulletRule("Capacidade máxima de 6 hóspedes (incluindo crianças)")
                BulletRule("Garantia da data com 20% de sinal via Pix e restante na entrega das chaves")
                BulletRule("Taxa única de limpeza de R$ 150 por estadia")
                BulletRule("Permitido som ambiente respeitando o sossego da vizinhança")
            }
        }
    }
}

@Composable
fun QuoteRow(label: String, value: String, isBold: Boolean = false, highlightColor: Color? = null) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            fontSize = 12.sp,
            fontWeight = if (isBold) FontWeight.Bold else FontWeight.Normal,
            color = highlightColor ?: StoneText
        )
        Text(
            text = value,
            fontSize = 12.sp,
            fontWeight = if (isBold) FontWeight.Bold else FontWeight.SemiBold,
            color = highlightColor ?: StoneText
        )
    }
}

@Composable
fun PricingTierCard(tier: PricingTier) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (tier.highlight) AmberContainer.copy(alpha = 0.4f) else Color.White
        ),
        border = CardDefaults.outlinedCardBorder(),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = tier.season,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = StoneText
                )
                tier.badge?.let {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = AmberPrimary
                    ) {
                        Text(
                            text = it,
                            color = Color.White,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }
                }
            }
            Text(
                text = tier.period,
                fontSize = 12.sp,
                color = StoneSubtext,
                modifier = Modifier.padding(top = 2.dp)
            )

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Dias de Semana", fontSize = 11.sp, color = StoneSubtext)
                    Text("R$ ${tier.weekdayPrice}/noite", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = AmberDark)
                }
                Column {
                    Text("Fins de Semana", fontSize = 11.sp, color = StoneSubtext)
                    Text("R$ ${tier.weekendPrice}/noite", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = AmberDark)
                }
                Column {
                    Text("Mínimo", fontSize = 11.sp, color = StoneSubtext)
                    Text("${tier.minNights} noites", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = StoneText)
                }
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = tier.description,
                fontSize = 11.sp,
                color = StoneSubtext,
                lineHeight = 15.sp
            )
        }
    }
}

@Composable
fun BulletRule(text: String) {
    Row(
        modifier = Modifier.padding(vertical = 3.dp),
        verticalAlignment = Alignment.Top
    ) {
        Icon(
            imageVector = Icons.Default.Check,
            contentDescription = null,
            tint = AmberPrimary,
            modifier = Modifier
                .size(14.dp)
                .padding(top = 2.dp)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(text = text, fontSize = 12.sp, color = StoneText)
    }
}
