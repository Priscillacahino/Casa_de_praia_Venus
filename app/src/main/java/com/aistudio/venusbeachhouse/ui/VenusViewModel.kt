package com.aistudio.venusbeachhouse.ui

import androidx.lifecycle.ViewModel
import com.aistudio.venusbeachhouse.data.HouseData
import com.aistudio.venusbeachhouse.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

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
    val isReviewDialogOpen: Boolean = false,
    val reviews: List<ReviewItem> = HouseData.INITIAL_REVIEWS,
    val contactName: String = "",
    val contactEmail: String = "",
    val contactPhone: String = "",
    val contactMessage: String = "",
    val contactSentSuccess: Boolean = false
)

class VenusViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(VenusUiState())
    val uiState: StateFlow<VenusUiState> = _uiState.asStateFlow()

    init {
        // Initialize with recommended upcoming weekend
        val cal = Calendar.getInstance()
        cal.add(Calendar.DAY_OF_YEAR, 3)
        val sdf = SimpleDateFormat("dd/MM/yyyy", Locale("pt", "BR"))
        val checkIn = sdf.format(cal.time)
        cal.add(Calendar.DAY_OF_YEAR, 2)
        val checkOut = sdf.format(cal.time)

        setDates(checkIn, checkOut)
    }

    fun selectSection(section: String) {
        _uiState.update { it.copy(selectedSection = section) }
    }

    fun setDates(checkIn: String, checkOut: String) {
        _uiState.update {
            it.copy(
                checkInDate = checkIn,
                checkOutDate = checkOut
            )
        }
        calculateQuote()
    }

    fun setGuests(count: Int) {
        val safeCount = count.coerceIn(1, HouseData.HOUSE_INFO.maxGuests)
        _uiState.update { it.copy(guestsCount = safeCount) }
    }

    fun setHasPet(hasPet: Boolean) {
        _uiState.update { it.copy(hasPet = hasPet) }
    }

    private fun calculateQuote() {
        val checkIn = _uiState.value.checkInDate
        val checkOut = _uiState.value.checkOutDate
        if (checkIn.isBlank() || checkOut.isBlank()) {
            _uiState.update { it.copy(quote = null) }
            return
        }

        try {
            val sdf = SimpleDateFormat("dd/MM/yyyy", Locale("pt", "BR"))
            val inDate = sdf.parse(checkIn)
            val outDate = sdf.parse(checkOut)

            if (inDate == null || outDate == null || !outDate.after(inDate)) {
                _uiState.update { it.copy(quote = null, errorMessage = "Check-out deve ser após check-in") }
                return
            }

            val diffDays = ((outDate.time - inDate.time) / (1000 * 60 * 60 * 24)).toInt()
            val cal = Calendar.getInstance()
            cal.time = inDate

            var weekdayNights = 0
            var weekendNights = 0

            for (i in 0 until diffDays) {
                val dayOfWeek = cal.get(Calendar.DAY_OF_WEEK)
                if (dayOfWeek == Calendar.FRIDAY || dayOfWeek == Calendar.SATURDAY) {
                    weekendNights++
                } else {
                    weekdayNights++
                }
                cal.add(Calendar.DAY_OF_YEAR, 1)
            }

            // Using standard base season rates: R$ 280 weekday, R$ 350 weekend
            val weekdayRate = 280
            val weekendRate = 350
            val cleaningFee = 150

            val subtotal = (weekdayNights * weekdayRate) + (weekendNights * weekendRate)
            val total = subtotal + cleaningFee
            val deposit = (total * 0.20).toInt()

            val quote = ReservationQuote(
                nights = diffDays,
                weekdayNights = weekdayNights,
                weekendNights = weekendNights,
                subtotal = subtotal,
                cleaningFee = cleaningFee,
                total = total,
                deposit = deposit,
                minNightsRequired = 2
            )

            _uiState.update { it.copy(quote = quote, errorMessage = null) }
        } catch (e: Exception) {
            _uiState.update { it.copy(quote = null) }
        }
    }

    fun openGallery(initialIndex: Int = 0) {
        _uiState.update {
            it.copy(
                isGalleryOpen = true,
                galleryIndex = initialIndex.coerceIn(0, HouseData.GALLERY_PHOTOS.lastIndex)
            )
        }
    }

    fun closeGallery() {
        _uiState.update { it.copy(isGalleryOpen = false) }
    }

    fun setGalleryIndex(index: Int) {
        _uiState.update {
            it.copy(galleryIndex = index.coerceIn(0, HouseData.GALLERY_PHOTOS.lastIndex))
        }
    }

    fun setGalleryCategory(category: String) {
        _uiState.update { it.copy(selectedGalleryCategory = category) }
    }

    fun openRoomDetail(room: RoomItem) {
        _uiState.update { it.copy(selectedRoomDetail = room) }
    }

    fun closeRoomDetail() {
        _uiState.update { it.copy(selectedRoomDetail = null) }
    }

    fun openReviewDialog() {
        _uiState.update { it.copy(isReviewDialogOpen = true) }
    }

    fun closeReviewDialog() {
        _uiState.update { it.copy(isReviewDialogOpen = false) }
    }

    fun submitReview(name: String, rating: Int, tripType: String, comment: String) {
        if (name.isBlank() || comment.isBlank()) return
        val newReview = ReviewItem(
            id = "r_${System.currentTimeMillis()}",
            name = name.trim(),
            date = "Recente",
            rating = rating.coerceIn(1, 5),
            comment = comment.trim(),
            tripType = tripType.ifBlank { "Hóspede" },
            isVerified = true
        )
        _uiState.update {
            it.copy(
                reviews = listOf(newReview) + it.reviews,
                isReviewDialogOpen = false
            )
        }
    }

    fun updateContactForm(name: String, email: String, phone: String, message: String) {
        _uiState.update {
            it.copy(
                contactName = name,
                contactEmail = email,
                contactPhone = phone,
                contactMessage = message
            )
        }
    }

    fun submitContactMessage() {
        if (_uiState.value.contactName.isNotBlank() && _uiState.value.contactMessage.isNotBlank()) {
            _uiState.update {
                it.copy(
                    contactSentSuccess = true,
                    contactName = "",
                    contactEmail = "",
                    contactPhone = "",
                    contactMessage = ""
                )
            }
        }
    }

    fun resetContactSuccess() {
        _uiState.update { it.copy(contactSentSuccess = false) }
    }

    fun generateWhatsAppBookingMessage(): String {
        val state = _uiState.value
        val quote = state.quote
        val petText = if (state.hasPet) " (levarei pet de pequeno porte)" else ""
        return if (quote != null) {
            "Olá Priscila! Gostaria de consultar reserva na Vênus Beach House.\n" +
                    "📅 Período: ${state.checkInDate} até ${state.checkOutDate} (${quote.nights} noites)\n" +
                    "👥 Hóspedes: ${state.guestsCount}$petText\n" +
                    "💰 Valor estimado: R$ ${quote.total} (Sinal 20%: R$ ${quote.deposit})\n" +
                    "Aguardo confirmação da disponibilidade!"
        } else {
            "Olá Priscila! Gostaria de mais informações sobre reservas na Vênus Beach House em Conde - PB."
        }
    }
}
