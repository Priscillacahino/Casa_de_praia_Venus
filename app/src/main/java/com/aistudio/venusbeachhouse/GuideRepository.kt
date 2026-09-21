package com.aistudio.venusbeachhouse

import android.content.Context
import com.aistudio.venusbeachhouse.data.HouseData
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

object GuideRepository {
    private const val MAX_BYTES = 600_000

    private fun cacheFile(context: Context): File = File(context.filesDir, "guide/guia-venus-pb.html")

    suspend fun load(context: Context, forceRefresh: Boolean = false): String = withContext(Dispatchers.IO) {
        val cache = cacheFile(context)
        if (!forceRefresh && cache.exists() && cache.length() in 1_001..MAX_BYTES.toLong()) {
            return@withContext cache.readText(Charsets.UTF_8)
        }
        try {
            val sourceUrl = URL(HouseData.GUIDE_SOURCE_URL)
            if (sourceUrl.protocol != "https" || sourceUrl.host != "raw.githubusercontent.com") error("Origem do guia não permitida")
            val connection = (sourceUrl.openConnection() as HttpURLConnection).apply {
                connectTimeout = 7_000
                readTimeout = 10_000
                instanceFollowRedirects = false
                requestMethod = "GET"
                setRequestProperty("Accept", "text/html,text/plain;q=0.9")
                setRequestProperty("User-Agent", "VenusBeachHouse-Android")
            }
            connection.connect()
            if (connection.responseCode !in 200..299) error("HTTP ${connection.responseCode}")
            val bytes = connection.inputStream.use { input ->
                val output = java.io.ByteArrayOutputStream()
                val buffer = ByteArray(16_384)
                var total = 0
                while (true) {
                    val read = input.read(buffer)
                    if (read < 0) break
                    total += read
                    if (total > MAX_BYTES) error("Guia maior que o limite permitido")
                    output.write(buffer, 0, read)
                }
                output.toByteArray()
            }
            val expectedHash = BuildConfig.GUIDE_EXPECTED_SHA256.trim().lowercase()
            if (expectedHash.isNotEmpty()) {
                if (!expectedHash.matches(Regex("[a-f0-9]{64}"))) error("SHA-256 do guia inválido no build")
                val actualHash = MessageDigest.getInstance("SHA-256").digest(bytes)
                    .joinToString("") { "%02x".format(it.toInt() and 0xff) }
                if (actualHash != expectedHash) error("O Guia Vênus não corresponde ao SHA-256 aprovado")
            }
            val html = bytes.toString(Charsets.UTF_8)
            if (!html.contains("Guia Vênus", ignoreCase = true) && !html.contains("Guia Venus", ignoreCase = true)) {
                error("Conteúdo do guia não reconhecido")
            }
            val csp = "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; connect-src 'none'; font-src data:; form-action 'none'; base-uri 'none'\">"
            val hardened = if (html.contains("<head>", ignoreCase = true)) html.replaceFirst(Regex("<head>", RegexOption.IGNORE_CASE), "<head>$csp") else "$csp$html"
            cache.parentFile?.mkdirs()
            cache.writeText(hardened, Charsets.UTF_8)
            hardened
        } catch (e: Exception) {
            if (cache.exists()) cache.readText(Charsets.UTF_8) else throw e
        }
    }
}
