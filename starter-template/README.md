# React Starter Template

A clean Vite + React + TypeScript starter with Tailwind CSS, Redux Toolkit,
RTK Query, routing, form handling, and PWA support.

## Tech stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Redux Toolkit
- RTK Query
- React Router
- React Hook Form
- Zod
- Sonner
- Vite PWA Plugin
- ESLint
- Prettier

## Features included

- Vite-based React TypeScript project setup
- Tailwind CSS via the latest `@tailwindcss/vite` plugin approach
- Redux Toolkit store with typed hooks
- Sample counter slice
- RTK Query auth API service
- React Router app shell and starter pages
- Reusable `Button`, `Input`, and `LoadingSpinner` components
- Login form with React Hook Form + Zod validation
- Sonner toast notifications
- PWA manifest configuration with `vite-plugin-pwa`
- ESLint and Prettier developer tooling

## Project structure

```text
.
├─ public/
├─ src/
│  ├─ app/
│  ├─ components/
│  │  ├─ layout/
│  │  └─ ui/
│  ├─ features/
│  │  ├─ auth/
│  │  └─ counter/
│  ├─ lib/
│  ├─ pages/
│  ├─ routes/
│  ├─ index.css
│  └─ main.tsx
├─ .env.example
├─ eslint.config.js
├─ package.json
├─ README.md
└─ vite.config.ts
```

## Environment variables

Create a local `.env` file if needed and provide:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

RTK Query uses `VITE_API_BASE_URL` for the auth API base URL and falls back to
`http://localhost:3000/api` if it is not defined.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run format
```

## PWA icons

Place these files in the `public` folder for the current PWA manifest:

- `public/pwa-192x192.png`
- `public/pwa-512x512.png`
- `public/apple-touch-icon.png` if you add Apple touch support later
