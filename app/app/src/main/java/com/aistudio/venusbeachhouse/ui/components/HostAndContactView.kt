package com.aistudio.venusbeachhouse.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.aistudio.venusbeachhouse.data.HouseData
import com.aistudio.venusbeachhouse.ui.VenusUiState
import com.aistudio.venusbeachhouse.ui.VenusViewModel
import com.aistudio.venusbeachhouse.ui.theme.AmberPrimary

@Composable
fun HostAndContactView(viewModel: VenusViewModel, state: VenusUiState, modifier: Modifier = Modifier) {
    val context=LocalContext.current;val house=HouseData.HOUSE_INFO
    Column(modifier.fillMaxWidth().padding(16.dp)) {
        Text("Contato",style=MaterialTheme.typography.headlineMedium)
        Text("Fale diretamente com a responsável pela Vênus Beach House.",modifier=Modifier.padding(top=6.dp,bottom=16.dp))
        Card(shape=RoundedCornerShape(18.dp),modifier=Modifier.fillMaxWidth()) { Column(Modifier.padding(18.dp)) {
            Text("Canais oficiais",style=MaterialTheme.typography.titleLarge)
            Row(Modifier.fillMaxWidth().padding(top=12.dp),horizontalArrangement=Arrangement.spacedBy(8.dp)) {
                OutlinedButton({context.startActivity(Intent(Intent.ACTION_VIEW,Uri.parse("https://api.whatsapp.com/send?phone=${house.whatsappNumber}")))},Modifier.weight(1f)){Icon(Icons.Default.Chat,null);Spacer(Modifier.width(5.dp));Text("WhatsApp")}
                OutlinedButton({context.startActivity(Intent(Intent.ACTION_VIEW,Uri.parse(house.instagramUrl)))},Modifier.weight(1f)){Icon(Icons.Default.CameraAlt,null);Spacer(Modifier.width(5.dp));Text("Instagram")}
            }
            OutlinedButton({context.startActivity(Intent(Intent.ACTION_VIEW,Uri.parse(house.googleMapsUrl)))},Modifier.fillMaxWidth().padding(top=8.dp)){Icon(Icons.Default.Map,null);Spacer(Modifier.width(5.dp));Text("Localização")}
        }}
        Card(shape=RoundedCornerShape(18.dp),modifier=Modifier.fillMaxWidth().padding(top=14.dp)) { Column(Modifier.padding(18.dp)) {
            Text("Escrever mensagem",style=MaterialTheme.typography.titleLarge)
            Text("O envio será concluído pelo WhatsApp; o app não exibirá uma confirmação falsa de mensagem enviada.",style=MaterialTheme.typography.bodySmall,modifier=Modifier.padding(top=4.dp,bottom=12.dp))
            OutlinedTextField(state.contactName,{viewModel.updateContactForm(it,state.contactEmail,state.contactPhone,state.contactMessage)},label={Text("Nome")},singleLine=true,modifier=Modifier.fillMaxWidth())
            OutlinedTextField(state.contactEmail,{viewModel.updateContactForm(state.contactName,it,state.contactPhone,state.contactMessage)},label={Text("E-mail")},singleLine=true,modifier=Modifier.fillMaxWidth().padding(top=8.dp))
            OutlinedTextField(state.contactPhone,{viewModel.updateContactForm(state.contactName,state.contactEmail,it,state.contactMessage)},label={Text("Telefone")},singleLine=true,modifier=Modifier.fillMaxWidth().padding(top=8.dp))
            OutlinedTextField(state.contactMessage,{viewModel.updateContactForm(state.contactName,state.contactEmail,state.contactPhone,it)},label={Text("Mensagem")},minLines=3,modifier=Modifier.fillMaxWidth().padding(top=8.dp))
            Button(onClick={
                val msg="Olá! Meu nome é ${state.contactName}.\nE-mail: ${state.contactEmail}\nTelefone: ${state.contactPhone}\n\n${state.contactMessage}"
                context.startActivity(Intent(Intent.ACTION_VIEW,Uri.parse("https://api.whatsapp.com/send?phone=${house.whatsappNumber}&text=${Uri.encode(msg)}")))
            },enabled=state.contactName.isNotBlank()&&state.contactMessage.isNotBlank(),colors=ButtonDefaults.buttonColors(containerColor=AmberPrimary),modifier=Modifier.fillMaxWidth().padding(top=12.dp)){Icon(Icons.Default.Send,null);Spacer(Modifier.width(6.dp));Text("Continuar no WhatsApp")}
        }}
    }
}
