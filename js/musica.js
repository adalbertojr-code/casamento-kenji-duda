/* ===================================================================
   MÚSICA — entra só depois que a pessoa abre o convite.
   Navegadores exigem um gesto do visitante para liberar o áudio.
   =================================================================== */

(function () {
  'use strict';

  const cfg = (window.CONFIG && window.CONFIG.musica) || {};
  const audio = document.getElementById('audio');
  const btn = document.getElementById('btnSom');
  const aviso = document.getElementById('avisoMusica');
  const fechar = document.getElementById('fecharAviso');
  const nome = document.getElementById('musicaNome');
  const rotulo = document.getElementById('musicaRotulo');

  if (!audio || !btn) return;

  let pronto = false;
  let tentou = false;
  let avisoFechado = false;

  const CHAVE = 'kd-musica-muda';

  function ehMudo() {
    try { return localStorage.getItem(CHAVE) === '1'; } catch (e) { return false; }
  }

  function salvarMudo(valor) {
    try { localStorage.setItem(CHAVE, valor ? '1' : '0'); } catch (e) { /* sem armazenamento */ }
  }

  function preparar() {
    if (pronto) return;
    pronto = true;
    audio.src = cfg.arquivo || '';
    audio.volume = typeof cfg.volume === 'number' ? cfg.volume : 0.3;
    if (nome) nome.textContent = cfg.titulo || 'Nosso tema';
  }

  function mostrarAviso() {
    if (!aviso || avisoFechado) return;
    aviso.classList.add('visivel');
    clearTimeout(window.__avisoMusica);
    window.__avisoMusica = setTimeout(esconderAviso, 6500);
  }

  function esconderAviso() {
    if (!aviso) return;
    aviso.classList.remove('visivel');
  }

  function marcarTocando(tocando) {
    btn.setAttribute('aria-pressed', tocando ? 'true' : 'false');
    btn.setAttribute('aria-label', tocando ? 'Pausar música' : 'Tocar música');
  }

  function naoConseguiu() {
    // arquivo ausente ou formato barrado: o site segue sem música, sem fingir
    btn.classList.remove('visivel');
    esconderAviso();
    marcarTocando(false);
  }

  function aoComecarSom() {
    marcarTocando(true);
    if (!pronto) return;
    btn.classList.add('visivel');
    mostrarAviso();
  }

  async function tocar() {
    preparar();
    if (!audio.src) return naoConseguiu();

    btn.classList.add('visivel');
    marcarTocando(false);

    try {
      await audio.play();
    } catch (erro) {
      marcarTocando(false);
    }
  }

  function pausar() {
    audio.pause();
    marcarTocando(false);
    esconderAviso();
  }

  /* ---- eventos ---- */

  audio.addEventListener('error', naoConseguiu);
  audio.addEventListener('playing', () => {
    aoComecarSom();
    if (rotulo) rotulo.textContent = 'Tocando agora';
  });
  audio.addEventListener('pause', () => marcarTocando(false));

  btn.addEventListener('click', () => {
    if (audio.paused) {
      salvarMudo(false);
      tocar();
    } else {
      salvarMudo(true);
      pausar();
    }
  });

  if (fechar) {
    fechar.addEventListener('click', () => {
      avisoFechado = true;
      esconderAviso();
    });
  }

  /* ---- exposto para a abertura ---- */

  window.Musica = {
    iniciar() {
      if (ehMudo()) {
        preparar();
        btn.classList.add('visivel');
        marcarTocando(false);
        return;
      }
      if (tentou) return;
      tentou = true;
      tocar();
    },

    pausar
  };
})();
