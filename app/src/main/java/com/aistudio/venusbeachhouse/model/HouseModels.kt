package com.aistudio.venusbeachhouse.model

data class HouseInfo(
    val name: String,
    val tagline: String,
    val intro: String,
    val locationShort: String,
    val locationDetails: String,
    val maxGuests: Int,
    val bedrooms: Int,
    val beds: Int,
    val baths: Int,
    val whatsappNumber: String,
    val whatsappDisplay: String,
    val email: String,
    val instagramUrl: String,
    val instagramHandle: String,
    val googleMapsUrl: String,
    val catProfileAsset: String,
    val heroMainAsset: String
)

data class RoomItem(
    val id: String,
    val title: String,
    val subtitle: String,
    val emoji: String,
    val category: String, // "quarto", "externo", "social"
    val description: String,
    val features: List<String>,
    val assetPath: String,
    val alt: String
)

data class BeachItem(
    val id: String,
    val name: String,
    val distance: String,
    val description: String,
    val highlights: List<String>,
    val assetPath: String
)

data class NearbyBeachGuide(
    val name: String,
    val distance: String,
    val description: String
)

data class AmenityItem(
    val name: String,
    val desc: String,
    val iconName: String
)

data class AmenityCategory(
    val title: String,
    val items: List<AmenityItem>
)

data class GalleryPhoto(
    val id: String,
    val title: String,
    val category: String, // "Cômodos", "Lazer & Área Externa", "Praias de Conde"
    val description: String,
    val assetPath: String
)

data class ReviewItem(
    val id: String,
    val name: String,
    val date: String,
    val rating: Int,
    val comment: String,
    val tripType: String,
    val isVerified: Boolean = true
)

data class PricingTier(
    val id: String,
    val season: String,
    val period: String,
    val weekdayPrice: Int,
    val weekendPrice: Int,
    val minNights: Int,
    val description: String,
    val badge: String? = null,
    val highlight: Boolean = false
)

data class ReservationQuote(
    val nights: Int,
    val weekdayNights: Int,
    val weekendNights: Int,
    val subtotal: Int,
    val cleaningFee: Int,
    val total: Int,
    val deposit: Int,
    val minNightsRequired: Int = 2
)
