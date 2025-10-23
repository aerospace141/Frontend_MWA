// src/components/Billing/BillHistory.js
import React, { useState, useEffect } from 'react';
import { Calendar, Download, Eye, Search, Filter } from 'lucide-react';
import { billService } from '../../services/billService';
import '../../Styling/components/Billing/BillHistoryPremium.css';

const BillHistory = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    fetchBills();
  }, [filters, pagination.page]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 10,
        ...filters
      };

      const response = await billService.getBillHistory(params);
      setBills(response.bills);
      setPagination({
        page: response.page,
        totalPages: response.totalPages,
        totalCount: response.totalCount
      });
      setError('');
    } catch (error) {
      console.error('Failed to fetch bills:', error);
      setError('Failed to load bill history');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDownloadBill = async (billId) => {
    try {
      const blob = await billService.downloadBill(billId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bill-${billId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download bill:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Completed': 'billhistory-premium-badge-completed',
      'Draft': 'billhistory-premium-badge-draft',
      'Cancelled': 'billhistory-premium-badge-cancelled',
      'Refunded': 'billhistory-premium-badge-refunded'
    };

    return (
      <span className={`billhistory-premium-badge ${statusStyles[status] || 'billhistory-premium-badge-default'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="billhistory-premium-container">
      {/* Filters */}
      <div className="billhistory-premium-filters-card">
        <div className="billhistory-premium-filters-header">
          <Filter className="billhistory-premium-icon" />
          <h3 className="billhistory-premium-filters-title">Filters</h3>
        </div>

        <div className="billhistory-premium-filters-grid">
          <div className="billhistory-premium-input-group">
            <label className="billhistory-premium-label">
              Search Bills
            </label>
            <div className="billhistory-premium-search-wrapper">
              <Search className="billhistory-premium-search-icon" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="billhistory-premium-input billhistory-premium-search-input"
                placeholder="Bill number, customer..."
              />
            </div>
          </div>

          <div className="billhistory-premium-input-group">
            <label className="billhistory-premium-label">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="billhistory-premium-select"
            >
              <option value="">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Draft">Draft</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <div className="billhistory-premium-input-group">
            <label className="billhistory-premium-label">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="billhistory-premium-input"
            />
          </div>

          <div className="billhistory-premium-input-group">
            <label className="billhistory-premium-label">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="billhistory-premium-input"
            />
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="billhistory-premium-content-card">
        {loading ? (
          <div className="billhistory-premium-loading">
            <div className="billhistory-premium-spinner"></div>
          </div>
        ) : error ? (
          <div className="billhistory-premium-error">
            {error}
          </div>
        ) : bills.length === 0 ? (
          <div className="billhistory-premium-empty">
            <Calendar className="billhistory-premium-empty-icon" />
            <p className="billhistory-premium-empty-text">No bills found</p>
          </div>
        ) : (
          <div className="billhistory-premium-table-wrapper">
            <table className="billhistory-premium-table">
              <thead className="billhistory-premium-thead">
                <tr>
                  <th className="billhistory-premium-th">Bill Details</th>
                  <th className="billhistory-premium-th">Customer</th>
                  <th className="billhistory-premium-th">Items</th>
                  <th className="billhistory-premium-th">Amount</th>
                  <th className="billhistory-premium-th">Status</th>
                  <th className="billhistory-premium-th billhistory-premium-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody className="billhistory-premium-tbody">
                {bills.map((bill) => (
                  <tr key={bill._id} className="billhistory-premium-row">
                    <td className="billhistory-premium-td">
                      <div>
                        <p className="billhistory-premium-bill-number">
                          {bill.billNumber}
                        </p>
                        <p className="billhistory-premium-bill-date">
                          {new Date(bill.createdAt).toLocaleDateString()} at{' '}
                          {new Date(bill.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                    <td className="billhistory-premium-td">
                      <div>
                        <p className="billhistory-premium-customer-name">
                          {bill.customer?.name || 'Walk-in Customer'}
                        </p>
                        {bill.customer?.phone && (
                          <p className="billhistory-premium-customer-phone">{bill.customer.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="billhistory-premium-td">
                      <p className="billhistory-premium-items-count">
                        {bill.items?.length || 0} items
                      </p>
                    </td>
                    <td className="billhistory-premium-td">
                      <p className="billhistory-premium-amount">
                        ₹{bill.totalAmount?.toFixed(2) || '0.00'}
                      </p>
                    </td>
                    <td className="billhistory-premium-td">
                      {getStatusBadge(bill.status)}
                    </td>
                    <td className="billhistory-premium-td billhistory-premium-td-actions">
                      <button
                        onClick={() => handleDownloadBill(bill._id)}
                        className="billhistory-premium-action-btn"
                        title="Download PDF"
                      >
                        <Download className="billhistory-premium-action-icon" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="billhistory-premium-pagination">
            <div className="billhistory-premium-pagination-mobile">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="billhistory-premium-pagination-btn"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="billhistory-premium-pagination-btn"
              >
                Next
              </button>
            </div>
            <div className="billhistory-premium-pagination-desktop">
              <div>
                <p className="billhistory-premium-pagination-info">
                  Showing{' '}
                  <span className="billhistory-premium-pagination-number">
                    {(pagination.page - 1) * 10 + 1}
                  </span>{' '}
                  to{' '}
                  <span className="billhistory-premium-pagination-number">
                    {Math.min(pagination.page * 10, pagination.totalCount)}
                  </span>{' '}
                  of{' '}
                  <span className="billhistory-premium-pagination-number">{pagination.totalCount}</span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav className="billhistory-premium-pagination-nav">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="billhistory-premium-pagination-btn billhistory-premium-pagination-btn-left"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="billhistory-premium-pagination-btn billhistory-premium-pagination-btn-right"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillHistory;