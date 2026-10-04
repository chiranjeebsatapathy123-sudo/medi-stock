import client from '../api/client';

export const facilityService = {
  async getOverview() {
    try {
      const response = await client.get('/facility/overview');
      return response.data;
    } catch (e) {
      console.error(e);
      return { edgeDevices: [], visionEvents: [], facilityIncidents: [], maintenanceTasks: [] };
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
