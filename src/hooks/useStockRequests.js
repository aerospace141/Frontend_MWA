// src/hooks/useStockRequests.js
import { useState, useCallback, useEffect } from 'react';
import stockRequestService from '../services/stockRequestService';

export const useStockRequests = (userRole = 'worker') => {
  const [requests, setRequests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch requests based on role
  const fetchRequests = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = userRole === 'admin' 
        ? await stockRequestService.getAllRequests(filters)
        : await stockRequestService.getMyRequests();

      setRequests(response.requests || []);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  // Fetch vendors
  const fetchVendors = useCallback(async (filters = {}) => {
    try {
      const response = await stockRequestService.getVendors(filters);
      setVendors(response.vendors || []);
      return response;
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
      throw err;
    }
  }, []);

  // Fetch stats (admin only)
  const fetchStats = useCallback(async () => {
    if (userRole !== 'admin') return;

    try {
      const response = await stockRequestService.getStats();
      setStats(response.stats);
      return response;
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      throw err;
    }
  }, [userRole]);

  // Create single request
  const createRequest = useCallback(async (requestData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await stockRequestService.createRequest(requestData);
      
      // Refresh requests list
      await fetchRequests();
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRequests]);

  // Create bulk requests
  const createBulkRequests = useCallback(async (requestsData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await stockRequestService.createBulkRequests(requestsData);
      
      // Refresh requests list
      await fetchRequests();
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRequests]);

  // Approve request (admin only)
  const approveRequest = useCallback(async (requestId, data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await stockRequestService.approveRequest(requestId, data);
      
      // Update local state
      setRequests(prev => 
        prev.map(req => req._id === requestId ? response.request : req)
      );
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reject request (admin only)
  const rejectRequest = useCallback(async (requestId, adminNotes) => {
    try {
      setLoading(true);
      setError(null);

      const response = await stockRequestService.rejectRequest(requestId, adminNotes);
      
      // Update local state
      setRequests(prev => 
        prev.map(req => req._id === requestId ? response.request : req)
      );
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark as ordered (admin only)
  const markAsOrdered = useCallback(async (requestId, data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await stockRequestService.markAsOrdered(requestId, data);
      
      // Update local state
      setRequests(prev => 
        prev.map(req => req._id === requestId ? response.request : req)
      );
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark as received (admin only)
  const markAsReceived = useCallback(async (requestId, data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await stockRequestService.markAsReceived(requestId, data);
      
      // Update local state
      setRequests(prev => 
        prev.map(req => req._id === requestId ? response.request : req)
      );
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create vendor
  const createVendor = useCallback(async (vendorData) => {
    try {
      const response = await stockRequestService.createVendor(vendorData);
      
      // Refresh vendors list
      await fetchVendors();
      
      return response;
    } catch (err) {
      throw err;
    }
  }, [fetchVendors]);

  // Get filtered requests
  const getFilteredRequests = useCallback((filters = {}) => {
    let filtered = [...requests];

    if (filters.status) {
      filtered = filtered.filter(req => req.status === filters.status);
    }

    if (filters.urgencyLevel) {
      filtered = filtered.filter(req => req.urgencyLevel === filters.urgencyLevel);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(req => 
        req.requestNumber?.toLowerCase().includes(searchLower) ||
        req.tablet?.name?.toLowerCase().includes(searchLower) ||
        req.tablet?.brand?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by priority and date
    const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    filtered.sort((a, b) => {
      // Pending requests first
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      
      // Then by priority
      if (priorityOrder[a.urgencyLevel] !== priorityOrder[b.urgencyLevel]) {
        return priorityOrder[a.urgencyLevel] - priorityOrder[b.urgencyLevel];
      }
      
      // Then by date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return filtered;
  }, [requests]);

  // Load initial data on mount
  useEffect(() => {
    fetchRequests();
    fetchVendors();
    if (userRole === 'admin') {
      fetchStats();
    }
  }, [fetchRequests, fetchVendors, fetchStats, userRole]);

  return {
    requests,
    vendors,
    stats,
    loading,
    error,
    fetchRequests,
    fetchVendors,
    fetchStats,
    createRequest,
    createBulkRequests,
    approveRequest,
    rejectRequest,
    markAsOrdered,
    markAsReceived,
    createVendor,
    getFilteredRequests,
    clearError: () => setError(null)
  };
};