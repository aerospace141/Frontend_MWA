import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class BillService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/bills`,
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
      (response) => response.data || response,
      (error) => {
        console.error('Bill API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  // Generate bill and download PDF
  async generateBill(billData) {
    const response = await axios.post(
      `${API_BASE_URL}/api/bills/generate`,
      billData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob' // Important for PDF download
      }
    );
    return response.data;
  }

  // Get bill history
  async getBillHistory(params = {}) {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        searchParams.append(key, params[key]);
      }
    });

    const queryString = searchParams.toString();
    const url = queryString ? `/history?${queryString}` : '/history';
    
    return await this.api.get(url);
  }

  // Get single bill details
  async getBillDetails(billId) {
    return await this.api.get(`/${billId}`);
  }

  // Download bill PDF
  async downloadBill(billId) {
    const response = await axios.get(
      `${API_BASE_URL}/api/bills/${billId}/download`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      }
    );
    return response.data;
  }

  // Update bill status (owner only)
  async updateBillStatus(billId, status) {
    return await this.api.patch(`/${billId}/status`, { status });
  }

  // Delete/cancel bill (owner only)
  async cancelBill(billId) {
    return await this.api.delete(`/${billId}`);
  }

  // Get bill analytics (owner only)
  async getBillAnalytics(params = {}) {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        searchParams.append(key, params[key]);
      }
    });

    const queryString = searchParams.toString();
    const url = queryString ? `/analytics/summary?${queryString}` : '/analytics/summary';
    
    return await this.api.get(url);
  }
}

export const billService = new BillService();
