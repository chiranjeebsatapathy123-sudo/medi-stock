# MediStock

MediStock is a comprehensive, production-grade Healthcare Supply Intelligence and Pharmacy Operations platform. It integrates inventory management, predictive procurement, financial intelligence, and supply chain automation into a single cohesive system.

## 🚀 Features
- **Intelligent Inventory & Cold-Chain Management**: Multi-location tracking, batch-level FEFO (First-Expire, First-Out) tracking, and temperature compliance.
- **Predictive Decision Intelligence**: Real-time stockout risk prediction, automated replenishment, and anomaly detection.
- **Advanced Pharmacy Operations**: Secure prescription dispensing, controlled medicine tracking, and patient verification.
- **Intelligent Procurement**: Supplier performance tracking, automated PO generation, and streamlined Goods Receipt Notes (GRN).
- **Financial Intelligence**: Dynamic inventory valuation (WAC, FIFO), cost analysis, and dead stock mitigation.
- **Multi-Tenant Architecture**: Robust role-based access control (RBAC) and strict tenant isolation for enterprise-scale deployments.

## 🛠️ Technology Stack
- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Java, Spring Boot, Spring Security, Hibernate (JPA)
- **Database**: PostgreSQL (Neon Serverless)
- **Migrations**: Flyway

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- Java 17+
- Maven
- PostgreSQL

### 1. Start the Frontend
The frontend is a Vite + React application.

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Start the Backend
The backend is a Spring Boot application.

```bash
cd backend

# Run the Spring Boot app (Flyway will automatically migrate the database)
./mvnw spring-boot:run
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:8080`.

## 🛡️ License
Proprietary & Confidential.
