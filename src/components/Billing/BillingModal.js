import React, { useState } from 'react';
import { X, CreditCard, DollarSign, User, Phone, Mail, FileText, Download } from 'lucide-react';
import { billService } from '../../services/billService';
import '../../Styling/components/Billing/BillingModalPremium.css';

const BillingModal = ({ cart, onClose, onBillGenerated }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    paymentMethod: 'Cash',
    discount: 0,
    notes: ''
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const subtotal = cart?.totalAmount || 0;
  const tax = subtotal * 0.05;
  const discount = parseFloat(formData.discount) || 0;
  const total = subtotal + tax - discount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cart?.items?.length) {
      setError('Cart is empty');
      return;
    }

    if (total <= 0) {
      setError('Total amount must be greater than 0');
      return;
    }

    try {
      setGenerating(true);
      setError('');

      const billData = {
        items: cart.items.map(item => ({
          _id: item.tablet._id,
          tabletId: item.tablet._id,
          name: item.tablet.name,
          quantity: item.quantity
        })),
        customer: {
          name: formData.customerName.trim(),
          phone: formData.customerPhone.trim(),
          email: formData.customerEmail.trim()
        },
        paymentMethod: formData.paymentMethod,
        discount: discount,
        notes: formData.notes.trim()
      };

      const blob = await billService.generateBill(billData);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bill-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onBillGenerated();
      
    } catch (error) {
      console.error('Bill generation error:', error);
      setError(error.response?.data?.message || 'Failed to generate bill. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="billingmodal-premium-overlay">
      <div className="billingmodal-premium-container">
        {/* Header */}
        <div className="billingmodal-premium-header">
          <h2 className="billingmodal-premium-title">
            <FileText className="billingmodal-premium-title-icon" />
            <span>Generate Bill</span>
          </h2>
          <button
            onClick={onClose}
            className="billingmodal-premium-close-btn"
          >
            <X className="billingmodal-premium-close-icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="billingmodal-premium-form">
          {/* Error Message */}
          {error && (
            <div className="billingmodal-premium-error-alert">
              {error}
            </div>
          )}

          {/* Customer Information */}
          <div className="billingmodal-premium-section">
            <h3 className="billingmodal-premium-section-title">
              <User className="billingmodal-premium-section-icon" />
              <span>Customer Information (Optional)</span>
            </h3>
            
            <div className="billingmodal-premium-grid">
              <div className="billingmodal-premium-input-group">
                <label className="billingmodal-premium-label">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="billingmodal-premium-input"
                  placeholder="Enter customer name"
                />
              </div>
              
              <div className="billingmodal-premium-input-group">
                <label className="billingmodal-premium-label">
                  Phone Number
                </label>
                <div className="billingmodal-premium-input-wrapper">
                  <Phone className="billingmodal-premium-input-icon" />
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="billingmodal-premium-input billingmodal-premium-input-with-icon"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>
            
            <div className="billingmodal-premium-input-group">
              <label className="billingmodal-premium-label">
                Email Address
              </label>
              <div className="billingmodal-premium-input-wrapper">
                <Mail className="billingmodal-premium-input-icon" />
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="billingmodal-premium-input billingmodal-premium-input-with-icon"
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </div>

          {/* Payment & Billing Details */}
          <div className="billingmodal-premium-section">
            <h3 className="billingmodal-premium-section-title">
              <CreditCard className="billingmodal-premium-section-icon" />
              <span>Payment Details</span>
            </h3>
            
            <div className="billingmodal-premium-grid">
              <div className="billingmodal-premium-input-group">
                <label className="billingmodal-premium-label">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="billingmodal-premium-select"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>
              
              <div className="billingmodal-premium-input-group">
                <label className="billingmodal-premium-label">
                  Discount Amount (₹)
                </label>
                <div className="billingmodal-premium-input-wrapper">
                  <DollarSign className="billingmodal-premium-input-icon" />
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max={subtotal}
                    step="0.01"
                    className="billingmodal-premium-input billingmodal-premium-input-with-icon"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="billingmodal-premium-section">
            <label className="billingmodal-premium-label">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="billingmodal-premium-textarea"
              placeholder="Add any additional notes for the bill..."
            />
          </div>

          {/* Order Summary */}
          <div className="billingmodal-premium-summary">
            <h3 className="billingmodal-premium-summary-title">Order Summary</h3>
            
            <div className="billingmodal-premium-summary-content">
              <div className="billingmodal-premium-summary-row">
                <span>Items ({cart?.totalItems})</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="billingmodal-premium-summary-row">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="billingmodal-premium-summary-row billingmodal-premium-summary-discount">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="billingmodal-premium-summary-total">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Items List */}
            <div className="billingmodal-premium-items-list">
              <h4 className="billingmodal-premium-items-title">Items in cart:</h4>
              <div className="billingmodal-premium-items-scroll">
                {cart?.items?.map((item, index) => (
                  <div key={index} className="billingmodal-premium-item-row">
                    <span>{item.tablet.name} ({item.tablet.brand})</span>
                    <span>{item.quantity} × ₹{item.tablet.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="billingmodal-premium-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={generating}
              className="billingmodal-premium-btn billingmodal-premium-btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating || total <= 0}
              className="billingmodal-premium-btn billingmodal-premium-btn-submit"
            >
              {generating ? (
                <>
                  <div className="billingmodal-premium-spinner"></div>
                  <span>Generating Bill...</span>
                </>
              ) : (
                <>
                  <Download className="billingmodal-premium-btn-icon" />
                  <span>Generate & Download Bill</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingModal;