package com.aistudio.venusbeachhouse.ui

import androidx.lifecycle.ViewModel
import com.aistudio.venusbeachhouse.data.HouseData
import com.aistudio.venusbeachhouse.model.ReservationQuote
import com.aistudio.venusbeachhouse.model.ReviewItem
import com.aistudio.venusbeachhouse.model.RoomItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

data class VenusUiState(
    val selectedSection: String = "Visão Geral",
    val checkInDate: String = "",
    val checkOutDate: String = "",
    val guestsCount: Int = 2,
    val hasPet: Boolean = false,
    val quote: ReservationQuote? = null,
    val errorMessage: String? = null,
    val isGalleryOpen: Boolean = false,
    val galleryIndex: Int = 0,
    val selectedGalleryCategory: String = "Todas",
    val selectedRoomDetail: RoomItem? = null,
    val reviews: List<ReviewItem> = emptyList(),
    val contactName: String = "",
    val contactEmail: String = "",
    val contactPhone: String = "",
    val contactMessage: String = ""
)

class VenusViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(VenusUiState())
    val uiState: StateFlow<VenusUiState> = _uiState.asStateFlow()

    fun selectSection(section: String) = _uiState.update { it.copy(selectedSection = section) }
    fun setDates(checkIn: String, checkOut: String) = _uiState.update {
        it.copy(checkInDate = checkIn.take(10), checkOutDate = checkOut.take(10), quote = null, errorMessage = null)
    }
    fun setGuests(count: Int) = _uiState.update { it.copy(guestsCount = count.coerceIn(1, HouseData.HOUSE_INFO.maxGuests)) }
    fun setHasPet(hasPet: Boolean) = _uiState.update { it.copy(hasPet = hasPet) }

    fun openGallery(initialIndex: Int = 0) = _uiState.update {
        it.copy(isGalleryOpen = true, galleryIndex = initialIndex.coerceIn(0, HouseData.GALLERY_PHOTOS.lastIndex))
    }
    fun closeGallery() = _uiState.update { it.copy(isGalleryOpen = false) }
    fun setGalleryIndex(index: Int) = _uiState.update { it.copy(galleryIndex = index.coerceIn(0, HouseData.GALLERY_PHOTOS.lastIndex)) }
    fun setGalleryCategory(category: String) = _uiState.update { it.copy(selectedGalleryCategory = category) }
    fun openRoomDetail(room: RoomItem) = _uiState.update { it.copy(selectedRoomDetail = room) }
    fun closeRoomDetail() = _uiState.update { it.copy(selectedRoomDetail = null) }

    fun updateContactForm(name: String, email: String, phone: String, message: String) = _uiState.update {
        it.copy(contactName = name.take(120), contactEmail = email.take(254), contactPhone = phone.take(25), contactMessage = message.take(2000))
    }

    fun clearContactForm() = _uiState.update {
        it.copy(contactName = "", contactEmail = "", contactPhone = "", contactMessage = "")
    }

    fun generateWhatsAppBookingMessage(): String {
        val state = _uiState.value
        val period = if (state.checkInDate.isNotBlank() && state.checkOutDate.isNotBlank())
            "\n📅 Período pretendido: ${state.checkInDate} até ${state.checkOutDate}" else ""
        val petText = if (state.hasPet) "\n🐾 Levo pet" else ""
        return "Olá! Gostaria de consultar disponibilidade e valor para a Vênus Beach House.$period\n👥 Hóspedes: ${state.guestsCount}$petText\nSe houver disponibilidade, gostaria de receber as orientações do fluxo oficial de reserva."
    }
}
