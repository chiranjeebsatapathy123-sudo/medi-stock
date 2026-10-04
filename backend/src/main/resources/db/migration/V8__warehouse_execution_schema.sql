-- Phase 24: Intelligent Warehouse Execution Schema

CREATE TABLE warehouses (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location_type VARCHAR(50) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE TABLE warehouse_locations (
    id UUID PRIMARY KEY,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    parent_location_id UUID REFERENCES warehouse_locations(id),
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location_type VARCHAR(50) NOT NULL, -- ZONE, AISLE, RACK, SHELF, BIN, COLD_ROOM
    barcode VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL, -- AVAILABLE, FULL, BLOCKED
    temperature_profile VARCHAR(50),
    storage_requirements JSONB,
    physical_capacity DECIMAL(10,2),
    used_capacity DECIMAL(10,2),
    capacity_uom VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(warehouse_id, code)
);

CREATE TABLE location_barcodes (
    id UUID PRIMARY KEY,
    location_id UUID NOT NULL REFERENCES warehouse_locations(id),
    barcode VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE warehouse_tasks (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    task_type VARCHAR(50) NOT NULL, -- PICK, PUT_AWAY, COUNT, TRANSFER
    status VARCHAR(50) NOT NULL, -- NEW, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
    priority INT DEFAULT 0,
    assigned_to UUID,
    source_location_id UUID REFERENCES warehouse_locations(id),
    destination_location_id UUID REFERENCES warehouse_locations(id),
    medicine_id UUID NOT NULL,
    batch_id UUID,
    requested_quantity DECIMAL(10,2),
    completed_quantity DECIMAL(10,2),
    sla_due_date TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_assignments (
    id UUID PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES warehouse_tasks(id),
    user_id UUID NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cycle_count_plans (
    id UUID PRIMARY KEY,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cycle_count_tasks (
    id UUID PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES cycle_count_plans(id),
    location_id UUID NOT NULL REFERENCES warehouse_locations(id),
    medicine_id UUID,
    batch_id UUID,
    expected_quantity DECIMAL(10,2),
    status VARCHAR(50) NOT NULL,
    counted_by UUID,
    counted_at TIMESTAMP
);

CREATE TABLE count_results (
    id UUID PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES cycle_count_tasks(id),
    observed_quantity DECIMAL(10,2),
    variance DECIMAL(10,2),
    status VARCHAR(50) NOT NULL, -- PENDING_REVIEW, APPROVED, REJECTED
    reviewer_id UUID,
    reviewed_at TIMESTAMP,
    reason TEXT
);

CREATE TABLE device_registry (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    warehouse_id UUID REFERENCES warehouses(id),
    device_type VARCHAR(50) NOT NULL, -- SCANNER, CAMERA, SENSOR, TABLET
    hardware_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    firmware_version VARCHAR(100),
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vision_results (
    id UUID PRIMARY KEY,
    device_id UUID REFERENCES device_registry(id),
    image_reference TEXT,
    detection_type VARCHAR(50) NOT NULL, -- BARCODE, WRONG_ITEM, DAMAGE
    confidence DECIMAL(5,4),
    expected_value TEXT,
    detected_value TEXT,
    requires_review BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vision_reviews (
    id UUID PRIMARY KEY,
    vision_result_id UUID NOT NULL REFERENCES vision_results(id),
    reviewer_id UUID NOT NULL,
    decision VARCHAR(50) NOT NULL, -- CONFIRMED, REJECTED, CORRECTED
    corrected_value TEXT,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE maintenance_assets (
    id UUID PRIMARY KEY,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    asset_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    next_maintenance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY,
    asset_id UUID NOT NULL REFERENCES maintenance_assets(id),
    record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    performed_by UUID
);

CREATE TABLE temperature_incidents (
    id UUID PRIMARY KEY,
    location_id UUID NOT NULL REFERENCES warehouse_locations(id),
    sensor_device_id UUID REFERENCES device_registry(id),
    recorded_temperature DECIMAL(5,2),
    threshold_min DECIMAL(5,2),
    threshold_max DECIMAL(5,2),
    status VARCHAR(50) NOT NULL, -- ACTIVE, REVIEWED, QUARANTINED, RESOLVED
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE warehouse_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    device_id UUID REFERENCES device_registry(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP,
    ended_at TIMESTAMP
);
