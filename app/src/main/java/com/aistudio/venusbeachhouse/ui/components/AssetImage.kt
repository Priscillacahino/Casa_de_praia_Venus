package com.aistudio.venusbeachhouse.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import coil.compose.SubcomposeAsyncImage
import coil.request.ImageRequest
import com.aistudio.venusbeachhouse.ui.theme.AmberPrimary
import com.aistudio.venusbeachhouse.ui.theme.StoneSurfaceVariant

@Composable
fun AssetImage(
    assetPath: String,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    contentScale: ContentScale = ContentScale.Crop,
    shape: RoundedCornerShape = RoundedCornerShape(16.dp)
) {
    val context = LocalContext.current
    val uri = "file:///android_asset/$assetPath"

    SubcomposeAsyncImage(
        model = ImageRequest.Builder(context)
            .data(uri)
            .crossfade(true)
            .build(),
        contentDescription = contentDescription,
        contentScale = contentScale,
        modifier = modifier.clip(shape),
        loading = {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(StoneSurfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Home,
                    contentDescription = null,
                    tint = AmberPrimary.copy(alpha = 0.5f)
                )
            }
        },
        error = {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(StoneSurfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Home,
                    contentDescription = null,
                    tint = AmberPrimary.copy(alpha = 0.6f)
                )
            }
        }
    )
}
