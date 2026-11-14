/* ===================================================================
   LOGIN DO PAINEL — Auth REST do Firebase.
   A senha nunca aparece no site, só o e-mail; quem confere é o servidor.
   =================================================================== */

(function () {
  'use strict';

  const cfg = (window.CONFIG && window.CONFIG.infra) || {};
  const CHAVE = 'kd-token';

  function guardar(sessao) {
    try {
      if (sessao) localStorage.setItem(CHAVE, JSON.stringify(sessao));
      else localStorage.removeItem(CHAVE);
    } catch (e) { /* sem armazenamento */ }
  }

  function ler() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE) || 'null');
    } catch (e) {
      return null;
    }
  }

  // devolve um token válido; renova com refreshToken quando expira
  async function token() {
    const sessao = ler();
    if (!sessao || !sessao.token) return '';

    if (sessao.expira && Date.now() < sessao.expira - 60000) return sessao.token;

    if (!sessao.refresh) return '';

    const resposta = await fetch(
      'https://securetoken.googleapis.com/v1/token?key=' + encodeURIComponent(cfg.firebaseKey),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(sessao.refresh)
      }
    );

    if (!resposta.ok) {
      guardar(null);
      return '';
    }

    const dados = await resposta.json();
    const nova = {
      token: dados.id_token,
      refresh: dados.refresh_token,
      expira: Date.now() + Number(dados.expires_in || 3600) * 1000
    };
    guardar(nova);
    return nova.token;
  }

  /* ------------------------------------------------------------------
     limite de tentativas
     O Firebase não bloqueia senha errada repetida, então o próprio painel
     conta as falhas antes de chamar a API. A trava é local (por navegador),
     o que segura quem tenta adivinhar a senha pelo site.
     ------------------------------------------------------------------ */

  const CHAVE_TENTATIVAS = 'kd-tentativas';
  const MAX_TENTATIVAS = 5;
  const ESPERA_MS = 15 * 60 * 1000; // 15 minutos

  function lerTentativas() {
    try {
      const dados = JSON.parse(localStorage.getItem(CHAVE_TENTATIVAS) || 'null');
      if (!dados || typeof dados.quantas !== 'number') return { quantas: 0, desde: 0 };
      // a contagem expira sozinha
      if (Date.now() - dados.desde > ESPERA_MS) return { quantas: 0, desde: 0 };
      return dados;
    } catch (e) {
      return { quantas: 0, desde: 0 };
    }
  }

  function contarFalha() {
    const atual = lerTentativas();
    const novo = { quantas: atual.quantas + 1, desde: atual.desde || Date.now() };
    try { localStorage.setItem(CHAVE_TENTATIVAS, JSON.stringify(novo)); } catch (e) {}
    return novo;
  }

  function limparTentativas() {
    try { localStorage.removeItem(CHAVE_TENTATIVAS); } catch (e) {}
  }

  function minutosRestantes(desde) {
    const falta = ESPERA_MS - (Date.now() - desde);
    return Math.max(1, Math.ceil(falta / 60000));
  }

  window.Auth = {
    async entrar(email, senha) {
      const tentativas = lerTentativas();
      if (tentativas.quantas >= MAX_TENTATIVAS) {
        throw new Error('espera:' + minutosRestantes(tentativas.desde));
      }

      const resposta = await fetch(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' +
          encodeURIComponent(cfg.firebaseKey),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: senha, returnSecureToken: true })
        }
      );

      if (!resposta.ok) {
        const depois = contarFalha();
        if (depois.quantas >= MAX_TENTATIVAS) {
          throw new Error('espera:' + minutosRestantes(depois.desde));
        }
        throw new Error('login');
      }

      limparTentativas();

      const dados = await resposta.json();
      guardar({
        token: dados.idToken,
        refresh: dados.refreshToken,
        expira: Date.now() + Number(dados.expiresIn || 3600) * 1000
      });
      return dados;
    },

    token,

    async sessao() {
      return Boolean(await token());
    },

    sair() {
      guardar(null);
    }
  };
})();
