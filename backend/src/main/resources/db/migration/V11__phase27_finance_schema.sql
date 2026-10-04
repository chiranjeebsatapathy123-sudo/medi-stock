CREATE TABLE valuation_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    total_inventory_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    expiring_risk_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    dead_stock_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    snapshot_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cost_layers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    batch_id UUID NOT NULL REFERENCES batches(id),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE financial_exceptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_val_snapshots_org ON valuation_snapshots(organization_id, snapshot_date);
CREATE INDEX idx_cost_layers_med ON cost_layers(medicine_id);
CREATE INDEX idx_fin_exceptions_org ON financial_exceptions(organization_id);
