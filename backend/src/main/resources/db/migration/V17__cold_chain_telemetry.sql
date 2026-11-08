-- V17: Real-Time IoT Cold Chain Telemetry & Sensor Readings

CREATE TABLE IF NOT EXISTS cold_chain_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    device_id VARCHAR(100) NOT NULL,
    device_name VARCHAR(255),
    location_code VARCHAR(100) NOT NULL,
    temperature DECIMAL(5, 2) NOT NULL,
    humidity DECIMAL(5, 2),
    battery_level INTEGER DEFAULT 100,
    status VARCHAR(50) DEFAULT 'NORMAL',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cold_chain_org_time ON cold_chain_readings(organization_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_cold_chain_device ON cold_chain_readings(device_id);

-- Seed initial default sensors for enterprise cold storage
INSERT INTO facility_edge_devices (id, organization_id, device_name, device_type, location_id, status, ip_address, firmware_version, last_heartbeat)
VALUES 
('77777777-7777-7777-7777-777777777771', '11111111-1111-1111-1111-111111111111', 'SenseNode-Alpha', 'TEMPERATURE_SENSOR', 'LOC-COLD', 'ACTIVE', '192.168.1.101', 'v2.4.1', CURRENT_TIMESTAMP),
('77777777-7777-7777-7777-777777777772', '11111111-1111-1111-1111-111111111111', 'SenseNode-Beta', 'TEMPERATURE_SENSOR', 'LOC-COLD', 'ACTIVE', '192.168.1.102', 'v2.4.1', CURRENT_TIMESTAMP),
('77777777-7777-7777-7777-777777777773', '11111111-1111-1111-1111-111111111111', 'MobileCooler-Logger1', 'TRANSIT_LOGGER', 'TRANSIT-01', 'ACTIVE', '192.168.1.103', 'v1.9.0', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Seed recent telemetry baseline
INSERT INTO cold_chain_readings (id, organization_id, device_id, device_name, location_code, temperature, humidity, battery_level, status, timestamp)
VALUES
('88888888-8888-8888-8888-888888888881', '11111111-1111-1111-1111-111111111111', 'SenseNode-Alpha', 'Cold Storage Array Alpha', 'LOC-COLD', 4.20, 42.50, 94, 'NORMAL', CURRENT_TIMESTAMP),
('88888888-8888-8888-8888-888888888882', '11111111-1111-1111-1111-111111111111', 'SenseNode-Beta', 'Cold Storage Array Beta', 'LOC-COLD', 4.80, 44.10, 88, 'NORMAL', CURRENT_TIMESTAMP),
('88888888-8888-8888-8888-888888888883', '11111111-1111-1111-1111-111111111111', 'MobileCooler-Logger1', 'Mobile Transit Cooler 1', 'TRANSIT-01', 3.90, 41.00, 76, 'NORMAL', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

