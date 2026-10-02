CREATE TABLE temperature_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    location_id UUID NOT NULL REFERENCES storage_locations(id),
    temperature DECIMAL(5, 2) NOT NULL,
    humidity DECIMAL(5, 2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    alert_triggered BOOLEAN DEFAULT false
);

CREATE TABLE cycle_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    location_id UUID REFERENCES storage_locations(id),
    medicine_id UUID REFERENCES medicines(id),
    expected_quantity INTEGER NOT NULL,
    counted_quantity INTEGER NOT NULL,
    variance INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recalls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    batch_number VARCHAR(100),
    affected_quantity INTEGER,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reorder_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    supplier_id UUID REFERENCES suppliers(id),
    current_stock INTEGER NOT NULL,
    forecast_demand INTEGER NOT NULL,
    safety_stock INTEGER NOT NULL,
    incoming_stock INTEGER DEFAULT 0,
    suggested_quantity INTEGER NOT NULL,
    estimated_cost DECIMAL(12, 2),
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_temp_readings_loc ON temperature_readings(location_id);
CREATE INDEX idx_temp_readings_time ON temperature_readings(timestamp);
CREATE INDEX idx_reorder_org_status ON reorder_recommendations(organization_id, status);
