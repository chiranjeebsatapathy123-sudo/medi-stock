-- V16: FDA 21 CFR Part 11 Regulatory Compliance, Audit Trail & GS1/DSCSA Fields

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES users(id),
    user_name VARCHAR(255),
    user_role VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    previous_state_json TEXT,
    new_state_json TEXT,
    reason_for_change TEXT NOT NULL,
    previous_hash VARCHAR(128),
    signature_hash VARCHAR(128) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_time ON audit_logs(organization_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Add GS1 and recall metadata to batches
ALTER TABLE batches
ADD COLUMN IF NOT EXISTS gtin VARCHAR(50),
ADD COLUMN IF NOT EXISTS serial_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS quarantine_reason VARCHAR(255),
ADD COLUMN IF NOT EXISTS recall_reason VARCHAR(255),
ADD COLUMN IF NOT EXISTS recall_class VARCHAR(50);

-- Add DEA schedule and GTIN to medicines
ALTER TABLE medicines
ADD COLUMN IF NOT EXISTS gtin VARCHAR(50),
ADD COLUMN IF NOT EXISTS dea_schedule VARCHAR(20) DEFAULT 'NON_CONTROLLED';

