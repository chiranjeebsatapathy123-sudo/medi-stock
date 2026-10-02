// Mock Database for Phase 2 Architecture
// This acts as a simulated backend until real API integration is complete.

const initialDb = {
  medicines: [
    { id: "MED-1042", code: "AMX500", genericName: "Amoxicillin", brandName: "Amoxil", category: "Antibiotic", dosageForm: "Capsule", strength: "500mg", manufacturer: "Cureline Pharma", description: "Broad-spectrum penicillin antibiotic", prescriptionRequired: true, controlled: false, temperatureSensitive: false, storageRequirements: "Store below 25°C", unit: "Capsule", reorderLevel: 300, safetyStock: 200, maxStock: 2000, status: "ACTIVE", createdAt: "2025-01-10T10:00:00Z", updatedAt: "2025-01-10T10:00:00Z" },
    { id: "MED-1043", code: "PCM500", genericName: "Paracetamol", brandName: "Panadol", category: "Analgesic", dosageForm: "Tablet", strength: "500mg", manufacturer: "MedCore Labs", description: "Pain reliever and fever reducer", prescriptionRequired: false, controlled: false, temperatureSensitive: false, storageRequirements: "Store below 30°C", unit: "Tablet", reorderLevel: 500, safetyStock: 300, maxStock: 5000, status: "ACTIVE", createdAt: "2025-01-12T10:00:00Z", updatedAt: "2025-01-12T10:00:00Z" },
    { id: "MED-1044", code: "AZI250", genericName: "Azithromycin", brandName: "Zithromax", category: "Antibiotic", dosageForm: "Tablet", strength: "250mg", manufacturer: "NovaMed", description: "Macrolide antibiotic", prescriptionRequired: true, controlled: false, temperatureSensitive: false, storageRequirements: "Store below 25°C", unit: "Tablet", reorderLevel: 250, safetyStock: 150, maxStock: 1000, status: "ACTIVE", createdAt: "2025-02-15T10:00:00Z", updatedAt: "2025-02-15T10:00:00Z" },
    { id: "MED-1045", code: "INS100", genericName: "Insulin Glargine", brandName: "Lantus", category: "Diabetes", dosageForm: "Injection", strength: "100IU/ml", manufacturer: "BioNova", description: "Long-acting insulin", prescriptionRequired: true, controlled: false, temperatureSensitive: true, storageRequirements: "Store in refrigerator 2-8°C", unit: "Vial", reorderLevel: 100, safetyStock: 50, maxStock: 500, status: "ACTIVE", createdAt: "2025-03-20T10:00:00Z", updatedAt: "2025-03-20T10:00:00Z" },
    { id: "MED-1046", code: "ATR20", genericName: "Atorvastatin", brandName: "Lipitor", category: "Cardiology", dosageForm: "Tablet", strength: "20mg", manufacturer: "MedCore Labs", description: "Statin to lower cholesterol", prescriptionRequired: true, controlled: false, temperatureSensitive: false, storageRequirements: "Store below 30°C", unit: "Tablet", reorderLevel: 200, safetyStock: 100, maxStock: 1500, status: "ACTIVE", createdAt: "2025-04-05T10:00:00Z", updatedAt: "2025-04-05T10:00:00Z" },
    { id: "MED-1047", code: "OMP20", genericName: "Omeprazole", brandName: "Prilosec", category: "Gastro", dosageForm: "Capsule", strength: "20mg", manufacturer: "Cureline Pharma", description: "Proton pump inhibitor", prescriptionRequired: false, controlled: false, temperatureSensitive: false, storageRequirements: "Store below 25°C", unit: "Capsule", reorderLevel: 180, safetyStock: 90, maxStock: 1000, status: "ACTIVE", createdAt: "2025-05-11T10:00:00Z", updatedAt: "2025-05-11T10:00:00Z" },
    { id: "MED-1048", code: "CEF1G", genericName: "Ceftriaxone", brandName: "Rocephin", category: "Antibiotic", dosageForm: "Injection", strength: "1g", manufacturer: "NovaMed", description: "Cephalosporin antibiotic", prescriptionRequired: true, controlled: false, temperatureSensitive: true, storageRequirements: "Store below 25°C, protect from light", unit: "Vial", reorderLevel: 80, safetyStock: 40, maxStock: 400, status: "ACTIVE", createdAt: "2025-06-21T10:00:00Z", updatedAt: "2025-06-21T10:00:00Z" },
    { id: "MED-1049", code: "MET500", genericName: "Metformin", brandName: "Glucophage", category: "Diabetes", dosageForm: "Tablet", strength: "500mg", manufacturer: "BioNova", description: "Biguanide for type 2 diabetes", prescriptionRequired: true, controlled: false, temperatureSensitive: false, storageRequirements: "Store below 30°C", unit: "Tablet", reorderLevel: 400, safetyStock: 200, maxStock: 2500, status: "ACTIVE", createdAt: "2025-07-30T10:00:00Z", updatedAt: "2025-07-30T10:00:00Z" }
  ],
  
  locations: [
    { id: "LOC-CENTRAL", name: "Central Store", type: "Main", isColdStorage: false },
    { id: "LOC-PHARMA", name: "Main Pharmacy", type: "Dispensary", isColdStorage: false },
    { id: "LOC-ICU", name: "ICU Pharmacy", type: "Ward", isColdStorage: false },
    { id: "LOC-ER", name: "Emergency Room", type: "Ward", isColdStorage: false },
    { id: "LOC-COLD", name: "Cold Storage Unit", type: "Main", isColdStorage: true },
  ],

  batches: [
    { id: "BAT-001", batchNumber: "AMX-24F8", medicineId: "MED-1042", manufacturer: "Cureline Pharma", mfgDate: "2024-04-18", expiryDate: "2027-04-18", receivedQty: 1000, currentQty: 820, purchasePrice: 3.5, sellingPrice: 4.8, supplier: "SUP-001", locationId: "LOC-CENTRAL", status: "ACTIVE", quarantine: false, recall: false },
    { id: "BAT-002", batchNumber: "PCM-25A1", medicineId: "MED-1043", manufacturer: "MedCore Labs", mfgDate: "2025-01-22", expiryDate: "2027-01-22", receivedQty: 2000, currentQty: 1460, purchasePrice: 1.0, sellingPrice: 1.9, supplier: "SUP-002", locationId: "LOC-PHARMA", status: "ACTIVE", quarantine: false, recall: false },
    { id: "BAT-003", batchNumber: "AZI-24K3", medicineId: "MED-1044", manufacturer: "NovaMed", mfgDate: "2024-11-14", expiryDate: "2026-11-14", receivedQty: 500, currentQty: 182, purchasePrice: 6.0, sellingPrice: 8.2, supplier: "SUP-003", locationId: "LOC-CENTRAL", status: "ACTIVE", quarantine: false, recall: false },
    { id: "BAT-004", batchNumber: "INS-26B4", medicineId: "MED-1045", manufacturer: "BioNova", mfgDate: "2025-10-26", expiryDate: "2026-10-26", receivedQty: 200, currentQty: 74, purchasePrice: 22.0, sellingPrice: 29.5, supplier: "SUP-004", locationId: "LOC-COLD", status: "ACTIVE", quarantine: false, recall: false },
    { id: "BAT-005", batchNumber: "ATR-25C7", medicineId: "MED-1046", manufacturer: "MedCore Labs", mfgDate: "2025-08-02", expiryDate: "2027-08-02", receivedQty: 800, currentQty: 512, purchasePrice: 2.1, sellingPrice: 3.4, supplier: "SUP-002", locationId: "LOC-CENTRAL", status: "ACTIVE", quarantine: false, recall: false },
    { id: "BAT-006", batchNumber: "OMP-25D2", medicineId: "MED-1047", manufacturer: "Cureline Pharma", mfgDate: "2025-12-08", expiryDate: "2026-12-08", receivedQty: 400, currentQty: 96, purchasePrice: 1.8, sellingPrice: 2.7, supplier: "SUP-001", locationId: "LOC-PHARMA", status: "ACTIVE", quarantine: false, recall: false },
    { id: "BAT-007", batchNumber: "CEF-26A5", medicineId: "MED-1048", manufacturer: "NovaMed", mfgDate: "2025-10-19", expiryDate: "2026-10-19", receivedQty: 150, currentQty: 48, purchasePrice: 9.5, sellingPrice: 12.4, supplier: "SUP-003", locationId: "LOC-COLD", status: "ACTIVE", quarantine: false, recall: false },
    { id: "BAT-008", batchNumber: "MET-25H6", medicineId: "MED-1049", manufacturer: "BioNova", mfgDate: "2025-06-11", expiryDate: "2027-06-11", receivedQty: 1200, currentQty: 930, purchasePrice: 1.1, sellingPrice: 1.6, supplier: "SUP-004", locationId: "LOC-CENTRAL", status: "ACTIVE", quarantine: false, recall: false },
    { id: "BAT-009", batchNumber: "CEF-26A9", medicineId: "MED-1048", manufacturer: "NovaMed", mfgDate: "2025-11-01", expiryDate: "2026-12-01", receivedQty: 100, currentQty: 100, purchasePrice: 9.5, sellingPrice: 12.4, supplier: "SUP-003", locationId: "LOC-COLD", status: "ACTIVE", quarantine: false, recall: false },
  ],

  movements: [
    { id: "MOV-1001", medicineId: "MED-1043", batchId: "BAT-002", quantity: 240, type: "PURCHASE_RECEIVED", prevQty: 1220, newQty: 1460, user: "USR-002", timestamp: new Date(Date.now() - 480000).toISOString(), sourceId: "SUP-002", destId: "LOC-PHARMA", reason: "Standard replenishment", reference: "PO-2026-184" },
    { id: "MOV-1002", medicineId: "MED-1048", batchId: "BAT-007", quantity: -2, type: "DISPENSED", prevQty: 50, newQty: 48, user: "USR-003", timestamp: new Date(Date.now() - 3600000).toISOString(), sourceId: "LOC-COLD", destId: "PATIENT", reason: "Prescription fulfillment", reference: "RX-9921" },
  ],

  suppliers: [
    { id: "SUP-001", name: "Cureline Pharma", contact: "orders@cureline.com", leadTimeDays: 2, totalOrders: 145, fulfilledOrders: 140, delayedOrders: 5, returnedOrders: 2, totalValue: 450000, qualityScore: 98, status: "ACTIVE" },
    { id: "SUP-002", name: "MedCore Labs", contact: "supply@medcore.com", leadTimeDays: 4, totalOrders: 88, fulfilledOrders: 82, delayedOrders: 6, returnedOrders: 1, totalValue: 210000, qualityScore: 92, status: "ACTIVE" },
    { id: "SUP-003", name: "NovaMed", contact: "sales@novamed.com", leadTimeDays: 7, totalOrders: 42, fulfilledOrders: 35, delayedOrders: 7, returnedOrders: 0, totalValue: 120000, qualityScore: 85, status: "WARNING" },
    { id: "SUP-004", name: "BioNova", contact: "coldchain@bionova.com", leadTimeDays: 1, totalOrders: 60, fulfilledOrders: 59, delayedOrders: 1, returnedOrders: 0, totalValue: 340000, qualityScore: 99, status: "ACTIVE" },
  ],

  users: [
    { id: "USR-001", name: "Admin (You)", email: "admin@medistock.com", role: "SUPER_ADMIN", status: "ACTIVE", lastLogin: new Date().toISOString() },
    { id: "USR-002", name: "Dr. Sarah Chen", email: "schen@medistock.com", role: "PHARMACIST", status: "ACTIVE", lastLogin: new Date(Date.now() - 7200000).toISOString() },
    { id: "USR-003", name: "Michael Vance", email: "mvance@medistock.com", role: "INVENTORY_MANAGER", status: "OFFLINE", lastLogin: new Date(Date.now() - 86400000).toISOString() },
    { id: "USR-004", name: "Elena Rodriguez", email: "erodriguez@medistock.com", role: "VIEWER", status: "ACTIVE", lastLogin: new Date(Date.now() - 14400000).toISOString() },
  ],
  
  notifications: [
    { id: "NOT-001", type: "INFO", message: "Purchase order PO-2026-184 has been received.", timestamp: new Date(Date.now() - 480000).toISOString(), read: false, link: "/purchases" },
    { id: "NOT-002", type: "WARNING", message: "Azithromycin is below safety stock.", timestamp: new Date(Date.now() - 2040000).toISOString(), read: false, link: "/inventory" },
    { id: "NOT-003", type: "CRITICAL", message: "Ceftriaxone 1g batch CEF-26A5 expires in 17 days.", timestamp: new Date(Date.now() - 7200000).toISOString(), read: true, link: "/batches" },
  ],

  // --- PHASE 12: LOGISTICS DOMAIN ---
  carriers: [
    { id: "CAR-001", name: "MediTrans Network", serviceType: "Specialized Medical", coverage: "National", avgTransitTime: "1-2 Days", reliability: 98, temperatureCapability: true, status: "ACTIVE", onTimeDelivery: 97, excursions: 1 },
    { id: "CAR-002", name: "FastFreight Logistics", serviceType: "Standard Freight", coverage: "Regional", avgTransitTime: "3-4 Days", reliability: 89, temperatureCapability: false, status: "ACTIVE", onTimeDelivery: 88, excursions: 0 },
    { id: "CAR-003", name: "ColdChain Express", serviceType: "Refrigerated Transport", coverage: "National", avgTransitTime: "1 Day", reliability: 99, temperatureCapability: true, status: "ACTIVE", onTimeDelivery: 99, excursions: 0 },
  ],

  drivers: [
    { id: "DRV-001", name: "Ahmed Patel", phone: "+1 555-0100", status: "ACTIVE", vehicleId: "VEH-001", assignedBranch: "LOC-CENTRAL", certification: "Cold Chain Level 2" },
    { id: "DRV-002", name: "Sarah Connor", phone: "+1 555-0101", status: "OFF_DUTY", vehicleId: "VEH-002", assignedBranch: "LOC-CENTRAL", certification: "Standard Courier" },
  ],

  vehicles: [
    { id: "VEH-001", type: "Refrigerated Van", capacityVolume: 12.5, capacityWeight: 1000, temperatureCapability: true, registration: "M-CC-192", status: "ACTIVE", currentAssignment: "ROUTE-99A" },
    { id: "VEH-002", type: "Cargo Sprinter", capacityVolume: 15.0, capacityWeight: 1500, temperatureCapability: false, registration: "M-STD-404", status: "MAINTENANCE", currentAssignment: null },
  ],

  shipments: [
    { 
      id: "SHIP-2026-000001", 
      origin: "LOC-CENTRAL", 
      destination: "LOC-PHARMA", 
      requestedBy: "USR-002", 
      createdAt: new Date(Date.now() - 86400000).toISOString(), 
      expectedDelivery: new Date(Date.now() - 3600000).toISOString(), 
      priority: "NORMAL", 
      carrierId: "CAR-001", 
      driverId: "DRV-001", 
      vehicleId: "VEH-001", 
      temperatureRequirement: "15-25°C", 
      status: "DELIVERED",
      items: [
        { medicineId: "MED-1043", batchId: "BAT-002", quantity: 240, unit: "Tablet", weight: 2.4, volume: 0.1 }
      ],
      trackingData: { currentLoc: "Main Pharmacy Receiving", eta: null, lastUpdated: new Date(Date.now() - 3600000).toISOString() },
      cost: 45.50
    },
    { 
      id: "SHIP-2026-000002", 
      origin: "LOC-COLD", 
      destination: "LOC-ER", 
      requestedBy: "USR-002", 
      createdAt: new Date(Date.now() - 14400000).toISOString(), 
      expectedDelivery: new Date(Date.now() + 7200000).toISOString(), 
      priority: "CRITICAL", 
      carrierId: "CAR-003", 
      driverId: "DRV-001", 
      vehicleId: "VEH-001", 
      temperatureRequirement: "2-8°C", 
      status: "IN_TRANSIT",
      items: [
        { medicineId: "MED-1048", batchId: "BAT-007", quantity: 50, unit: "Vial", weight: 0.5, volume: 0.05 }
      ],
      trackingData: { currentLoc: "Transit Route 9, 4 miles from destination", eta: new Date(Date.now() + 1800000).toISOString(), lastUpdated: new Date().toISOString() },
      temperatureLog: [
        { time: new Date(Date.now() - 7200000).toISOString(), temp: 4.2 },
        { time: new Date(Date.now() - 3600000).toISOString(), temp: 4.5 },
        { time: new Date().toISOString(), temp: 4.1 },
      ],
      cost: 120.00
    },
    { 
      id: "SHIP-2026-000003", 
      origin: "LOC-CENTRAL", 
      destination: "LOC-ICU", 
      requestedBy: "USR-003", 
      createdAt: new Date(Date.now() - 3600000).toISOString(), 
      expectedDelivery: new Date(Date.now() + 86400000).toISOString(), 
      priority: "HIGH", 
      carrierId: null, 
      driverId: null, 
      vehicleId: null, 
      temperatureRequirement: "N/A", 
      status: "PICKED",
      items: [
        { medicineId: "MED-1044", batchId: "BAT-003", quantity: 100, unit: "Tablet", weight: 1.0, volume: 0.05 }
      ],
      trackingData: null,
      cost: null
    }
  ],

  packages: [
    { id: "PKG-2026-991A", shipmentId: "SHIP-2026-000002", weight: 1.2, dimensions: "30x20x15", type: "Cold Pack", status: "IN_TRANSIT", currentTemp: 4.1 }
  ],

  exceptions: [
    { id: "EXC-192", shipmentId: "SHIP-2026-000002", type: "DELAY", description: "Traffic accident on Route 9, rerouting.", severity: "MEDIUM", status: "OPEN", timestamp: new Date(Date.now() - 1800000).toISOString() }
  ],

  proofOfDelivery: [
    { id: "POD-991", shipmentId: "SHIP-2026-000001", recipientName: "Jane Smith", signatureUrl: "/mock-sig.png", timestamp: new Date(Date.now() - 3600000).toISOString(), condition: "Intact", notes: "Received at front desk." }
  ],

  chainOfCustody: [
    { id: "COC-001", shipmentId: "SHIP-2026-000002", event: "Created", actor: "USR-002", timestamp: new Date(Date.now() - 14400000).toISOString(), location: "LOC-COLD" },
    { id: "COC-002", shipmentId: "SHIP-2026-000002", event: "Picked", actor: "Warehouse System", timestamp: new Date(Date.now() - 10800000).toISOString(), location: "LOC-COLD" },
    { id: "COC-003", shipmentId: "SHIP-2026-000002", event: "Packed", actor: "Scanner Station 2", timestamp: new Date(Date.now() - 9000000).toISOString(), location: "LOC-COLD" },
    { id: "COC-004", shipmentId: "SHIP-2026-000002", event: "Dispatched", actor: "DRV-001", timestamp: new Date(Date.now() - 7200000).toISOString(), location: "Loading Dock A" }
  ],

  // --- PHASE 13: SMART WAREHOUSE DOMAIN ---
  warehouseLocations: [
    { id: "BIN-C-01-A-1", name: "Central Rack 1, Shelf A, Bin 1", type: "BIN", parent: "RACK-C-01", zone: "ZONE-A-DRY", capacity: 5000, current: 3200, tempRange: "15-25°C", status: "ACTIVE" },
    { id: "BIN-C-01-A-2", name: "Central Rack 1, Shelf A, Bin 2", type: "BIN", parent: "RACK-C-01", zone: "ZONE-A-DRY", capacity: 5000, current: 4800, tempRange: "15-25°C", status: "FULL" },
    { id: "BIN-COLD-1-A", name: "Cold Room 1, Rack A", type: "BIN", parent: "ZONE-COLD-1", zone: "ZONE-COLD-1", capacity: 1000, current: 850, tempRange: "2-8°C", status: "ACTIVE" },
    { id: "BIN-QUAR-1", name: "Quarantine Cage", type: "QUARANTINE", parent: "ZONE-SECURE", zone: "ZONE-SECURE", capacity: 2000, current: 150, tempRange: "15-25°C", status: "ACTIVE" }
  ],

  edgeDevices: [
    { id: "EDGE-GW-01", type: "IOT_GATEWAY", location: "Central Store", status: "ONLINE", lastSeen: new Date().toISOString(), firmware: "v2.1.4", cpu: 45, memory: 62 },
    { id: "CAM-01-DOCK", type: "CAMERA_GATEWAY", location: "Loading Dock A", status: "ONLINE", lastSeen: new Date().toISOString(), firmware: "v1.8.0", cpu: 78, memory: 80, modelVersion: "CV-Pkg-Detect-v2" },
    { id: "SENS-COLD-1", type: "TEMPERATURE_SENSOR", location: "Cold Room 1", status: "ONLINE", lastSeen: new Date().toISOString(), battery: 85, reading: 4.2 }
  ],

  visionEvents: [
    { id: "VIS-1042", cameraId: "CAM-01-DOCK", type: "PACKAGE_COUNT", detection: "Detected 24 units", expected: "25 units", confidence: 0.82, status: "NEEDS_REVIEW", timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: "VIS-1043", cameraId: "CAM-02-PICK", type: "WRONG_ITEM", detection: "Detected MED-1044", expected: "MED-1043", confidence: 0.95, status: "CONFIRMED", timestamp: new Date(Date.now() - 7200000).toISOString() }
  ],

  facilityIncidents: [
    { id: "INC-2026-001", type: "ENVIRONMENTAL", sensorId: "SENS-COLD-1", location: "Cold Room 1", condition: "Temperature Spiked to 9.1°C", start: new Date(Date.now() - 14400000).toISOString(), end: null, status: "OPEN", severity: "HIGH" }
  ],

  maintenanceTasks: [
    { id: "MNT-001", assetId: "HVAC-MAIN-1", type: "Preventative", description: "Quarterly filter replacement and coil cleaning", dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), status: "QUEUED", technician: "TECH-01" },
    { id: "MNT-002", assetId: "SENS-COLD-1", type: "Calibration", description: "Annual NIST calibration", dueDate: new Date(Date.now() - 86400000).toISOString(), status: "OVERDUE", technician: "External" }
  ],

  warehouseTasks: [
    { id: "TSK-PUT-102", type: "PUT_AWAY", priority: "HIGH", assignedTo: "USR-003", location: "BIN-C-01-A-1", item: "Paracetamol 500mg", qty: 240, status: "QUEUED", due: new Date(Date.now() + 3600000).toISOString() },
    { id: "TSK-PICK-99", type: "PICK", priority: "CRITICAL", assignedTo: "USR-002", location: "BIN-COLD-1-A", item: "Ceftriaxone 1g", qty: 50, status: "STARTED", due: new Date(Date.now() + 1800000).toISOString() }
  ]
};

export const db = (typeof window !== 'undefined' && localStorage.getItem('medistock_db')) 
  ? JSON.parse(localStorage.getItem('medistock_db')) 
  : initialDb;

export const saveDb = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('medistock_db', JSON.stringify(db));
  }
};

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
