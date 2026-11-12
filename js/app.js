/* ===================================================================
   NÚCLEO — preenche a página com o conteúdo do config.js
   =================================================================== */

(function () {
  'use strict';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const texto = (el, valor) => { if (el) el.textContent = valor; };

  /* ---------------- utilidades públicas ---------------- */

  window.App = {
    $, texto,

    // aviso rápido no rodapé da tela
    avisar(mensagem, ms) {
      const toast = $('#toast');
      if (!toast) return;
      toast.textContent = mensagem;
      toast.classList.add('visivel');
      clearTimeout(window.App._toastTimer);
      window.App._toastTimer = setTimeout(() => {
        toast.classList.remove('visivel');
      }, ms || 3200);
    },

    linkWhatsapp(mensagem) {
      const numero = (CONFIG.whatsapp || '').replace(/\D/g, '');
      if (!numero) return '';
      const query = mensagem ? '?text=' + encodeURIComponent(mensagem) : '';
      return 'https://wa.me/' + numero + query;
    }
  };

  /* ---------------- versículo ---------------- */

  function montarVersiculo() {
    const v = CONFIG.versiculo || {};
    texto($('#versiculoTexto'), v.texto || '');
    texto($('#versiculoRef'), v.referencia || '');
    texto($('#rodapeVersiculo'), v.texto || '');
    texto($('#rodapeReferencia'), v.referencia || '');
  }

  /* ---------------- contagem regressiva ---------------- */

  function iniciarContagem() {
    const alvo = new Date(CONFIG.data).getTime();
    const campos = {
      dias: $('#tDias'),
      horas: $('#tHoras'),
      min: $('#tMin'),
      seg: $('#tSeg')
    };
    if (!campos.dias) return;

    let anterior = {};

    function atualizar() {
      const restante = alvo - Date.now();

      if (restante <= 0) {
        const deck = $('#deck');
        if (deck) {
          deck.innerHTML =
            '<p class="contagem__sub" style="margin:0;grid-column:1/-1">' +
            'Hoje é o nosso grande dia! ♥</p>';
        }
        return;
      }

      const seg = Math.floor(restante / 1000);
      const valores = {
        dias: Math.floor(seg / 86400),
        horas: Math.floor((seg % 86400) / 3600),
        min: Math.floor((seg % 3600) / 60),
        seg: seg % 60
      };

      Object.keys(campos).forEach((chave) => {
        const el = campos[chave];
        if (!el) return;
        const novo = String(valores[chave]).padStart(chave === 'dias' ? 1 : 2, '0');
        if (anterior[chave] !== novo) {
          el.textContent = novo;
          anterior[chave] = novo;
          el.animate(
            [{ opacity: .35, transform: 'translateY(-3px)' }, { opacity: 1, transform: 'none' }],
            { duration: 380, easing: 'ease-out' }
          );
        }
      });
    }

    atualizar();
    setInterval(atualizar, 1000);
  }

  /* ---------------- locais ---------------- */

  function montarLocais() {
    const container = $('#locais');
    if (!container) return;

    container.innerHTML = (CONFIG.locais || []).map((local) => `
      <article class="local">
        <svg class="local__icone" aria-hidden="true"><use href="#i-salao"/></svg>
        <span class="local__tipo">${escapar(local.tipo)}</span>
        <h3 class="local__titulo">${escapar(local.titulo)}</h3>
        <div class="local__info">
          <p class="local__hora">${escapar(local.hora || '')}</p>
          <p class="local__end">
            <b>${escapar(local.endereco)}</b><br>
            ${escapar(local.bairro)}
          </p>
        </div>
      </article>
    `).join('');
  }

  /* ---------------- mapas ---------------- */

  function montarMapas() {
    const container = $('#mapas');
    if (!container) return;

    container.innerHTML = (CONFIG.locais || []).map((local, i) => {
      const consulta = encodeURIComponent(local.mapa || local.titulo);
      const embed = 'https://maps.google.com/maps?q=' + consulta + '&z=16&output=embed';
      const rota = 'https://www.google.com/maps/dir/?api=1&destination=' + consulta;

      return `
        <figure class="mapa">
          <div class="mapa__tela">
            <div class="mapa__capa" data-embed="${embed}">
              <span class="mapa__pino" aria-hidden="true"><svg><use href="#i-pino"/></svg></span>
              <b>${escapar(local.titulo)}</b>
              <span>toque para ver o mapa</span>
            </div>
          </div>
          <figcaption class="mapa__rodape">
            <span class="mapa__nome">${escapar(local.tipo)}</span>
            <a class="mapa__acao" href="${rota}" target="_blank" rel="noopener">
              Como chegar
              <svg aria-hidden="true"><use href="#i-seta"/></svg>
            </a>
          </figcaption>
        </figure>
      `;
    }).join('');

    // o mapa só carrega quando o convidado pede — mantém a página rápida
    $$('.mapa__capa', container).forEach((capa) => {
      capa.addEventListener('click', () => {
        const frame = document.createElement('iframe');
        frame.src = capa.dataset.embed;
        frame.loading = 'lazy';
        frame.title = 'Mapa do local';
        frame.referrerPolicy = 'no-referrer-when-downgrade';
        frame.allowFullscreen = true;
        capa.parentNode.insertBefore(frame, capa);
        capa.classList.add('some');
      });
    });
  }

  /* ---------------- traje ---------------- */

  function montarTraje() {
    texto($('#trajeNome'), CONFIG.traje || '');
    texto($('#trajeNota'), CONFIG.trajeNota || '');

    const caixa = $('#trajePapeis');
    if (!caixa) return;

    caixa.innerHTML = (CONFIG.trajes || []).map((p) =>
      '<article class="papel papel--' + escapar(p.chave) + '">' +
        '<svg class="papel__icone" aria-hidden="true"><use href="#' + escapar(p.icone) + '"/></svg>' +
        '<h4 class="papel__titulo">' + escapar(p.titulo) + '</h4>' +
        '<p class="papel__texto">' + escapar(p.texto) + '</p>' +
        '<p class="papel__reserva">' +
          (p.cor ? '<span class="papel__amostra" style="--amostra:' + escapar(p.cor) + '"></span>' : '') +
          escapar(p.reserva) +
        '</p>' +
      '</article>'
    ).join('');
  }

  /* ---------------- história ---------------- */

  function montarHistoria() {
    const alvo = $('#historiaTexto');
    if (!alvo) return;

    const partes = CONFIG.historia || [];
    alvo.innerHTML = partes.map((p) => `<p>${escapar(p)}</p>`).join('') +
      '<div class="historia__assinatura">' +
        '<span class="historia__assina-nome">' + escapar(CONFIG.casal.ele) + '</span>' +
        '<svg class="historia__assina-coracao" aria-hidden="true"><use href="#i-coracao"/></svg>' +
        '<span class="historia__assina-nome">' + escapar(CONFIG.casal.ela) + '</span>' +
      '</div>';
  }

  /* ---------------- contato ---------------- */

  function montarContatos() {
    const url = window.App.linkWhatsapp(
      'Olá! Estou vendo o site do casamento de ' +
      CONFIG.casal.ele + ' e ' + CONFIG.casal.ela + ' e queria falar com vocês.'
    );

    ['#btnWhatsConfirmacao', '#linkWhats'].forEach((sel) => {
      const el = $(sel);
      if (!el) return;
      if (url) {
        el.href = url;
      } else {
        el.removeAttribute('href');
        el.setAttribute('aria-disabled', 'true');
      }
    });
  }

  /* ---------------- proteção contra HTML ---------------- */

  function escapar(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // chave estável de cada presente: "Louças-Sucos de vidro" -> "loucas-sucos-de-vidro"
  function idDoItem(categoria, nome) {
    return (categoria + '-' + nome)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  window.App.escapar = escapar;
  window.App.idDoItem = idDoItem;

  /* ---------------- início ---------------- */

  function iniciar() {
    montarVersiculo();
    montarHistoria();
    montarLocais();
    montarMapas();
    montarTraje();
    montarContatos();
    iniciarContagem();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
