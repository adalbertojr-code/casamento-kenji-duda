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

  /* cores reservadas: convidados não devem usá-las */
  trajePadrinhos: "Terno preto, camisa branca e gravata rosa bebê. Pedimos que os convidados não usem gravata nessa cor, por ser o traje dos padrinhos.",
  trajeMadrinhas: "Vestido rosa bebê. Pedimos que as convidadas não usem vestido nessa cor, por ser o traje das madrinhas.",
  trajeNoiva: "A noiva vai de branco. Pedimos que as convidadas não usem branco.",

  /* ---------------- história ---------------- */
  historia: [
    "Tudo começou há cerca de sete anos, quando nenhum dos dois imaginava que aquela amizade se transformaria em uma história de amor.",
    "Ele era o melhor amigo do irmão dela e, por isso, estava sempre por perto, frequentando a casa da família e participando de muitos momentos com todos. Com o tempo, tornou-se alguém muito querido, especialmente pelo tio Maicon, com quem construiu uma amizade especial.",
    "Eles praticamente cresceram juntos, entre conversas, encontros de família e tantos momentos que, na época, pareciam apenas parte da rotina. Ele nunca imaginou que um dia se apaixonaria pela irmã do seu melhor amigo. Mas, aos poucos, foi percebendo algo diferente nela. O jeito dela, humilde, simpático, amoroso e carinhoso, foi conquistando o coração dele. O que ele não sabia era que ela sentia o mesmo.",
    "E assim, sem pressa e sem precisar de grandes acontecimentos, a amizade foi dando espaço a algo ainda mais bonito. Vieram o carinho, o companheirismo e a vontade de estar cada vez mais perto. Quando perceberam, já não conseguiam se imaginar em caminhos separados.",
    "Hoje, depois de tantos anos e de tantas lembranças construídas a dois, chegou a hora de dar mais um passo nessa história: vamos nos casar! E não poderíamos viver esse momento sem a presença das pessoas que estiveram ao nosso lado e que, de alguma forma, também fazem parte dessa caminhada."
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
    titulo: "Sorriso Resplandecente",
    artista: "Cammyli Aguiar — violino",
    volume: 0.32
  },

  /* ---------------- infraestrutura ----------------
     "local"    -> funciona sem internet, guarda só no aparelho (para testar)
     "firebase" -> RSVP de verdade, com painel para os noivos

     Quando criar o Firebase, troque para "firebase" e cole as duas
     chaves abaixo. O passo a passo está no LEIA-ME. */
  infra: {
    modo: "local",
    firebaseUrl: "",   // ex.: https://kenji-duda-default-rtdb.firebaseio.com
    firebaseKey: ""    // ex.: AIzaSy...  (chave WEB, pode ficar no site)
  },

  /* ---------------- painel dos noivos ----------------
     O painel entra com a conta dos noivos (e-mail e senha) criada no
     Firebase, em Authentication > Users. Nada de senha aqui: este
     arquivo é público e qualquer visitante consegue ler.
     A senha só é exigida no servidor, pelas regras do banco. */
  painel: {
    email: ""          // ex.: "noivos@kenjiduda.com"
  },

  /* ---------------- presentes ---------------- */
  presentes: [
    { categoria: "Utensílios", itens: [
      "Colher de pau", "Espátulas", "Concha", "Escumadeira", "Pegador de massa",
      "Fouet", "Abridor de latas", "Saca-rolhas", "Descascador de legumes",
      "Ralador", "Peneira", "Funil", "Tesoura de cozinha", "Tábua de corte"
    ]},

    { categoria: "Louças", itens: [
      "Pratos rasos", "Pratos fundos", "Pratos de sobremesa", "Copos", "Xícaras",
      "Canecas", "Talheres", "Jogo de sobremesa", "Tigelas"
    ]},

    { categoria: "Panelas e formas", itens: [
      "Jogo de panelas", "Frigideira", "Panela de pressão", "Leiteira",
      "Forma de bolo", "Assadeira", "Refratário de vidro"
    ]},

    { categoria: "Organização", itens: [
      "Potes com tampa", "Potes para mantimentos", "Porta-temperos",
      "Escorredor de louça", "Escorredor de macarrão", "Lixeira de cozinha",
      "Pano de prato", "Luvas térmicas"
    ]},

    { categoria: "Eletrodomésticos", itens: [
      "Liquidificador", "Batedeira", "Air fryer", "Sanduicheira", "Mixer"
    ]},

    { categoria: "Para preparar receitas", itens: [
      "Jarra medidora", "Pincel culinário", "Forma de gelo"
    ]},

    { categoria: "Quarto", itens: [
      "Jogo de cama", "Lençóis", "Fronhas", "Travesseiros", "Cobertor",
      "Edredom", "Protetor de colchão", "Cabides", "Cortina — quarto"
    ]},

    { categoria: "Banheiro", itens: [
      "Jogo de toalhas", "Toalhas de banho", "Toalhas de rosto",
      "Tapete de banheiro", "Lixeira", "Porta-sabonete", "Porta-escova"
    ]},

    { categoria: "Limpeza", itens: [
      "Vassoura", "Rodo", "Pá", "Balde", "Mop", "Panos de chão",
      "Panos de limpeza", "Escova para banheiro"
    ]},

    { categoria: "Sala", itens: [
      "Tapete", "Cortina — sala", "Almofadas", "Manta para sofá"
    ]},

    { categoria: "Lavanderia", itens: [
      "Ferro de passar", "Cesto para roupas", "Varal de chão", "Balde para lavanderia"
    ]}
  ]
};

/* deixa o conteúdo acessível a todos os scripts do site */
window.CONFIG = CONFIG;
