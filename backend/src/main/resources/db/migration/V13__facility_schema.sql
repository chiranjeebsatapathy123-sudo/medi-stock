CREATE TABLE facility_edge_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    location_id VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    ip_address VARCHAR(50),
    firmware_version VARCHAR(50),
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE facility_vision_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    device_id UUID REFERENCES facility_edge_devices(id),
    event_type VARCHAR(100) NOT NULL,
    confidence_score DECIMAL(5, 4),
    image_url VARCHAR(500),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolution_notes TEXT
);

CREATE TABLE facility_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    incident_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    location_id VARCHAR(100),
    description TEXT,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'OPEN',
    assigned_to UUID
);

CREATE TABLE facility_maintenance_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    asset_id VARCHAR(100) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    description TEXT,
    scheduled_date DATE,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    completed_at TIMESTAMP WITH TIME ZONE,
    technician_id UUID
);
