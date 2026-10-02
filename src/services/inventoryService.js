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
        recentMovements: []
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
