/* ===================================================================
   CONFIRMAÇÃO DE PRESENÇA (RSVP)

   "local"    -> a resposta fica no aparelho do convidado (para testar)
   "firebase" -> a resposta vai para o banco e aparece no painel dos
                 noivos (painel.html)

   Também guarda no aparelho qual resposta já foi enviada, para que a
   pessoa possa editar depois, em vez de confirmar duas vezes.
   =================================================================== */

(function () {
  'use strict';

  const cfg = (window.CONFIG && window.CONFIG.infra) || { modo: 'local' };
  const nuvem = cfg.modo === 'firebase' && cfg.firebaseUrl && cfg.firebaseKey;

  const chaveResposta = 'kd-rsvp';
  const $ = (s) => document.querySelector(s);

  /* ------------------------------------------------------------------
     identificação do convidado
     ------------------------------------------------------------------ */

  function idConvidado() {
    let id = null;
    try { id = localStorage.getItem('kd-convidado'); } catch (e) { /* sem armazenamento */ }
    if (!id) {
      id = 'c-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      try { localStorage.setItem('kd-convidado', id); } catch (e) { /* sem armazenamento */ }
    }
    return id;
  }

  const convidado = idConvidado();

  /* ------------------------------------------------------------------
     endereço do banco
     ------------------------------------------------------------------ */

  function urlRespostas() {
    const base = (cfg.firebaseUrl || '').replace(/\/+$/, '');
    return base + '/rsvp.json';
  }

  function urlResposta() {
    const base = (cfg.firebaseUrl || '').replace(/\/+$/, '');
    return base + '/rsvp/' + encodeURIComponent(convidado) + '.json';
  }

  /* ------------------------------------------------------------------
     leitura e gravação
     ------------------------------------------------------------------ */

  function guardarLocal(dados) {
    try { localStorage.setItem(chaveResposta, JSON.stringify(dados)); } catch (e) { /* sem armazenamento */ }
  }

  function lerLocal() {
    try {
      return JSON.parse(localStorage.getItem(chaveResposta) || 'null');
    } catch (e) {
      return null;
    }
  }

  async function enviar(dados) {
    const registro = Object.assign({}, dados, {
      id: convidado,
      quando: new Date().toISOString()
    });

    if (nuvem) {
      const resposta = await fetch(urlResposta(), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registro)
      });
      if (!resposta.ok) {
        throw new Error('Não foi possível enviar agora (' + resposta.status + ')');
      }
    }

    guardarLocal(registro);
    return registro;
  }

  async function listar() {
    if (!nuvem) {
      const local = lerLocal();
      return local ? [local] : [];
    }

    // a lista completa só abre para a conta dos noivos
    // o Realtime Database recebe o token pelo parâmetro ?auth=, não pelo cabeçalho
    const token = window.Auth ? await window.Auth.token() : '';
    const endereco = urlRespostas() + (token ? '?auth=' + encodeURIComponent(token) : '');

    const resposta = await fetch(endereco, { cache: 'no-store' });

    if (resposta.status === 401 || resposta.status === 403) {
      throw new Error('entre com a conta dos noivos para ver as confirmações');
    }
    if (!resposta.ok) throw new Error('Não foi possível ler as confirmações (' + resposta.status + ')');

    const dados = (await resposta.json()) || {};
    return Object.keys(dados).map((id) => Object.assign({ id }, dados[id]));
  }

  /* ------------------------------------------------------------------
     formulário da página
     ------------------------------------------------------------------ */

  const form = $('#formRsvp');

  function mostrarAviso(mensagem) {
    const aviso = $('#formAviso');
    if (!aviso) return;
    aviso.textContent = mensagem;
    aviso.classList.toggle('ativo', Boolean(mensagem));
  }

  function marcarErro(idCampo, temErro) {
    const campo = document.getElementById(idCampo);
    if (!campo) return;
    campo.closest('.campo').classList.toggle('campo--erro', temErro);
    campo.setAttribute('aria-invalid', temErro ? 'true' : 'false');
  }

  function validar() {
    const nome = $('#nome');
    const limpo = nome.value.trim().replace(/\s+/g, ' ');

    if (limpo.length < 3) {
      marcarErro('nome', true);
      nome.focus();
      return null;
    }

    marcarErro('nome', false);

    const acompanhantes = Number($('#acompanhantes').value) || 0;
    const maximo = (CONFIG.rsvpMaxAcompanhantes || 6);

    return {
      nome: limpo,
      telefone: $('#telefone').value.replace(/[^\d+()\s-]/g, '').trim(),
      vai: form.querySelector('input[name="vai"]:checked').value,
      acompanhantes: Math.min(Math.max(acompanhantes, 0), maximo),
      recado: $('#recado').value.trim().slice(0, 400)
    };
  }

  function preencher(dados) {
    if (!dados) return;
    const nome = $('#nome');
    if (nome) nome.value = dados.nome || '';
    if ($('#telefone')) $('#telefone').value = dados.telefone || '';
    if ($('#acompanhantes')) $('#acompanhantes').value = dados.acompanhantes || 0;
    if ($('#recado')) $('#recado').value = dados.recado || '';

    const escolha = form.querySelector('input[name="vai"][value="' + (dados.vai || 'sim') + '"]');
    if (escolha) escolha.checked = true;

    atualizarCampoAcompanhantes();
  }

  function atualizarCampoAcompanhantes() {
    const vai = form && form.querySelector('input[name="vai"]:checked');
    const campo = $('#campoAcompanhantes');
    if (!campo) return;
    const veio = !vai || vai.value === 'sim';
    campo.style.display = veio ? '' : 'none';
  }

  function mostrarSucesso(dados) {
    form.classList.add('respondido');

    const titulo = $('#formOkTitulo');
    const txt = $('#formOkTexto');

    const nome = window.App.escapar(primeiroNome(dados.nome));
    const data = window.App.dataDoCasamento ? window.App.dataDoCasamento() : '';

    if (dados.vai === 'nao') {
      if (titulo) titulo.textContent = 'Vamos sentir sua falta';
      if (txt) {
        txt.innerHTML = 'Obrigado por avisar, <b>' + nome + '</b>. ' +
          'Seu lugar continua guardado no nosso coração' +
          (data ? ', e no dia ' + data + ' você estará nas nossas orações.' : '.');
      }
    } else {
      if (titulo) titulo.textContent = 'Que notícia boa!';
      const quantos = dados.acompanhantes > 0;
      const amigos = dados.acompanhantes === 1 ? 'uma pessoa especial' : dados.acompanhantes + ' pessoas especiais';

      if (txt) {
        txt.innerHTML = '<b>' + nome + '</b>, você acabou de deixar esse dia ainda mais bonito.' +
          (quantos
            ? ' E que alegria saber que ' + amigos + ' vêm com você!'
            : '') +
          ' Já estamos contando os dias' + (data ? ' até ' + data : '') +
          ' — e agora com você na conta.';
      }
    }
  }

  function primeiroNome(nome) {
    return String(nome || '').trim().split(' ')[0] || '';
  }

  /* ------------------------------------------------------------------
     eventos
     ------------------------------------------------------------------ */

  // a resposta guardada só vale se ainda existir no banco: os noivos
  // podem ter apagado pelo painel, e aí o convidado precisa responder de novo
  async function confirmarNoBanco(anterior) {
    if (!nuvem || !anterior) return;

    try {
      const base = (cfg.firebaseUrl || '').replace(/\/+$/, '');
      const resposta = await fetch(
        base + '/rsvp/' + encodeURIComponent(convidado) + '.json',
        { cache: 'no-store' }
      );
      if (!resposta.ok) return;

      const atual = await resposta.json();
      if (atual) return;

      // foi apagado: limpa o cache local para a pessoa poder responder de novo
      try { localStorage.removeItem(chaveResposta); } catch (e) { /* sem armazenamento */ }
      form.classList.remove('respondido');
      form.reset();
      atualizarCampoAcompanhantes();
    } catch (e) { /* sem rede: mantém o que estava na tela */ }
  }

  function ligarFormulario() {
    if (!form) return;

    // já respondeu antes? mostra a resposta guardada
    const anterior = lerLocal();
    if (anterior) {
      preencher(anterior);
      mostrarSucesso(anterior);
      confirmarNoBanco(anterior);
    }

    form.querySelectorAll('input[name="vai"]').forEach((radio) => {
      radio.addEventListener('change', atualizarCampoAcompanhantes);
    });

    const menos = $('#menos');
    const mais = $('#mais');
    const campo = $('#acompanhantes');
    const maximo = CONFIG.rsvpMaxAcompanhantes || 6;

    function ajustar(delta) {
      if (!campo) return;
      const atual = Number(campo.value) || 0;
      campo.value = Math.min(Math.max(atual + delta, 0), maximo);
      if (menos) menos.disabled = Number(campo.value) <= 0;
      if (mais) mais.disabled = Number(campo.value) >= maximo;
    }

    if (menos) menos.addEventListener('click', () => ajustar(-1));
    if (mais) mais.addEventListener('click', () => ajustar(1));
    if (campo) {
      campo.addEventListener('input', () => {
        const n = Number(campo.value) || 0;
        if (n < 0) campo.value = 0;
        if (n > maximo) campo.value = maximo;
      });
      ajustar(0);
    }

    if ($('#nome')) $('#nome').addEventListener('input', () => marcarErro('nome', false));

    form.addEventListener('submit', async (evento) => {
      evento.preventDefault();
      mostrarAviso('');

      const dados = validar();
      if (!dados) return;

      const botao = $('#btnEnviar');
      botao.setAttribute('aria-busy', 'true');

      try {
        const salvo = await enviar(dados);
        mostrarSucesso(salvo);
        window.App.avisar(dados.vai === 'sim' ? 'Presença confirmada. Até lá!' : 'Resposta registrada. Obrigado!');
      } catch (erro) {
        mostrarAviso('Não conseguimos salvar sua resposta agora. Tente de novo em instantes ou fale com a gente pelo WhatsApp.');
      } finally {
        botao.removeAttribute('aria-busy');
      }
    });

    const editar = $('#btnEditar');
    if (editar) {
      editar.addEventListener('click', () => {
        form.classList.remove('respondido');
        const nome = $('#nome');
        if (nome) nome.focus();
      });
    }
  }

  /* ------------------------------------------------------------------
     prazo
     ------------------------------------------------------------------ */

  function mostrarPrazo() {
    const alvo = $('#prazoRsvp');
    if (alvo && CONFIG.rsvpPrazoTexto) alvo.textContent = CONFIG.rsvpPrazoTexto;
  }

  /* ------------------------------------------------------------------
     início
     ------------------------------------------------------------------ */

  function iniciar() {
    mostrarPrazo();
    ligarFormulario();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

  // só o painel logado usa: apaga a resposta de um convidado
  async function apagar(id) {
    if (!nuvem) throw new Error('o banco não está ligado');

    const token = window.Auth ? await window.Auth.token() : '';
    if (!token) throw new Error('entre com a conta dos noivos para apagar');

    const base = (cfg.firebaseUrl || '').replace(/\/+$/, '');
    const endereco = base + '/rsvp/' + encodeURIComponent(id) + '.json?auth=' + encodeURIComponent(token);

    const resposta = await fetch(endereco, { method: 'DELETE' });
    if (resposta.status === 401 || resposta.status === 403) {
      throw new Error('sem permissão para apagar');
    }
    if (!resposta.ok) throw new Error('não foi possível apagar (' + resposta.status + ')');
  }

  window.Rsvp = { listar, apagar, nuvem };
})();
