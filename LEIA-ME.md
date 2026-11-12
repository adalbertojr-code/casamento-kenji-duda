# Casamento Kenji & Duda — 20.06.2027

Site de página única, sem build e sem dependências. Basta abrir `index.html`
(ou publicar a pasta) que ele funciona.

```
index.html            o convite
painel.html           painel dos noivos (confirmações e presentes)
LEIA-ME.md            este arquivo

css/
  base.css            cores, tipografia, botões e utilitários
  abertura.css        a tela de entrada com o monograma
  hero.css            topo com os nomes, foto e pétalas
  contagem.css        contagem regressiva e versículo
  historia.css        nossa história e as fotos
  dia.css             data, locais, mapas e traje
  presentes.css       lista de presentes
  formulario.css      confirmação de presença
  interface.css       navegação, rodapé, música e avisos
  painel.css          estilos do painel dos noivos
  responsivo.css      ajustes de tela e de impressão

js/
  config.js           TODO o conteúdo editável
  app.js              textos, contagem, locais, mapas
  musica.js           música de fundo e botão de som
  presentes.js        regras de reserva (local ou Firebase)
  presentes-ui.js     a lista na tela
  rsvp.js             confirmação de presença
  auth.js             login dos noivos (Firebase Authentication)
  painel.js           painel dos noivos
  interface.js        abertura, pétalas, menu, rolagem

assets/
  arte/               monograma, favicon, imagem de compartilhamento
  fotos/              fotos do casal
  musica/             música de fundo
  _origem/            originais e duplicatas (fora do site publicado)
```

## 1. O que editar (`js/config.js`)

Quase tudo que muda está lá: data, locais, história, versículo, WhatsApp,
música e a lista de presentes.

A data está no fuso de Brasília:

```js
data: "2027-06-20T15:30:00-03:00",
```

A contagem regressiva e o "domingo" se ajustam sozinhos a partir dela.

O WhatsApp vai só com números, com código do país: `"5547933003133"`.

### A história

O texto que está no site é um **rascunho** — troque pelo de vocês.
É só editar a lista em `historia: [...]`, uma frase por linha entre aspas.
Se quiser mais ou menos parágrafos, adicione ou remova linhas.

## 2. Ligar o banco de dados (para o RSVP de verdade)

Hoje o site está em `infra.modo: "local"`: as respostas ficam guardadas no
aparelho de cada convidado e **vocês não as veem**. Para receber as
confirmações e ver o painel, são 5 minutos:

**1. Criar o projeto**

1. Abra `console.firebase.google.com` e entre com uma conta Google.
2. **Adicionar projeto** → dê um nome (ex.: `kenji-duda`) → desligue o Analytics → criar.

**2. Criar o banco**

1. No menu lateral, **Criar** → **Realtime Database**.
2. Escolha a região `us-central1` e o modo **bloqueado**.
3. Copie a URL que aparece no topo, algo como
   `https://kenji-duda-default-rtdb.firebaseio.com`.

**3. Pegar a chave do site**

1. Engrenagem → **Configurações do projeto** → aba **Geral**.
2. Role até **Seus apps** → clique em `</>` (Web) → registre o app.
3. Copie o valor de `apiKey` (começa com `AIzaSy...`).

**4. Colar no site**

Em `js/config.js`:

```js
infra: {
  modo: "firebase",
  firebaseUrl: "https://kenji-duda-default-rtdb.firebaseio.com",
  firebaseKey: "AIzaSy..."
},
```

**5. Criar a conta dos noivos**

1. No Firebase, abra **Authentication** → **Get started**.
2. Aba **Sign-in method** → ative **E-mail/senha**.
3. Aba **Users** → **Add user** → e-mail e senha de vocês.
4. Em `js/config.js`, coloque o e-mail em `painel.email`:

```js
painel: { email: "noivos@kenjiduda.com" }
```

