// src/pages/Worker/StockRequestPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Package, ArrowLeft, Send, Plus, Minus, X, AlertTriangle, Loader } from 'lucide-react';
import { useStockRequests } from '../../hooks/useStockRequests';
import '../../Styling/components/StockRequest/StockRequestPremium.css';

const StockRequestPage = () => {
  const navigate = useNavigate();
  const { createBulkRequests, loading: submitting } = useStockRequests('worker');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const [requestCart, setRequestCart] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    fetchLowStockCount();
  }, []);

  const fetchLowStockCount = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://pharma-smoky.vercel.app/api'}/tablets/popular?limit=200`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const medicines = data.medicines || data || [];
        const lowStock = medicines.filter(med => {
          const minStock = med.minStockLevel || 10;
          return med.stock < minStock && med.isActive !== false;
        });
        setLowStockCount(lowStock.length);
      }
    } catch (error) {
      console.error('Failed to fetch low stock count:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      alert('Please enter at least 2 characters to search');
      return;
    }

    setSearching(true);
    setSearchPerformed(true);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://pharma-smoky.vercel.app/api'}/tablets/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const results = data.results || data || [];
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const addToRequestCart = (medicine) => {
    const existing = requestCart.find(item => item.tabletId === medicine._id);
    
    if (existing) {
      alert('This medicine is already in your request cart');
      return;
    }

    const currentStock = medicine.stock || 0;
    const minStock = medicine.minStockLevel || 10;
    const suggestedQuantity = Math.max(minStock - currentStock, 10);

    const newItem = {
      tabletId: medicine._id,
      medicineName: medicine.name,
      brand: medicine.brand,
      company: medicine.company,
      category: medicine.category,
      currentStock: currentStock,
      minStock: minStock,
      unit: medicine.dosageForm || 'strips',
      quantity: suggestedQuantity,
      urgencyLevel: currentStock === 0 ? 'Critical' : currentStock < 5 ? 'High' : 'Medium',
      reason: currentStock === 0 
        ? 'Out of stock - urgent restocking needed'
        : currentStock < minStock
        ? `Stock below minimum level (${currentStock}/${minStock})`
        : 'Routine restocking needed'
    };

    setRequestCart([...requestCart, newItem]);
  };

  const updateCartItem = (tabletId, field, value) => {
    setRequestCart(requestCart.map(item =>
      item.tabletId === tabletId ? { ...item, [field]: value } : item
    ));
  };

  const removeFromCart = (tabletId) => {
    setRequestCart(requestCart.filter(item => item.tabletId !== tabletId));
  };

  const handleSubmit = async () => {
    if (requestCart.length === 0) {
      alert('Please add at least one medicine to your request cart');
      return;
    }

    const invalidItems = requestCart.filter(item => !item.reason || item.reason.trim().length < 10);
    if (invalidItems.length > 0) {
      alert('Please provide a detailed reason (at least 10 characters) for all items');
      return;
    }

    if (!window.confirm(`Submit ${requestCart.length} stock request(s) to admin?`)) {
      return;
    }

    try {
      await createBulkRequests(requestCart);
      
      setShowSuccess(true);
      setRequestCart([]);
      setSearchQuery('');
      setSearchResults([]);
      setSearchPerformed(false);
      
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/worker/dashboard');
      }, 2000);
    } catch (error) {
      alert('Failed to submit requests: ' + error.message);
    }
  };

  const getPriorityBadge = (priority) => {
    const classes = {
      Critical: 'stockrequest-premium-priority-critical',
      High: 'stockrequest-premium-priority-high',
      Medium: 'stockrequest-premium-priority-medium',
      Low: 'stockrequest-premium-priority-low'
    };
    return (
      <span className={`stockrequest-premium-priority-badge ${classes[priority]}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="stockrequest-premium-page">
      {/* Header */}
      <header className="stockrequest-premium-header">
        <div className="stockrequest-premium-header-content">
          <div className="stockrequest-premium-header-inner">
            <div className="stockrequest-premium-header-left">
              <button
                onClick={() => navigate('/worker/dashboard')}
                className="stockrequest-premium-back-btn"
              >
                <ArrowLeft className="stockrequest-premium-back-icon" />
              </button>
              <div className="stockrequest-premium-title-wrapper">
                <div className="stockrequest-premium-title-row">
                  <Package className="stockrequest-premium-title-icon" />
                  <h1 className="stockrequest-premium-title">Stock Request System</h1>
                </div>
                <p className="stockrequest-premium-subtitle">
                  Search medicines and request stock replenishment
                </p>
              </div>
            </div>

            {requestCart.length > 0 && (
              <div className="stockrequest-premium-cart-badge">
                <ShoppingCart className="stockrequest-premium-cart-icon" />
                <span className="stockrequest-premium-cart-text">
                  {requestCart.length} item{requestCart.length !== 1 ? 's' : ''} in cart
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Success Message */}
      {showSuccess && (
        <div className="stockrequest-premium-success">
          <Package className="stockrequest-premium-success-icon" />
          <div>
            <p className="stockrequest-premium-success-title">Success!</p>
            <p className="stockrequest-premium-success-text">Requests submitted to admin</p>
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="stockrequest-premium-alert">
          <div className="stockrequest-premium-alert-content">
            <AlertTriangle className="stockrequest-premium-alert-icon" />
            <p className="stockrequest-premium-alert-text">
              <strong>{lowStockCount}</strong> item{lowStockCount !== 1 ? 's' : ''} currently below minimum stock level
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="stockrequest-premium-content">
        <div className="stockrequest-premium-grid">
          {/* Left Column - Search & Results */}
          <div>
            {/* Search Section */}
            <div className="stockrequest-premium-search-card">
              <h2 className="stockrequest-premium-search-title">Search Medicines</h2>
              
              <div className="stockrequest-premium-search-row">
                <div className="stockrequest-premium-search-wrapper">
                  <Search className="stockrequest-premium-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by medicine name, brand, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="stockrequest-premium-search-input"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searching || !searchQuery || searchQuery.length < 2}
                  className="stockrequest-premium-search-btn"
                >
                  {searching ? (
                    <>
                      <Loader className="stockrequest-premium-search-btn-icon animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="stockrequest-premium-search-btn-icon" />
                      Search
                    </>
                  )}
                </button>
              </div>

              <p className="stockrequest-premium-search-tip">
                💡 Tip: Enter at least 2 characters and press Enter or click Search
              </p>
            </div>

            {/* Search Results */}
            {searching && (
              <div className="stockrequest-premium-loading">
                <div className="stockrequest-premium-loading-spinner"></div>
              </div>
            )}

            {!searching && searchPerformed && searchResults.length === 0 && (
              <div className="stockrequest-premium-empty">
                <Package className="stockrequest-premium-empty-icon" />
                <p className="stockrequest-premium-empty-title">No medicines found</p>
                <p className="stockrequest-premium-empty-text">Try different search terms</p>
              </div>
            )}

            {!searching && searchResults.length > 0 && (
              <div className="stockrequest-premium-results-card">
                <h3 className="stockrequest-premium-results-title">
                  Search Results ({searchResults.length})
                </h3>
                <div className="stockrequest-premium-results-scroll">
                  {searchResults.map(medicine => {
                    const isInCart = requestCart.some(item => item.tabletId === medicine._id);
                    const currentStock = medicine.stock || 0;
                    const minStock = medicine.minStockLevel || 10;
                    const isLowStock = currentStock < minStock;

                    return (
                      <div
                        key={medicine._id}
                        className={`stockrequest-premium-medicine-card ${
                          isInCart ? 'stockrequest-premium-medicine-card-in-cart' :
                          currentStock === 0 ? 'stockrequest-premium-medicine-card-out-of-stock' :
                          isLowStock ? 'stockrequest-premium-medicine-card-low-stock' : ''
                        }`}
                      >
                        <div className="stockrequest-premium-medicine-row">
                          <div className="stockrequest-premium-medicine-left">
                            <div className="stockrequest-premium-medicine-header">
                              <h4 className="stockrequest-premium-medicine-name">{medicine.name}</h4>
                              {currentStock === 0 && (
                                <span className="stockrequest-premium-out-of-stock-badge">
                                  OUT OF STOCK
                                </span>
                              )}
                              {isInCart && (
                                <span className="stockrequest-premium-in-cart-badge">
                                  ✓ IN CART
                                </span>
                              )}
                            </div>
                            <p className="stockrequest-premium-medicine-brand">
                              {medicine.brand} • {medicine.company}
                            </p>
                            <div className="stockrequest-premium-medicine-stats">
                              <span className={`stockrequest-premium-medicine-stat ${
                                currentStock === 0 ? 'stockrequest-premium-medicine-stat-stock-critical' : 
                                isLowStock ? 'stockrequest-premium-medicine-stat-stock-low' : 
                                'stockrequest-premium-medicine-stat-stock-good'
                              }`}>
                                Stock: {currentStock}
                              </span>
                              <span>Min: {minStock}</span>
                              <span>₹{medicine.price}</span>
                              <span>{medicine.category}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => addToRequestCart(medicine)}
                            disabled={isInCart}
                            className={`stockrequest-premium-add-btn ${
                              isInCart ? 'stockrequest-premium-add-btn-disabled' :
                              currentStock === 0 ? 'stockrequest-premium-add-btn-critical' :
                              'stockrequest-premium-add-btn-normal'
                            }`}
                          >
                            <Plus className="stockrequest-premium-add-icon" />
                            {isInCart ? 'Added' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!searchPerformed && (
              <div className="stockrequest-premium-empty">
                <Search className="stockrequest-premium-empty-icon" />
                <p className="stockrequest-premium-empty-title">
                  Search for medicines to request stock
                </p>
                <p className="stockrequest-premium-empty-text">
                  Enter medicine name, brand, or company in the search box above
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Request Cart */}
          <div>
            <div className="stockrequest-premium-cart-sidebar">
              <h3 className="stockrequest-premium-cart-header">
                <ShoppingCart className="stockrequest-premium-cart-header-icon" />
                Request Cart ({requestCart.length})
              </h3>

              {requestCart.length === 0 ? (
                <div className="stockrequest-premium-cart-empty">
                  <ShoppingCart className="stockrequest-premium-cart-empty-icon" />
                  <p className="stockrequest-premium-cart-empty-text">
                    Your request cart is empty
                  </p>
                  <p className="stockrequest-premium-cart-empty-hint">
                    Search and add medicines
                  </p>
                </div>
              ) : (
                <>
                  <div className="stockrequest-premium-cart-items">
                    {requestCart.map(item => (
                      <div key={item.tabletId} className="stockrequest-premium-cart-item">
                        <div className="stockrequest-premium-cart-item-header">
                          <div className="stockrequest-premium-cart-item-info">
                            <h4 className="stockrequest-premium-cart-item-name">{item.medicineName}</h4>
                            <p className="stockrequest-premium-cart-item-brand">{item.brand}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.tabletId)}
                            className="stockrequest-premium-cart-remove-btn"
                          >
                            <X className="stockrequest-premium-cart-remove-icon" />
                          </button>
                        </div>

                        <div className="stockrequest-premium-cart-item-fields">
                          <div className="stockrequest-premium-cart-field">
                            <label className="stockrequest-premium-cart-label">Quantity</label>
                            <div className="stockrequest-premium-quantity-row">
                              <button
                                onClick={() => updateCartItem(item.tabletId, 'quantity', Math.max(1, item.quantity - 10))}
                                className="stockrequest-premium-quantity-btn"
                              >
                                <Minus className="stockrequest-premium-quantity-icon" />
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateCartItem(item.tabletId, 'quantity', parseInt(e.target.value) || 1)}
                                className="stockrequest-premium-quantity-input"
                                min="1"
                              />
                              <button
                                onClick={() => updateCartItem(item.tabletId, 'quantity', item.quantity + 10)}
                                className="stockrequest-premium-quantity-btn"
                              >
                                <Plus className="stockrequest-premium-quantity-icon" />
                              </button>
                            </div>
                          </div>

                          <div className="stockrequest-premium-cart-field">
                            <label className="stockrequest-premium-cart-label">Priority</label>
                            <select
                              value={item.urgencyLevel}
                              onChange={(e) => updateCartItem(item.tabletId, 'urgencyLevel', e.target.value)}
                              className="stockrequest-premium-cart-select"
                            >
                              <option value="Critical">Critical</option>
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </div>

                          <div className="stockrequest-premium-cart-field">
                            <label className="stockrequest-premium-cart-label">Reason *</label>
                            <textarea
                              value={item.reason}
                              onChange={(e) => updateCartItem(item.tabletId, 'reason', e.target.value)}
                              placeholder="Why is this needed?"
                              className="stockrequest-premium-cart-textarea"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="stockrequest-premium-submit-btn"
                  >
                    {submitting ? (
                      <>
                        <div className="stockrequest-premium-submit-spinner"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="stockrequest-premium-submit-icon" />
                        Submit {requestCart.length} Request{requestCart.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockRequestPage;