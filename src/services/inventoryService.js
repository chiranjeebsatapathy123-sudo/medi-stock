import client from '../api/client';
import { CLINICAL_DEMO_MEDICINES, CLINICAL_DEMO_BATCHES } from '../data/clinicalDemoData';

const FALLBACK_MOVEMENTS = [
  {
    id: "MOV-2026-901",
    type: "PURCHASE_RECEIVED",
    quantity: 400,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    medicineName: "Ceftriaxone Sodium 1g Injection",
    batchNumber: "CEF-2026-C1",
    sourceId: "Pfizer BioPharma (GRN-2026-4001)",
    destId: "Central Depository Bay A-12",
    userName: "Lead Pharmacist",
    reason: "PO-2026-8001 Delivery Receipt"
  },
  {
    id: "MOV-2026-902",
    type: "PURCHASE_RECEIVED",
    quantity: 1000,
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    medicineName: "Amoxicillin Trihydrate 500mg",
    batchNumber: "AMX-2026-N1",
    sourceId: "Teva Pharmaceuticals (GRN-2026-4002)",
    destId: "Central Depository Bay A-08",
    userName: "Warehouse Operations",
    reason: "PO-2026-8002 Delivery Receipt"
  },
  {
    id: "MOV-2026-903",
    type: "CLINICAL_DISPENSE",
    quantity: -20,
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    medicineName: "Metoprolol Succinate ER 50mg",
    batchNumber: "MET-2027-T1",
    sourceId: "Main Pharmacy Bay B-04",
    destId: "David Miller (MRN-100251)",
    userName: "Dr. Robert Harrison, MD",
    reason: "Prescription RX-2026-9003"
  },
  {
    id: "MOV-2026-904",
    type: "QUARANTINE_TRANSFER",
    quantity: -150,
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    medicineName: "Insulin Glargine 100 U/mL",
    batchNumber: "INS-2026-EXC",
    sourceId: "Cold Room C-01 (Excursion Area)",
    destId: "Quarantine Bio-Secure Vault",
    userName: "IoT Automated Safety Protocol",
    reason: "WHO Excursion > 8.0°C Detected"
  },
  {
    id: "MOV-2026-905",
    type: "PURCHASE_RECEIVED",
    quantity: 100,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    medicineName: "Insulin Glargine 100 U/mL",
    batchNumber: "INS-2026-N1",
    sourceId: "AstraZeneca Biologics (GRN-2026-4003)",
    destId: "Cold Storage Unit 2 (2-8°C)",
    userName: "Cold Chain Supervisor",
    reason: "PO-2026-8003 Partial Receipt"
  }
];

export const inventoryService = {
  async getMedicines() {
    try {
      const response = await client.get('/medicines');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return CLINICAL_DEMO_MEDICINES;
    } catch (e) {
      console.warn("Using enterprise clinical demo fallback medicines:", e.message);
      return CLINICAL_DEMO_MEDICINES;
    }
  },

  async createMedicine(medicine) {
    try {
      const response = await client.post('/medicines', medicine);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async updateMedicine(id, medicine) {
    try {
      const response = await client.put(`/medicines/${id}`, medicine);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async deleteMedicine(id) {
    try {
      const response = await client.delete(`/medicines/${id}`);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async getBatches(medicineId = null) {
    try {
      const url = medicineId ? `/batches?medicineId=${medicineId}` : '/batches';
      const response = await client.get(url);
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return medicineId 
        ? CLINICAL_DEMO_BATCHES.filter(b => b.medicineId === medicineId || b.medicineCode === medicineId)
        : CLINICAL_DEMO_BATCHES;
    } catch (e) {
      console.warn("Using enterprise clinical demo fallback batches:", e.message);
      return medicineId 
        ? CLINICAL_DEMO_BATCHES.filter(b => b.medicineId === medicineId || b.medicineCode === medicineId)
        : CLINICAL_DEMO_BATCHES;
    }
  },

  async createBatch(batch) {
    try {
      const response = await client.post('/batches', batch);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async updateBatch(id, batch) {
    try {
      const response = await client.put(`/batches/${id}`, batch);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async deleteBatch(id) {
    try {
      const response = await client.delete(`/batches/${id}`);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async getLocations() {
    try {
      const response = await client.get('/locations');
      return response.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async getDashboardStats() {
    try {
      const response = await client.get('/dashboard/summary');
      return response.data;
    } catch (e) {
      console.error(e);
      return {
        totalStockUnits: 0,
        inventoryValue: 0,
        lowStockItems: 0,
        criticalItems: 0,
        expiringItems: 0,
        expiredItems: 0,
        recentMovements: [],
        inventoryHealth: 0,
        healthReasons: []
      };
    }
  },

  async receiveStock(payload) {
    try {
      const response = await client.post('/inventory/receive', payload);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async issueStock(payload) {
    try {
      const response = await client.post('/inventory/issue', payload);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async transferStock(payload) {
    try {
      const response = await client.post('/inventory/transfer', payload);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async disposeStock(payload) {
    try {
      const response = await client.post('/inventory/adjust', { ...payload, type: 'DISPOSAL' });
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async getInventoryMovements() {
    try {
      const response = await client.get('/inventory/movements');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return FALLBACK_MOVEMENTS;
    } catch (e) {
      console.warn("Using clinical fallback movements:", e.message);
      return FALLBACK_MOVEMENTS;
    }
  },

  async getAiForecast() {
    const res = await client.get('/dashboard/ai-forecast');
    return res.data;
  }
};

