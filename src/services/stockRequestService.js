// src/services/stockRequestService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});

class StockRequestService {
  // Worker: Get my requests
  async getMyRequests() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/stock-requests/my-requests`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Worker: Create single stock request
  async createRequest(requestData) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/stock-requests/create`,
        requestData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Worker: Create bulk stock requests
  async createBulkRequests(requests) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/stock-requests/create-bulk`,
        { requests },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin: Get all requests (with filters)
  async getAllRequests(filters = {}) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/stock-requests/all`,
        {
          ...getAuthHeaders(),
          params: filters
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin: Approve request
  async approveRequest(requestId, data) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/stock-requests/${requestId}/approve`,
        data,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin: Reject request
  async rejectRequest(requestId, adminNotes) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/stock-requests/${requestId}/reject`,
        { adminNotes },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin: Mark as ordered
  async markAsOrdered(requestId, data) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/stock-requests/${requestId}/mark-ordered`,
        data,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin: Mark as received
  async markAsReceived(requestId, data) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/stock-requests/${requestId}/mark-received`,
        data,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get dashboard stats
  async getStats() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/stock-requests/stats`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get vendors
  async getVendors(filters = {}) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/vendors`,
        {
          ...getAuthHeaders(),
          params: filters
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create vendor
  async createVendor(vendorData) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/vendors/create`,
        vendorData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      return new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      return new Error('No response from server');
    } else {
      return new Error(error.message || 'An error occurred');
    }
  }
}

export default new StockRequestService();