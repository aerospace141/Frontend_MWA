import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, Check, X, Clock, 
  AlertCircle, Send, FileText, User, Calendar,
  TrendingUp, Download, Phone, Mail, MessageSquare,
  Truck, CheckCircle, Eye, RefreshCw, ChevronDown,
  MessageCircle, Printer, Share2
} from 'lucide-react';
import { ownerService } from '../../services/ownerService';
import '../../Styling/pages/Owner/StockRequestManagementPremium.css';

const StockRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    urgency: '',
    search: ''
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    critical: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    totalPages: 1
  });

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await ownerService.getStockRequests({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status,
        urgency: filters.urgency,
        search: filters.search
      });

      setRequests(data.requests);
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages
      }));
    } catch (error) {
      console.error('Failed to fetch stock requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await ownerService.getStockRequestStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await ownerService.approveStockRequest(requestId);
      fetchRequests();
      fetchStats();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleReject = async (requestId, reason) => {
    try {
      await ownerService.rejectStockRequest(requestId, reason);
      fetchRequests();
      fetchStats();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const handleSendToVendor = async (requestId, vendorData) => {
    try {
      await ownerService.sendToVendor(requestId, vendorData);
      fetchRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to send to vendor:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { className: 'stock-premium-badge-pending', icon: Clock },
      'Under Review': { className: 'stock-premium-badge-review', icon: FileText },
      'Approved': { className: 'stock-premium-badge-approved', icon: Check },
      'Rejected': { className: 'stock-premium-badge-rejected', icon: X },
      'Ordered': { className: 'stock-premium-badge-ordered', icon: Send },
      'Received': { className: 'stock-premium-badge-received', icon: Package }
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;

    return (
      <span className={`stock-premium-badge ${config.className}`}>
        <Icon className="stock-premium-badge-icon" />
        <span>{status}</span>
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      'Critical': 'stock-premium-urgency-critical',
      'High': 'stock-premium-urgency-high',
      'Medium': 'stock-premium-urgency-medium',
      'Low': 'stock-premium-urgency-low'
    };

    const className = urgencyConfig[urgency] || urgencyConfig['Medium'];

    return (
      <span className={`stock-premium-urgency ${className}`}>
        {urgency}
      </span>
    );
  };

  return (
    <div className="stock-premium-container">
      {/* Header */}
      <div className="stock-premium-header">
        <div className="stock-premium-header-content">
          <div className="stock-premium-header-top">
            <div className="stock-premium-header-info">
              <h1 className="stock-premium-title">Stock Request Management</h1>
              <p className="stock-premium-subtitle">
                Review and manage stock requests from workers
              </p>
            </div>
            <div className="stock-premium-header-actions">
              <button
                onClick={fetchRequests}
                className="stock-premium-btn stock-premium-btn-secondary"
              >
                <RefreshCw className="stock-premium-btn-icon" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => {/* Export report */}}
                className="stock-premium-btn stock-premium-btn-primary"
              >
                <Download className="stock-premium-btn-icon" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stock-premium-stats">
            <div className="stock-premium-stat-card stock-premium-stat-pending">
              <div className="stock-premium-stat-content">
                <div className="stock-premium-stat-info">
                  <p className="stock-premium-stat-label">Pending</p>
                  <p className="stock-premium-stat-value">{stats.pending}</p>
                </div>
                <Clock className="stock-premium-stat-icon" />
              </div>
            </div>
            <div className="stock-premium-stat-card stock-premium-stat-approved">
              <div className="stock-premium-stat-content">
                <div className="stock-premium-stat-info">
                  <p className="stock-premium-stat-label">Approved</p>
                  <p className="stock-premium-stat-value">{stats.approved}</p>
                </div>
                <Check className="stock-premium-stat-icon" />
              </div>
            </div>
            <div className="stock-premium-stat-card stock-premium-stat-rejected">
              <div className="stock-premium-stat-content">
                <div className="stock-premium-stat-info">
                  <p className="stock-premium-stat-label">Rejected</p>
                  <p className="stock-premium-stat-value">{stats.rejected}</p>
                </div>
                <X className="stock-premium-stat-icon" />
              </div>
            </div>
            <div className="stock-premium-stat-card stock-premium-stat-critical">
              <div className="stock-premium-stat-content">
                <div className="stock-premium-stat-info">
                  <p className="stock-premium-stat-label">Critical</p>
                  <p className="stock-premium-stat-value">{stats.critical}</p>
                </div>
                <AlertCircle className="stock-premium-stat-icon" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="stock-premium-filters">
            <div className="stock-premium-search-wrapper">
              <Search className="stock-premium-search-icon" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="stock-premium-search-input"
                placeholder="Search requests..."
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="stock-premium-select"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Ordered">Ordered</option>
              <option value="Received">Received</option>
            </select>

            <select
              value={filters.urgency}
              onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
              className="stock-premium-select"
            >
              <option value="">All Urgency</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="stock-premium-main">
        {loading ? (
          <div className="stock-premium-loading">
            <div className="stock-premium-spinner"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="stock-premium-empty">
            <Package className="stock-premium-empty-icon" />
            <h3 className="stock-premium-empty-title">No stock requests found</h3>
            <p className="stock-premium-empty-text">All requests have been processed</p>
          </div>
        ) : (
          <>
            <div className="stock-premium-requests">
              {requests.map((request) => (
                <RequestCard
                  key={request._id}
                  request={request}
                  onView={() => setSelectedRequest(request)}
                  onApprove={() => handleApprove(request._id)}
                  onReject={() => setSelectedRequest(request)}
                  getStatusBadge={getStatusBadge}
                  getUrgencyBadge={getUrgencyBadge}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="stock-premium-pagination">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="stock-premium-pagination-btn"
                >
                  Previous
                </button>
                <span className="stock-premium-pagination-info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="stock-premium-pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onSendToVendor={handleSendToVendor}
        />
      )}
    </div>
  );
};

// Request Card Component
const RequestCard = ({ request, onView, onApprove, onReject, getStatusBadge, getUrgencyBadge }) => {
  return (
    <div className="stock-premium-card">
      <div className="stock-premium-card-header">
        <h3 className="stock-premium-card-number">
          {request.requestNumber}
        </h3>
        <div className="stock-premium-card-badges">
          {getUrgencyBadge(request.urgencyLevel)}
          {getStatusBadge(request.status)}
        </div>
      </div>

      <div className="stock-premium-card-grid">
        <div className="stock-premium-card-section">
          <p className="stock-premium-card-label">Medicine</p>
          <p className="stock-premium-card-value">{request.tablet?.name || 'N/A'}</p>
          <p className="stock-premium-card-meta">
            {request.tablet?.brand} • {request.tablet?.company}
          </p>
        </div>

        <div className="stock-premium-card-section">
          <p className="stock-premium-card-label">Requested By</p>
          <div className="stock-premium-card-user">
            <User className="stock-premium-card-user-icon" />
            <span className="stock-premium-card-value">
              {request.requestedBy?.name || 'Unknown'}
            </span>
          </div>
          <p className="stock-premium-card-meta">{request.requestedBy?.employeeId}</p>
        </div>

        <div className="stock-premium-card-section">
          <p className="stock-premium-card-label">Stock Info</p>
          <p className="stock-premium-card-stock">
            <span className="stock-premium-card-stock-current">Current: {request.currentStock}</span>
            <span className="stock-premium-card-stock-arrow">→</span>
            <span className="stock-premium-card-stock-requested">Requested: {request.requestedQuantity}</span>
          </p>
        </div>

        <div className="stock-premium-card-section">
          <p className="stock-premium-card-label">Date</p>
          <div className="stock-premium-card-date">
            <Calendar className="stock-premium-card-date-icon" />
            <span className="stock-premium-card-value">
              {new Date(request.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="stock-premium-card-reason">
        <p className="stock-premium-card-label">Reason</p>
        <p className="stock-premium-card-reason-text">
          {request.reason}
        </p>
      </div>

      {request.estimatedCost && (
        <div className="stock-premium-card-cost">
          <span className="stock-premium-card-cost-label">Estimated Cost:</span>
          <span className="stock-premium-card-cost-value">₹{request.estimatedCost.toLocaleString()}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="stock-premium-card-actions">
        <button
          onClick={onView}
          className="stock-premium-card-btn stock-premium-card-btn-view"
        >
          <Eye className="stock-premium-card-btn-icon" />
          <span>View Details</span>
        </button>
        
        {request.status === 'Pending' && (
          <>
            <button
              onClick={onApprove}
              className="stock-premium-card-btn stock-premium-card-btn-approve"
            >
              <Check className="stock-premium-card-btn-icon" />
              <span>Approve</span>
            </button>
            <button
              onClick={onReject}
              className="stock-premium-card-btn stock-premium-card-btn-reject"
            >
              <X className="stock-premium-card-btn-icon" />
              <span>Reject</span>
            </button>
          </>
        )}

        {request.status === 'Approved' && (
          <button
            onClick={onView}
            className="stock-premium-card-btn stock-premium-card-btn-vendor"
          >
            <Send className="stock-premium-card-btn-icon" />
            <span>Send to Vendor</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Enhanced Request Detail Modal Component
const RequestDetailModal = ({ request, onClose, onApprove, onReject, onSendToVendor }) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [vendorData, setVendorData] = useState({
    vendorId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    notes: '',
    communicationMethod: 'whatsapp',
    sendQuotation: true,
    priority: 'normal'
  });

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(request._id, rejectReason);
    }
  };

  const handleSendToVendor = () => {
    if (vendorData.vendorId && vendorData.expectedDeliveryDate) {
      onSendToVendor(request._id, vendorData);
    }
  };

  const generateWhatsAppMessage = () => {
    return `Hello! 
    
Stock Request Details:
Request No: ${request.requestNumber}
Medicine: ${request.tablet?.name}
Brand: ${request.tablet?.brand}
Quantity: ${request.requestedQuantity} units
Estimated Cost: ₹${request.estimatedCost}

Please confirm availability and quote.

Thank you!`;
  };

  const sendViaWhatsApp = () => {
    const message = encodeURIComponent(generateWhatsAppMessage());
    const phone = '1234567890';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const sendViaEmail = () => {
    const subject = encodeURIComponent(`Stock Request - ${request.requestNumber}`);
    const body = encodeURIComponent(generateWhatsAppMessage());
    window.location.href = `mailto:vendor@example.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="stock-premium-modal-overlay">
      <div className="stock-premium-modal">
        <div className="stock-premium-modal-header">
          <h2 className="stock-premium-modal-title">Request Details</h2>
          <button onClick={onClose} className="stock-premium-modal-close">
            <X className="stock-premium-modal-close-icon" />
          </button>
        </div>

        <div className="stock-premium-modal-content">
          {/* Request Info */}
          <div className="stock-premium-modal-grid">
            <div className="stock-premium-modal-field">
              <label className="stock-premium-modal-label">Request Number</label>
              <p className="stock-premium-modal-value">{request.requestNumber}</p>
            </div>
            <div className="stock-premium-modal-field">
              <label className="stock-premium-modal-label">Status</label>
              <p className="stock-premium-modal-value">{request.status}</p>
            </div>
            <div className="stock-premium-modal-field">
              <label className="stock-premium-modal-label">Urgency</label>
              <p className="stock-premium-modal-value stock-premium-modal-value-urgency">{request.urgencyLevel}</p>
            </div>
            <div className="stock-premium-modal-field">
              <label className="stock-premium-modal-label">Current Stock</label>
              <p className="stock-premium-modal-value stock-premium-modal-value-danger">{request.currentStock}</p>
            </div>
            <div className="stock-premium-modal-field">
              <label className="stock-premium-modal-label">Requested Quantity</label>
              <p className="stock-premium-modal-value stock-premium-modal-value-success">{request.requestedQuantity}</p>
            </div>
            {request.estimatedCost && (
              <div className="stock-premium-modal-field">
                <label className="stock-premium-modal-label">Estimated Cost</label>
                <p className="stock-premium-modal-value stock-premium-modal-value-success">₹{request.estimatedCost.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Medicine Details */}
          <div className="stock-premium-modal-section stock-premium-modal-section-medicine">
            <h3 className="stock-premium-modal-section-title">
              <Package className="stock-premium-modal-section-icon" />
              Medicine Details
            </h3>
            <p className="stock-premium-modal-medicine-name">{request.tablet?.name}</p>
            <p className="stock-premium-modal-medicine-meta">{request.tablet?.brand} • {request.tablet?.company}</p>
          </div>

          {/* Reason */}
          <div className="stock-premium-modal-section">
            <h3 className="stock-premium-modal-section-title">Request Reason</h3>
            <p className="stock-premium-modal-reason">{request.reason}</p>
          </div>

          {/* Worker Info */}
          <div className="stock-premium-modal-section stock-premium-modal-section-worker">
            <h3 className="stock-premium-modal-section-title">
              <User className="stock-premium-modal-section-icon" />
              Requested By
            </h3>
            <p className="stock-premium-modal-worker-name">{request.requestedBy?.name}</p>
            <p className="stock-premium-modal-worker-meta">{request.requestedBy?.employeeId} • {request.requestedBy?.department}</p>
          </div>

          {/* Reject Form */}
          {showRejectForm && (
            <div className="stock-premium-modal-form stock-premium-modal-form-reject">
              <label className="stock-premium-modal-form-label">
                Rejection Reason *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="3"
                className="stock-premium-modal-textarea"
                placeholder="Explain why this request is being rejected..."
              />
            </div>
          )}

          {/* Enhanced Vendor Form */}
          {showVendorForm && (
            <div className="stock-premium-modal-form stock-premium-modal-form-vendor">
              <h3 className="stock-premium-modal-form-title">
                <Send className="stock-premium-modal-form-icon" />
                Send to Vendor
              </h3>
              
              {/* Vendor Selection */}
              <div className="stock-premium-modal-form-group">
                <label className="stock-premium-modal-form-label">Vendor *</label>
                <select
                  value={vendorData.vendorId}
                  onChange={(e) => setVendorData({ ...vendorData, vendorId: e.target.value })}
                  className="stock-premium-modal-select"
                >
                  <option value="">Select Vendor</option>
                  <option value="vendor1">MedSupply Co. - 9876543210</option>
                  <option value="vendor2">PharmaDirect Ltd. - 9123456789</option>
                  <option value="vendor3">HealthCare Supplies - 9988776655</option>
                </select>
              </div>

              {/* Communication Method */}
              <div className="stock-premium-modal-form-group">
                <label className="stock-premium-modal-form-label">
                  Communication Method *
                </label>
                <div className="stock-premium-modal-comm-methods">
                  <button
                    type="button"
                    onClick={() => setVendorData({ ...vendorData, communicationMethod: 'whatsapp' })}
                    className={`stock-premium-modal-comm-btn ${vendorData.communicationMethod === 'whatsapp' ? 'stock-premium-modal-comm-btn-active-whatsapp' : ''}`}
                  >
                    <MessageCircle className="stock-premium-modal-comm-icon" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVendorData({ ...vendorData, communicationMethod: 'email' })}
                    className={`stock-premium-modal-comm-btn ${vendorData.communicationMethod === 'email' ? 'stock-premium-modal-comm-btn-active-email' : ''}`}
                  >
                    <Mail className="stock-premium-modal-comm-icon" />
                    <span>Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVendorData({ ...vendorData, communicationMethod: 'phone' })}
                    className={`stock-premium-modal-comm-btn ${vendorData.communicationMethod === 'phone' ? 'stock-premium-modal-comm-btn-active-phone' : ''}`}
                  >
                    <Phone className="stock-premium-modal-comm-icon" />
                    <span>Phone</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              {vendorData.communicationMethod && (
                <div className="stock-premium-modal-quick-actions">
                  <p className="stock-premium-modal-quick-label">Quick Actions:</p>
                  <div className="stock-premium-modal-quick-buttons">
                    {vendorData.communicationMethod === 'whatsapp' && (
                      <button
                        type="button"
                        onClick={sendViaWhatsApp}
                        className="stock-premium-modal-quick-btn stock-premium-modal-quick-btn-whatsapp"
                      >
                        <MessageCircle className="stock-premium-modal-quick-icon" />
                        <span>Open WhatsApp</span>
                      </button>
                    )}
                    {vendorData.communicationMethod === 'email' && (
                      <button
                        type="button"
                        onClick={sendViaEmail}
                        className="stock-premium-modal-quick-btn stock-premium-modal-quick-btn-email"
                      >
                        <Mail className="stock-premium-modal-quick-icon" />
                        <span>Open Email</span>
                      </button>
                    )}
                    {vendorData.communicationMethod === 'phone' && (
                      <button
                        type="button"
                        onClick={() => window.open('tel:+911234567890')}
                        className="stock-premium-modal-quick-btn stock-premium-modal-quick-btn-phone"
                      >
                        <Phone className="stock-premium-modal-quick-icon" />
                        <span>Call Vendor</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const message = generateWhatsAppMessage();
                        navigator.clipboard.writeText(message);
                        alert('Message copied to clipboard!');
                      }}
                      className="stock-premium-modal-quick-btn stock-premium-modal-quick-btn-copy"
                    >
                      <FileText className="stock-premium-modal-quick-icon" />
                      <span>Copy Message</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Priority Selection */}
              <div className="stock-premium-modal-form-group">
                <label className="stock-premium-modal-form-label">
                  Order Priority
                </label>
                <div className="stock-premium-modal-priority-btns">
                  <button
                    type="button"
                    onClick={() => setVendorData({ ...vendorData, priority: 'urgent' })}
                    className={`stock-premium-modal-priority-btn ${vendorData.priority === 'urgent' ? 'stock-premium-modal-priority-btn-urgent-active' : ''}`}
                  >
                    Urgent
                  </button>
                  <button
                    type="button"
                    onClick={() => setVendorData({ ...vendorData, priority: 'normal' })}
                    className={`stock-premium-modal-priority-btn ${vendorData.priority === 'normal' ? 'stock-premium-modal-priority-btn-normal-active' : ''}`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setVendorData({ ...vendorData, priority: 'low' })}
                    className={`stock-premium-modal-priority-btn ${vendorData.priority === 'low' ? 'stock-premium-modal-priority-btn-low-active' : ''}`}
                  >
                    Low
                  </button>
                </div>
              </div>

              {/* Date Fields */}
              <div className="stock-premium-modal-date-grid">
                <div className="stock-premium-modal-form-group">
                  <label className="stock-premium-modal-form-label">Order Date</label>
                  <input
                    type="date"
                    value={vendorData.orderDate}
                    onChange={(e) => setVendorData({ ...vendorData, orderDate: e.target.value })}
                    className="stock-premium-modal-input"
                  />
                </div>
                <div className="stock-premium-modal-form-group">
                  <label className="stock-premium-modal-form-label">
                    Expected Delivery *
                  </label>
                  <input
                    type="date"
                    value={vendorData.expectedDeliveryDate}
                    onChange={(e) => setVendorData({ ...vendorData, expectedDeliveryDate: e.target.value })}
                    className="stock-premium-modal-input"
                  />
                </div>
              </div>

              {/* Additional Options */}
              <div className="stock-premium-modal-checkbox-group">
                <label className="stock-premium-modal-checkbox">
                  <input
                    type="checkbox"
                    checked={vendorData.sendQuotation}
                    onChange={(e) => setVendorData({ ...vendorData, sendQuotation: e.target.checked })}
                    className="stock-premium-modal-checkbox-input"
                  />
                  <span className="stock-premium-modal-checkbox-label">Request quotation from vendor</span>
                </label>
              </div>

              {/* Notes */}
              <div className="stock-premium-modal-form-group">
                <label className="stock-premium-modal-form-label">
                  Additional Notes
                </label>
                <textarea
                  value={vendorData.notes}
                  onChange={(e) => setVendorData({ ...vendorData, notes: e.target.value })}
                  rows="3"
                  className="stock-premium-modal-textarea"
                  placeholder="Any special instructions for the vendor..."
                />
              </div>

              {/* Message Preview */}
              <div className="stock-premium-modal-preview">
                <p className="stock-premium-modal-preview-label">Message Preview:</p>
                <div className="stock-premium-modal-preview-content">
                  {generateWhatsAppMessage()}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="stock-premium-modal-actions">
            {request.status ==='Pending' && !showRejectForm && !showVendorForm && (
              <>
                <button
                  onClick={() => onApprove(request._id)}
                  className="stock-premium-modal-btn stock-premium-modal-btn-approve"
                >
                  ✓ Approve Request
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="stock-premium-modal-btn stock-premium-modal-btn-reject"
                >
                  ✗ Reject Request
                </button>
              </>
            )}

            {showRejectForm && (
              <>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="stock-premium-modal-btn stock-premium-modal-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="stock-premium-modal-btn stock-premium-modal-btn-reject"
                >
                  Confirm Rejection
                </button>
              </>
            )}

            {request.status === 'Approved' && !showVendorForm && (
              <button
                onClick={() => setShowVendorForm(true)}
                className="stock-premium-modal-btn stock-premium-modal-btn-vendor"
              >
                📤 Send to Vendor
              </button>
            )}

            {showVendorForm && (
              <>
                <button
                  onClick={() => setShowVendorForm(false)}
                  className="stock-premium-modal-btn stock-premium-modal-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendToVendor}
                  disabled={!vendorData.vendorId || !vendorData.expectedDeliveryDate}
                  className="stock-premium-modal-btn stock-premium-modal-btn-vendor"
                >
                  Confirm & Send
                </button>
              </>
            )}

            {!showRejectForm && !showVendorForm && request.status !== 'Pending' && request.status !== 'Approved' && (
              <button
                onClick={onClose}
                className="stock-premium-modal-btn stock-premium-modal-btn-cancel"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockRequestManagement;