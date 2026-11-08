import client from '../api/client';
import { CLINICAL_DEMO_ORDERS } from '../data/clinicalDemoData';

export const pharmacyService = {
  async getOrders() {
    try {
      const response = await client.get('/pharmacy/orders');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return CLINICAL_DEMO_ORDERS;
    } catch (e) {
      console.warn("Using enterprise clinical demo fallback pharmacy orders:", e.message);
      return CLINICAL_DEMO_ORDERS;
    }
  },

  async getOrder(id) {
    try {
      const response = await client.get(`/pharmacy/orders/${id}`);
      return response.data;
    } catch (e) {
      const fallback = CLINICAL_DEMO_ORDERS.find(o => o.id === id);
      if (fallback) return fallback;
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
