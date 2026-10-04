# PRODUCTION TRUTH MAP

## Overview
This document maps the current state of the MediStock platform prior to executing the full Phase 21R production truth restoration. It identifies fake/simulated data sources, backend/frontend integration gaps, and database reality.

## Frontend
**Location:** `/src` (React/Vite)
**Known Issues & Fakes:**
- Widespread use of `mockDb` in `src/services/simulationEngine.js` and various pages (e.g., `PharmacyOperations.jsx`, `LogisticsCommandCenter.jsx`, `Dashboard.jsx`, etc.).
- Widespread use of `Math.random()` to generate fake data in UI components (e.g., `ControlTower.jsx`, `Suppliers.jsx`).
- Client-side token storage is inconsistent or disconnected from true backend authentication.
- Many pages show mock "loading" or hardcoded UI states without real API calls.

## Backend
**Location:** `/backend` (Spring Boot / Java)
**Known Controllers:**
- `AuthController`
- `BatchController`
- `DashboardController`
- `HealthController`
- `MedicineController`
- `PharmacyController`
- `AiController`
**Known Issues & Fakes:**
- `UsageService`, `ReorderRecommendationService`, and `AiAnomalyDetectionService` contain mocked or hardcoded logic.
- Inventory API is incomplete.
- RBAC and Tenant Isolation are either missing or not fully enforced across all endpoints.
- Authentication flow lacks robust JWT storage, refresh logic, and audit trailing.

## ML Service
**Location:** `/ml-service` (FastAPI / Python)
**Known Issues & Fakes:**
- `app/main.py` explicitly contains "ML Mock implementation" and random/hardcoded confidence scores.
- Uses hardcoded `C:\Users\...` paths for the model registry.
- Features are not drawn from real historical PostgreSQL data.

## Database
**Location:** PostgreSQL
**Known Issues:**
- Mismatch between frontend expectations (e.g., procurement workflows, advanced tracking) and actual DB schema/migrations.
- Some mutations are not transactional or do not record proper audit logs (e.g., missing user context in inventory transactions).

## Next Actions Required (Phase 21R)
1. **Purge Mocks:** Eliminate `mockDb` and `Math.random()` from production UI flows.
2. **Authentication:** Rebuild robust JWT Auth and RBAC (removing demo credentials).
3. **Database Integrity:** Build out full inventory APIs with FEFO and concurrency checks.
4. **AI & Realtime:** Connect real ML predictions and implement actual WebSockets/SSE for Control Tower instead of intervals.
