import client from '../api/client';

export const db = {
  medicines: [],
  locations: [],
  batches: [],
  movements: [],
  suppliers: [],
  users: [],
  notifications: [],
  carriers: [],
  drivers: [],
  vehicles: [],
  shipments: [],
  qualityIncidents: [],
  maintenanceLogs: []
};

export const saveDb = () => {
  console.warn("saveDb called, but data is now managed by the backend API.");
};

export const delay = (ms) => new Promise(res => setTimeout(res, ms));

export async function initializeDbFromApi() {
  try {
    const res = await client.get('/dashboard/summary');
    const data = res.data;
    
    // Merge API data into our in-memory cache
    if (data.medicines) db.medicines = data.medicines;
    if (data.locations) db.locations = data.locations;
    if (data.batches) db.batches = data.batches;
    if (data.movements) db.movements = data.movements;
    if (data.suppliers) db.suppliers = data.suppliers;
    if (data.users) db.users = data.users;
    if (data.notifications) db.notifications = data.notifications;
    if (data.carriers) db.carriers = data.carriers;
    if (data.drivers) db.drivers = data.drivers;
    if (data.vehicles) db.vehicles = data.vehicles;
    if (data.shipments) db.shipments = data.shipments;
    if (data.qualityIncidents) db.qualityIncidents = data.qualityIncidents;
    if (data.maintenanceLogs) db.maintenanceLogs = data.maintenanceLogs;

    console.log("In-memory cache initialized from API");
  } catch (err) {
    console.error("Failed to initialize from API, using empty cache", err);
  }
}
