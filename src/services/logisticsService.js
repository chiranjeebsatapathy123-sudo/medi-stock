import client from '../api/client';

export const logisticsService = {
  async getOverview() {
    try {
      const response = await client.get('/logistics/overview');
      return response.data;
    } catch (e) {
      console.error(e);
      return { shipments: [], vehicles: [], drivers: [], exceptions: [], chainOfCustody: [] };
    }
  },
  async createShipment(shipment) {
    try {
      const response = await client.post('/logistics/shipments', shipment);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  async updateShipmentStatus(id, status) {
    try {
      const response = await client.put(`/logistics/shipments/${id}/status`, { status });
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
};
