/* ===================================================================
   PRESENTES — reserva de itens.

   Dois modos (configurar em CONFIG.infra.modo):

   "local"    -> guarda no aparelho de quem reservou. Serve para testar.
   "firebase" -> lista compartilhada entre todos os convidados, com
                 proteção contra duas pessoas pegarem o mesmo item.

   No modo firebase, a proteção usa transação por ETag (If-Match):
   se outra pessoa reservar no mesmo instante, o servidor recusa e o
   site tenta de novo. Sem isso, um PUT simples sobrescreveria a
   reserva do outro e as duas pessoas achariam que reservaram.
   =================================================================== */

(function () {
  'use strict';

  const chaveLocal = 'kd-presentes';
  const infra = (window.CONFIG && window.CONFIG.infra) || { modo: 'local' };

  /* identidade do aparelho: ninguém vê quem reservou,
     só o site sabe qual reserva é "sua" */

  function idAparelho() {
    let id = null;
    try { id = localStorage.getItem('kd-aparelho'); } catch (e) { /* sem armazenamento */ }
    if (!id) {
      id = 'ap-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      try { localStorage.setItem('kd-aparelho', id); } catch (e) { /* sem armazenamento */ }
    }
    return id;
  }

  const meuId = idAparelho();

  /* ------------------------------------------------------------------
     modo local
     ------------------------------------------------------------------ */

  const Local = {
    ler() {
      try {
        return JSON.parse(localStorage.getItem(chaveLocal) || '{}') || {};
      } catch (e) {
        return {};
      }
    },

    gravar(dados) {
      try { localStorage.setItem(chaveLocal, JSON.stringify(dados)); } catch (e) { /* sem armazenamento */ }
    },

    async reservar(id) {
      const dados = this.ler();
      if (dados[id] && dados[id] !== meuId) {
        throw new Error('ocupado');
      }
      dados[id] = meuId;
      this.gravar(dados);
      return dados;
    },

    async liberar(id) {
      const dados = this.ler();
      if (dados[id] === meuId) {
        delete dados[id];
        this.gravar(dados);
      }
      return dados;
    },

    async listar() {
      return this.ler();
    }
  };

  /* ------------------------------------------------------------------
     modo firebase (Realtime Database, REST)
     ------------------------------------------------------------------ */

  function baseUrl() {
    const url = (infra.firebaseUrl || '').replace(/\/+$/, '');
    return url ? url + '/reservas' : '';
  }

  function urlItem(id) {
    return baseUrl() + '/' + encodeURIComponent(id) + '.json';
  }

  function urlLista() {
    return baseUrl() + '.json';
  }

  const Nuvem = {
    async listar() {
      const resposta = await fetch(urlLista(), { cache: 'no-store' });
      if (!resposta.ok) throw new Error('Não foi possível ler a lista (' + resposta.status + ')');
      return (await resposta.json()) || {};
    },

    async reservar(id, tentativa) {
      tentativa = tentativa || 0;
      if (tentativa > 4) throw new Error('Muitas tentativas. Tente de novo em instantes.');

      // 1. lê o estado atual e guarda a "impressão digital" (ETag)
      const leitura = await fetch(urlItem(id), { cache: 'no-store' });
      if (!leitura.ok) throw new Error('Não foi possível conferir o item');

      const etag = leitura.headers.get('ETag');
      const atual = await leitura.json();

      if (atual && atual.d !== meuId) throw new Error('ocupado');

      // 2. grava só se ninguém mudou o item no meio do caminho
      const cabecalhos = { 'Content-Type': 'application/json' };
      if (etag) cabecalhos['If-Match'] = etag;

      const resposta = await fetch(urlItem(id), {
        method: 'PUT',
        headers: cabecalhos,
        body: JSON.stringify({ d: meuId, t: Date.now() })
      });

      if (resposta.status === 412) {
        // alguém reservou entre a leitura e a gravação: tenta de novo
        return this.reservar(id, tentativa + 1);
      }

      if (!resposta.ok) {
        throw new Error('Não foi possível reservar agora (' + resposta.status + ')');
      }

      return this.listar();
    },

    async liberar(id) {
      const atual = await (await fetch(urlItem(id), { cache: 'no-store' })).json();
      if (atual && atual.d === meuId) {
        await fetch(urlItem(id), { method: 'DELETE' });
      }
      return this.listar();
    }
  };

  /* ------------------------------------------------------------------
     escolhe o motor
     ------------------------------------------------------------------ */

  const pronto = infra.modo === 'firebase' && infra.firebaseUrl && infra.firebaseKey;
  const motor = pronto ? Nuvem : Local;

  /* ------------------------------------------------------------------
     API pública
     ------------------------------------------------------------------ */

  window.Presentes = {
    modo: pronto ? 'firebase' : 'local',
    meuId,

    async listar() {
      return motor.listar();
    },

    async reservar(id) {
      return motor.reservar(id);
    },

    async liberar(id) {
      return motor.liberar(id);
    },

    ehMinha(reserva) {
      if (!reserva) return false;
      const dono = typeof reserva === 'string' ? reserva : reserva.d;
      return dono === meuId;
    }
  };
})();
