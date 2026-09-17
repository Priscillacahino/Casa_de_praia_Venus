package com.aistudio.venusbeachhouse

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import com.aistudio.venusbeachhouse.ui.VenusViewModel
import com.aistudio.venusbeachhouse.ui.components.*
import com.aistudio.venusbeachhouse.ui.theme.*

class MainActivity : ComponentActivity() {

    private val viewModel: VenusViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            VenusBeachHouseTheme {
                VenusBeachHouseApp(viewModel = viewModel)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VenusBeachHouseApp(viewModel: VenusViewModel) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    val tabs = listOf(
        "Visão Geral",
        "Cômodos",
        "Comodidades",
        "Praias",
        "Reservas",
        "Avaliações",
        "Contato"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .clickable {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(HouseData.HOUSE_INFO.instagramUrl))
                                context.startActivity(intent)
                            }
                            .padding(end = 4.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(AmberContainer)
                                .border(1.5.dp, AmberPrimary, CircleShape)
                        ) {
                            AssetImage(
                                assetPath = HouseData.HOUSE_INFO.catProfileAsset,
                                contentDescription = "Logotipo Gatinha Vênus @venuscasadepraiapb",
                                modifier = Modifier.fillMaxSize(),
                                shape = CircleShape
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Vênus Beach House",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = StoneText
                            )
                            Text(
                                text = "@venuscasadepraiapb • Conde - PB",
                                fontSize = 10.sp,
                                color = AmberDark
                            )
                        }
                    }
                },
                actions = {
                    IconButton(
                        onClick = { viewModel.openGallery(0) },
                        modifier = Modifier.testTag("top_bar_gallery_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.PhotoLibrary,
                            contentDescription = "Galeria de Fotos",
                            tint = AmberDark
                        )
                    }
                    IconButton(
                        onClick = {
                            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(
                                    Intent.EXTRA_TEXT,
                                    "Conheça a Vênus Beach House em Conde - PB! Refúgio com piscina em L, churrasqueira e home office perto de Tabatinga e Coqueirinho: ${HouseData.HOUSE_INFO.googleMapsUrl}"
                                )
                            }
                            context.startActivity(Intent.createChooser(shareIntent, "Compartilhar Casa de Praia"))
                        },
                        modifier = Modifier.testTag("top_bar_share_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = "Compartilhar",
                            tint = StoneText
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color.White,
                tonalElevation = 6.dp
            ) {
                tabs.take(5).forEach { tab ->
                    val isSelected = state.selectedSection == tab
                    val icon = when (tab) {
                        "Visão Geral" -> Icons.Default.Home
                        "Cômodos" -> Icons.Default.Bed
                        "Comodidades" -> Icons.Default.Pool
                        "Praias" -> Icons.Default.BeachAccess
                        "Reservas" -> Icons.Default.CalendarToday
                        else -> Icons.Default.Star
                    }
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { viewModel.selectSection(tab) },
                        icon = { Icon(icon, contentDescription = tab) },
                        label = { Text(tab, fontSize = 10.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = AmberDark,
                            selectedTextColor = AmberDark,
                            indicatorColor = AmberContainer
                        ),
                        modifier = Modifier.testTag("nav_tab_$tab")
                    )
                }
            }
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    val url = "https://api.whatsapp.com/send?phone=${HouseData.HOUSE_INFO.whatsappNumber}&text=${Uri.encode("Olá Priscila! Gostaria de falar sobre a Vênus Beach House.")}"
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    context.startActivity(intent)
                },
                containerColor = WhatsAppGreen,
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier.testTag("floating_whatsapp_fab")
            ) {
                Icon(
                    imageVector = Icons.Default.Chat,
                    contentDescription = "WhatsApp Anfitriã",
                    modifier = Modifier.size(24.dp)
                )
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(StoneBackground)
                .verticalScroll(scrollState)
        ) {
            // Secondary Category Pill Bar
            ScrollableTabRow(
                selectedTabIndex = tabs.indexOf(state.selectedSection).coerceAtLeast(0),
                edgePadding = 16.dp,
                containerColor = Color.White,
                contentColor = AmberPrimary,
                indicator = {},
                divider = {}
            ) {
                tabs.forEach { tab ->
                    val isSelected = state.selectedSection == tab
                    FilterChip(
                        selected = isSelected,
                        onClick = { viewModel.selectSection(tab) },
                        label = { Text(tab, fontSize = 11.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = AmberPrimary,
                            selectedLabelColor = Color.White
                        ),
                        modifier = Modifier
                            .padding(end = 6.dp, top = 4.dp, bottom = 4.dp)
                            .testTag("pill_tab_$tab")
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Active View based on selected section
            when (state.selectedSection) {
                "Visão Geral" -> {
                    PropertyOverview(
                        onOpenGallery = { viewModel.openGallery(it) },
                        onNavigateToBooking = { viewModel.selectSection("Reservas") },
                        onNavigateToRooms = { viewModel.selectSection("Cômodos") }
                    )
                }
                "Cômodos" -> {
                    RoomsView(
                        onOpenRoomDetail = { viewModel.openRoomDetail(it) }
                    )
                }
                "Comodidades" -> {
                    AmenitiesView()
                }
                "Praias" -> {
                    BeachesView()
                }
                "Reservas" -> {
                    PricingBookingView(
                        viewModel = viewModel,
                        state = state
                    )
                }
                "Avaliações" -> {
                    ReviewsView(
                        viewModel = viewModel,
                        state = state
                    )
                }
                "Contato" -> {
                    HostAndContactView(
                        viewModel = viewModel,
                        state = state
                    )
                }
            }

            Spacer(modifier = Modifier.height(80.dp)) // Extra space for FAB and navigation bar
        }

        // Room Detail Modal Dialog
        state.selectedRoomDetail?.let { room ->
            RoomDetailDialog(
                room = room,
                onDismiss = { viewModel.closeRoomDetail() }
            )
        }

        // Fullscreen Lightbox Photo Gallery
        if (state.isGalleryOpen) {
            PhotoGalleryDialog(
                initialIndex = state.galleryIndex,
                onDismiss = { viewModel.closeGallery() }
            )
        }
    }
}
