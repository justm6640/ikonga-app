# Ikonga App

Ce dépôt contient la structure de base pour l'application **Ikonga**, composée de :

- **backend** : API REST Node.js avec Express et Prisma pour se connecter à PostgreSQL.
- **frontend** : application Next.js 15 en TypeScript.

## Prérequis généraux

- Node.js 18 ou version supérieure
- npm 9 ou version supérieure

---

## Lancer le backend

```bash
cd backend
cp .env.example .env # puis ajustez les informations de connexion PostgreSQL
npm install
npm run dev
```

Le serveur Express démarre par défaut sur le port `4000` et expose une route de vérification : `GET /health`.

### Prisma

- `npm run prisma:generate` : génère le client Prisma à partir du schéma.
- `npm run prisma:migrate` : lance un cycle de migration (en mode développement).

Le fichier `prisma/schema.prisma` est préconfiguré pour PostgreSQL via la variable d'environnement `DATABASE_URL`.

---

## Lancer le frontend

```bash
cd frontend
npm install
npm run dev
```

L'application Next.js est ensuite accessible sur `http://localhost:3000`.

---

## Structure du projet

```
.
├── backend
│   ├── .env.example
│   ├── package.json
│   ├── prisma
│   │   └── schema.prisma
│   └── src
│       └── server.js
├── frontend
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── src
│       └── app
│           ├── globals.css
│           ├── layout.tsx
│           └── page.tsx
└── README.md
```
