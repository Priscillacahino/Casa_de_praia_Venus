package com.aistudio.venusbeachhouse

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
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
        setContent { VenusBeachHouseTheme { VenusBeachHouseApp(viewModel) } }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VenusBeachHouseApp(viewModel: VenusViewModel) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val scrollState = rememberScrollState()
    val tabs = listOf("Visão Geral","Cômodos","Comodidades","Praias","Reservas","Guia PB","Avaliações","Contato")
    val bottomTabs = listOf("Visão Geral","Cômodos","Reservas","Guia PB","Contato")

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment=Alignment.CenterVertically, modifier=Modifier.clip(RoundedCornerShape(12.dp)).clickable {
                        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(HouseData.HOUSE_INFO.instagramUrl)))
                    }.padding(end=4.dp)) {
                        AssetImage(assetPath=HouseData.HOUSE_INFO.catProfileAsset, contentDescription="Mascote Vênus", modifier=Modifier.size(36.dp), shape=CircleShape)
                        Spacer(Modifier.width(10.dp))
                        Column { Text("Vênus Beach House",fontWeight=FontWeight.Bold);Text("Conde - PB",fontSize=10.sp,color=AmberDark) }
                    }
                },
                actions = {
                    IconButton({viewModel.openGallery(0)}){Icon(Icons.Default.PhotoLibrary,"Galeria")}
                    IconButton({
                        val share=Intent(Intent.ACTION_SEND).apply{type="text/plain";putExtra(Intent.EXTRA_TEXT,"Conheça a Vênus Beach House em Conde - PB: ${HouseData.HOUSE_INFO.instagramUrl}")}
                        context.startActivity(Intent.createChooser(share,"Compartilhar"))
                    }){Icon(Icons.Default.Share,"Compartilhar")}
                },
                colors=TopAppBarDefaults.topAppBarColors(containerColor=Color.White)
            )
        },
        bottomBar = {
            NavigationBar(containerColor=Color.White) {
                bottomTabs.forEach { tab ->
                    val icon=when(tab){"Visão Geral"->Icons.Default.Home;"Cômodos"->Icons.Default.Bed;"Reservas"->Icons.Default.CalendarToday;"Guia PB"->Icons.Default.Explore;else->Icons.Default.Chat}
                    NavigationBarItem(selected=state.selectedSection==tab,onClick={viewModel.selectSection(tab)},icon={Icon(icon,tab)},label={Text(tab,fontSize=9.sp)},colors=NavigationBarItemDefaults.colors(selectedIconColor=AmberDark,selectedTextColor=AmberDark,indicatorColor=AmberContainer))
                }
            }
        },
        floatingActionButton = {
            FloatingActionButton(onClick={
                val url="https://api.whatsapp.com/send?phone=${HouseData.HOUSE_INFO.whatsappNumber}&text=${Uri.encode("Olá! Gostaria de falar sobre a Vênus Beach House.")}"
                context.startActivity(Intent(Intent.ACTION_VIEW,Uri.parse(url)))
            },containerColor=WhatsAppGreen,contentColor=Color.White,shape=CircleShape){Icon(Icons.Default.Chat,"WhatsApp")}
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).background(StoneBackground).verticalScroll(scrollState)) {
            ScrollableTabRow(selectedTabIndex=tabs.indexOf(state.selectedSection).coerceAtLeast(0),edgePadding=16.dp,containerColor=Color.White,contentColor=AmberPrimary,indicator={},divider={}) {
                tabs.forEach { tab ->
                    FilterChip(selected=state.selectedSection==tab,onClick={viewModel.selectSection(tab)},label={Text(tab,fontSize=11.sp)},colors=FilterChipDefaults.filterChipColors(selectedContainerColor=AmberPrimary,selectedLabelColor=Color.White),modifier=Modifier.padding(end=6.dp,top=4.dp,bottom=4.dp))
                }
            }
            Spacer(Modifier.height(8.dp))
            when(state.selectedSection){
                "Visão Geral"->PropertyOverview(onOpenGallery={viewModel.openGallery(it)},onNavigateToBooking={viewModel.selectSection("Reservas")},onNavigateToRooms={viewModel.selectSection("Cômodos")})
                "Cômodos"->RoomsView(onOpenRoomDetail={viewModel.openRoomDetail(it)})
                "Comodidades"->AmenitiesView()
                "Praias"->BeachesView()
                "Reservas"->PricingBookingView(viewModel,state)
                "Guia PB"->GuideHubView()
                "Avaliações"->ReviewsView(viewModel,state)
                "Contato"->HostAndContactView(viewModel,state)
            }
            Spacer(Modifier.height(90.dp))
        }
        state.selectedRoomDetail?.let { RoomDetailDialog(it,{viewModel.closeRoomDetail()}) }
        if(state.isGalleryOpen) PhotoGalleryDialog(state.galleryIndex,{viewModel.closeGallery()})
    }
}
