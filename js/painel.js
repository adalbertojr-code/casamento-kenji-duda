/* ===================================================================
   PAINEL DOS NOIVOS
   Mostra quem confirmou e quais presentes já foram reservados.
   Só funciona com o banco ligado (CONFIG.infra.modo = "firebase").
   =================================================================== */

(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const esc = (s) => window.App.escapar(s);

  const cfg = (window.CONFIG && window.CONFIG.infra) || {};
  const ligado = cfg.modo === 'firebase' && cfg.firebaseUrl && cfg.firebaseKey;

  /* ------------------------------------------------------------------
     abas
     ------------------------------------------------------------------ */

  function ligarAbas() {
    const abas = Array.from(document.querySelectorAll('.aba'));

    abas.forEach((aba) => {
      aba.addEventListener('click', () => {
        abas.forEach((a) => a.setAttribute('aria-selected', a === aba ? 'true' : 'false'));
        $('#blocoRsvp').classList.toggle('ativo', aba.dataset.aba === 'rsvp');
        $('#blocoPresentes').classList.toggle('ativo', aba.dataset.aba === 'presentes');
      });
    });
  }

  /* ------------------------------------------------------------------
     montagem das tabelas
     ------------------------------------------------------------------ */

  function montarRsvp(lista) {
    const corpo = $('#corpoRsvp');
    const vazio = $('#vazioRsvp');

    const confirmados = lista.filter((r) => r.vai === 'sim');
    const naoVao = lista.filter((r) => r.vai !== 'sim');
    const ordenado = confirmados.concat(naoVao).sort((a, b) => {
      return String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR');
    });

    const totalPessoas = confirmados.reduce((soma, r) => soma + 1 + (Number(r.acompanhantes) || 0), 0);

    $('#numConfirmados').textContent = confirmados.length;
    $('#numPessoas').textContent = totalPessoas;
    $('#numNaoVao').textContent = naoVao.length;

    if (!ordenado.length) {
      corpo.innerHTML = '';
      vazio.hidden = false;
      return;
    }

    vazio.hidden = true;

    corpo.innerHTML = ordenado.map((r) => {
      const quando = r.quando
        ? new Date(r.quando).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
        : '—';

      const selo = r.vai === 'sim'
        ? '<span class="selo selo--sim">Sim</span>'
        : '<span class="selo selo--nao">Não</span>';

      return '<tr>' +
        '<td class="tabela__nome">' + esc(r.nome) + '</td>' +
        '<td>' + selo + '</td>' +
        '<td>' + (Number(r.acompanhantes) || 0) + '</td>' +
        '<td>' + esc(r.telefone || '—') + '</td>' +
        '<td class="tabela__recado">' + esc(r.recado || '—') + '</td>' +
        '<td>' + esc(quando) + '</td>' +
        '<td><button class="apagar" type="button" data-apagar="' + esc(r.id) + '" ' +
          'data-nome="' + esc(r.nome) + '" title="Apagar esta resposta">&times;</button></td>' +
        '</tr>';
    }).join('');
  }

  function montarPresentes(reservas) {
    const corpo = $('#corpoPresentes');
    const vazio = $('#vazioPresentes');

    const ids = Object.keys(reservas || {});
    $('#numPresentes').textContent = ids.length;

    if (!ids.length) {
      corpo.innerHTML = '';
      vazio.hidden = false;
      return;
    }

    vazio.hidden = true;

    const mapa = {};
    (CONFIG.presentes || []).forEach((grupo) => {
      grupo.itens.forEach((nome) => {
        mapa[window.App.idDoItem(grupo.categoria, nome)] = { nome, categoria: grupo.categoria };
      });
    });

    corpo.innerHTML = ids.map((id) => {
      const item = mapa[id] || { nome: id, categoria: '—' };
      const quando = reservas[id] && reservas[id].t
        ? new Date(reservas[id].t).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
        : '—';

      return '<tr>' +
        '<td class="tabela__nome">' + esc(item.nome) + '</td>' +
        '<td>' + esc(item.categoria) + '</td>' +
        '<td>' + esc(quando) + '</td>' +
        '<td><button class="apagar" type="button" data-liberar="' + esc(id) + '" ' +
          'data-nome="' + esc(item.nome) + '" title="Liberar este presente">&times;</button></td>' +
        '</tr>';
    }).join('');
  }

  /* ------------------------------------------------------------------
     carga
     ------------------------------------------------------------------ */

  async function carregar() {
    const botao = $('#btnAtualizar');
    if (botao) botao.setAttribute('aria-busy', 'true');

    // as duas listas carregam separadas: se a de confirmações falhar por
    // falta de login, os presentes ainda aparecem
    const [confirmacoes, reservas] = await Promise.allSettled([
      window.Rsvp.listar(),
      window.Presentes.listar()
    ]);

    if (confirmacoes.status === 'fulfilled') {
      montarRsvp(confirmacoes.value || []);
    } else {
      montarRsvp([]);
      window.App.avisar('Confirmações: ' + confirmacoes.reason.message);
    }

    if (reservas.status === 'fulfilled') {
      montarPresentes(reservas.value || {});
    } else {
      montarPresentes({});
      window.App.avisar('Presentes: ' + reservas.reason.message);
    }

    if (botao) botao.removeAttribute('aria-busy');
  }

  /* ------------------------------------------------------------------
     login
     ------------------------------------------------------------------ */

  function entrar() {
    $('#painelLogin').hidden = true;
    $('#painelConteudo').hidden = false;
    carregar();
  }

  function ligarLogin() {
    const form = $('#formLogin');

    form.addEventListener('submit', async (evento) => {
      evento.preventDefault();

      const email = ($('#email').value || '').trim();
      const senha = $('#senha').value;
      const erro = $('#erroSenha');

      erro.parentNode.classList.remove('campo--erro');

      if (!cfg.firebaseKey) {
        erro.textContent = 'Ligue o banco de dados primeiro (js/config.js).';
        erro.parentNode.classList.add('campo--erro');
        return;
      }

      const botao = form.querySelector('button[type="submit"]');
      botao.setAttribute('aria-busy', 'true');

      try {
        await window.Auth.entrar(email, senha);
        entrar();
      } catch (falha) {
        erro.textContent = 'E-mail ou senha incorretos.';
        erro.parentNode.classList.add('campo--erro');
      } finally {
        botao.removeAttribute('aria-busy');
      }
    });
  }

  /* ------------------------------------------------------------------
     apagar
     ------------------------------------------------------------------ */

  function ligarApagar() {
    // um só ouvinte na tabela: as linhas são redesenhadas a cada carga
    document.querySelector('#corpoRsvp').addEventListener('click', async (evento) => {
      const botao = evento.target.closest('[data-apagar]');
      if (!botao) return;

      const nome = botao.dataset.nome || 'este convidado';
      if (!confirm('Apagar a resposta de ' + nome + '? Isso não pode ser desfeito.')) return;

      botao.disabled = true;
      try {
        await window.Rsvp.apagar(botao.dataset.apagar);
        await carregar();
        window.App.avisar('Resposta de ' + nome + ' apagada.');
      } catch (erro) {
        botao.disabled = false;
        window.App.avisar('Não foi possível apagar: ' + erro.message);
      }
    });

    document.querySelector('#corpoPresentes').addEventListener('click', async (evento) => {
      const botao = evento.target.closest('[data-liberar]');
      if (!botao) return;

      const nome = botao.dataset.nome || 'este presente';
      if (!confirm('Liberar "' + nome + '"? Ele volta para a lista e pode ser escolhido de novo.')) return;

      botao.disabled = true;
      try {
        const base = (CONFIG.infra.firebaseUrl || '').replace(/\/+$/, '');
        const resposta = await fetch(base + '/reservas/' + encodeURIComponent(botao.dataset.liberar) + '.json', {
          method: 'DELETE'
        });
        if (!resposta.ok) throw new Error('o banco respondeu ' + resposta.status);
        await carregar();
        window.App.avisar('"' + nome + '" voltou para a lista.');
      } catch (erro) {
        botao.disabled = false;
        window.App.avisar('Não foi possível liberar: ' + erro.message);
      }
    });
  }

  /* ------------------------------------------------------------------
     início
     ------------------------------------------------------------------ */

  function iniciar() {
    ligarAbas();
    ligarLogin();
    ligarApagar();

    const botao = $('#btnAtualizar');
    if (botao) botao.addEventListener('click', carregar);

    const sair = $('#btnSair');
    if (sair) {
      sair.addEventListener('click', () => {
        window.Auth.sair();
        location.reload();
      });
    }

    if (!ligado) {
      $('#avisoLocal').hidden = false;
      $('#painelSub').textContent = 'Modo de teste, ligue o banco para ver as respostas';
      // sem banco, o painel abre direto para mostrar o aviso
      $('#painelLogin').hidden = true;
      $('#painelConteudo').hidden = false;
      return;
    }

    window.Auth.sessao().then((temSessao) => {
      if (temSessao) entrar();
      else $('#painelLogin').hidden = false;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
