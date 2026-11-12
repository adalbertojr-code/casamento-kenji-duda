/* ===================================================================
   LISTA DE PRESENTES NA TELA
   =================================================================== */

(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const esc = (s) => window.App.escapar(s);

  let reservas = {};
  let categoriaAtiva = 'todas';
  let filtro = null; // null | 'meus' | 'livres'
  let itens = [];

  function capitalizar(texto) {
    const minusculas = ['de', 'da', 'do', 'das', 'dos', 'para', 'com', 'e'];
    return String(texto || '').replace(/(^|\s|-)(\S+)/g, (m, sep, palavra, posicao) => {
      const baixa = palavra.toLowerCase();
      if (posicao > 0 && minusculas.indexOf(baixa) !== -1) return sep + baixa;
      return sep + palavra.charAt(0).toUpperCase() + palavra.slice(1);
    });
  }

  function montarItens() {
    itens = [];
    (CONFIG.presentes || []).forEach((grupo) => {
      grupo.itens.forEach((nome) => {
        itens.push({
          id: window.App.idDoItem(grupo.categoria, nome),
          nome: capitalizar(nome),
          categoria: grupo.categoria
        });
      });
    });
  }

  function montarCategorias() {
    const caixa = $('#categorias');
    if (!caixa) return;

    const categorias = (CONFIG.presentes || []).map((g) => g.categoria);

    caixa.innerHTML =
      '<button class="categorias__botao" type="button" data-cat="todas" aria-pressed="true">Todas</button>' +
      categorias.map((c) =>
        '<button class="categorias__botao" type="button" data-cat="' + esc(c) + '" aria-pressed="false">' + esc(c) + '</button>'
      ).join('');

    caixa.addEventListener('click', (e) => {
      const botao = e.target.closest('.categorias__botao');
      if (!botao) return;

      categoriaAtiva = botao.dataset.cat;
      caixa.querySelectorAll('.categorias__botao').forEach((b) => {
        b.setAttribute('aria-pressed', b === botao ? 'true' : 'false');
      });
      desenhar();
    });
  }

  // a reserva vem do banco como { d: <id de quem reservou>, t: <quando> }
  function idDono(reserva) {
    if (!reserva) return null;
    return typeof reserva === 'string' ? reserva : reserva.d || null;
  }

  function desenhar() {
    const lista = $('#listaPresentes');
    if (!lista) return;

    const filtrados = itens.filter((item) => {
      if (categoriaAtiva !== 'todas' && item.categoria !== categoriaAtiva) return false;

      const dono = idDono(reservas[item.id]);
      if (filtro === 'meus') return dono === window.Presentes.meuId;
      if (filtro === 'livres') return !dono;
      return true;
    });

    if (!filtrados.length) {
      lista.innerHTML = '<li class="lista-vazia">Nenhum item por aqui com esse filtro.</li>';
      return;
    }

    lista.innerHTML = filtrados.map((item) => {
      const dono = idDono(reservas[item.id]);
      const meu = dono === window.Presentes.meuId;
      const ocupado = Boolean(dono) && !meu;

      const classe = 'presente' + (meu ? ' presente--meu' : '') + (ocupado ? ' presente--ocupado' : '');

      const acao = meu
        ? '<button class="presente__acao" type="button" data-id="' + item.id + '" data-acao="liberar">Liberar</button>'
        : ocupado
          ? '<span class="presente__acao">Reservado</span>'
          : '<button class="presente__acao" type="button" data-id="' + item.id + '" data-acao="reservar">Reservar</button>';

      return (
        '<li class="' + classe + '" data-id="' + item.id + '">' +
          '<span class="presente__info">' +
            '<span class="presente__nome">' + esc(item.nome) + '</span>' +
            '<span class="presente__cat">' + esc(item.categoria) + '</span>' +
          '</span>' +
          acao +
        '</li>'
      );
    }).join('');
  }

  /* ------------------------------------------------------------------
     confirmação em destaque
     O toast do rodapé passa despercebido. Um card logo acima da lista
     deixa claro que a reserva deu certo.
     ------------------------------------------------------------------ */

  let confirmacaoTimer = null;

  function mostrarConfirmacao(item) {
    const caixa = $('#confirmacaoPresente');
    if (!caixa) return;

    const nome = $('#confirmacaoItem');
    if (nome) nome.textContent = item ? '“' + item + '”' : '';

    caixa.hidden = false;
    clearTimeout(confirmacaoTimer);
    confirmacaoTimer = setTimeout(esconderConfirmacao, 12000);

    caixa.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function esconderConfirmacao() {
    const caixa = $('#confirmacaoPresente');
    if (caixa) caixa.hidden = true;
    clearTimeout(confirmacaoTimer);
  }

  function ligarConfirmacao() {
    const fechar = $('#fecharConfirmacao');
    if (fechar) fechar.addEventListener('click', esconderConfirmacao);
  }

  function atualizarProgresso() {
    const total = itens.length;
    const feitos = itens.filter((i) => reservas[i.id]).length;

    const fill = $('#progressoFill');
    const texto = $('#progressoTexto');

    if (fill) fill.style.width = (total ? (feitos / total) * 100 : 0).toFixed(1) + '%';
    if (texto) texto.textContent = feitos + ' de ' + total + ' reservados';
  }

  async function recarregar() {
    try {
      reservas = await window.Presentes.listar();
    } catch (e) {
      reservas = {};
      window.App.avisar('Não conseguimos carregar a lista agora.');
    }
    desenhar();
    atualizarProgresso();
  }

  async function tratarClique(e) {
    const botao = e.target.closest('.presente__acao[data-acao]');
    if (!botao) return;

    const id = botao.dataset.id;
    const acao = botao.dataset.acao;
    const item = itens.find((i) => i.id === id);
    if (!item) return;

    botao.disabled = true;

    try {
      if (acao === 'reservar') {
        reservas = await window.Presentes.reservar(id);
        mostrarConfirmacao(item.nome);
      } else {
        reservas = await window.Presentes.liberar(id);
        esconderConfirmacao();
        window.App.avisar('“' + item.nome + '” voltou para a lista.');
      }

      desenhar();
      atualizarProgresso();

      const linha = document.querySelector('.presente[data-id="' + id + '"]');
      if (linha) {
        linha.classList.add('presente--novo');
        setTimeout(() => linha.classList.remove('presente--novo'), 1900);
      }
    } catch (erro) {
      if (erro.message === 'ocupado') {
        window.App.avisar('Alguém reservou esse item nesse instante. Escolha outro.');
        recarregar();
      } else {
        window.App.avisar('Não conseguimos reservar agora. Tente de novo.');
      }
    } finally {
      botao.disabled = false;
    }
  }

  function ligarChips() {
    const meus = $('#chipMeus');
    const livres = $('#chipLivres');

    function alternar(qual) {
      filtro = filtro === qual ? null : qual;
      if (meus) meus.setAttribute('aria-pressed', filtro === 'meus' ? 'true' : 'false');
      if (livres) livres.setAttribute('aria-pressed', filtro === 'livres' ? 'true' : 'false');
      desenhar();
    }

    if (meus) meus.addEventListener('click', () => alternar('meus'));
    if (livres) livres.addEventListener('click', () => alternar('livres'));
  }

  /* ------------------------------------------------------------------
     sorteio: escolhe um item livre aleatório e reserva no nome de quem tocou
     ------------------------------------------------------------------ */

  const caixaSorteio = () => $('#sorteio');

  function mostrarSorteio(html, classe) {
    const caixa = caixaSorteio();
    if (!caixa) return;
    caixa.innerHTML = html;
    caixa.classList.toggle('tem-resultado', true);
    caixa.classList.remove('sorteio--rolando');
    if (classe) caixa.classList.add(classe);
  }

  async function sortear() {
    const botao = $('#btnSortear');
    const caixa = caixaSorteio();
    if (!botao || !caixa) return;

    const livres = itens.filter((i) => !reservas[i.id]);

    if (!livres.length) {
      mostrarSorteio(
        '<span class="sorteio__rotulo">Todos reservados</span>' +
        '<span class="sorteio__item" style="font-family:var(--serif);font-style:italic;font-size:1.2rem;color:var(--tinta-media)">' +
        'A lista já está completa — que alegria!</span>'
      );
      botao.disabled = true;
      return;
    }

    botao.setAttribute('aria-busy', 'true');

    // roda a roleta por um instante, para dar emoção
    caixa.classList.remove('tem-resultado');
    caixa.innerHTML =
      '<span class="sorteio__rotulo">Sorteando…</span>' +
      '<span class="sorteio__item" id="sorteioAtual">—</span>';
    caixa.classList.add('tem-resultado', 'sorteio--rolando');

    const atual = $('#sorteioAtual');
    const inicio = Date.now();
    const duracao = 1500;

    const roleta = setInterval(() => {
      if (!atual) return;
      const aleatorio = livres[Math.floor(Math.random() * livres.length)];
      atual.textContent = aleatorio.nome;
    }, 90);

    await new Promise((r) => setTimeout(r, duracao));
    clearInterval(roleta);

    // tenta reservar; se alguém tomar no meio do caminho, tenta outro livre
    let escolhido = null;
    let tentativas = 0;

    while (!escolhido && tentativas < 6) {
      tentativas++;
      const livreAgora = itens.filter((i) => !reservas[i.id]);

      if (!livreAgora.length) {
        mostrarSorteio(
          '<span class="sorteio__rotulo">Todos reservados</span>' +
          '<span class="sorteio__item" style="font-family:var(--serif);font-style:italic;font-size:1.2rem;color:var(--tinta-media)">' +
          'A lista acabou de ficar completa — escolha outro carinho?</span>'
        );
        botao.disabled = true;
        botao.removeAttribute('aria-busy');
        return;
      }

      const candidato = livreAgora[Math.floor(Math.random() * livreAgora.length)];

      try {
        reservas = await window.Presentes.reservar(candidato.id);
        escolhido = candidato;
      } catch (erro) {
        if (erro.message !== 'ocupado') {
          mostrarSorteio(
            '<span class="sorteio__rotulo">Não foi possível agora</span>' +
            '<span class="sorteio__item" style="font-family:var(--serif);font-style:italic;font-size:1.2rem;color:var(--tinta-media)">' +
            'Tente de novo em instantes.</span>'
          );
          botao.removeAttribute('aria-busy');
          return;
        }
        await recarregar();
      }
    }

    if (!escolhido) {
      botao.removeAttribute('aria-busy');
      return;
    }

    mostrarSorteio(
      '<span class="sorteio__rotulo">O seu presente é</span>' +
      '<span class="sorteio__item">' + esc(escolhido.nome) + '</span>' +
      '<span class="sorteio__cat">' + esc(escolhido.categoria) + ' · reservado no seu nome</span>'
    );

    desenhar();
    atualizarProgresso();
    botao.removeAttribute('aria-busy');
    botao.innerHTML = '<svg aria-hidden="true"><use href="#i-presente"/></svg> Sortear outro';

    mostrarConfirmacao(escolhido.nome);
  }

  function iniciar() {
    const lista = $('#listaPresentes');
    if (!lista) return;

    montarItens();
    montarCategorias();
    ligarChips();
    ligarConfirmacao();
    lista.addEventListener('click', tratarClique);

    const btnSortear = $('#btnSortear');
    if (btnSortear) btnSortear.addEventListener('click', sortear);

    recarregar();

    // no modo compartilhado, atualiza sozinho de quando em quando
    if (window.Presentes && window.Presentes.modo === 'firebase') {
      setInterval(recarregar, 45000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
