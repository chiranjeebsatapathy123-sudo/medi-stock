CREATE TABLE logistics_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    plate_number VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    capacity_kg DECIMAL(10, 2),
    cold_chain_capable BOOLEAN DEFAULT FALSE,
    last_maintenance_date DATE
);

CREATE TABLE logistics_drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID,
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    vehicle_id UUID REFERENCES logistics_vehicles(id)
);

CREATE TABLE logistics_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    shipment_number VARCHAR(100) NOT NULL,
    origin_id VARCHAR(100) NOT NULL,
    destination_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    driver_id UUID REFERENCES logistics_drivers(id),
    vehicle_id UUID REFERENCES logistics_vehicles(id),
    priority VARCHAR(50) DEFAULT 'NORMAL',
    temperature_min DECIMAL(5, 2),
    temperature_max DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estimated_arrival TIMESTAMP WITH TIME ZONE
);

CREATE TABLE logistics_chain_of_custody (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES logistics_shipments(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    recorded_by VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    signature_hash VARCHAR(255),
    notes TEXT
);

CREATE TABLE logistics_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES logistics_shipments(id) ON DELETE CASCADE,
    exception_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    description TEXT,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE
);

CREATE TABLE logistics_proof_of_delivery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES logistics_shipments(id) ON DELETE CASCADE,
    received_by VARCHAR(255) NOT NULL,
    signature_url VARCHAR(500),
    condition_notes TEXT,
    delivery_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
