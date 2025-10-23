// src/services/ownerService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://pharma-smoky.vercel.app';

class OwnerService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/owner`,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle responses and errors
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error('Owner API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  // Dashboard Stats
  async getDashboardStats(period = 'today') {
    return await this.api.get(`/dashboard/stats?period=${period}`);
  }

  // Worker Performance
  async getWorkerPerformance(period = 'today', limit = 10) {
    return await this.api.get(`/workers/performance?period=${period}&limit=${limit}`);
  }

  // Individual Worker Details
  async getWorkerDetails(workerId, period = 'month') {
    return await this.api.get(`/workers/${workerId}/details?period=${period}`);
  }

  // Worker Sales History
  async getWorkerSalesHistory(workerId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.api.get(`/workers/${workerId}/sales?${query}`);
  }

  // Stock Alerts
  async getStockAlerts() {
    return await this.api.get('/inventory/alerts');
  }

  // Critical Alerts
  async getCriticalAlerts() {
    return await this.api.get('/alerts/critical');
  }

  // Sales Trends
  async getSalesTrends(period = 'today') {
    return await this.api.get(`/sales/trends?period=${period}`);
  }

  // Revenue Analytics
  async getRevenueAnalytics(startDate, endDate) {
    return await this.api.get(`/analytics/revenue?start=${startDate}&end=${endDate}`);
  }

  // Top Selling Medicines
  async getTopSellingMedicines(period = 'month', limit = 10) {
    return await this.api.get(`/analytics/top-medicines?period=${period}&limit=${limit}`);
  }

  // Inventory Overview
  async getInventoryOverview() {
    return await this.api.get('/inventory/overview');
  }

  // Demand Pattern Analysis
  async getDemandPatterns(medicineId) {
    return await this.api.get(`/analytics/demand/${medicineId}`);
  }

  // Worker Management
  async getAllWorkers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.api.get(`/workers?${query}`);
  }

  async createWorker(workerData) {
    return await this.api.post('/workers', workerData);
  }

  async updateWorker(workerId, workerData) {
    return await this.api.put(`/workers/${workerId}`, workerData);
  }

  async deleteWorker(workerId) {
    return await this.api.delete(`/workers/${workerId}`);
  }

  async toggleWorkerStatus(workerId) {
    return await this.api.patch(`/workers/${workerId}/toggle-status`);
  }

  // Medicine Management
  async getAllMedicines(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.api.get(`/medicines?${query}`);
  }

  async createMedicine(medicineData) {
    return await this.api.post('/medicines', medicineData);
  }

  async updateMedicine(medicineId, medicineData) {
    return await this.api.put(`/medicines/${medicineId}`, medicineData);
  }

  async deleteMedicine(medicineId) {
    return await this.api.delete(`/medicines/${medicineId}`);
  }

  async updateStock(medicineId, quantity, type = 'add') {
    return await this.api.patch(`/medicines/${medicineId}/stock`, { quantity, type });
  }

  async bulkUpdateStock(updates) {
    return await this.api.post('/medicines/bulk-stock-update', { updates });
  }

  // Reports
  async generateSalesReport(startDate, endDate, format = 'pdf') {
    const response = await axios.get(
      `${API_BASE_URL}/api/owner/reports/sales`,
      {
        params: { startDate, endDate, format },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        responseType: format === 'pdf' ? 'blob' : 'json'
      }
    );
    return response.data;
  }

  async generateInventoryReport(format = 'pdf') {
    const response = await axios.get(
      `${API_BASE_URL}/api/owner/reports/inventory`,
      {
        params: { format },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        responseType: format === 'pdf' ? 'blob' : 'json'
      }
    );
    return response.data;
  }

  async generateWorkerReport(workerId, startDate, endDate, format = 'pdf') {
    const response = await axios.get(
      `${API_BASE_URL}/api/owner/reports/worker/${workerId}`,
      {
        params: { startDate, endDate, format },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        responseType: format === 'pdf' ? 'blob' : 'json'
      }
    );
    return response.data;
  }

  // Notifications
  async getNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.api.get(`/notifications?${query}`);
  }

  async markNotificationRead(notificationId) {
    return await this.api.patch(`/notifications/${notificationId}/read`);
  }

  async markAllNotificationsRead() {
    return await this.api.patch('/notifications/read-all');
  }

  // Settings
  async getSettings() {
    return await this.api.get('/settings');
  }

  async updateSettings(settings) {
    return await this.api.put('/settings', settings);
  }

  // Dashboard Configuration
  async getDashboardConfig() {
    return await this.api.get('/dashboard/config');
  }

  async updateDashboardConfig(config) {
    return await this.api.put('/dashboard/config', config);
  }
  // Add these methods to the OwnerService class in ownerService.js

// Stock Request Management
async getStockRequests(params = {}) {
  const query = new URLSearchParams(params).toString();
  return await this.api.get(`/stock-requests?${query}`);
}

async getStockRequestStats() {
  return await this.api.get('/stock-requests/stats');
}

async approveStockRequest(requestId) {
  return await this.api.patch(`/stock-requests/${requestId}/approve`);
}

async rejectStockRequest(requestId, reason) {
  return await this.api.patch(`/stock-requests/${requestId}/reject`, { reason });
}

async sendToVendor(requestId, vendorData) {
  return await this.api.post(`/stock-requests/${requestId}/send-to-vendor`, vendorData);
}



// // Vendor Management
// async getVendors(params = {}) {
//   const query = new URLSearchParams(params).toString();
//   return await this.api.get(`/vendors?${query}`);
// }

// async getVendorById(vendorId) {
//   return await this.api.get(`/vendors/${vendorId}`);
// }

// async createVendor(vendorData) {
//   return await this.api.post('/vendors', vendorData);
// }

// async updateVendor(vendorId, vendorData) {
//   return await this.api.put(`/vendors/${vendorId}`, vendorData);
// }

// async deleteVendor(vendorId) {
//   return await this.api.delete(`/vendors/${vendorId}`);
// }

// async toggleVendorStatus(vendorId) {
//   return await this.api.patch(`/vendors/${vendorId}/toggle-status`);
// }

// async getVendorStats() {
//   return await this.api.get('/vendors/stats');
// }

// async updateVendorRating(vendorId, rating) {
//   return await this.api.patch(`/vendors/${vendorId}/rating`, { rating });
// }
}

export const ownerService = new OwnerService();