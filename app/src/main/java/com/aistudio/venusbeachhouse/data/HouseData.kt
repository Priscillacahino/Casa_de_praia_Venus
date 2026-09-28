package com.aistudio.venusbeachhouse.data

import com.aistudio.venusbeachhouse.model.AmenityCategory
import com.aistudio.venusbeachhouse.model.AmenityItem
import com.aistudio.venusbeachhouse.model.BeachItem
import com.aistudio.venusbeachhouse.model.GalleryPhoto
import com.aistudio.venusbeachhouse.model.HouseInfo
import com.aistudio.venusbeachhouse.model.NearbyBeachGuide
import com.aistudio.venusbeachhouse.model.RoomItem

object HouseData {
    const val GUIDE_SOURCE_URL =
        "https://raw.githubusercontent.com/Priscillacahino/guia_lugares_pb/main/guia_offline.html"

    val HOUSE_INFO = HouseInfo(
        name = "Vênus Beach House",
        tagline = "Venus, sua casa de praia!",
        intro = "Aqui você viverá momentos de alegria, confraternização e união. Será um refúgio para relaxar e se divertir junto aos amigos e à família.",
        locationShort = "Conde, Litoral Sul da Paraíba, Brasil",
        locationDetails = "Conde, Litoral Sul da Paraíba, com acesso às praias e aos comércios de Jacumã.",
        maxGuests = 6,
        bedrooms = 2,
        beds = 3,
        baths = 1,
        whatsappNumber = "83986705999",
        whatsappDisplay = "(83) 98670-5999",
        email = "",
        instagramUrl = "https://www.instagram.com/venuscasadepraiapb?stkn=MWpvd3cwMWpvbmJ2Mg==",
        instagramHandle = "@venuscasadepraiapb",
        googleMapsUrl = "https://maps.app.goo.gl/QdquwUhCt9KzitQr8",
        catProfileAsset = "images/cat_profile.jpg",
        heroMainAsset = "images/piscina_churrasqueira.jpg"
    )

    val ROOMS = listOf(
        RoomItem("quarto-01","Quarto 01 - Fui abduzido 👽🛸","Conforto para descansar","🛸","quarto",
            "Cama de casal, ventilação e acesso ao banheiro principal.",
            listOf("Cama de casal","Ventilador","Acesso ao banheiro"),
            "images/quarto_abduzido.jpg","Quarto 01 - Fui Abduzido na Vênus Beach House"),
        RoomItem("quarto-02","Quarto 02 - Escritório no Paraíso","Descanso & Home Office","💻","quarto",
            "Cama retrátil, ventilador e estação para Home Office.",
            listOf("Cama retrátil","Mesa de trabalho","Ventilador"),
            "images/quarto_escritorio.jpg","Quarto 02 - Escritório no Paraíso na Vênus Beach House"),
        RoomItem("area-externa-01","Área externa 01 - Ilhado em Vênus","Piscina em L & Churrasqueira","🏊‍♂️","externo",
            "Piscina em L, churrasqueira e área de convivência.",
            listOf("Piscina privativa em L","Churrasqueira","Área de convivência"),
            "images/piscina_churrasqueira.jpg","Área externa 01 com piscina em L e churrasqueira"),
        RoomItem("area-externa-02","Área externa 02 - Suave na nave","Rede & Jardim Suspenso","🌴","externo",
            "Área externa com rede nordestina e jardim suspenso.",
            listOf("Rede","Jardim suspenso","Espaço para descanso"),
            "images/area_externa_rede.jpg","Área externa 02 Suave na Nave com rede e jardim suspenso"),
        RoomItem("sala","Sala - Divindade ancestral","Convivência & Cinema","🎬","social",
            "Sala com sofá bicama, bancada e projetor smart.",
            listOf("Sofá bicama","Bancada","Projetor smart"),
            "images/sala_divindade.jpg","Sala Divindade Ancestral"),
        RoomItem("cozinha","Cozinha - Chef no rolê","Prática para a estadia","🍳","social",
            "Cozinha com geladeira, fogão, Airfryer e utensílios.",
            listOf("Geladeira","Fogão","Airfryer e utensílios"),
            "images/cozinha_chef.jpg","Cozinha Chef no Rolê")
    )

    val BEACHES = listOf(
        BeachItem("tabatinga","Praia de Tabatinga","~5 a 7 min",
            "Falésias, encontro do rio com o mar e piscinas naturais na maré baixa.",
            listOf("Falésias","Encontro do rio com o mar","Piscinas naturais"),"images/tabatinga.jpg"),
        BeachItem("coqueirinho","Praia de Coqueirinho","~8 a 10 min",
            "Coqueirais, mar verde-esmeralda, cânions e mirantes.",
            listOf("Mar verde-esmeralda","Coqueirais","Cânions e mirantes"),"images/coqueirinho.jpg")
    )

    val OTHER_BEACHES = listOf(
        NearbyBeachGuide("Praia de Carapibus","~3 a 5 min","Piscinas naturais e quiosques à beira-mar."),
        NearbyBeachGuide("Praia do Amor","~5 min","Pedra Furada, mirante natural e falésias."),
        NearbyBeachGuide("Praia de Jacumã","~4 min","Comércio, artesanato, mercados e gastronomia."),
        NearbyBeachGuide("Praia de Tambaba","~12 min","Falésias e natureza preservada.")
    )

    val AMENITIES = listOf(
        AmenityCategory("Comodidades & Infraestrutura", listOf(
            AmenityItem("Piscina privativa em L","Com cascata e ducha externa","pool"),
            AmenityItem("Churrasqueira pré-moldada","Uso privativo durante a hospedagem","grill"),
            AmenityItem("Wi-Fi de fibra ótica","Conexão para lazer e Home Office","wifi"),
            AmenityItem("Home Office","Espaço dedicado para trabalho remoto","work"),
            AmenityItem("Pet Friendly 🐾","Pet bem-vindo sem taxa adicional","pet")
        ))
    )

    val GALLERY_PHOTOS = listOf(
        GalleryPhoto("p1","Área externa 01 - Ilhado em Vênus","Área externa","Piscina em L e churrasqueira.","images/piscina_churrasqueira.jpg"),
        GalleryPhoto("p2","Área externa 02 - Suave na nave","Área externa","Rede e jardim suspenso.","images/area_externa_rede.jpg"),
        GalleryPhoto("p3","Quarto 01 - Fui abduzido 👽🛸","Cômodos","Cama de casal e ventilação.","images/quarto_abduzido.jpg"),
        GalleryPhoto("p4","Quarto 01 - Segundo ângulo","Cômodos","Segundo ângulo do Quarto 01.","images/quarto_abduzido_angulo2.jpg"),
        GalleryPhoto("p5","Quarto 02 - Escritório no Paraíso","Cômodos","Cama retrátil e Home Office.","images/quarto_escritorio.jpg"),
        GalleryPhoto("p6","Sala - Divindade ancestral","Cômodos","Sala com sofá bicama e projetor smart.","images/sala_divindade.jpg"),
        GalleryPhoto("p7","Cozinha - Chef no rolê","Cômodos","Cozinha equipada para a estadia.","images/cozinha_chef.jpg"),
        GalleryPhoto("p8","Praia de Tabatinga","Praias de Conde","Falésias e piscinas naturais.","images/tabatinga.jpg"),
        GalleryPhoto("p9","Praia de Coqueirinho","Praias de Conde","Coqueirais, cânions e mirantes.","images/coqueirinho.jpg"),
        GalleryPhoto("p10","Vênus Astronauta","Mascote","A mascote da Vênus Beach House.","images/cat_profile.jpg")
    )
}
