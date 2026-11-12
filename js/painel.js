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
        '</tr>';
    }).join('');
  }

  /* ------------------------------------------------------------------
     carga
     ------------------------------------------------------------------ */

  async function carregar() {
    const botao = $('#btnAtualizar');
    if (botao) botao.setAttribute('aria-busy', 'true');

    try {
      const [confirmacoes, reservas] = await Promise.all([
        window.Rsvp.listar(),
        window.Presentes.listar()
      ]);

      montarRsvp(confirmacoes || []);
      montarPresentes(reservas || {});
    } catch (erro) {
      window.App.avisar('Não foi possível carregar os dados: ' + erro.message);
    } finally {
      if (botao) botao.removeAttribute('aria-busy');
    }
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
     início
     ------------------------------------------------------------------ */

  function iniciar() {
    ligarAbas();
    ligarLogin();

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
