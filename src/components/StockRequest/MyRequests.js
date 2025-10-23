// src/components/StockRequest/MyRequests.js
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Package, Calendar, User, FileText, AlertCircle } from 'lucide-react';
import { useStockRequests } from '../../hooks/useStockRequests';
import '../../Styling/components/StockRequest/MyRequestsPremium.css';

const MyRequests = () => {
  const { requests, loading, error, fetchRequests } = useStockRequests('worker');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      Pending: { color: 'requests-premium-badge-pending', icon: Clock, label: 'Pending' },
      'Under Review': { color: 'requests-premium-badge-review', icon: FileText, label: 'Under Review' },
      Approved: { color: 'requests-premium-badge-approved', icon: CheckCircle, label: 'Approved' },
      Rejected: { color: 'requests-premium-badge-rejected', icon: XCircle, label: 'Rejected' },
      Ordered: { color: 'requests-premium-badge-ordered', icon: Package, label: 'Ordered' },
      Received: { color: 'requests-premium-badge-received', icon: CheckCircle, label: 'Received' },
      Cancelled: { color: 'requests-premium-badge-cancelled', icon: XCircle, label: 'Cancelled' }
    };
    const badge = badges[status] || badges.Pending;
    const Icon = badge.icon;
    return (
      <span className={`requests-premium-status-badge ${badge.color}`}>
        <Icon className="requests-premium-badge-icon" />
        {badge.label}
      </span>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const colors = {
      Critical: 'requests-premium-priority-critical',
      High: 'requests-premium-priority-high',
      Medium: 'requests-premium-priority-medium',
      Low: 'requests-premium-priority-low'
    };
    return (
      <span className={`requests-premium-priority-badge ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'pending') return req.status === 'Pending' || req.status === 'Under Review';
    if (filter === 'approved') return req.status === 'Approved' || req.status === 'Ordered';
    if (filter === 'rejected') return req.status === 'Rejected' || req.status === 'Cancelled';
    return true;
  });

  // Calculate days waiting
  const getDaysWaiting = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading && requests.length === 0) {
    return (
      <div className="requests-premium-loading">
        <div className="requests-premium-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="requests-premium-error-container">
        <AlertCircle className="requests-premium-error-icon" />
        <p className="requests-premium-error-text">{error}</p>
        <button
          onClick={fetchRequests}
          className="requests-premium-retry-btn"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="requests-premium-wrapper">
      {/* Header with Filters */}
      <div className="requests-premium-header-container">
        <h2 className="requests-premium-title">My Stock Requests</h2>
        
        {/* Filter Tabs */}
        <div className="requests-premium-tabs">
          {[
            { id: 'all', label: 'All Requests', count: requests.length },
            { id: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length },
            { id: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'Approved' || r.status === 'Ordered').length },
            { id: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'Rejected' || r.status === 'Cancelled').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`requests-premium-tab ${filter === tab.id ? 'requests-premium-tab-active' : ''}`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`requests-premium-tab-count ${filter === tab.id ? 'requests-premium-tab-count-active' : ''}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="requests-premium-empty">
          <FileText className="requests-premium-empty-icon" />
          <p className="requests-premium-empty-text">No {filter !== 'all' ? filter : ''} requests found</p>
          <p className="requests-premium-empty-subtext">
            {filter === 'all' 
              ? 'Start by requesting stock for low inventory items'
              : 'Try changing the filter to see more requests'}
          </p>
        </div>
      ) : (
        <div className="requests-premium-list">
          {filteredRequests.map(request => {
            const daysWaiting = getDaysWaiting(request.createdAt);
            const isUrgent = request.urgencyLevel === 'Critical' || daysWaiting > 7;

            return (
              <div
                key={request._id}
                className={`requests-premium-card ${isUrgent && request.status === 'Pending' ? 'requests-premium-card-urgent' : ''}`}
              >
                {/* Request Header */}
                <div className="requests-premium-card-header">
                  <div className="requests-premium-card-header-main">
                    <div className="requests-premium-card-title-row">
                      <h3 className="requests-premium-card-title">{request.tablet?.name}</h3>
                      {getPriorityBadge(request.urgencyLevel)}
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="requests-premium-card-meta">
                      <span className="requests-premium-meta-item">
                        {request.tablet?.brand} • {request.tablet?.company}
                      </span>
                      <span className="requests-premium-meta-item requests-premium-meta-date">
                        <Calendar className="requests-premium-meta-icon" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`requests-premium-meta-item requests-premium-meta-waiting ${daysWaiting > 5 ? 'requests-premium-meta-warning' : ''}`}>
                        <Clock className="requests-premium-meta-icon" />
                        {daysWaiting} days ago
                      </span>
                    </div>
                  </div>
                  <span className="requests-premium-request-number">
                    {request.requestNumber}
                  </span>
                </div>

                {/* Request Details */}
                <div className="requests-premium-details-grid">
                  <div className="requests-premium-detail-box">
                    <p className="requests-premium-detail-label">Current Stock</p>
                    <p className="requests-premium-detail-value requests-premium-detail-stock">{request.currentStock}</p>
                  </div>
                  <div className="requests-premium-detail-box">
                    <p className="requests-premium-detail-label">Requested Quantity</p>
                    <p className="requests-premium-detail-value requests-premium-detail-requested">{request.requestedQuantity}</p>
                  </div>
                  <div className="requests-premium-detail-box">
                    <p className="requests-premium-detail-label">Category</p>
                    <p className="requests-premium-detail-value">{request.tablet?.category || 'N/A'}</p>
                  </div>
                </div>

                {/* Your Reason */}
                {request.reason && (
                  <div className="requests-premium-reason-box">
                    <p className="requests-premium-reason-title">Your Request Reason:</p>
                    <p className="requests-premium-reason-text">{request.reason}</p>
                  </div>
                )}

                {/* Status-specific information */}
                {request.status === 'Approved' && (
                  <div className="requests-premium-status-info requests-premium-status-approved">
                    <p className="requests-premium-status-title">✓ Request Approved</p>
                    {request.orderDetails?.vendor && (
                      <p className="requests-premium-status-text">
                        Vendor: {request.orderDetails.vendor.name}
                      </p>
                    )}
                    {request.orderDetails?.expectedDeliveryDate && (
                      <p className="requests-premium-status-text">
                        Expected Delivery: {new Date(request.orderDetails.expectedDeliveryDate).toLocaleDateString()}
                      </p>
                    )}
                    {request.adminNotes && (
                      <p className="requests-premium-status-text">
                        Note: {request.adminNotes}
                      </p>
                    )}
                  </div>
                )}

                {request.status === 'Rejected' && request.adminNotes && (
                  <div className="requests-premium-status-info requests-premium-status-rejected">
                    <p className="requests-premium-status-title">✗ Request Rejected</p>
                    <p className="requests-premium-status-text">Reason: {request.adminNotes}</p>
                  </div>
                )}

                {request.status === 'Ordered' && (
                  <div className="requests-premium-status-info requests-premium-status-ordered">
                    <p className="requests-premium-status-title">📦 Order Placed</p>
                    {request.orderDetails?.expectedDeliveryDate && (
                      <p className="requests-premium-status-text">
                        Expected Delivery: {new Date(request.orderDetails.expectedDeliveryDate).toLocaleDateString()}
                      </p>
                    )}
                    {request.orderDetails?.invoiceNumber && (
                      <p className="requests-premium-status-text">
                        Invoice: {request.orderDetails.invoiceNumber}
                      </p>
                    )}
                  </div>
                )}

                {request.status === 'Received' && (
                  <div className="requests-premium-status-info requests-premium-status-received">
                    <p className="requests-premium-status-title">✓ Stock Received</p>
                    {request.orderDetails?.receivedQuantity && (
                      <p className="requests-premium-status-text">
                        Received Quantity: {request.orderDetails.receivedQuantity}
                      </p>
                    )}
                    {request.orderDetails?.actualDeliveryDate && (
                      <p className="requests-premium-status-text">
                        Delivered: {new Date(request.orderDetails.actualDeliveryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Pending Warning */}
                {request.status === 'Pending' && daysWaiting > 5 && (
                  <div className="requests-premium-warning-box">
                    <AlertCircle className="requests-premium-warning-icon" />
                    <div>
                      <p className="requests-premium-warning-title">
                        Request pending for {daysWaiting} days
                      </p>
                      <p className="requests-premium-warning-text">
                        Contact admin if this is urgent
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRequests;