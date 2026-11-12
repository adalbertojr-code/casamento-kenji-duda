# Conectar o banco e o painel dos noivos

Hoje o site guarda as respostas **só no aparelho de cada convidado** — vocês
não recebem nada. Este guia liga o banco compartilhado e o login do painel.

São cerca de 10 minutos. Tudo o que eu podia deixar pronto já está no
repositório (`firebase.json`, `firebase-database.rules.json` e o login em
`js/auth.js`). Falta só o que só você pode fazer: criar o projeto na sua
conta Google.

---

## 1. Criar o projeto

1. Abra **console.firebase.google.com** e entre com a conta Google de vocês.
2. **Criar projeto** → nome `kenji-duda` → desligue o Analytics → criar.

## 2. Criar o banco

1. No menu, **Build** → **Realtime Database** → **Criar banco**.
2. Região `us-central1`, escolha **modo bloqueado**.
3. Copie a URL no topo, algo como
   `https://kenji-duda-default-rtdb.firebaseio.com`.

## 3. Pegar a chave do site

1. Engrenagem → **Configurações do projeto** → aba **Geral**.
2. Em **Seus apps**, clique em `</>` (Web) → registre o app.
3. Copie a `apiKey` (começa com `AIzaSy...`).

## 4. Criar a conta dos noivos

1. **Build** → **Authentication** → **Vamos começar**.
2. Aba **Sign-in method** → ative **E-mail/senha**.
3. Aba **Users** → **Adicionar usuário** → e-mail e senha de vocês.
   Esse e-mail e essa senha são o que vai abrir o painel.

## 5. Colar no site

Em `js/config.js`, preencha:

```js
infra: {
  modo: "firebase",
  firebaseUrl: "https://kenji-duda-default-rtdb.firebaseio.com",
  firebaseKey: "AIzaSy..."
},

painel: {
  email: "o-email-que-voce-criou@exemplo.com"
}
```

> **A senha não vai aqui.** Este arquivo é público e qualquer visitante
> consegue ler. A senha fica só no Firebase e é conferida no servidor.

## 6. Publicar as regras de segurança

No Firebase, aba **Regras** do banco, cole o conteúdo de
`firebase-database.rules.json` e publique:

```json
{
  "rules": {
    "reservas": {
      ".read": true,
      ".write": true,
      "$item": { ".validate": "newData.hasChild('d')" }
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

O que cada parte faz:

- `rsvp` só pode ser **lido** por quem está logado, ou seja, só pelo painel
  dos noivos. As confirmações têm nome, telefone e recado de cada convidado.
- Qualquer convidado ainda consegue **escrever** a própria resposta.
- `reservas` precisa aceitar escrita livre porque a página usa transação por
  ETag para ninguém reservar o mesmo presente duas vezes.

## 7. Testar

1. Abra `painel.html`, entre com o e-mail e a senha dos noivos.
   A lista deve aparecer vazia.
2. Abra o site, confirme presença e reserve um presente.
3. Volte ao painel e clique em **Atualizar**.

Se o painel recusar o login, confira se o e-mail está igual ao do
Authentication e se o `firebaseKey` está preenchido.

## 8. Enviar para o site

```bash
git add js/config.js && git commit -m "liga o banco" && git push
```

O GitHub Pages publica sozinho em cerca de um minuto.
