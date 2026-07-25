# Task Manager Frontend

React and TypeScript frontend for the task management assessment.

## Foundation

- Vite
- React Router
- Axios
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS
- ESLint and Prettier

## Commands

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run format:check
npm run build
```

Copy `.env.example` to `.env` before local development when the API does not
use the default `http://localhost:5000/api/v1` address.

## Source Responsibilities

```text
src/
├── api/                    # Shared Axios client and API-wide errors
├── components/             # Reusable common and UI components
├── config/                 # Validated environment configuration
├── features/
│   ├── auth/               # Auth state, API, validation, UI, and pages
│   └── tasks/              # Task API, validation, UI, types, and pages
├── providers/              # Application-wide React providers
├── routes/                 # Route composition and lazy page loading
├── styles/                 # Tailwind and global styles
├── App.tsx                 # Root route outlet
└── main.tsx                # Application bootstrap
```

Shared HTTP configuration stays in `api`, while each feature owns its API
functions and business-facing UI. Components never call Axios directly.
