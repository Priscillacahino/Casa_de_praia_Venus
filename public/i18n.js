(() => {
  "use strict";

  const STORAGE_KEY = "venus:lang";
  const SUPPORTED = new Set(["pt", "es"]);

  const ES = {
    "Conde · Litoral Sul da Paraíba": "Conde · Litoral Sur de Paraíba",
    "A casa": "La casa",
    "Ambientes": "Espacios",
    "Praias": "Playas",
    "Tarifas": "Tarifas",
    "Reservar": "Reservar",
    "Guia Vênus": "Guía Vênus",
    "Contato": "Contacto",
    "Privacidade": "Privacidad",
    "Vênus, sua casa de praia!": "¡Vênus, tu casa de playa!",
    "Aqui você viverá momentos de alegria, confraternização e união. Será um refúgio para relaxar e se divertir junto aos amigos e à família.": "Aquí vivirás momentos de alegría, convivencia y unión. Será un refugio para relajarte y disfrutar con amigos y familia.",
    "Estamos localizados no Litoral Sul, próximos às praias paradisíacas da Paraíba, como:": "Estamos en el Litoral Sur, cerca de playas paradisíacas de Paraíba, como:",
    "A região também reúne outros paraísos do Nordeste, em Conde, no Litoral Sul da Paraíba. Venha viver essa experiência e criar memórias incríveis e inesquecíveis!": "La región también reúne otros paraísos del Nordeste, en Conde, en el Litoral Sur de Paraíba. ¡Ven a vivir esta experiencia y crear recuerdos increíbles e inolvidables!",
    "Consultar reserva": "Consultar reserva",
    "💬 Falar no WhatsApp": "💬 Hablar por WhatsApp",
    "Abrir Guia Vênus": "Abrir Guía Vênus",
    "Comodidades & Infraestrutura": "Comodidades e infraestructura",
    "O que este refúgio oferece": "Lo que ofrece este refugio",
    "Uma casa de praia pensada para descanso, convivência e praticidade, com uso exclusivo durante a hospedagem.": "Una casa de playa pensada para el descanso, la convivencia y la practicidad, de uso exclusivo durante la estancia.",
    "🏡 Uso exclusivo": "🏡 Uso exclusivo",
    "Casa e áreas de convivência privativas, sem compartilhamento com outros hóspedes.": "Casa y áreas de convivencia privadas, sin compartir con otros huéspedes.",
    "🏊 Piscina privativa": "🏊 Piscina privada",
    "Piscina em L e ducha externa.": "Piscina en L y ducha exterior.",
    "🔥 Churrasqueira": "🔥 Barbacoa",
    "Churrasqueira pré-moldada privativa com grelha.": "Barbacoa prefabricada privada con parrilla.",
    "💻 Wi-Fi & Home Office": "💻 Wi-Fi y espacio de trabajo",
    "Internet de fibra ótica e espaço dedicado para trabalho remoto.": "Internet de fibra óptica y espacio dedicado al trabajo remoto.",
    "🐾 Pet Friendly": "🐾 Pet Friendly",
    "Seu animalzinho é bem-vindo sem cobrança de taxa adicional.": "Tu mascota es bienvenida sin cargo adicional.",
    "👥 Até 6 hóspedes": "👥 Hasta 6 huéspedes",
    "Capacidade máxima informada para adultos e crianças.": "Capacidad máxima informada para adultos y niños.",
    "Conheça a casa": "Conoce la casa",
    "Ambientes da Vênus Casa de Praia": "Espacios de Vênus Casa de Praia",
    "Este quarto conta com cama de casal, ventilador e porta para acesso ao banheiro principal.": "Esta habitación cuenta con cama doble, ventilador y puerta de acceso al baño principal.",
    "Este quarto conta com cama de casal retrátil, ventilador, mesa retrátil, cadeira e suporte para monitor.": "Esta habitación cuenta con cama doble retráctil, ventilador, mesa retráctil, silla y soporte para monitor.",
    "Neste espaço temos o nosso jardim suspenso para dar vida ao ambiente e uma rede tipicamente nordestina para que você possa relaxar ao ar livre.": "En este espacio tenemos un jardín suspendido que aporta vida al ambiente y una hamaca típicamente nordestina para relajarte al aire libre.",
    "Este espaço conta com a nossa churrasqueira pré-moldada e uma singela piscina em L. Também pode ser utilizado como garagem, suportando até 1 carro de passeio.": "Este espacio cuenta con nuestra barbacoa prefabricada y una sencilla piscina en L. También puede utilizarse como garaje para 1 automóvil.",
    "Nossa cozinha conta com geladeira, fogão, liquidificador, Airfryer e utensílios.": "Nuestra cocina cuenta con nevera, cocina, licuadora, Airfryer y utensilios.",
    "Temos sofá bicama de solteiro, mesa bancada, cadeiras e projetor smart.": "Tenemos sofá cama individual, mesa tipo barra, sillas y proyector inteligente.",
    "Litoral Sul da Paraíba · Conde": "Litoral Sur de Paraíba · Conde",
    "Praias paradisíacas ao seu redor": "Playas paradisíacas a tu alrededor",
    "A Vênus Casa de Praia está cercada por praias, falésias e piscinas naturais do litoral sul paraibano.": "Vênus Casa de Praia está rodeada de playas, acantilados y piscinas naturales del litoral sur de Paraíba.",
    "Falésias, encontro do rio com o mar e piscinas naturais na maré baixa.": "Acantilados, encuentro del río con el mar y piscinas naturales durante la marea baja.",
    "Coqueirais, mar verde-esmeralda, cânions e mirantes.": "Palmerales, mar verde esmeralda, cañones y miradores.",
    "Dica da anfitriã Vênus:": "Consejo de la anfitriona Vênus:",
    "visite Tabatinga e Coqueirinho na maré baixa para aproveitar melhor as piscinas naturais.": "visita Tabatinga y Coqueirinho durante la marea baja para disfrutar mejor de las piscinas naturales.",
    "Transparência & condições": "Transparencia y condiciones",
    "Valores & condições da reserva": "Valores y condiciones de la reserva",
    "Estes são os valores atuais de referência da Vênus Casa de Praia. A cotação oficial continua sendo calculada e revalidada pelo servidor antes do envio da solicitação.": "Estos son los valores actuales de referencia de Vênus Casa de Praia. La cotización oficial sigue siendo calculada y revalidada por el servidor antes de enviar la solicitud.",
    "Tabela atual de valores": "Tabla actual de precios",
    "Hóspedes": "Huéspedes",
    "Dias úteis": "Días laborables",
    "FDS e feriados": "Fin de semana y festivos",
    "Adicional fixo": "Adicional fijo",
    "2 hóspedes": "2 huéspedes",
    "3 hóspedes": "3 huéspedes",
    "4 hóspedes": "4 huéspedes",
    "5 hóspedes": "5 huéspedes",
    "6 hóspedes": "6 huéspedes",
    "R$ 120/noite": "R$ 120/noche",
    "R$ 150/noite": "R$ 150/noche",
    "Até 2 hóspedes estão incluídos na diária. Do 3º ao 6º hóspede, é acrescentado R$ 50 por pessoa, uma única vez por hospedagem. Todos seguem o mesmo período e horários de check-in e check-out da reserva.": "Hasta 2 huéspedes están incluidos en la tarifa. Del 3.º al 6.º huésped se añaden R$ 50 por persona una sola vez por estancia. Todos siguen el mismo período y los mismos horarios de check-in y check-out de la reserva.",
    "📅 Feriados e datas especiais": "📅 Festivos y fechas especiales",
    "Noites de sexta e sábado seguem a tarifa de fim de semana. Feriados cadastrados também usam essa tarifa; outros períodos especiais podem ter valores próprios configurados pela administração.": "Las noches de viernes y sábado utilizan la tarifa de fin de semana. Los festivos registrados también utilizan esta tarifa; otros períodos especiales pueden tener valores propios configurados por la administración.",
    "🧾 Limpeza": "🧾 Limpieza",
    "Quando houver taxa de limpeza, o valor aparece na cotação antes do envio da solicitação.": "Cuando exista una tarifa de limpieza, su valor aparecerá en la cotización antes de enviar la solicitud.",
    "🔐 Reserva": "🔐 Reserva",
    "20% de sinal": "20% de señal",
    "após termo assinado e validado, com": "después del documento firmado y validado, con",
    "80% restantes no check-in": "80% restante en el check-in",
    ", salvo ajuste registrado pela administração.": ", salvo ajuste registrado por la administración.",
    "O que está incluso": "Qué está incluido",
    "Uso exclusivo e privativo da casa.": "Uso exclusivo y privado de la casa.",
    "Piscina privativa em L e ducha externa.": "Piscina privada en L y ducha exterior.",
    "Churrasqueira pré-moldada privativa.": "Barbacoa prefabricada privada.",
    "Wi-Fi de fibra ótica e espaço para Home Office.": "Wi-Fi de fibra óptica y espacio para trabajar.",
    "Pet Friendly sem taxa adicional.": "Pet Friendly sin cargo adicional.",
    "Capacidade máxima de até 6 hóspedes.": "Capacidad máxima de hasta 6 huéspedes.",
    "Cancelamento": "Cancelación",
    "48 horas ou mais:": "48 horas o más:",
    "devolução de 100% do sinal pago.": "devolución del 100% de la señal pagada.",
    "De 24 horas até menos de 48 horas:": "De 24 horas a menos de 48 horas:",
    "devolução de 50% do sinal pago.": "devolución del 50% de la señal pagada.",
    "Menos de 24 horas:": "Menos de 24 horas:",
    "sem reembolso contratual do sinal, ressalvados direitos legais aplicáveis.": "sin reembolso contractual de la señal, sin perjuicio de los derechos legales aplicables.",
    "O site não executa estorno automaticamente. A administração analisa o caso e registra eventual devolução após a conferência financeira.": "El sitio no realiza reembolsos automáticamente. La administración analiza el caso y registra cualquier devolución después de la verificación financiera.",
    "Consultar disponibilidade": "Consultar disponibilidad",
    "💬 Perguntar no WhatsApp": "💬 Consultar por WhatsApp",
    "Localização": "Ubicación",
    "Onde você estará": "Dónde estarás",
    "Conde, no Litoral Sul da Paraíba: tranquilidade para relaxar, com acesso às praias e aos comércios de Jacumã.": "Conde, en el Litoral Sur de Paraíba: tranquilidad para relajarte, con acceso a las playas y al comercio de Jacumã.",
    "Como chegar": "Cómo llegar",
    "Localização preservada": "Ubicación protegida",
    "O site apresenta a região e o link oficial de navegação. O endereço residencial detalhado não é exposto publicamente antes da reserva.": "El sitio muestra la región y el enlace oficial de navegación. La dirección residencial detallada no se publica antes de la reserva.",
    "Vênus · Anfitriã oficial e mascote": "Vênus · Anfitriona oficial y mascota",
    "Hospedado por Vênus 🐾🪐": "Hospedado por Vênus 🐾🪐",
    "“Aqui você viverá momentos de alegria, confraternização e união. Será um refúgio para relaxar e se divertir junto aos amigos e à família.”": "“Aquí vivirás momentos de alegría, convivencia y unión. Será un refugio para relajarte y disfrutar con amigos y familia.”",
    "A Vênus Casa de Praia nasceu do desejo de proporcionar um espaço acolhedor no Litoral Sul da Paraíba. Cada ambiente mantém sua própria identidade, sem necessidade de detalhar elementos decorativos que não interferem na hospedagem.": "Vênus Casa de Praia nació del deseo de ofrecer un espacio acogedor en el Litoral Sur de Paraíba. Cada ambiente mantiene su propia identidad, sin necesidad de detallar elementos decorativos que no influyen en la estancia.",
    "Falar com o anfitrião": "Hablar con el anfitrión",
    "Experiências reais": "Experiencias reales",
    "Avaliações dos hóspedes": "Reseñas de los huéspedes",
    "As avaliações aparecem aqui somente após estadia concluída e moderação.": "Las reseñas aparecen aquí únicamente después de una estancia finalizada y de la moderación.",
    "Nenhuma avaliação pública disponível no momento.": "No hay reseñas públicas disponibles por el momento.",
    "Contato fácil e direto": "Contacto fácil y directo",
    "Fale com a Vênus Casa de Praia": "Habla con Vênus Casa de Praia",
    "Você não precisa iniciar uma reserva para tirar dúvidas. WhatsApp e Instagram ficam disponíveis diretamente; o formulário é apenas uma opção adicional.": "No necesitas iniciar una reserva para resolver dudas. WhatsApp e Instagram están disponibles directamente; el formulario es solo una opción adicional.",
    "Pagamento de reserva:": "Pago de la reserva:",
    "use sempre o acompanhamento com protocolo e código privado. O contato geral pelo WhatsApp não libera pagamento por si só.": "utiliza siempre el seguimiento con protocolo y código privado. El contacto general por WhatsApp no habilita el pago por sí solo.",
    "WHATSAPP OFICIAL": "WHATSAPP OFICIAL",
    "Atendimento rápido para consultar datas e tirar dúvidas.": "Atención rápida para consultar fechas y resolver dudas.",
    "INSTAGRAM OFICIAL": "INSTAGRAM OFICIAL",
    "Acompanhe novidades, fotos e conteúdo da Vênus.": "Sigue las novedades, fotos y contenidos de Vênus.",
    "LOCALIZAÇÃO": "UBICACIÓN",
    "Próximo a Jacumã, Carapibus, Tabatinga, Coqueirinho e Praia do Amor.": "Cerca de Jacumã, Carapibus, Tabatinga, Coqueirinho y Praia do Amor.",
    "E-MAIL OFICIAL": "CORREO OFICIAL",
    "Canal em atualização": "Canal en actualización",
    "E-mail secundário para mensagens e registros.": "Correo secundario para mensajes y registros.",
    "Formulário de contato": "Formulario de contacto",
    "Envie sua mensagem": "Envía tu mensaje",
    "🔒 Registro seguro": "🔒 Registro seguro",
    "Seu nome completo": "Tu nombre completo",
    "Seu e-mail": "Tu correo electrónico",
    "WhatsApp ou telefone (opcional)": "WhatsApp o teléfono (opcional)",
    "Datas pretendidas ou época (opcional)": "Fechas previstas o época (opcional)",
    "Sua mensagem ou dúvida": "Tu mensaje o consulta",
    "Autorizo o uso dos dados para responder esta mensagem.": "Autorizo el uso de mis datos para responder este mensaje.",
    "Enviar mensagem": "Enviar mensaje",
    "Não envie documentos, senhas ou dados bancários neste formulário.": "No envíes documentos, contraseñas ni datos bancarios en este formulario.",
    "Reserva segura": "Reserva segura",
    "Escolha as datas": "Elige las fechas",
    "Disponibilidade": "Disponibilidad",
    "Mês anterior": "Mes anterior",
    "Próximo mês": "Mes siguiente",
    "Legenda da disponibilidade": "Leyenda de disponibilidad",
    "Disponível": "Disponible",
    "Indisponível": "No disponible",
    "Selecionado": "Seleccionado",
    "Carregando disponibilidade…": "Cargando disponibilidad…",
    "Datas indisponíveis incluem reservas confirmadas, bloqueios e prioridades temporárias ativas.": "Las fechas no disponibles incluyen reservas confirmadas, bloqueos y prioridades temporales activas.",
    "Não foi possível carregar o calendário agora. Você ainda pode usar os campos de check-in e check-out.": "No fue posible cargar el calendario ahora. Aún puedes utilizar los campos de check-in y check-out.",
    "Check-in selecionado. Agora escolha a data de check-out.": "Check-in seleccionado. Ahora elige la fecha de check-out.",
    "Não foi possível carregar a disponibilidade.": "No fue posible cargar la disponibilidad.",
    "Etapas da reserva": "Etapas de la reserva",
    "Datas": "Fechas",
    "Solicitação": "Solicitud",
    "Termo": "Documento",
    "WhatsApp / pagamento": "WhatsApp / pago",
    "Conferência bancária": "Verificación bancaria",
    "Confirmada": "Confirmada",
    "Ao retornar do WhatsApp para esta aba, o site consulta novamente o andamento. O código privado não é enviado ao WhatsApp.": "Al volver de WhatsApp a esta pestaña, el sitio consulta nuevamente el estado. El código privado no se envía a WhatsApp.",
    "Sua reserva está confirmada! Guarde o protocolo e acompanhe aqui qualquer atualização da hospedagem.": "¡Tu reserva está confirmada! Guarda el protocolo y consulta aquí cualquier actualización de la estancia.",
    "Esquecer acesso deste dispositivo": "Olvidar acceso en este dispositivo",
    "Para facilitar o retorno do WhatsApp, o protocolo e o código privado ficam temporariamente apenas nesta aba do navegador.": "Para facilitar el regreso desde WhatsApp, el protocolo y el código privado permanecen temporalmente solo en esta pestaña del navegador.",
    "Consulte valor e disponibilidade no servidor.": "Consulta el valor y la disponibilidad en el servidor.",
    "O navegador não calcula preços por conta própria. O valor exibido vem da API e é revalidado quando o pedido é enviado.": "El navegador no calcula precios por su cuenta. El valor mostrado proviene de la API y se vuelve a validar cuando se envía la solicitud.",
    "Informe check-in e check-out para consultar.": "Indica las fechas de check-in y check-out para consultar.",
    "Nome completo": "Nombre completo",
    "Telefone/WhatsApp": "Teléfono/WhatsApp",
    "Hóspedes": "Huéspedes",
    "Levo pet": "Viajo con mascota",
    "Observações": "Observaciones",
    "Autorizo o uso destes dados para atender esta solicitação.": "Autorizo el uso de estos datos para atender esta solicitud.",
    "Enviar solicitação": "Enviar solicitud",
    "Não envie dados bancários, documentos ou senhas neste formulário.": "No envíes datos bancarios, documentos ni contraseñas en este formulario.",
    "Acompanhar solicitação": "Seguir solicitud",
    "Consulte o andamento sem criar uma conta.": "Consulta el estado sin crear una cuenta.",
    "O protocolo identifica a solicitação. O código privado funciona como uma chave de acesso: não compartilhe com terceiros. Se houver risco de exposição, a administração pode substituí-lo e o anterior deixa de funcionar.": "El protocolo identifica la solicitud. El código privado funciona como una clave de acceso: no lo compartas con terceros. Si existe riesgo de exposición, la administración puede sustituirlo y el anterior dejará de funcionar.",
    "Nenhuma solicitação consultada neste dispositivo.": "No se ha consultado ninguna solicitud en este dispositivo.",
    "Termo de compromisso": "Documento de compromiso",
    "Assinatura eletrônica pelo GOV.BR": "Firma electrónica mediante GOV.BR",
    "Antes do pagamento da reserva, prepare o termo com os dados da solicitação, salve-o como PDF, assine pelo serviço oficial GOV.BR e envie o PDF assinado para validação.": "Antes de pagar la reserva, prepara el documento con los datos de la solicitud, guárdalo como PDF, fírmalo mediante el servicio oficial GOV.BR y envía el PDF firmado para su validación. El documento contractual oficial se genera en portugués (Brasil).",
    "Consulte a solicitação para verificar o termo.": "Consulta la solicitud para verificar el documento.",
    "1. Preparar termo em PDF": "1. Preparar documento en PDF",
    "2. Assinar pelo GOV.BR": "2. Firmar mediante GOV.BR",
    "3. Enviar PDF assinado": "3. Enviar PDF firmado",
    "O envio do PDF não confirma a assinatura automaticamente. A administração valida o documento antes de liberar o pagamento.": "El envío del PDF no confirma la firma automáticamente. La administración valida el documento antes de habilitar el pago.",
    "Vênus Casa de Praia · Termo de compromisso": "Vênus Casa de Praia · Documento de compromiso",
    "Protocolo": "Protocolo",
    "Código privado de acompanhamento": "Código privado de seguimiento",
    "Consultar andamento": "Consultar estado",
    "Continuar pelo WhatsApp": "Continuar por WhatsApp",
    "Já realizei um pagamento": "Ya realicé un pago",
    "Solicitar cancelamento": "Solicitar cancelación",
    "Após a estadia": "Después de la estancia",
    "Avalie sua experiência.": "Evalúa tu experiencia.",
    "A avaliação só é aceita para uma reserva confirmada cujo check-out já tenha ocorrido. O nome vem da própria reserva e a publicação passa por moderação.": "La reseña solo se acepta para una reserva confirmada cuyo check-out ya haya ocurrido. El nombre proviene de la propia reserva y la publicación pasa por moderación.",
    "Nota": "Puntuación",
    "Selecione": "Selecciona",
    "5 — Excelente": "5 — Excelente",
    "4 — Muito boa": "4 — Muy buena",
    "3 — Boa": "3 — Buena",
    "2 — Regular": "2 — Regular",
    "1 — Ruim": "1 — Mala",
    "Comentário": "Comentario",
    "Autorizo a publicação do meu nome, nota e comentário após moderação.": "Autorizo la publicación de mi nombre, puntuación y comentario después de la moderación.",
    "Enviar avaliação": "Enviar reseña",
    "Aplicativo Android": "Aplicación Android",
    "Baixe somente a versão publicada pela Vênus Casa de Praia.": "Descarga únicamente la versión publicada por Vênus Casa de Praia.",
    "O aplicativo será distribuído diretamente pela página oficial da casa, sem depender da Google Play. Antes de instalar, confira a versão e o SHA-256 exibidos nesta página.": "La aplicación se distribuirá directamente desde la página oficial de la casa, sin depender de Google Play. Antes de instalarla, comprueba la versión y el SHA-256 mostrados en esta página.",
    "Consultando disponibilidade do APK oficial…": "Consultando disponibilidad del APK oficial…",
    "Instalação direta": "Instalación directa",
    "O Android pode solicitar autorização para instalar aplicativos obtidos pelo navegador. Autorize apenas para o navegador usado no download e somente para o arquivo oficial desta página.": "Android puede solicitar autorización para instalar aplicaciones obtenidas desde el navegador. Autoriza únicamente el navegador utilizado para la descarga y solo para el archivo oficial de esta página.",
    "Baixar APK oficial": "Descargar APK oficial",
    "Não instale cópias recebidas por mensagens, grupos ou links de terceiros.": "No instales copias recibidas por mensajes, grupos o enlaces de terceros.",
    "Dois aplicativos em um": "Dos aplicaciones en una",
    "Guia Vênus · João Pessoa, Cabedelo e Conde": "Guía Vênus · João Pessoa, Cabedelo y Conde",
    "O guia pode ser aberto diretamente no site e também baixado em um único arquivo HTML para consulta offline. A busca, os filtros e as informações ficam disponíveis sem conexão; Maps, Instagram e outros links externos precisam de internet.": "La guía puede abrirse directamente en el sitio y también descargarse como un único archivo HTML para consulta sin conexión. La búsqueda, los filtros y la información quedan disponibles offline; Maps, Instagram y otros enlaces externos necesitan internet.",
    "Acessar guia": "Abrir guía",
    "Baixar guia offline": "Descargar guía offline",
    "Pagamentos": "Pagos",
    "Negociação pelo WhatsApp, confirmação pelo site.": "Gestión por WhatsApp, confirmación en el sitio.",
    "O pagamento é combinado com a administração pelo WhatsApp.": "El pago se coordina con la administración por WhatsApp.",
    "Depois de solicitar a reserva, use o botão de WhatsApp no acompanhamento. Os dados para Pix ou transferência são informados durante o atendimento, e os dados bancários não ficam publicados no site.": "Después de solicitar la reserva, utiliza el botón de WhatsApp en el seguimiento. Los datos para Pix o transferencia se informan durante la atención y los datos bancarios no se publican en el sitio.",
    "O botão “Já realizei um pagamento” apenas avisa a administração. A reserva só é confirmada depois da conferência do crédito no banco, do registro no painel, da validação das demais exigências e de uma nova checagem de conflito de datas.": "El botón “Ya realicé un pago” solo avisa a la administración. La reserva solo se confirma después de verificar el abono en el banco, registrarlo en el panel, validar los demás requisitos y realizar una nueva comprobación de conflicto de fechas.",
    "Dados mínimos, finalidade clara.": "Datos mínimos, finalidad clara.",
    "Os dados de contato e reserva são usados para atender a solicitação, organizar a hospedagem e manter os registros operacionais necessários. Avaliações só são publicadas após moderação. Solicitações de correção ou exclusão devem ser tratadas pela administração, observadas as obrigações legais de retenção.": "Los datos de contacto y reserva se utilizan para atender la solicitud, organizar la estancia y mantener los registros operativos necesarios. Las reseñas solo se publican después de la moderación. Las solicitudes de corrección o eliminación deben ser tratadas por la administración, respetando las obligaciones legales de conservación.",
    "Este sistema não armazena senha do hóspede nem dados de cartão. Pix e transferência são registrados somente após conferência bancária pela administração.": "Este sistema no almacena contraseñas del huésped ni datos de tarjeta. Pix y las transferencias solo se registran después de la verificación bancaria por la administración.",
    "Política de privacidade": "Política de privacidad (PT-BR)",
    "Termo vigente da hospedagem": "Documento contractual vigente (PT-BR)",
    "O termo vigente só é disponibilizado pelo sistema depois que a versão exata possui aprovação registrada.": "El documento contractual vigente solo se pone a disposición cuando la versión exacta cuenta con la aprobación registrada. La versión contractual oficial se mantiene en portugués (Brasil).",
    "FALE CONOSCO": "CONTÁCTANOS",
    "Ambiente": "Espacio",
    "Foto da casa": "Foto de la casa",
    "Administração": "Administración",

    "Ex.: feriado ou período desejado": "Ej.: festivo o período deseado",
    "Gostaria de saber mais sobre disponibilidade, piscina, pets ou horários...": "Me gustaría saber más sobre disponibilidad, piscina, mascotas u horarios...",
    "Termo para impressão": "Documento para imprimir",
    "Fale conosco pelo WhatsApp": "Habla con nosotros por WhatsApp",
    "Fechar galeria": "Cerrar galería",
    "Foto anterior": "Foto anterior",
    "Próxima foto": "Foto siguiente",
    "Logotipo Vênus Casa de Praia": "Logotipo de Vênus Casa de Praia",
    "Área externa da Vênus Casa de Praia": "Área exterior de Vênus Casa de Praia",

    "Resposta inválida do servidor.": "Respuesta inválida del servidor.",
    "Não foi possível concluir.": "No fue posible completar la operación.",
    "Consultando valor e disponibilidade…": "Consultando valor y disponibilidad…",
    "Solicitação registrada.": "Solicitud registrada.",
    "Código privado:": "Código privado:",
    "Guarde o código privado.": "Guarda el código privado.",
    "Ele permite acompanhar esta solicitação e consultar instruções oficiais quando forem liberadas.": "Permite seguir esta solicitud y consultar las instrucciones oficiales cuando estén disponibles.",
    "A solicitação entrou na fila porque já existe outra prioridade temporária para o período. Não faça pagamento até a administração liberar a sua solicitação.": "La solicitud entró en la cola porque ya existe otra prioridad temporal para el período. No realices ningún pago hasta que la administración libere tu solicitud.",
    "Consultando andamento…": "Consultando estado…",
    "Solicitação em análise": "Solicitud en análisis",
    "Reserva confirmada": "Reserva confirmada",
    "Solicitação cancelada": "Solicitud cancelada",
    "Sem prioridade temporária no momento.": "Sin prioridad temporal en este momento.",
    "Cancelamento solicitado e aguardando análise. Não realize novos pagamentos.": "Cancelación solicitada y pendiente de análisis. No realices nuevos pagos.",
    "Solicitação de cancelamento aceita.": "Solicitud de cancelación aceptada.",
    "Solicitação de cancelamento analisada e não aceita.": "Solicitud de cancelación analizada y no aceptada.",
    "Pagamento informado pelo hóspede — aguardando conferência bancária.": "Pago informado por el huésped — pendiente de verificación bancaria.",
    "Pagamento recebido e conciliado pela administração.": "Pago recibido y conciliado por la administración.",
    "Avaliação da estadia já enviada.": "Reseña de la estancia ya enviada.",
    "Termo assinado e validado. O pagamento da reserva pode seguir pelo canal oficial quando as demais condições estiverem válidas.": "Documento firmado y validado. El pago de la reserva puede continuar por el canal oficial cuando se cumplan las demás condiciones.",
    "PDF assinado enviado. Aguarde a validação administrativa antes do pagamento.": "PDF firmado enviado. Espera la validación administrativa antes del pago.",
    "Prepare o termo, assine pelo GOV.BR e envie o PDF assinado.": "Prepara el documento, fírmalo mediante GOV.BR y envía el PDF firmado.",
    "A versão atual do termo ainda aguarda a aprovação necessária para contratação.": "La versión actual del documento todavía espera la aprobación necesaria para la contratación.",
    "Enviando avaliação…": "Enviando reseña…",
    "Avaliação recebida e encaminhada para moderação.": "Reseña recibida y enviada a moderación.",
    "Verificando se a solicitação está liberada para continuar…": "Verificando si la solicitud está habilitada para continuar…",
    "Há uma solicitação de cancelamento pendente. Não realize novos pagamentos.": "Hay una solicitud de cancelación pendiente. No realices nuevos pagos.",
    "A etapa de pagamento ainda não foi liberada porque o termo vigente não possui aprovação registrada.": "La etapa de pago todavía no está habilitada porque el documento vigente no cuenta con aprobación registrada.",
    "O termo assinado ainda precisa ser enviado e validado antes do pagamento.": "El documento firmado todavía debe enviarse y validarse antes del pago.",
    "Esta solicitação ainda não está liberada para pagamento. Aguarde a prioridade das datas ou a orientação da administração.": "Esta solicitud todavía no está habilitada para el pago. Espera la prioridad de las fechas o la orientación de la administración.",
    "O WhatsApp oficial ainda não está configurado. Use o canal de contato informado pela administração.": "El WhatsApp oficial todavía no está configurado. Utiliza el canal de contacto informado por la administración.",
    "WhatsApp oficial não configurado.": "WhatsApp oficial no configurado.",
    "Motivo do cancelamento (opcional, até 1000 caracteres):": "Motivo de la cancelación (opcional, hasta 1000 caracteres):",
    "O motivo deve ter no máximo 1000 caracteres.": "El motivo debe tener como máximo 1000 caracteres.",
    "Registrar a solicitação de cancelamento? Isso não gera estorno automático; a administração fará a análise e o eventual reembolso.": "¿Registrar la solicitud de cancelación? Esto no genera un reembolso automático; la administración realizará el análisis y, cuando corresponda, la devolución.",
    "Solicitação de cancelamento registrada. Acompanhe o andamento por este mesmo protocolo e código privado.": "Solicitud de cancelación registrada. Sigue el estado con este mismo protocolo y código privado.",
    "Você já realizou o Pix ou a transferência combinada pelo WhatsApp? Este aviso não confirma o pagamento; a administração ainda fará a conferência bancária.": "¿Ya realizaste el Pix o la transferencia acordada por WhatsApp? Este aviso no confirma el pago; la administración todavía realizará la verificación bancaria.",
    "Confirma o envio do PDF assinado? A administração ainda validará a assinatura e a integridade do documento.": "¿Confirmas el envío del PDF firmado? La administración todavía validará la firma y la integridad del documento.",
    "O WhatsApp será aberto com os dados básicos da reserva. O código privado não será enviado.": "WhatsApp se abrirá con los datos básicos de la reserva. El código privado no será enviado.",
    "Registrando seu aviso de pagamento…": "Registrando tu aviso de pago…",
    "O pagamento já havia sido informado e continua aguardando conferência bancária.": "El pago ya había sido informado y continúa pendiente de verificación bancaria.",
    "Pagamento informado. A administração fará a conferência bancária antes de confirmar o recebimento.": "Pago informado. La administración realizará la verificación bancaria antes de confirmar la recepción.",
    "Mensagem registrada. A administração poderá responder pelos canais informados.": "Mensaje registrado. La administración podrá responder por los canales informados.",
    "Envie o PDF original assinado.": "Envía el PDF original firmado.",
    "O PDF deve ter no máximo 3 MB.": "El PDF debe tener como máximo 3 MB.",
    "PDF assinado enviado. Aguarde a validação administrativa antes do pagamento.": "PDF firmado enviado. Espera la validación administrativa antes del pago.",
    "Experiência publicada após moderação": "Experiencia publicada después de moderación",
    "Hóspede": "Huésped",
    "O APK oficial ainda não foi publicado. Use a versão web/PWA enquanto isso.": "El APK oficial todavía no se ha publicado. Mientras tanto, utiliza la versión web/PWA.",
    "Após solicitar a reserva, continue pelo WhatsApp oficial. Pix ou transferência são combinados no atendimento e a confirmação final aparece no próprio site.": "Después de solicitar la reserva, continúa por el WhatsApp oficial. Pix o transferencia se coordinan durante la atención y la confirmación final aparece en el propio sitio.",
    "O canal oficial de WhatsApp ainda será configurado pela administração.": "El canal oficial de WhatsApp todavía será configurado por la administración."
  };

  const PATTERNS = [
    [/^(\d+)\s+noite\(s\)(.*)$/u, (_, n, rest) => `${n} noche(s)${rest}`],
    [/^Diárias:\s*(.+)\s+·\s+Hóspedes adicionais:\s*(.+)\s+·\s+Limpeza:\s*(.+)\s+·\s+Sinal previsto\s+\((\d+)%\):\s*(.+)\.$/u,
      (_, diaria, adicionais, limpeza, pct, sinal) => `Noches: ${diaria} · Huéspedes adicionales: ${adicionais} · Limpieza: ${limpeza} · Señal prevista (${pct}%): ${sinal}.`],
    [/^As datas ficaram com prioridade temporária até (.+)\.$/u,
      (_, when) => `Las fechas quedaron con prioridad temporal hasta ${when}.`],
    [/^Prioridade temporária ativa até (.+)\.$/u,
      (_, when) => `Prioridad temporal activa hasta ${when}.`],
    [/^(.+)\s+·\s+(\d+)\s+noite\(s\)$/u,
      (_, dates, n) => `${dates} · ${n} noche(s)`],
    [/^Total contratado:\s*(.+)\s+·\s+Recebido:\s*(.+)\s+·\s+Saldo:\s*(.+)\.$/u,
      (_, total, paid, balance) => `Total contratado: ${total} · Recibido: ${paid} · Saldo: ${balance}.`],
    [/^(\d+)\s+avaliação\(ões\)\s+pública\(s\)\s+·\s+média\s+(.+)\/5$/u,
      (_, count, avg) => `${count} reseña(s) pública(s) · promedio ${avg}/5`],
    [/^Versão\s+(.+)\s+disponível para Android\.$/u,
      (_, version) => `Versión ${version} disponible para Android.`]
  ];

  const WHATSAPP_ES = {
    "Olá! Gostaria de falar sobre a Vênus Casa de Praia.": "¡Hola! Me gustaría hablar sobre Vênus Casa de Praia.",
    "Olá! Gostaria de saber mais sobre a Vênus Casa de Praia.": "¡Hola! Me gustaría saber más sobre Vênus Casa de Praia.",
    "Olá! Gostaria de consultar a Vênus Casa de Praia.": "¡Hola! Me gustaría consultar la disponibilidad de Vênus Casa de Praia.",
    "Olá! Adorei a Vênus Casa de Praia e gostaria de conversar sobre uma reserva.": "¡Hola! Me encantó Vênus Casa de Praia y me gustaría hablar sobre una reserva."
  };

  const originalText = new WeakMap();
  const originalAttrs = new WeakMap();

  let language = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.has(saved) ? saved : "pt";
    } catch {
      return "pt";
    }
  })();

  function coreTranslate(value) {
    if (language !== "es" || typeof value !== "string") return value;
    if (Object.prototype.hasOwnProperty.call(ES, value)) return ES[value];
    for (const [pattern, replacer] of PATTERNS) {
      if (pattern.test(value)) {
        pattern.lastIndex = 0;
        return value.replace(pattern, replacer);
      }
    }
    return value;
  }

  function translatePreservingWhitespace(value) {
    if (language !== "es" || typeof value !== "string") return value;
    const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/u);
    if (!match || !match[2]) return value;
    const translated = coreTranslate(match[2]);
    return match[1] + translated + match[3];
  }

  function shouldSkipText(node) {
    const parent = node.parentElement;
    if (!parent) return false;
    if (parent.closest("#printableTermText")) return true;
    const reviewCard = parent.closest(".review-card");
    if (reviewCard && (parent.closest("h3") || parent.closest("p"))) return true;
    return false;
  }

  function applyTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE || shouldSkipText(node)) return;

    let original = originalText.get(node);
    if (original === undefined) {
      original = node.nodeValue;
      originalText.set(node, original);
    } else if (language === "pt" && node.nodeValue !== original) {
      original = node.nodeValue;
      originalText.set(node, original);
    } else if (language === "es") {
      const expected = translatePreservingWhitespace(original);
      if (node.nodeValue !== expected) {
        original = node.nodeValue;
        originalText.set(node, original);
      }
    }

    const desired = language === "es" ? translatePreservingWhitespace(original) : original;
    if (node.nodeValue !== desired) node.nodeValue = desired;
  }

  function applyAttribute(element, attr) {
    if (!element.hasAttribute(attr)) return;
    let store = originalAttrs.get(element);
    if (!store) {
      store = new Map();
      originalAttrs.set(element, store);
    }

    let original = store.get(attr);
    const current = element.getAttribute(attr) || "";
    if (original === undefined) {
      original = current;
      store.set(attr, original);
    } else if (language === "pt" && current !== original) {
      original = current;
      store.set(attr, original);
    } else if (language === "es") {
      const expected = coreTranslate(original);
      if (current !== expected) {
        original = current;
        store.set(attr, original);
      }
    }

    const desired = language === "es" ? coreTranslate(original) : original;
    if (current !== desired) element.setAttribute(attr, desired);
  }

  function scan(root) {
    if (!root) return;

    if (root.nodeType === Node.TEXT_NODE) {
      applyTextNode(root);
      return;
    }

    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

    const element = root.nodeType === Node.ELEMENT_NODE ? root : null;
    if (element) {
      for (const attr of ["placeholder", "aria-label", "title", "alt"]) applyAttribute(element, attr);
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) applyTextNode(walker.currentNode);

    if (root.querySelectorAll) {
      for (const el of root.querySelectorAll("[placeholder],[aria-label],[title],[alt]")) {
        for (const attr of ["placeholder", "aria-label", "title", "alt"]) applyAttribute(el, attr);
      }
    }
  }

  function updateWhatsAppLinks() {
    for (const anchor of document.querySelectorAll('a[href*="wa.me/"]')) {
      if (!anchor.dataset.i18nPtHref) anchor.dataset.i18nPtHref = anchor.getAttribute("href") || "";
      const original = anchor.dataset.i18nPtHref;
      if (language === "pt") {
        anchor.setAttribute("href", original);
        continue;
      }
      try {
        const url = new URL(original, location.href);
        const ptMessage = url.searchParams.get("text");
        if (ptMessage && WHATSAPP_ES[ptMessage]) url.searchParams.set("text", WHATSAPP_ES[ptMessage]);
        anchor.setAttribute("href", url.toString());
      } catch {
        anchor.setAttribute("href", original);
      }
    }
  }

  function updateMeta() {
    const meta = document.querySelector('meta[name="description"]');
    if (!meta) return;
    if (!meta.dataset.i18nPtContent) meta.dataset.i18nPtContent = meta.getAttribute("content") || "";
    meta.setAttribute(
      "content",
      language === "es"
        ? "Vênus Casa de Praia — información, disponibilidad, reservas y Guía Vênus PB."
        : meta.dataset.i18nPtContent
    );
  }

  function updateButtons() {
    const pt = document.getElementById("lang-pt");
    const es = document.getElementById("lang-es");
    const group = document.querySelector(".language-switcher");
    if (pt) {
      const active = language === "pt";
      pt.classList.toggle("is-active", active);
      pt.setAttribute("aria-pressed", String(active));
    }
    if (es) {
      const active = language === "es";
      es.classList.toggle("is-active", active);
      es.setAttribute("aria-pressed", String(active));
    }
    if (group) group.setAttribute("aria-label", language === "es" ? "Selección de idioma" : "Seleção de idioma");
  }

  function applyLanguage(next, persist = true) {
    if (!SUPPORTED.has(next)) next = "pt";
    language = next;

    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, language); } catch {}
    }

    document.documentElement.lang = language === "es" ? "es" : "pt-BR";
    scan(document.body);
    updateWhatsAppLinks();
    updateMeta();
    updateButtons();

    window.dispatchEvent(new CustomEvent("venus:languagechange", {
      detail: { language, locale: language === "es" ? "es-ES" : "pt-BR" }
    }));
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        applyTextNode(mutation.target);
      }
      for (const node of mutation.addedNodes || []) scan(node);
    }
  });

  window.VenusI18n = {
    getLanguage: () => language,
    getLocale: () => language === "es" ? "es-ES" : "pt-BR",
    translate: (value) => language === "es" ? coreTranslate(String(value ?? "")) : String(value ?? ""),
    setLanguage: (value) => applyLanguage(value, true)
  };

  const init = () => {
    document.getElementById("lang-pt")?.addEventListener("click", () => applyLanguage("pt", true));
    document.getElementById("lang-es")?.addEventListener("click", () => applyLanguage("es", true));
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    applyLanguage(language, false);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
