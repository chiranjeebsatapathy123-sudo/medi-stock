-- V10__procurement_phase26_schema.sql

-- 1. Suppliers Updates
ALTER TABLE suppliers ADD COLUMN legal_name VARCHAR(255);
ALTER TABLE suppliers ADD COLUMN tax_identifier VARCHAR(100);
ALTER TABLE suppliers ADD COLUMN currency VARCHAR(10) DEFAULT 'USD';
ALTER TABLE suppliers ADD COLUMN minimum_order_value DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE suppliers ADD COLUMN minimum_order_quantity INTEGER DEFAULT 0;

-- 2. Purchase Requests
CREATE TABLE purchase_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    requested_by UUID NOT NULL REFERENCES users(id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    priority VARCHAR(50) DEFAULT 'ROUTINE',
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    notes TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_request_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_request_id UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
    preferred_supplier_id UUID REFERENCES suppliers(id),
    target_date DATE,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING'
);

-- 3. Purchase Orders Updates
ALTER TABLE purchase_orders ADD COLUMN currency VARCHAR(10) DEFAULT 'USD';
ALTER TABLE purchase_orders ADD COLUMN shipping DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE purchase_orders ADD COLUMN discount DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE purchase_orders ADD COLUMN requested_delivery_date DATE;

ALTER TABLE purchase_order_items ADD COLUMN received_quantity INTEGER DEFAULT 0;
ALTER TABLE purchase_order_items ADD COLUMN discount DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE purchase_order_items ADD COLUMN expected_delivery_date DATE;
ALTER TABLE purchase_order_items ADD COLUMN status VARCHAR(50) DEFAULT 'PENDING';

-- 4. Supplier Contracts
CREATE TABLE supplier_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    contract_price DECIMAL(12, 2) NOT NULL,
    minimum_quantity INTEGER DEFAULT 0,
    maximum_quantity INTEGER,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    terms TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. GRN (Goods Receipt Note)
CREATE TABLE grns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    grn_number VARCHAR(100) NOT NULL,
    received_by UUID NOT NULL REFERENCES users(id),
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    notes TEXT,
    UNIQUE (organization_id, grn_number)
);

CREATE TABLE grn_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_id UUID NOT NULL REFERENCES grns(id) ON DELETE CASCADE,
    purchase_order_item_id UUID NOT NULL REFERENCES purchase_order_items(id),
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    batch_id UUID REFERENCES batches(id),
    storage_location_id UUID REFERENCES storage_locations(id),
    received_quantity INTEGER NOT NULL,
    accepted_quantity INTEGER DEFAULT 0,
    rejected_quantity INTEGER DEFAULT 0,
    quality_status VARCHAR(50) DEFAULT 'ACCEPTED',
    notes TEXT
);

-- 6. Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    purchase_order_id UUID REFERENCES purchase_orders(id),
    invoice_number VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    currency VARCHAR(10) DEFAULT 'USD',
    subtotal DECIMAL(12, 2) NOT NULL,
    tax DECIMAL(12, 2) DEFAULT 0,
    shipping DECIMAL(12, 2) DEFAULT 0,
    discount DECIMAL(12, 2) DEFAULT 0,
    grand_total DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'RECEIVED',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (organization_id, supplier_id, invoice_number)
);

CREATE TABLE invoice_exceptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    owner_id UUID REFERENCES users(id),
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Budgets
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    allocated_amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE budget_consumptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    reference_type VARCHAR(50) NOT NULL, -- 'PO', 'INVOICE'
    reference_id UUID NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'COMMITTED', 'SPENT'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Procurement Audit Logs
CREATE TABLE procurement_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    actor_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    before_state JSONB,
    after_state JSONB,
    reason TEXT,
    correlation_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_purchase_req_org_status ON purchase_requests(organization_id, status);
CREATE INDEX idx_grns_org_status ON grns(organization_id, status);
CREATE INDEX idx_invoices_org_status ON invoices(organization_id, status);
CREATE INDEX idx_procurement_audit_entity ON procurement_audit_logs(entity_type, entity_id);
