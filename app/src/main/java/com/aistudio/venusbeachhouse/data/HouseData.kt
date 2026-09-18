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
        locationDetails = "Localizada estrategicamente no litoral sul paraibano, a poucos minutos das praias mais cobiçadas do Nordeste, em um bairro tranquilo e acolhedor em Conde - PB.",
        maxGuests = 6,
        bedrooms = 2,
        beds = 3,
        baths = 1,
        whatsappNumber = "83986705999",
        whatsappDisplay = "(83) 98670-5999",
        email = "priscillacahinoo@gmail.com",
        instagramUrl = "https://www.instagram.com/venuscasadepraiapb?stkn=MWpvd3cwMWpvbmJ2Mg==",
        instagramHandle = "@venuscasadepraiapb",
        googleMapsUrl = "https://maps.app.goo.gl/QdquwUhCt9KzitQr8",
        catProfileAsset = "images/cat_profile.jpg",
        heroMainAsset = "images/piscina_churrasqueira.jpg"
    )

    val ROOMS = listOf(
        RoomItem(
            id = "quarto-01",
            title = "Quarto 01 - Fui abduzido 👽🛸",
            subtitle = "Suíte Cósmica & Conforto",
            emoji = "🛸",
            category = "quarto",
            description = "Este quarto conta com cama de casal, ventilador e porta para acesso ao banheiro principal.",
            features = listOf(
                "Cama de casal com colcha preta espacial de OVNI e vaquinha abduzida",
                "Ventilador de parede de alta potência",
                "Tapeçaria mística feminina com arco-íris e estrelas na parede",
                "Banquinho decorativo arco-íris e tomadas acessíveis",
                "Porta com acesso direto ao banheiro privativo"
            ),
            assetPath = "images/quarto_abduzido.jpg",
            alt = "Quarto 01 - Fui Abduzido na Vênus Beach House"
        ),
        RoomItem(
            id = "quarto-02",
            title = "Quarto 02 - Escritório no Paraíso",
            subtitle = "Home Office & Cama Retrátil Inteligente",
            emoji = "💻",
            category = "quarto",
            description = "Este quarto conta com cama de casal retrátil, ventilador, mesa retrátil, cadeira e suporte para monitor.",
            features = listOf(
                "Estante e cama retrátil em madeira com armário",
                "Mesa de trabalho com cadeira de escritório giratória ergonômica preta",
                "Ventilador de parede potente",
                "Janela com cortina persiana e excelente claridade natural",
                "Placa de porta decorativa redonda com arco-íris e inscrição Amor"
            ),
            assetPath = "images/quarto_escritorio.jpg",
            alt = "Quarto 02 - Escritório no Paraíso na Vênus Beach House"
        ),
        RoomItem(
            id = "area-externa-01",
            title = "Área externa 01 - Ilhado em Vênus",
            subtitle = "Piscina em L & Churrasqueira",
            emoji = "🏊‍♂️",
            category = "externo",
            description = "Este espaço conta com a nossa churrasqueira pré-moldada e uma singela piscina em L. Também pode ser utilizado como garagem, suportando até 1 carro de passeio.",
            features = listOf(
                "Piscina privativa refrescante com design em L e pastilhas azuis",
                "Churrasqueira de tijolos à vista para confraternizações",
                "Varanda coberta com telhado colonial e cortinas decorativas",
                "Plantas ornamentais em vasos e decoração de praia",
                "Garagem privativa fechada para 1 carro de passeio"
            ),
            assetPath = "images/piscina_churrasqueira.jpg",
            alt = "Área externa 01 com piscina em L e churrasqueira"
        ),
        RoomItem(
            id = "area-externa-02",
            title = "Área externa 02 - Suave na nave",
            subtitle = "Varanda Colonial & Jardim Suspenso",
            emoji = "🌴",
            category = "externo",
            description = "Neste espaço temos o nosso jardim suspenso para dar vida ao ambiente e também uma rede tipicamente nordestina para que você possa relaxar ao ar livre.",
            features = listOf(
                "Varanda colonial sombreada e ventilada para relaxar ao ar livre",
                "Ambiente arejado com plantas tropicais em vasos",
                "Espaço para rede e descanso revigorante",
                "Decoração alegre com cortinas coloridas e estilo rústico"
            ),
            assetPath = "images/area_externa_rede.jpg",
            alt = "Área externa 02 Suave na Nave com varanda e jardim"
        ),
        RoomItem(
            id = "sala",
            title = "Sala - Divindade ancestral",
            subtitle = "Cinema Smart & Convivência Integrada",
            emoji = "🎬",
            category = "social",
            description = "Temos sofá bicama de solteiro, mesa bancada, cadeiras e projetor smart.",
            features = listOf(
                "Sofá de madeira bicama com almofadas temáticas sol e girassol",
                "Bancada americana de granito com cadeiras pretas modernas",
                "Quadros com arte de divindades ancestrais na parede",
                "Geladeira duplex e integração aberta com a cozinha",
                "Projetor smart para noites de streaming e cinema"
            ),
            assetPath = "images/sala_divindade.jpg",
            alt = "Sala Divindade Ancestral com sofá bicama e bancada integrada"
        ),
        RoomItem(
            id = "cozinha",
            title = "Cozinha - Chef no rolê",
            subtitle = "Completa & Prática para suas Férias",
            emoji = "🍳",
            category = "social",
            description = "Nossa cozinha conta com geladeira, fogão, Airfryer e utensílios.",
            features = listOf(
                "Geladeira duplex espaçosa e bancada prática",
                "Fogão a gás para refeições completas",
                "Fritadeira elétrica Airfryer para petiscos práticos",
                "Kit completo de panelas, pratos, copos e talheres",
                "Liquidificador, cafeteira e itens essenciais"
            ),
            assetPath = "images/cozinha_chef.jpg",
            alt = "Cozinha Chef no Rolê integrada à sala americana"
        )
    )

    val BEACHES = listOf(
        BeachItem(
            id = "tabatinga",
            name = "Praia de Tabatinga",
            distance = "~5 a 7 min",
            description = "Famosa pelas imponentes falésias coloridas, encontro do rio com o mar e piscinas naturais mornas e cristalinas.",
            highlights = listOf(
                "Falésias exuberantes",
                "Encontro do Rio com o Mar",
                "Piscinas naturais na maré baixa"
            ),
            assetPath = "images/tabatinga.jpg"
        ),
        BeachItem(
            id = "coqueirinho",
            name = "Praia de Coqueirinho",
            distance = "~8 a 10 min",
            description = "Considerada uma das praias mais bonitas do Brasil, cercada por coqueirais ondulantes, mar verde esmeralda e cânions multicoloridos.",
            highlights = listOf(
                "Mar verde-esmeralda",
                "Coqueirais",
                "Cânions e mirantes"
            ),
            assetPath = "images/coqueirinho.jpg"
        )
    )

    val OTHER_BEACHES = listOf(
        NearbyBeachGuide(
            name = "Praia de Carapibus",
            distance = "~3 a 5 min",
            description = "Piscinas naturais de corais e quiosques charmosos à beira-mar."
        ),
        NearbyBeachGuide(
            name = "Praia do Amor",
            distance = "~5 min",
            description = "Pedra Furada, mirante natural e falésias deslumbrantes."
        ),
        NearbyBeachGuide(
            name = "Praia de Jacumã",
            distance = "~4 min",
            description = "Centro comercial, artesanato, mercados e culinária paraibana."
        ),
        NearbyBeachGuide(
            name = "Praia de Tambaba",
            distance = "~12 min",
            description = "Referência internacional por suas falésias e natureza preservada."
        )
    )

    val AMENITIES = listOf(
        AmenityCategory(
            title = "Lazer e Área Externa",
            items = listOf(
                AmenityItem("Piscina privativa em L", "Perfeita para relaxar e se refrescar a qualquer hora", "pool"),
                AmenityItem("Churrasqueira pré-moldada", "Pronta para churrascos e confraternizações", "grill"),
                AmenityItem("Rede nordestina autêntica", "Para relaxar sob a brisa na área externa Suave na nave", "hammock"),
                AmenityItem("Jardim suspenso", "Verde e vida decorando o ambiente externo", "garden")
            )
        ),
        AmenityCategory(
            title = "Trabalho, Tecnologia & Sala",
            items = listOf(
                AmenityItem("Home Office completo", "Mesa retrátil, cadeira ergonômica e suporte para monitor", "work"),
                AmenityItem("Projetor Smart", "Cinema em casa na sala com projetor", "movie"),
                AmenityItem("Wi-Fi rápido", "Conexão estável para videochamadas e streaming", "wifi"),
                AmenityItem("Sofá bicama de solteiro", "Confortável para repouso ou acomodar hóspedes extras", "bed")
            )
        ),
        AmenityCategory(
            title = "Cozinha e Praticidade",
            items = listOf(
                AmenityItem("Airfryer elétrica", "Fritadeira sem óleo para lanches e refeições rápidas", "kitchen"),
                AmenityItem("Fogão a gás", "Cozinhe suas receitas favoritas com liberdade", "kitchen"),
                AmenityItem("Geladeira espaçosa", "Mantém bebidas geladas e alimentos frescos", "kitchen"),
                AmenityItem("Utensílios completos", "Panelas, pratos, copos, talheres e recipientes", "kitchen")
            )
        ),
        AmenityCategory(
            title = "Instalações & Serviços",
            items = listOf(
                AmenityItem("Garagem privativa", "Vaga segura para 1 carro de passeio", "car"),
                AmenityItem("Lavanderia completa", "Tanque para lavar e varal retrátil para secagem", "laundry"),
                AmenityItem("Ventiladores potentes", "Ambientes frescos nos quartos e áreas sociais", "fan"),
                AmenityItem("Pet Friendly 🐾", "Seu pet de pequeno/médio porte é bem-vindo", "pet")
            )
        )
    )

    val GALLERY_PHOTOS = listOf(
        GalleryPhoto(
            id = "p1",
            title = "Piscina em L e Churrasqueira",
            category = "Lazer & Área Externa",
            description = "Área externa 01 - Ilhado em Vênus com piscina privativa em L, churrasqueira, varanda colonial e plantas.",
            assetPath = "images/piscina_churrasqueira.jpg"
        ),
        GalleryPhoto(
            id = "p2",
            title = "Quarto 01 - Fui abduzido 👽🛸",
            category = "Cômodos",
            description = "Cama de casal com temática espacial e decoração mística.",
            assetPath = "images/quarto_abduzido.jpg"
        ),
        GalleryPhoto(
            id = "p3",
            title = "Quarto 01 - Vista das Portas & Ventilador",
            category = "Cômodos",
            description = "Segundo ângulo do Quarto 01 mostrando ventilador, portas para o banheiro e corredor.",
            assetPath = "images/quarto_abduzido_angulo2.jpg"
        ),
        GalleryPhoto(
            id = "p4",
            title = "Quarto 02 - Escritório no Paraíso",
            category = "Cômodos",
            description = "Cama retrátil, bancada home office e cadeira ergonômica.",
            assetPath = "images/quarto_escritorio.jpg"
        ),
        GalleryPhoto(
            id = "p5",
            title = "Sala & Cozinha Americana Integrada",
            category = "Cômodos",
            description = "Sofá bicama, bancada americana, geladeira e integração com a cozinha.",
            assetPath = "images/sala_divindade.jpg"
        ),
        GalleryPhoto(
            id = "p6",
            title = "Praia de Tabatinga",
            category = "Praias de Conde",
            description = "Falésias coloridas, encontro do rio com o mar e piscinas naturais.",
            assetPath = "images/tabatinga.jpg"
        ),
        GalleryPhoto(
            id = "p7",
            title = "Praia de Coqueirinho",
            category = "Praias de Conde",
            description = "Coqueirais, mar verde-esmeralda, cânions e mirantes.",
            assetPath = "images/coqueirinho.jpg"
        ),
        GalleryPhoto(
            id = "p8",
            title = "Vênus Astronauta",
            category = "Lazer & Área Externa",
            description = "A mascote que dá nome e personalidade à Vênus Beach House.",
            assetPath = "images/cat_profile.jpg"
        )
    )
}
