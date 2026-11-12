/* ===================================================================
   INTERFACE — abertura, pétalas, menu, navegação e revelações
   =================================================================== */

(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     pétalas caindo
     ------------------------------------------------------------------ */

  function criarPetalas(container, quantidade) {
    if (!container || reduzir) return;

    const tons = [
      ['#F3C9C1', '#DB9188'],
      ['#F0BDB4', '#CE7F75'],
      ['#F6D7D0', '#DFA49A'],
      ['#F8E2DD', '#E4B3AA']
    ];

    const frag = document.createDocumentFragment();

    for (let i = 0; i < quantidade; i++) {
      const p = document.createElement('span');
      p.className = 'petala';

      const tamanho = 8 + Math.random() * 12;
      const [a, b] = tons[Math.floor(Math.random() * tons.length)];

      p.style.setProperty('--tam', tamanho.toFixed(0) + 'px');
      p.style.setProperty('--cor-a', a);
      p.style.setProperty('--cor-b', b);
      p.style.setProperty('--dur', (13 + Math.random() * 12).toFixed(1) + 's');
      p.style.setProperty('--atraso', (-Math.random() * 22).toFixed(1) + 's');
      p.style.setProperty('--drift', (Math.random() * 170 - 85).toFixed(0) + 'px');
      p.style.setProperty('--giro', (Math.random() * 720 - 360).toFixed(0) + 'deg');
      p.style.setProperty('--op', (0.6 + Math.random() * 0.35).toFixed(2));
      p.style.left = (Math.random() * 100).toFixed(2) + '%';

      frag.appendChild(p);
    }

    container.appendChild(frag);
  }

  /* ------------------------------------------------------------------
     abertura
     ------------------------------------------------------------------ */

  function iniciarAbertura() {
    const abertura = $('#abertura');
    const botao = $('#btnEntrar');
    if (!abertura || !botao) return;

    const jaEntrou = (() => {
      try { return sessionStorage.getItem('kd-entrou') === '1'; } catch (e) { return false; }
    })();

    // as pétalas do site valem sempre, mesmo para quem já entrou
    criarPetalas($('#petalasSite'), 30);

    // quem já entrou nesta visita não repete a abertura
    if (jaEntrou) {
      abertura.remove();
      document.body.classList.remove('travado');
      if (window.Musica) window.Musica.iniciar();
      return;
    }

    document.body.classList.add('travado');

    criarPetalas($('#petalasAbertura'), 30);

    function entrar() {
      try { sessionStorage.setItem('kd-entrou', '1'); } catch (e) { /* sem armazenamento */ }

      abertura.classList.add('saindo');
      document.body.classList.remove('travado');

      if (window.Musica) window.Musica.iniciar();

      setTimeout(() => {
        abertura.remove();
      }, 1200);
    }

    botao.addEventListener('click', entrar);

    // dá para entrar com Enter
    abertura.addEventListener('keydown', (evento) => {
      if (evento.key === 'Enter' || evento.key === ' ') {
        evento.preventDefault();
        entrar();
      }
    });
  }

  /* ------------------------------------------------------------------
     menu
     ------------------------------------------------------------------ */

  function iniciarMenu() {
    const botao = $('#menuBtn');
    const nav = $('#nav');
    if (!botao || !nav) return;

    function fechar() {
      nav.classList.remove('aberto');
      botao.setAttribute('aria-expanded', 'false');
      botao.setAttribute('aria-label', 'Abrir menu');
      document.body.classList.remove('travado');
    }

    function abrir() {
      nav.classList.add('aberto');
      botao.setAttribute('aria-expanded', 'true');
      botao.setAttribute('aria-label', 'Fechar menu');
      document.body.classList.add('travado');
    }

    botao.addEventListener('click', () => {
      if (nav.classList.contains('aberto')) fechar();
      else abrir();
    });

    $$('a', nav).forEach((link) => link.addEventListener('click', fechar));

    document.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape' && nav.classList.contains('aberto')) fechar();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) fechar();
    });
  }

  /* ------------------------------------------------------------------
     topo: esconder ao descer, mostrar ao subir
     ------------------------------------------------------------------ */

  function iniciarTopo() {
    const topo = $('#topo');
    const barra = $('#progressoLeitura');
    if (!topo) return;

    let ultimoY = window.scrollY;
    let pedido = false;

    function atualizar() {
      pedido = false;
      const y = window.scrollY;

      topo.classList.toggle('solido', y > 60);

      if (y > 260 && y > ultimoY && !document.querySelector('.nav.aberto')) {
        topo.classList.add('escondido');
      } else {
        topo.classList.remove('escondido');
      }

      if (barra) {
        const altura = document.documentElement.scrollHeight - window.innerHeight;
        const pct = altura > 0 ? Math.min((y / altura) * 100, 100) : 0;
        barra.style.width = pct.toFixed(2) + '%';
      }

      ultimoY = y;
    }

    window.addEventListener('scroll', () => {
      if (!pedido) {
        pedido = true;
        requestAnimationFrame(atualizar);
      }
    }, { passive: true });

    atualizar();
  }

  /* ------------------------------------------------------------------
     revelar ao entrar na tela
     ------------------------------------------------------------------ */

  function iniciarRevelacoes() {
    const alvos = $$('.revelar');
    if (!alvos.length) return;

    if (reduzir || !('IntersectionObserver' in window)) {
      alvos.forEach((el) => el.classList.add('visivel'));
      return;
    }

    // limiar 0: blocos mais altos que a tela nunca chegariam a 14% visíveis
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;

        const el = entrada.target;
        const irmaos = Array.from(el.parentNode.children).filter((n) => n.classList.contains('revelar'));
        const indice = Math.max(irmaos.indexOf(el), 0);

        el.style.setProperty('--atraso', Math.min(indice * 90, 450) + 'ms');
        el.classList.add('visivel');
        observador.unobserve(el);
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });

    alvos.forEach((el) => observador.observe(el));
  }

  /* ------------------------------------------------------------------
     link ativo na navegação
     ------------------------------------------------------------------ */

  function iniciarNavegacao() {
    const secoes = $$('section[id], header[id]');
    const links = $$('.nav a');
    if (!secoes.length || !links.length || !('IntersectionObserver' in window)) return;

    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;

        const id = entrada.target.id;
        links.forEach((link) => {
          link.classList.toggle('ativo', link.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    secoes.forEach((secao) => observador.observe(secao));
  }

  /* ------------------------------------------------------------------
     rolagem suave respeitando o topo fixo
     ------------------------------------------------------------------ */

  function iniciarRolagem() {
    document.addEventListener('click', (evento) => {
      const link = evento.target.closest('a[href^="#"]');
      if (!link) return;

      const id = link.getAttribute('href');
      if (!id || id === '#') return;

      const alvo = document.querySelector(id);
      if (!alvo) return;

      evento.preventDefault();

      const topo = $('#topo');
      const altura = topo ? topo.offsetHeight + 8 : 0;

      const y = alvo.getBoundingClientRect().top + window.scrollY - altura;

      window.scrollTo({
        top: Math.max(y, 0),
        behavior: reduzir ? 'auto' : 'smooth'
      });

      if (history.replaceState) history.replaceState(null, '', id);
    });
  }

  /* ------------------------------------------------------------------
     início
     ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------
     foto da história acompanha a rolagem.
     O sticky nativo é desativado nesta página, então deslocamos a foto
     por transform dentro da moldura da coluna.
     ------------------------------------------------------------------ */

  function iniciarFotoHistoria() {
    const moldura = document.getElementById('historiaMoldura');
    const foto = document.getElementById('historiaFoto');
    if (!moldura || !foto) return;

    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
    let pedido = false;

    function ajustar() {
      pedido = false;

      if (reduzir.matches || window.innerWidth < 861) {
        foto.style.transform = '';
        return;
      }

      const caixa = moldura.getBoundingClientRect();
      const alturaFoto = foto.offsetHeight;
      const teto = 108;

      let deslocamento = teto - caixa.top;

      const limite = moldura.offsetHeight - alturaFoto - 8;
      deslocamento = Math.max(0, Math.min(deslocamento, Math.max(limite, 0)));

      foto.style.transform = 'translate3d(0,' + deslocamento + 'px,0)';
    }

    function agendar() {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(ajustar);
    }

    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar);
    if (reduzir.addEventListener) reduzir.addEventListener('change', agendar);
    agendar();
  }

  function iniciar() {
    iniciarFotoHistoria();
    iniciarAbertura();
    iniciarMenu();
    iniciarTopo();
    iniciarRevelacoes();
    iniciarNavegacao();
    iniciarRolagem();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
