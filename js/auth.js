/* ===================================================================
   LOGIN DOS NOIVOS — Firebase Authentication, REST.

   A leitura de /rsvp no banco só é liberada para quem tem a conta dos
   noivos. O token volta do login e vai em cada requisição; as regras do
   Firebase conferem esse token no servidor. Sem token, o banco recusa.

   Nenhuma senha fica no site: só o e-mail aparece em config.js.
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

  window.Auth = {
    async entrar(email, senha) {
      const resposta = await fetch(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' +
          encodeURIComponent(cfg.firebaseKey),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: senha, returnSecureToken: true })
        }
      );

      if (!resposta.ok) throw new Error('login');

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
