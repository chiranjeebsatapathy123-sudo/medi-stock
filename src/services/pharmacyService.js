import client from '../api/client';

export const pharmacyService = {
  async getOrders() {
    try {
      const response = await client.get('/pharmacy/orders');
      return response.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async getOrder(id) {
    try {
      const response = await client.get(`/pharmacy/orders/${id}`);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async createOrder(order) {
    try {
      const response = await client.post('/pharmacy/orders', order);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async reviewOrder(id, action) {
    try {
      const response = await client.post(`/pharmacy/orders/${id}/review`, { action });
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async dispenseOrder(id, request) {
    try {
      const response = await client.post(`/pharmacy/orders/${id}/dispense`, request);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async secondVerifyOrder(id) {
    try {
      const response = await client.post(`/pharmacy/orders/${id}/second-verify`);
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async reverseDispense(id, reason) {
    try {
      const response = await client.post(`/pharmacy/dispensing/${id}/reverse`, { reason });
      return response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
};
