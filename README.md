# MediStock Pro
**Intelligent Medical Inventory Management System**

MediStock Pro is a comprehensive, AI-powered medical inventory and supply chain management platform designed for enterprise healthcare organizations. 

## Features

- **Control Tower & Command Center**: High-level dashboards summarizing real-time active alerts, operations, and insights.
- **Inventory & Shelf Map**: Complete warehouse visualization, shelf mapping, and item-level tracking using First-Expired-First-Out (FEFO) logic.
- **Batches & Expiry Management**: Keep track of upcoming expirations to minimize wastage and improve safety.
- **Purchases & Suppliers**: Streamline your procurement workflows and manage supplier lead times and performances.
- **Logistics & Facility Management**: Monitor active fleet shipments (Chain of Custody), cold chain compliance, and smart warehouse IoT events.
- **Pharmacy Operations**: Specialized workflows for fulfilling orders, managing dispensing validation, and controlled substance tracking.
- **AI & Predictive Intelligence**: Embedded machine learning capabilities for predicting stockout risks, calculating optimal reorder points, and interrogating your data using natural language (Evidence-Based Insights).
- **Users & Roles**: Role-based Access Control (RBAC) supporting multiple tenants and permission levels to keep operations secure.

## Architecture

- **Frontend**: React (Vite), featuring dynamic routing and dark mode support.
- **Backend**: Spring Boot 3, providing a REST API and securing endpoints via JWT and stateless authentication.
- **Database**: PostgreSQL 16+ via Flyway migrations ensuring full transactional integrity.
- **Python ML Services**: Fast/Automated AI models running to provide real-time inference (e.g. `start_ml_service.bat`).

## Quick Start

### 1. Database
Set up a PostgreSQL database named `medistock` and run the Spring Boot backend to automatically run the Flyway migrations (V1 to V13). Wait for `V4__seed_data.sql` to populate demo data.

### 2. Backend
```bash
cd backend
mvn spring-boot:run
```

### 3. Frontend
```bash
npm install
npm run dev
```

Visit `http://localhost:5173` and log in with the pre-filled demo credentials (`admin@medistock.com` / `admin123`).
