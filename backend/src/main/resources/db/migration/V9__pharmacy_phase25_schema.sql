-- V9__pharmacy_phase25_schema.sql

-- 1. Backorders
CREATE TABLE pharmacy_backorders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    order_id UUID REFERENCES medication_orders(id),
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    priority VARCHAR(50) DEFAULT 'ROUTINE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Pharmacy Returns
CREATE TABLE pharmacy_returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    dispensing_record_id UUID REFERENCES dispensing_records(id),
    order_id UUID REFERENCES medication_orders(id),
    batch_id UUID NOT NULL REFERENCES batches(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_INSPECTION',
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    inspected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Pharmacy Audit Logs
CREATE TABLE pharmacy_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    actor_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    before_state JSONB,
    after_state JSONB,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Reversals tracking in dispensing records
ALTER TABLE dispensing_records ADD COLUMN reversed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE dispensing_records ADD COLUMN reversed_by UUID REFERENCES users(id);
ALTER TABLE dispensing_records ADD COLUMN reversal_reason TEXT;

-- 5. Add second verifier for controlled medication on medication_orders
ALTER TABLE medication_orders ADD COLUMN second_verifier_id UUID REFERENCES users(id);
ALTER TABLE medication_orders ADD COLUMN second_verified_at TIMESTAMP WITH TIME ZONE;

-- Indexes
CREATE INDEX idx_pharmacy_backorders_org_status ON pharmacy_backorders(organization_id, status);
CREATE INDEX idx_pharmacy_returns_org_status ON pharmacy_returns(organization_id, status);
CREATE INDEX idx_pharmacy_audit_entity ON pharmacy_audit_logs(entity_type, entity_id);
