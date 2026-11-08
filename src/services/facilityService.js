import client from '../api/client';

const FALLBACK_FACILITY_DATA = {
  edgeDevices: [
    { id: "SenseNode-Alpha", name: "Refrigeration Array 1", type: "TEMPERATURE_HUMIDITY", status: "ONLINE", battery: 96, temperature: 4.2 },
    { id: "SenseNode-Beta", name: "Vaccine Freezer -20°C", type: "TEMPERATURE", status: "ONLINE", battery: 88, temperature: -19.4 },
    { id: "SenseNode-Vault", name: "DEA Schedule II Vault", type: "BIOMETRIC_LOCK", status: "SECURE", battery: 100 }
  ],
  visionEvents: [
    { id: "VIS-901", camera: "Dock Loading Bay 2", eventType: "PACKAGE_DETECTED", confidence: 0.96, timestamp: new Date(Date.now() - 1800000).toISOString() }
  ],
  facilityIncidents: [
    { id: "INC-2026-08", severity: "HIGH", description: "Sensor SenseNode-Alpha logged excursion > 8.0°C (10.4°C peak)", status: "INVESTIGATING" }
  ],
  maintenanceTasks: [
    { id: "MNT-2026-401", assetId: "SenseNode-Alpha (Cold Unit 1)", taskType: "NIST Calibration", description: "Annual NIST-traceable RTD probe temperature verification", scheduledDate: new Date(Date.now() + 86400000 * 4).toISOString(), status: "SCHEDULED" },
    { id: "MNT-2026-402", assetId: "VAULT-NARCO-01 (C-II Vault)", taskType: "Security Audit", description: "Biometric keypad battery replacement & dual-control lock test", scheduledDate: new Date(Date.now() + 86400000 * 14).toISOString(), status: "COMPLIANT" },
    { id: "MNT-2026-403", assetId: "STERILE-HOOD-B (Compounding)", taskType: "HEPA Filter Service", description: "ISO Class 5 Laminar Flow Workbench particulate certification", scheduledDate: new Date(Date.now() - 86400000).toISOString(), status: "OVERDUE" },
    { id: "MNT-2026-404", assetId: "THERMAL-PRINTER-01 (Dock B)", taskType: "Printhead Inspection", description: "Zebra 300 DPI thermal printhead cleaning & contrast check", scheduledDate: new Date(Date.now() - 86400000 * 7).toISOString(), status: "COMPLETED" }
  ]
};

export const facilityService = {
  async getOverview() {
    try {
      const response = await client.get('/facility/overview');
      if (response.data && (response.data.edgeDevices?.length || response.data.maintenanceTasks?.length)) {
        return response.data;
      }
      return FALLBACK_FACILITY_DATA;
    } catch (e) {
      console.warn("Using clinical facility fallback:", e.message);
      return FALLBACK_FACILITY_DATA;
    }
  },
  async reportIncident(incident) {
    try {
      const response = await client.post('/facility/incidents', incident);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  async resolveVisionEvent(id, resolutionData) {
    try {
      const response = await client.put(`/facility/vision/${id}/resolve`, resolutionData);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
};
