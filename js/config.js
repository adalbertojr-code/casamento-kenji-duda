/* ===================================================================
   KENJI & DUDA — todo o conteúdo editável está AQUI.
   Depois de mexer, salve e recarregue a página.
   =================================================================== */

const CONFIG = {

  /* ---------------- o casal ---------------- */
  casal: {
    ele: "Kenji",
    ela: "Duda",
    // Nome completo, se quiserem que apareça em algum lugar
    nomeCompleto: "Kenji & Duda"
  },

  /* ---------------- data e hora ----------------
     Fuso de Brasília (-03:00). Domigo, 20 de junho de 2027.
     A contagem regressiva e o "domingo" se ajustam sozinhos. */
  data: "2027-06-20T15:30:00-03:00",

  /* ---------------- versículo ---------------- */
  versiculo: {
    texto: "De modo que não são mais dois, mas uma só carne. Portanto, o que Deus pôs sob o mesmo jugo, o homem não deve separar.",
    referencia: "Mateus 19:6"
  },

  /* ---------------- locais ---------------- */
  locais: [
    {
      tipo: "Cerimônia",
      titulo: "Salão do Reino das Testemunhas de Jeová",
      endereco: "Rua Pintassilgo, 154",
      bairro: "Bombas — Bombinhas/SC",
      hora: "15h30",
      // Busca usada no Google Maps — confira o lugar exato antes de publicar
      mapa: "Salão do Reino das Testemunhas de Jeová, Rua Pintassilgo 154, Bombinhas SC"
    }
  ],

  /* ---------------- informações gerais ---------------- */
  traje: "Traje social modesto",
  trajeNota: "Pedimos roupa social modesta, que não exponha muitas partes do corpo. O mais importante é a sua presença.",

  /* os quatro cartões de traje.
     reserva = a cor que fica guardada para aquele papel */
  trajes: [
    {
      chave: 'padrinhos',
      titulo: 'Padrinhos',
      icone: 'i-terno',
      texto: 'Terno preto, camisa branca e gravata rosa bebê.',
      reserva: 'Gravata rosa bebê, e tons similares, é exclusiva dos padrinhos.',
      cor: '#E9BCB6'
    },
    {
      chave: 'madrinhas',
      titulo: 'Madrinhas',
      icone: 'i-vestido',
      texto: 'Vestido rosa bebê.',
      reserva: 'Vestido rosa bebê, e tons similares, é exclusivo das madrinhas.',
      cor: '#E9BCB6'
    },
    {
      chave: 'noiva',
      titulo: 'Noiva',
      icone: 'i-vestido-noiva',
      texto: 'A noiva vai de branco.',
      reserva: 'Branco, e tons similares, é reservado para a noiva.',
      cor: '#FFFFFF'
    },
    {
      chave: 'convidados',
      titulo: 'Convidados',
      icone: 'i-convidados',
      texto: 'Roupa social modesta, que não mostre muitas partes do corpo.',
      reserva: 'Sem gravata rosa, sem vestido rosa e sem branco, nem em tons similares.',
      cor: null
    }
  ],

  /* ---------------- história ---------------- */
  historia: [
    "Nós nos conhecemos há cerca de sete anos, quase sem perceber que ali começava a história mais bonita das nossas vidas. Ele sempre foi o melhor amigo do irmão dela e, por isso, frequentava a nossa casa como alguém da família. Era tão próximo de todos que logo conquistou um carinho especial, principalmente do tio Maicon, que foi seu instrutor e com quem criou uma amizade muito especial.",
    "Praticamente crescemos juntos, entre conversas, encontros de família e momentos simples que, sem que soubéssemos, estavam construindo algo muito maior. Ele nunca imaginou que um dia se casaria com a irmã do seu melhor amigo. Mas, dia após dia, ao ver como ela era humilde, simpática, amorosa e carinhosa, foi se apaixonando em silêncio. Mal ele sabia que, do outro lado, ela também estava se apaixonando por ele.",
    "O que começou como amizade virou companheirismo, e o companheirismo virou amor. Fomos caminhando lado a lado, aprendendo um com o outro e descobrindo que tínhamos encontrado no outro a pessoa certa, que sempre esteve tão perto.",
    "Hoje, depois de tantos anos de história, damos o passo mais especial da nossa caminhada: vamos nos casar! E queremos muito ter ao nosso lado as pessoas que fizeram e fazem parte dessa história."
  ],

  /* ---------------- contato ---------------- */
  whatsapp: "5547933003133",       // só números, com código do país
  whatsappExibicao: "(47) 93300-3133",

  /* ---------------- confirmação ---------------- */
  rsvpPrazo: "2027-06-01",
  rsvpPrazoTexto: "1º de junho de 2027",
  rsvpMaxAcompanhantes: 6,

  /* ---------------- música ---------------- */
  musica: {
    arquivo: "assets/musica/musica.mp3",
    titulo: "Ordinary",
    artista: "Alex Warren — piano e cello",
    volume: 0.32
  },

  /* ---------------- infraestrutura ----------------
     "local"    -> funciona sem internet, guarda só no aparelho (para testar)
     "firebase" -> RSVP de verdade, com painel para os noivos

     Quando criar o Firebase, troque para "firebase" e cole as duas
     chaves abaixo. O passo a passo está no LEIA-ME. */
  infra: {
    modo: "firebase",
    firebaseUrl: "https://kenji-duda-default-rtdb.firebaseio.com",
    firebaseKey: "AIzaSyAsjEUE5rUMlzEWeSHjk9AeKf3pXf8T_5c"
  },

  /* ---------------- painel dos noivos ----------------
     A conta fica no Firebase (Authentication > Users). Nem e-mail nem
     senha ficam aqui: este arquivo é público. */

  /* ---------------- presentes ---------------- */
  presentes: [
    { categoria: "Louças", itens: [
      "Pratos rasos", "Pratos fundos", "Pratos de sobremesa", "Talheres",
      "Jogo de sobremesa", "Xícaras", "Canecas"
    ]},

    { categoria: "Panelas e formas", itens: [
      "Jogo de panelas", "Frigideira", "Panela de pressão", "Leiteira",
      "Forma de bolo", "Assadeira", "Refratário de vidro"
    ]},

    { categoria: "Organização", itens: [
      "Potes de mantimentos", "Porta temperos"
    ]},

    { categoria: "Eletrodomésticos", itens: [
      "Liquidificador", "Mixer", "Jarra medidora"
    ]},

    { categoria: "Quarto", itens: [
      "Jogo de cama", "Lençóis", "Fronhas", "Travesseiros", "Cobertor",
      "Edredom", "Protetor de colchão", "Cabides"
    ]},

    { categoria: "Banheiro", itens: [
      "Jogo de toalhas", "Toalhas de rosto", "Tapete de banheiro"
    ]},

    { categoria: "Sala", itens: [
      "Manta de sofá", "Tapete de cozinha"
    ]},

    { categoria: "Limpeza e lavanderia", itens: [
      "Mop", "Ferro de passar", "Cesto de roupas"
    ]}
  ]
};

/* deixa o conteúdo acessível a todos os scripts do site */
window.CONFIG = CONFIG;
