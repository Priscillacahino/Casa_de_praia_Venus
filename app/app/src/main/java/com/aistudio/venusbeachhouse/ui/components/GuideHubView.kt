package com.aistudio.venusbeachhouse.ui.components

import android.content.Intent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.aistudio.venusbeachhouse.GuideActivity
import com.aistudio.venusbeachhouse.GuideRepository
import com.aistudio.venusbeachhouse.ui.theme.AmberPrimary
import kotlinx.coroutines.launch

@Composable
fun GuideHubView(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var pendingHtml by remember { mutableStateOf<String?>(null) }
    var status by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(false) }

    val saveLauncher = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("text/html")) { uri ->
        if (uri != null && pendingHtml != null) {
            val ok = runCatching {
                context.contentResolver.openOutputStream(uri)?.use { it.write(pendingHtml!!.toByteArray(Charsets.UTF_8)) }
            }.isSuccess
            status = if (ok) "Guia salvo no local escolhido." else "Não foi possível salvar o guia."
        }
    }

    Column(modifier.fillMaxWidth().padding(16.dp)) {
        Text("Guia Vênus PB", style = MaterialTheme.typography.headlineMedium)
        Text(
            "Explore João Pessoa, Cabedelo e Conde sem sair do ecossistema Vênus. O módulo sincroniza o guia oficial e mantém uma cópia local para uso posterior.",
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.padding(top = 6.dp, bottom = 16.dp)
        )
        Card(shape = RoundedCornerShape(20.dp), modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(18.dp)) {
                Text("Dois aplicativos em um", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge)
                Text("A Casa Vênus e o Guia Vênus continuam em repositórios independentes, mas o hóspede acessa os dois pelo mesmo aplicativo.", modifier = Modifier.padding(top = 6.dp, bottom = 16.dp))
                Button(
                    onClick = { context.startActivity(Intent(context, GuideActivity::class.java)) },
                    modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = AmberPrimary)
                ) {
                    Icon(Icons.Default.Explore, contentDescription = null)
                    Spacer(Modifier.width(8.dp))
                    Text("Abrir Guia Vênus")
                }
                Spacer(Modifier.height(10.dp))
                OutlinedButton(
                    onClick = {
                        scope.launch {
                            loading = true; status = null
                            try {
                                pendingHtml = GuideRepository.load(context, false)
                                saveLauncher.launch("guia-venus-pb.html")
                            } catch (_: Exception) {
                                status = "Não foi possível obter o guia agora. Verifique a conexão."
                            } finally { loading = false }
                        }
                    }, enabled = !loading, modifier = Modifier.fillMaxWidth()
                ) {
                    if (loading) CircularProgressIndicator(Modifier.size(18.dp), strokeWidth = 2.dp)
                    else Icon(Icons.Default.Download, contentDescription = null)
                    Spacer(Modifier.width(8.dp))
                    Text(if (loading) "Preparando…" else "Baixar guia offline")
                }
                status?.let { Text(it, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 10.dp)) }
            }
        }
        Text(
            "Os estabelecimentos e atrações do guia podem mudar horários, preços e disponibilidade. Confirme as informações nos canais oficiais antes da visita.",
            style = MaterialTheme.typography.bodySmall,
            modifier = Modifier.padding(top = 14.dp)
        )
    }
}
