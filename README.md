# Minhas Receitas

PWA simples para salvar receitas em texto livre, com login Firebase, Firestore, Storage para foto opcional e Screen Wake Lock API na leitura da receita.

## Rodar localmente

```bash
npm install
npm run dev
```

Copie `.env.example` para `.env` e preencha com as credenciais do seu app web no Firebase:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Firebase

Ative no Firebase Console:

- Authentication com provedor de e-mail/senha.
- Firestore Database.
- Storage.

As receitas ficam em:

```txt
users/{uid}/recipes/{recipeId}
```

As fotos ficam em:

```txt
users/{uid}/recipes/{recipeId}/cover
```

## Regras sugeridas

As regras de exemplo estao em `firestore.rules` e `storage.rules`. Elas permitem que cada usuario leia e escreva apenas os dados dentro da propria pasta.