A senha **não** vai no site. O painel entra com essa conta e o Firebase
confere a senha no servidor. Nunca coloque a senha em `config.js`: o
arquivo é público e qualquer visitante consegue ler.

**6. As regras — este passo é o que faz a proteção funcionar**

Na aba **Regras** do banco, cole:

```json
{
  "rules": {
    "reservas": {
      ".read": true,
      ".write": true,
      "$item": {
        ".validate": "newData.hasChild('d')"
      }
    },
    "rsvp": {
      ".read": "auth != null",
      "$pessoa": {
        ".write": true,
        ".validate": "newData.hasChild('nome')"
      }
    }
  }
}
```

> **`rsvp` com `.read` só para quem está logado**: as confirmações têm
> nome, telefone e recado de cada convidado. Com a regra acima, só a conta
> dos noivos (logada no painel) consegue ler. As pessoas continuam podendo
> **escrever** a própria resposta.

> **Por que escrever solto em `reservas`** e travar o resto: o site usa
> transação por ETag para impedir duas pessoas de reservarem o mesmo
> presente. Se a raiz do banco ficar com escrita livre, o Firebase recusa
> essa transação e a lista para de funcionar.

**7. Conferir**

Abra `painel.html` no site publicado, entre com o e-mail e a senha dos noivos
e confirme que a lista aparece vazia. Depois faça um teste: abra o site,
confirme presença e reserve um presente. Volte ao painel e clique em
**Atualizar**. Para sair, use o botão **Sair**.

## 3. Como as reservas de presente funcionam

Quando alguém toca em **Reservar**, o site lê o item e guarda o `ETag`
(uma impressão digital daquele estado). Na gravação, envia esse `ETag` no
cabeçalho `If-Match`. Se outra pessoa reservou no meio do caminho, o
servidor recusa com `412` e o site tenta de novo. Assim, dois cliques
simultâneos **não** reservam o mesmo item.

Ninguém vê quem reservou o quê — só que o item já foi escolhido.

## 4. A música

O arquivo é `assets/musica/musica.mp3` — "Sorriso Resplandecente"
(Dragon Ball GT), cover de violino da Cammyli Aguiar, reencodado em 112 kbps
(1,7 MB) e normalizado, para carregar rápido no celular.

A música só começa quando a pessoa toca em **Abrir o convite** — navegadores
só liberam áudio depois de uma interação. O botão redondo no canto liga e
desliga a qualquer momento, e a escolha fica guardada no aparelho.

> **Sobre direitos autorais:** é uma obra de terceiros. Para um convite
> privado, sem fins comerciais, o uso é comum. Se o site ficar público ou
> comercial, use uma faixa com licença explícita. Sem o arquivo, o site
> funciona normalmente — ele não finge tocar o que não existe.

## 5. Publicar

O site é 100% estático. Ele está publicado no **GitHub Pages**, direto do
repositório na branch `main` (pasta raiz). Para atualizar, é só commitar e
enviar o código:

```bash
git add -A && git commit -m "minha alteração" && git push
```

O GitHub Pages publica a nova versão sozinho em cerca de um minuto.

Alternativas, se um dia precisar: arrastar a pasta em `app.netlify.com/drop`
ou rodar `firebase deploy` (o `firebase.json` já está configurado para
hospedagem e regras do banco).

## 6. Antes de considerar pronto

- [ ] Trocar a história de exemplo pelo texto real do casal
- [ ] Conferir os endereços dos dois locais no mapa
- [ ] Testar o botão **Como chegar** nos dois cartões
- [ ] Criar o Firebase e trocar `infra.modo` para `"firebase"`
- [ ] Criar a conta dos noivos no Authentication e preencher `painel.email`
- [ ] Colar as regras do banco (a de `rsvp` com `.read` só para logados)
- [ ] Fazer um teste completo: confirmar, reservar, abrir o painel
- [ ] Abrir no celular de verdade e ver a abertura com música
- [ ] Confirmar o prazo da confirmação (`rsvpPrazoTexto`)
