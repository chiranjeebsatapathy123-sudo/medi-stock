# Phase 18 Baseline Discovery

## Frontend Architecture
- **Framework:** React / Vite
- **Routing:** Currently UI-level state-based (e.g., `activeTab` or `active` component swapping in `main.jsx`), NOT real URL routing.
- **State Management:** React `useState`/`useEffect` + `localStorage` + `mockDb`.
- **Styling:** CSS + Lucide Icons + Framer Motion.
- **Dependencies:** React, Vite, Framer Motion, Lucide React, workbox (PWA).

### Frontend Routes (Current Virtual Routes)
- `/` -> Renders `App` -> Swaps between:
  - Today, Command Center, Dashboard, Control Tower, Pharmacy Ops, Inventory, Batches & Expiry, Purchases, Suppliers, Logistics Network, Logistics Ops, Facility Center, Digital Twin, Vision Queue, Maintenance, System Health, Error Center, Shelf Map, Scenario Planning, AI Operations, Financial Intel, Predictive Risk, Analytics, AI Insights, Reports, Users & Roles, Movements, Settings, Quality Control.

## Backend Architecture
- **Framework:** Spring Boot (Java)
- **Database:** PostgreSQL
- **Security:** Spring Security + JWT
- **Build Tool:** Maven

### Backend Controllers
- `AiController`
- `AuthController`
- `HealthController`

### Backend Services
- `AiAnomalyDetectionService`
- `AiInventoryService`
- `BarcodeService`
- `ForecastService`
- `InventoryService`
- `ReorderRecommendationService`
- `StockoutPredictionService`
- `UsageService`

### Repositories
- `BatchRepository`
- `InventoryTransactionRepository`
- `MedicineRepository`
- `UserRepository`

### Entities
- `Batch`, `InventoryTransaction`, `Medicine`, `Organization`, `RecordStatus`, `Role`, `User`

### Database Migrations
- Flyway migrations in `src/main/resources/db/migration/`:
  - `V1__init_schema.sql`
  - `V2__phase4_schema.sql`
  - `V3__phase5_enterprise_schema.sql`

## Code Search Findings
- **mockDb**: Used extensively across frontend components (`src/services/mockDb.js`, imported in `main.jsx`, `Batches.jsx`, `Inventory.jsx`, `LogisticsCommandCenter.jsx`, etc.) -> *Production simulation to be replaced.*
- **localStorage**: Used for frontend state persistence (`medistock_logged`, `medistock_theme`, `medistock_active`, `medistock_db`) -> *medistock_db is obsolete production simulation. Theme/active tab are UI preferences.*
- **demo / dummy / hardcoded**: Fake data found in Dashboard KPIs, AI models, hardcoded statistics throughout `.jsx` pages -> *Obsolete production simulation to be replaced.*
- **admin123 / 1234 / SUPER_ADMIN**: `AuthController` or `JwtUtils` currently hardcodes authentication/token generation. -> *To be replaced with real BCrypt/DB auth.*
- **TODO / FIXME**: Occasional notes for unimplemented features.

## Incomplete Features & Dead Code
- Some frontend screens (Analytics, AI Insights) render a fallback "Module Under Development".
- The frontend routing is entirely virtual state (`active`), not HTML5 History API.
- `src/services/simulationEngine.js` exists to mock backend processes on the frontend.
- `mockDb.js` acts as an in-memory SQL database for the frontend.

## Test Coverage
- Minimal Spring Boot tests (`InventoryServiceTest`, `MedistockBackendApplicationTests`).
- No E2E tests for frontend (Playwright/Cypress missing).

## Build Commands
- Frontend: `npm run build`
- Backend: `./mvnw clean package`

## Next Steps
- Implement React Router for real URL routing.
- Create `/src/api/` client layer using `fetch` or `axios`.
- Replace `mockDb` with real API calls via the API layer.
- Fix JWT generation in `AuthController` to use DB user records.
- Implement RBAC and Tenant Isolation in Spring Boot.
- Write E2E and DB integration tests.
