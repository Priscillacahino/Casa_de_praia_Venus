# Vênus Beach House - Aplicativo Android Nativo

Aplicativo Android nativo da **Vênus Beach House**, casa de praia em Conde - PB (Litoral Sul da Paraíba). Desenvolvido em **Kotlin** com **Jetpack Compose** e arquitetura moderna Android.

## Recursos do Aplicativo

- **Visão Geral e Apresentação**: Banner herói interativo, galeria de fotos, especificações da casa (até 6 hóspedes, 2 quartos, 3 camas, 1 banheiro, piscina em L, churrasqueira, home office e pet friendly) e destaques da hospedagem.
- **Tour Virtual pelos Cômodos**: Navegação e filtros por cômodos ("Quarto 01 - Fui Abduzido 👽🛸", "Quarto 02 - Escritório no Paraíso 💻", "Área Externa 01 - Piscina em L & Churrasqueira 🏊‍♂️", "Área Externa 02 - Varanda Suave na Nave 🌴", "Sala Divindade Ancestral 🎬" e "Cozinha Chef no Rolê 🍳") com fotos e fichas de detalhes.
- **Comodidades & Infraestrutura**: Divisão em 4 categorias detalhadas (Lazer e Área Externa, Trabalho/Tecnologia, Cozinha e Instalações/Serviços).
- **Guia de Praias de Conde**: Destaques de Tabatinga (~5 min) com falésias e rio, Coqueirinho (~8 min) com cânions e coqueirais, além de Carapibus, Praia do Amor, Jacumã e Tambaba.
- **Simulador de Diárias e Reserva**: Seleção dinâmica de check-in, check-out, contagem de hóspedes e pets, cálculo instantâneo de diárias (semana vs fim de semana), taxa de limpeza, total e sinal de 20%, além de botão direto para solicitar reserva via WhatsApp com mensagem pré-formatada.
- **Galeria de Fotos em Modal / Lightbox**: Visualizador em tela cheia com carrossel de fotos categorizadas, controle anterior/próximo e faixa de miniaturas.
- **Avaliações dos Hóspedes**: Média 5.0 estrelas, comentários verificados por tipo de viagem e formulário interativo para envio de novas avaliações.
- **Anfitriã & Mascote Vênus**: Perfil da mascote felina cósmica Vênus Astronauta 🐾, contato da anfitriã Priscila Cahino com botões diretos de WhatsApp, chamada telefônica, Instagram (@venuscasadepraiapb) e Google Maps.

## Arquitetura e Tecnologias

- **Linguagem**: Kotlin 2.0+
- **Interface**: Jetpack Compose com Material Design 3 (M3)
- **Design System & Paleta**: Cores inspiradas nas areias quentes e praias da Paraíba (Amber, Ocean Blue, Stone)
- **Gerenciamento de Estado**: Android `ViewModel`, `StateFlow` e `asStateFlow()`
- **Carregamento de Imagens**: Coil Compose para assets locais e remotos
- **Build System**: Gradle (Kotlin DSL - `.gradle.kts`) com Version Catalog (`gradle/libs.versions.toml`)

## Como Executar no Android Studio

1. Abra a pasta raiz deste repositório no **Android Studio**.
2. Aguarde a sincronização do Gradle (`settings.gradle.kts` e `app/build.gradle.kts`).
3. Conecte um dispositivo Android ou inicie um Emulador com Android 8.0+ (API 26+).
4. Clique em **Run 'app'** para instalar e executar.
