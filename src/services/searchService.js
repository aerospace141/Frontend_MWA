// src/services/searchService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class SearchService {
  constructor() {
    this.cache = new Map();
    this.preloadedMedicines = [];
    this.isPreloaded = false;
  }

  // Preload top medicines for instant search
  async preloadTopMedicines() {
    try {
      if (this.isPreloaded) return this.preloadedMedicines;
      
      const response = await axios.get(`${API_BASE_URL}/tablets/popular`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      this.preloadedMedicines = response.data;
      this.isPreloaded = true;
      
      // Cache in browser storage for offline capability
      localStorage.setItem('pharma_popular_medicines', JSON.stringify(this.preloadedMedicines));
      
      return this.preloadedMedicines;
    } catch (error) {
      console.error('Failed to preload medicines:', error);
      
      // Fallback to cached data
      const cached = localStorage.getItem('pharma_popular_medicines');
      if (cached) {
        this.preloadedMedicines = JSON.parse(cached);
        this.isPreloaded = true;
      }
      
      return this.preloadedMedicines;
    }
  }

  // Search medicines with caching
  async searchMedicines(query, options = {}) {
    if (!query || query.length < 2) return [];

    const cacheKey = `search_${query}_${JSON.stringify(options)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // For very fast searches, use preloaded data first
      if (this.isPreloaded && query.length === 2) {
        const localResults = this.searchInPreloaded(query);
        if (localResults.length > 0) {
          return localResults;
        }
      }

      const response = await axios.get(`${API_BASE_URL}/tablets/search`, {
        params: {
          q: query,
          fuzzy: options.fuzzy || true,
          limit: options.limit || 10,
          ...options
        }
      });

      const results = response.data;
      
      // Cache results for 5 minutes
      this.cache.set(cacheKey, results);
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
      
      return results;
    } catch (error) {
      console.error('Search failed:', error);
      
      // Fallback to preloaded search
      if (this.isPreloaded) {
        return this.searchInPreloaded(query);
      }
      
      return [];
    }
  }

  // Search in preloaded medicines (offline capability)
  searchInPreloaded(query) {
    if (!this.preloadedMedicines.length) return [];
    
    const queryLower = query.toLowerCase();
    return this.preloadedMedicines
      .filter(medicine => 
        medicine.name.toLowerCase().includes(queryLower) ||
        medicine.brand?.toLowerCase().includes(queryLower) ||
        medicine.company?.toLowerCase().includes(queryLower)
      )
      .slice(0, 10);
  }

  // Get medicine by ID
  async getMedicine(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/tablets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch medicine:', error);
      throw error;
    }
  }

  // Get suggestions for autocomplete
  async getSuggestions(query) {
    if (!query || query.length < 2) return [];

    try {
      const response = await axios.get(`${API_BASE_URL}/tablets/suggestions`, {
        params: { q: query, limit: 5 }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export default new SearchService();