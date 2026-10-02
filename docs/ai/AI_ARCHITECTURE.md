# MediStock AI Architecture

## 1. Overview
The MediStock AI Architecture implements a controlled operations layer that continuously observes the platform, identifies important situations, gathers evidence, and routes high-impact actions through human approval.

## 2. Core Principles
*   **Assistive**: AI does not replace humans; it augments their operational capacity.
*   **Explainable**: Every AI conclusion is backed by concrete evidence and transparent confidence metrics.
*   **Permission-Aware**: AI adheres strictly to the existing RBAC and tenant boundaries.
*   **Auditable**: All AI actions, drafts, and approvals are logged.
*   **Reversible**: AI actions support rollback where technically possible.

## 3. Architecture Flow
```text
                   MEDISTOCK
                       │
              Operational Data
                       │
                       ▼
              ┌────────────────┐
              │ AI Operations  │
              └────────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
   Monitor          Analyze         Recommend
       │               │               │
       └───────────────┼───────────────┘
                       ▼
                 Human Review
                       │
                ┌──────┴──────┐
                ▼             ▼
             Approve        Reject
                │
                ▼
             Execute
                │
                ▼
              Audit
```

## 4. Components
*   **AI Agent Registry**: Central catalog of specialized agents (Inventory, Expiry, Procurement, etc.).
*   **AI Situation Center**: The user-facing dashboard displaying active AI-detected situations, evidence, and recommendations.
*   **AI Action Gateway**: The central choke-point where all AI tool requests undergo schema validation, permission checks, business rule enforcement, and risk classification.
*   **AI Automation Policies**: Configurable rules dictating whether an agent's recommendation triggers automatically or requires human approval.
*   **Kill Switch**: An emergency halt mechanism that allows administrators to immediately suspend all AI execution capabilities while preserving observation.
