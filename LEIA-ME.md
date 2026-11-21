# Casamento Kenji & Duda — 20.06.2027

Convite de página única, sem build e sem dependências. Basta abrir
`index.html` que ele funciona.

```
index.html            o convite
painel.html           painel dos noivos (confirmados e presentes)
robots.txt            mantém o painel fora dos buscadores

css/
  base.css            cores, tipografia, botões e utilitários
  abertura.css        tela de entrada com o monograma
  hero.css            topo com os nomes, foto e pétalas
  contagem.css        contagem regressiva e versículo
  historia.css        nossa história e as fotos
  dia.css             data, locais, mapas e traje
  presentes.css       lista de presentes
  formulario.css      confirmação de presença
  interface.css       navegação, rodapé, música e avisos
  painel.css          painel dos noivos
  responsivo.css      ajustes de tela e de impressão

js/
  config.js           todo o conteúdo editável
  app.js              textos, contagem, locais, mapas
  musica.js           música de fundo e botão de som
  presentes.js        regras de reserva
  presentes-ui.js     a lista na tela
  rsvp.js             confirmação de presença
  auth.js             login dos noivos
  painel.js           painel dos noivos
  interface.js        abertura, pétalas, menu, rolagem

assets/
  arte/               monograma, favicon, cartilha do traje, imagem de compartilhamento
  fotos/              fotos do casal
  musica/             música de fundo
  _origem/            originais de trabalho (fora do site publicado)
```

## Editar o conteúdo

Quase tudo que muda está em `js/config.js`: data, locais, história,
versículo, WhatsApp, música e a lista de presentes.

A data está no fuso de Brasília, e a contagem regressiva se ajusta sozinha:

```js
data: "2027-06-20T15:30:00-03:00",
```

O WhatsApp vai só com números, com código do país: `"5547933003133"`.

## Publicar uma alteração

O site é estático e está no GitHub Pages, direto da branch `main`:

```bash
git add -A && git commit -m "ajuste no texto da história" && git push
```

O GitHub publica a nova versão em cerca de um minuto.

## Painel dos noivos

Fica em `painel.html`, com a conta criada no Firebase Authentication.
A senha não está no repositório — quem confere é o servidor.

Depois de 5 tentativas erradas, o login fica bloqueado por 15 minutos.

## Banco de dados

Realtime Database, com as regras em `firebase-database.rules.json`.

- `rsvp` só pode ser **lido** por quem está logado (o painel). As
  confirmações têm nome, telefone e recado de cada convidado.
- Qualquer convidado ainda consegue **escrever** a própria resposta.
- `reservas` aceita escrita livre porque a página usa transação por ETag:
  ao reservar, envia a impressão digital do item (`If-Match`). Se alguém
  reservou no meio do caminho, o servidor recusa com `412` e o site tenta de
  novo. Assim dois cliques simultâneos não pegam o mesmo presente.

Para publicar as regras, cole o conteúdo do arquivo na aba **Regras** do
console do Firebase.

## A música

`assets/musica/musica.mp3` — "Ordinary", Alex Warren, cover de piano e
cello. 3min24s, 128 kbps.

Só começa quando a pessoa toca em **Abrir o convite**, porque o navegador
exige uma interação antes de liberar áudio. O botão redondo no canto liga e
desliga, e a escolha fica guardada no aparelho.

É obra de terceiros. Para um convite privado, sem fins comerciais, o uso é
comum; se o site passar a ter fins comerciais, troque por uma faixa com
licença explícita.

## Traje

A seção de traje usa uma arte única (`assets/arte/traje-cartilha.webp`)
com os dez avisos aos convidados. Para trocar o texto, é preciso editar a
imagem.
