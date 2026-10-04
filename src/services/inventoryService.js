import client from '../api/client';

export const inventoryService = {
  async getMedicines() {
    try {
      const response = await client.get('/medicines');
      return response.data;
    } catch (e) {
      console.error(e);
      return [];
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
      return response.data;
    } catch (e) {
      console.error(e);
      return [];
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
      return response.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  }
};

