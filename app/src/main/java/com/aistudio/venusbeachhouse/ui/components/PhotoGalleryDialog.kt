package com.aistudio.venusbeachhouse.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.aistudio.venusbeachhouse.data.HouseData
import com.aistudio.venusbeachhouse.model.GalleryPhoto
import com.aistudio.venusbeachhouse.ui.theme.*

@Composable
fun PhotoGalleryDialog(
    initialIndex: Int,
    onDismiss: () -> Unit
) {
    var selectedCategory by remember { mutableStateOf("Todas") }
    val categories = listOf("Todas", "Cômodos", "Lazer & Área Externa", "Praias de Conde")

    val photos = remember(selectedCategory) {
        if (selectedCategory == "Todas") {
            HouseData.GALLERY_PHOTOS
        } else {
            HouseData.GALLERY_PHOTOS.filter { it.category == selectedCategory }
        }
    }

    var currentIndex by remember(photos) {
        mutableIntStateOf(initialIndex.coerceIn(0, (photos.size - 1).coerceAtLeast(0)))
    }

    val currentPhoto: GalleryPhoto? = photos.getOrNull(currentIndex)

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .systemBarsPadding()
            ) {
                // Top controls: Category filter + Close button
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Galeria de Fotos (${currentIndex + 1}/${photos.size})",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold
                    )

                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.2f))
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Fechar Galeria",
                            tint = Color.White
                        )
                    }
                }

                // Filter categories
                LazyRow(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(categories.size) { idx ->
                        val cat = categories[idx]
                        val isSelected = selectedCategory == cat
                        Surface(
                            onClick = {
                                selectedCategory = cat
                                currentIndex = 0
                            },
                            shape = RoundedCornerShape(12.dp),
                            color = if (isSelected) AmberPrimary else Color.White.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = cat,
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.weight(0.1f))

                // Main Image with Prev / Next arrows
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .padding(horizontal = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    currentPhoto?.let { photo ->
                        AssetImage(
                            assetPath = photo.assetPath,
                            contentDescription = photo.title,
                            modifier = Modifier
                                .fillMaxWidth()
                                .fillMaxHeight(),
                            contentScale = ContentScale.Fit,
                            shape = RoundedCornerShape(12.dp)
                        )
                    }

                    // Left arrow
                    if (currentIndex > 0) {
                        IconButton(
                            onClick = { currentIndex-- },
                            modifier = Modifier
                                .align(Alignment.CenterStart)
                                .padding(start = 8.dp)
                                .clip(CircleShape)
                                .background(Color.Black.copy(alpha = 0.5f))
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Foto anterior",
                                tint = Color.White
                            )
                        }
                    }

                    // Right arrow
                    if (currentIndex < photos.size - 1) {
                        IconButton(
                            onClick = { currentIndex++ },
                            modifier = Modifier
                                .align(Alignment.CenterEnd)
                                .padding(end = 8.dp)
                                .clip(CircleShape)
                                .background(Color.Black.copy(alpha = 0.5f))
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = "Próxima foto",
                                tint = Color.White
                            )
                        }
                    }
                }

                // Photo Caption & Details
                currentPhoto?.let { photo ->
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 20.dp, vertical = 10.dp)
                    ) {
                        Text(
                            text = photo.title,
                            color = Color.White,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = photo.description,
                            color = Color.LightGray,
                            fontSize = 12.sp,
                            lineHeight = 16.sp,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }
                }

                // Thumbnail Strip along bottom
                LazyRow(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    itemsIndexed(photos) { idx, photo ->
                        val isSelected = idx == currentIndex
                        Box(
                            modifier = Modifier
                                .size(54.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .border(
                                    width = if (isSelected) 2.dp else 1.dp,
                                    color = if (isSelected) AmberPrimary else Color.Transparent,
                                    shape = RoundedCornerShape(8.dp)
                                )
                                .clickable { currentIndex = idx }
                        ) {
                            AssetImage(
                                assetPath = photo.assetPath,
                                contentDescription = null,
                                modifier = Modifier.fillMaxSize(),
                                shape = RoundedCornerShape(8.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
