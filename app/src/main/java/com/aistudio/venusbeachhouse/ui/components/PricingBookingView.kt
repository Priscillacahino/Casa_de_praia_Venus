package com.aistudio.venusbeachhouse.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.aistudio.venusbeachhouse.BuildConfig
import com.aistudio.venusbeachhouse.data.HouseData
import com.aistudio.venusbeachhouse.ui.VenusUiState
import com.aistudio.venusbeachhouse.ui.VenusViewModel
import com.aistudio.venusbeachhouse.ui.theme.AmberPrimary
import com.aistudio.venusbeachhouse.ui.theme.WhatsAppGreen

@Composable
fun PricingBookingView(viewModel: VenusViewModel, state: VenusUiState, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    Column(modifier.fillMaxWidth().padding(16.dp)) {
        Text("Reservas", style = MaterialTheme.typography.headlineMedium)
        Text("O aplicativo móvel não calcula nem confirma valores localmente. Isso evita que uma tarifa desatualizada seja tratada como preço válido.", modifier = Modifier.padding(top = 6.dp, bottom = 16.dp))

        Card(shape = RoundedCornerShape(20.dp), modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(18.dp)) {
                Row { Icon(Icons.Default.CalendarToday, null); Spacer(Modifier.width(8.dp)); Text("Dados para consulta", fontWeight = FontWeight.Bold) }
                Spacer(Modifier.height(14.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(state.checkInDate, { viewModel.setDates(it, state.checkOutDate) }, label={Text("Check-in")}, placeholder={Text("dd/mm/aaaa")}, singleLine=true, modifier=Modifier.weight(1f))
                    OutlinedTextField(state.checkOutDate, { viewModel.setDates(state.checkInDate, it) }, label={Text("Check-out")}, placeholder={Text("dd/mm/aaaa")}, singleLine=true, modifier=Modifier.weight(1f))
                }
                Spacer(Modifier.height(12.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Hóspedes: ${state.guestsCount}")
                    Row {
                        TextButton(onClick={viewModel.setGuests(state.guestsCount-1)}, enabled=state.guestsCount>1){Text("−")}
                        TextButton(onClick={viewModel.setGuests(state.guestsCount+1)}, enabled=state.guestsCount<HouseData.HOUSE_INFO.maxGuests){Text("+")}
                    }
                }
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Levo pet")
                    Switch(state.hasPet, { viewModel.setHasPet(it) })
                }
                Spacer(Modifier.height(14.dp))

                if (BuildConfig.BOOKING_URL.isNotBlank()) {
                    Button(
                        onClick={ context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(BuildConfig.BOOKING_URL))) },
                        colors=ButtonDefaults.buttonColors(containerColor=AmberPrimary), modifier=Modifier.fillMaxWidth().testTag("secure_booking_button")
                    ) { Icon(Icons.Default.Lock,null); Spacer(Modifier.width(8.dp)); Text("Abrir reserva segura") }
                    Spacer(Modifier.height(8.dp))
                }
                Button(
                    onClick={
                        val url="https://api.whatsapp.com/send?phone=${HouseData.HOUSE_INFO.whatsappNumber}&text=${Uri.encode(viewModel.generateWhatsAppBookingMessage())}"
                        context.startActivity(Intent(Intent.ACTION_VIEW,Uri.parse(url)))
                    }, colors=ButtonDefaults.buttonColors(containerColor=WhatsAppGreen), modifier=Modifier.fillMaxWidth().testTag("booking_whatsapp_button")
                ){Icon(Icons.Default.Chat,null);Spacer(Modifier.width(8.dp));Text("Consultar pelo WhatsApp")}
            }
        }
        Card(shape=RoundedCornerShape(16.dp),modifier=Modifier.fillMaxWidth().padding(top=14.dp)) {
            Column(Modifier.padding(16.dp)) {
                Text("Fluxo de segurança", fontWeight=FontWeight.Bold)
                Text("1. disponibilidade e valor são conferidos no servidor; 2. o termo vigente precisa estar validado; 3. pagamento só conta após compensação bancária; 4. a data é revalidada imediatamente antes da confirmação.", modifier=Modifier.padding(top=6.dp))
                Text("Não envie senha bancária, código de autenticação ou dados de cartão.", modifier=Modifier.padding(top=8.dp), style=MaterialTheme.typography.bodySmall)
            }
        }
    }
}
