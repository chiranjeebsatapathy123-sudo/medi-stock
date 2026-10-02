CREATE TABLE medication_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    order_number VARCHAR(100) NOT NULL,
    patient_reference VARCHAR(255),
    prescriber_reference VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'RECEIVED',
    priority VARCHAR(50) DEFAULT 'ROUTINE',
    notes TEXT,
    created_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (organization_id, order_number)
);

CREATE TABLE medication_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES medication_orders(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
    approved_quantity INTEGER DEFAULT 0,
    dispensed_quantity INTEGER DEFAULT 0,
    instructions TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE dispensing_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    order_id UUID NOT NULL REFERENCES medication_orders(id),
    dispensing_number VARCHAR(100) NOT NULL,
    dispensed_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (organization_id, dispensing_number)
);

CREATE TABLE dispensing_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispensing_record_id UUID NOT NULL REFERENCES dispensing_records(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES medication_order_items(id),
    batch_id UUID NOT NULL REFERENCES batches(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE pharmacy_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    reference_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'UNRESOLVED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id)
);

-- Indexing for performance
CREATE INDEX idx_medication_orders_org_status ON medication_orders(organization_id, status);
CREATE INDEX idx_dispensing_records_org ON dispensing_records(organization_id);
CREATE INDEX idx_pharmacy_alerts_org_status ON pharmacy_alerts(organization_id, status);
