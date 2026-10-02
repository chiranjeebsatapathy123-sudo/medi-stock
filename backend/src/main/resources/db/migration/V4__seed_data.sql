-- Insert Organization
INSERT INTO organizations (id, name, code, status) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Medistock Enterprise', 'MEDISTOCK_ORG', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Insert Default User
INSERT INTO users (id, organization_id, name, email, password_hash, role, status)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Admin (You)', 'admin@medistock.com', 'admin123', 'SUPER_ADMIN', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Insert Storage Locations
INSERT INTO storage_locations (id, organization_id, name, code, type, is_cold_storage)
VALUES 
('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Central Store', 'LOC-CENTRAL', 'Main', false),
('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'Main Pharmacy', 'LOC-PHARMA', 'Dispensary', false),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Cold Storage Unit', 'LOC-COLD', 'Main', true);

-- Insert Suppliers
INSERT INTO suppliers (id, organization_id, name, supplier_code, contact_person, status)
VALUES 
('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'Cureline Pharma', 'SUP-001', 'orders@cureline.com', 'ACTIVE'),
('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', 'MedCore Labs', 'SUP-002', 'supply@medcore.com', 'ACTIVE'),
('44444444-4444-4444-4444-444444444443', '11111111-1111-1111-1111-111111111111', 'NovaMed', 'SUP-003', 'sales@novamed.com', 'ACTIVE'),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'BioNova', 'SUP-004', 'coldchain@bionova.com', 'ACTIVE');

-- Insert Medicines
INSERT INTO medicines (id, organization_id, medicine_code, generic_name, brand_name, category, dosage_form, strength, manufacturer, unit, prescription_required, controlled_medicine, temperature_sensitive, reorder_level, safety_stock, maximum_stock)
VALUES 
('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', 'AMX500', 'Amoxicillin', 'Amoxil', 'Antibiotic', 'Capsule', '500mg', 'Cureline Pharma', 'Capsule', true, false, false, 300, 200, 2000),
('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', 'PCM500', 'Paracetamol', 'Panadol', 'Analgesic', 'Tablet', '500mg', 'MedCore Labs', 'Tablet', false, false, false, 500, 300, 5000),
('55555555-5555-5555-5555-555555555553', '11111111-1111-1111-1111-111111111111', 'INS100', 'Insulin Glargine', 'Lantus', 'Diabetes', 'Injection', '100IU/ml', 'BioNova', 'Vial', true, false, true, 100, 50, 500);

-- Insert Batches
INSERT INTO batches (id, medicine_id, batch_number, manufacturer, expiry_date, received_quantity, current_quantity, purchase_price, selling_price, supplier_id, storage_location_id, status)
VALUES
('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', 'AMX-24F8', 'Cureline Pharma', '2027-04-18', 1000, 820, 3.5, 4.8, '44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333331', 'ACTIVE'),
('66666666-6666-6666-6666-666666666662', '55555555-5555-5555-5555-555555555552', 'PCM-25A1', 'MedCore Labs', '2027-01-22', 2000, 1460, 1.0, 1.9, '44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333332', 'ACTIVE'),
('66666666-6666-6666-6666-666666666663', '55555555-5555-5555-5555-555555555553', 'INS-26B4', 'BioNova', '2026-10-26', 200, 74, 22.0, 29.5, '44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'ACTIVE');
