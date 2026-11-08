import client from '../api/client';

let fallbackShipments = [
  {
    id: "SHP-2026-101",
    shipmentNumber: "SHP-2026-101",
    originId: "Central Depository Bay 1",
    destinationId: "Emergency ICU Wing",
    status: "READY",
    priority: "STAT",
    temperatureMin: null,
    temperatureMax: null,
    estimatedArrival: new Date(Date.now() + 1800000).toISOString()
  },
  {
    id: "SHP-2026-102",
    shipmentNumber: "SHP-2026-102",
    originId: "Cold Vault Alpha (2-8°C)",
    destinationId: "Oncology Infusion Clinic",
    status: "PICKED",
    priority: "HIGH",
    temperatureMin: 2.0,
    temperatureMax: 8.0,
    estimatedArrival: new Date(Date.now() + 3600000).toISOString()
  },
  {
    id: "SHP-2026-103",
    shipmentNumber: "SHP-2026-103",
    originId: "Distribution Bay 2",
    destinationId: "Metro Pediatric Clinic",
    status: "PACKED",
    priority: "NORMAL",
    temperatureMin: null,
    temperatureMax: null,
    estimatedArrival: new Date(Date.now() + 7200000).toISOString()
  },
  {
    id: "SHP-2026-104",
    shipmentNumber: "SHP-2026-104",
    originId: "Pfizer BioPharma Hub",
    destinationId: "Central Pharmacy Receiving",
    status: "IN_TRANSIT",
    priority: "HIGH",
    temperatureMin: 2.0,
    temperatureMax: 8.0,
    estimatedArrival: new Date(Date.now() + 10800000).toISOString()
  },
  {
    id: "SHP-2026-090",
    shipmentNumber: "SHP-2026-090",
    originId: "Central Depository",
    destinationId: "Surgical Suites 1-4",
    status: "DELIVERED",
    priority: "STAT",
    temperatureMin: null,
    temperatureMax: null,
    estimatedArrival: new Date(Date.now() - 3600000).toISOString()
  }
];

const fallbackVehicles = [
  { id: "VEH-01", plateNumber: "MED-REEFER-01", vehicleType: "Mercedes Sprinter Reefer", status: "AVAILABLE", capacityKg: 1200, coldChainCapable: true },
  { id: "VEH-02", plateNumber: "MED-VAN-02", vehicleType: "Ford Transit High-Roof", status: "IN_TRANSIT", capacityKg: 950, coldChainCapable: false }
];

const fallbackDrivers = [
  { id: "DRV-01", name: "Marcus Brody", licenseNumber: "CDL-A-99210", status: "ON_ROUTE" },
  { id: "DRV-02", name: "Sarah Miller", licenseNumber: "CDL-B-88341", status: "AVAILABLE" }
];

export const logisticsService = {
  async getOverview() {
    try {
      const response = await client.get('/logistics/overview');
      if (response.data && response.data.shipments && response.data.shipments.length > 0) {
        return response.data;
      }
      return {
        shipments: fallbackShipments,
        vehicles: response.data?.vehicles?.length ? response.data.vehicles : fallbackVehicles,
        drivers: response.data?.drivers?.length ? response.data.drivers : fallbackDrivers,
        exceptions: [],
        chainOfCustody: []
      };
    } catch (e) {
      console.warn("Using clinical logistics fallback:", e.message);
      return {
        shipments: fallbackShipments,
        vehicles: fallbackVehicles,
        drivers: fallbackDrivers,
        exceptions: [],
        chainOfCustody: []
      };
    }
  },
  async createShipment(shipment) {
    try {
      const response = await client.post('/logistics/shipments', shipment);
      return response.data;
    } catch (e) {
      const newShip = {
        ...shipment,
        id: `SHP-${Date.now().toString().slice(-4)}`,
        shipmentNumber: shipment.shipmentNumber || `SHP-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString()
      };
      fallbackShipments = [newShip, ...fallbackShipments];
      return newShip;
    }
  },
  async updateShipmentStatus(id, status) {
    try {
      const response = await client.put(`/logistics/shipments/${id}/status`, { status });
      return response.data;
    } catch (e) {
      fallbackShipments = fallbackShipments.map(s => s.id === id ? { ...s, status } : s);
      return { id, status };
    }
  }
};
