package com.aistudio.venusbeachhouse

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.unit.dp
import com.aistudio.venusbeachhouse.ui.theme.VenusBeachHouseTheme
import kotlinx.coroutines.launch

class GuideActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            VenusBeachHouseTheme {
                GuideScreen(onBack = { finish() })
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun GuideScreen(onBack: () -> Unit) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val scope = rememberCoroutineScope()
    var html by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var refreshing by remember { mutableStateOf(false) }

    suspend fun reload(force: Boolean) {
        refreshing = true
        error = null
        try { html = GuideRepository.load(context, force) }
        catch (_: Exception) { error = "Não foi possível carregar o Guia Vênus. Verifique a conexão e tente novamente." }
        finally { refreshing = false }
    }

    LaunchedEffect(Unit) { reload(false) }
    val saveLauncher = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("text/html")) { uri ->
        if (uri != null && html != null) {
            runCatching { context.contentResolver.openOutputStream(uri)?.use { it.write(html!!.toByteArray(Charsets.UTF_8)) } }
        }
    }

    Scaffold(topBar = {
        TopAppBar(
            title = { Text("Guia Vênus PB") },
            navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, "Voltar") } },
            actions = {
                IconButton(onClick = { scope.launch { reload(true) } }, enabled = !refreshing) { Icon(Icons.Default.Refresh, "Atualizar guia") }
                IconButton(onClick = { if (html != null) saveLauncher.launch("guia-venus-pb.html") }, enabled = html != null) { Icon(Icons.Default.Download, "Baixar guia") }
            }
        )
    }) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            when {
                refreshing && html == null -> CircularProgressIndicator(Modifier.padding(24.dp))
                error != null && html == null -> Text(error!!, Modifier.padding(24.dp))
                html != null -> AndroidView(
                    modifier = Modifier.fillMaxSize(),
                    factory = { ctx ->
                        WebView(ctx).apply {
                            settings.javaScriptEnabled = true
                            settings.domStorageEnabled = true
                            settings.allowFileAccess = false
                            settings.allowContentAccess = false
                            settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
                            settings.javaScriptCanOpenWindowsAutomatically = false
                            webViewClient = object : WebViewClient() {
                                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                                    val uri = request?.url ?: return true
                                    if (uri.host == "guide.venus.local") return false
                                    if (uri.scheme == "https" || uri.scheme == "http") {
                                        runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, uri)) }
                                    }
                                    return true
                                }
                            }
                        }
                    },
                    update = { view ->
                        val fingerprint = html!!.hashCode()
                        if (view.tag != fingerprint) {
                            view.tag = fingerprint
                            view.loadDataWithBaseURL("https://guide.venus.local/", html!!, "text/html", "utf-8", null)
                        }
                    }
                )
            }
        }
    }
}

