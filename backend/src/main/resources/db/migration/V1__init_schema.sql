CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    address TEXT,
    contact VARCHAR(100),
    email VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    medicine_code VARCHAR(100) NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    category VARCHAR(100),
    dosage_form VARCHAR(100),
    strength VARCHAR(100),
    manufacturer VARCHAR(255),
    description TEXT,
    unit VARCHAR(50),
    prescription_required BOOLEAN DEFAULT false,
    controlled_medicine BOOLEAN DEFAULT false,
    temperature_sensitive BOOLEAN DEFAULT false,
    storage_requirement VARCHAR(255),
    reorder_level INTEGER DEFAULT 0,
    safety_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, medicine_code)
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    supplier_code VARCHAR(100),
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    lead_time_days INTEGER DEFAULT 0,
    payment_terms VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    rating DECIMAL(3, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE storage_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100),
    type VARCHAR(100),
    temperature_range VARCHAR(100),
    capacity INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    batch_number VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(255),
    manufacturing_date DATE,
    expiry_date DATE NOT NULL,
    received_quantity INTEGER NOT NULL,
    current_quantity INTEGER NOT NULL,
    purchase_price DECIMAL(12, 2),
    selling_price DECIMAL(12, 2),
    supplier_id UUID REFERENCES suppliers(id),
    storage_location_id UUID REFERENCES storage_locations(id),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    quarantine BOOLEAN DEFAULT false,
    recall BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    transaction_id VARCHAR(100) NOT NULL,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    batch_id UUID NOT NULL REFERENCES batches(id),
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    source_location_id UUID REFERENCES storage_locations(id),
    destination_location_id UUID REFERENCES storage_locations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    reason TEXT,
    reference_number VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    po_number VARCHAR(100) NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    order_date DATE NOT NULL,
    expected_delivery DATE,
    status VARCHAR(50) NOT NULL,
    subtotal DECIMAL(12, 2) DEFAULT 0,
    tax DECIMAL(12, 2) DEFAULT 0,
    total DECIMAL(12, 2) DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, po_number)
);

CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL
);

CREATE TABLE audit_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    actor_id UUID REFERENCES users(id),
    actor_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    previous_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(100),
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    linked_entity VARCHAR(100),
    linked_entity_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_medicines_org_code ON medicines(organization_id, medicine_code);
CREATE INDEX idx_batches_medicine ON batches(medicine_id);
CREATE INDEX idx_batches_expiry ON batches(expiry_date);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_inventory_tx_medicine ON inventory_transactions(medicine_id);
CREATE INDEX idx_inventory_tx_batch ON inventory_transactions(batch_id);
CREATE INDEX idx_inventory_tx_org ON inventory_transactions(organization_id);
CREATE INDEX idx_po_org_supplier ON purchase_orders(organization_id, supplier_id);
CREATE INDEX idx_audit_org_entity ON audit_records(organization_id, entity, entity_id);
