# MediStock Pro

A polished React + Vite frontend foundation for an intelligent medical inventory platform.

## Included
- Responsive dashboard
- Login screen
- Inventory management UI
- Medicine add modal
- Stock/expiry statuses
- AI inventory brief
- Analytics-style dashboard
- Purchases, suppliers, batches, reports, users, audit and settings module shells
- Light/dark theme
- Responsive mobile navigation
- Search and inventory filters

## Run

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally http://localhost:5173).

The current build uses local demo data so the interface works immediately. The next integration layer should replace the demo state with REST calls to the Spring Boot API and PostgreSQL persistence.

## Suggested API modules

- /api/auth
- /api/medicines
- /api/batches
- /api/inventory
- /api/purchases
- /api/suppliers
- /api/reports
- /api/analytics
- /api/ai
- /api/users
- /api/audit
