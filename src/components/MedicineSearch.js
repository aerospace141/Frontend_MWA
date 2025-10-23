import React, { useState, useRef, useEffect, useContext } from 'react';
import { useSearch } from '../hooks/useSearch';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import { ShoppingCart, X, Receipt } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import '../Styling/components/MedicineSearchPremium.css';

const MedicineSearch = () => {
  const {
    query,
    setQuery,
    results,
    isLoading,
    error,
    suggestions,
    startVoiceSearch,
    clearResults
  } = useSearch();

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);

  // Use global CartContext!
  const { cart, addToCart, removeFromCart, updateQuantity, getTotalAmount } = useContext(CartContext);

  // Show results when query changes and results are available
  useEffect(() => {
    if (results.length > 0 && query.length >= 2) {
      setShowResults(true);
      setSelectedIndex(-1);
    } else {
      setShowResults(false);
    }
  }, [results, query]);

  // Add medicine to cart (uses context)
  const handleAddToCart = (medicine) => {
    addToCart(medicine);
    setQuery('');
  };

  // Handle result click
  const handleResultClick = (index) => {
    setSelectedIndex(index);
  };

  // Cart total and item count from context
  const cartTotal = getTotalAmount();
  const cartItemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  // Cart clear
  const handleClearCart = () => {
    cart.items.forEach(item => removeFromCart(item._id));
  };

  // Handle quantity change
  const handleQuantityChange = (itemId, newQty) => {
    updateQuantity(itemId, newQty);
  };

  const searchContainerRef = useRef(null);

  return (
    <div className="medicine-premium-wrapper">
      {/* Search Section */}
      <div ref={searchContainerRef} className="medicine-premium-search-container">
        <SearchBar
          query={query}
          setQuery={setQuery}
          isLoading={isLoading}
          onVoiceSearch={startVoiceSearch}
          onKeyDown={(e) => {
            if (!showResults || results.length === 0) return;
            switch (e.key) {
              case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                  prev < results.length - 1 ? prev + 1 : 0
                );
                break;
              case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev =>
                  prev > 0 ? prev - 1 : results.length - 1
                );
                break;
              default:
                break;
            }
          }}
          onFocus={() => {}}
          placeholder="Search medicines by name, brand, company, or category..."
        />

        {/* Error display */}
        {error && (
          <div className="medicine-premium-error-alert">
            <p>Search error: {error}</p>
          </div>
        )}

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="medicine-premium-results-dropdown">
            <SearchResults
              results={results}
              searchTerm={query}
              onAddToCart={handleAddToCart}
              selectedIndex={selectedIndex}
              onResultClick={handleResultClick}
              isVisible={showResults}
            />
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div className="medicine-premium-cart-container">
        <div className="medicine-premium-cart-header">
          <h2 className="medicine-premium-cart-title">
            <ShoppingCart className="medicine-premium-cart-icon" />
            Shopping Cart
            {cartItemCount > 0 && (
              <span className="medicine-premium-cart-badge">
                {cartItemCount}
              </span>
            )}
          </h2>
          
          {cart.items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="medicine-premium-clear-btn"
            >
              <X className="medicine-premium-clear-icon" />
              Clear Cart
            </button>
          )}
        </div>

        {cart.items.length === 0 ? (
          <div className="medicine-premium-empty-state">
            <ShoppingCart className="medicine-premium-empty-icon" />
            <p className="medicine-premium-empty-text">Your cart is empty</p>
            <p className="medicine-premium-empty-subtext">Search and add medicines above</p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="medicine-premium-cart-items">
              {cart.items.map((item) => (
                <div key={item._id} className="medicine-premium-cart-item">
                  <div className="medicine-premium-item-info">
                    <span className="medicine-premium-item-name">{item.tablet?.name}</span>
                    <span className="medicine-premium-item-brand">({item.tablet?.brand})</span>
                  </div>
                  <div className="medicine-premium-quantity-controls">
                    <button
                      className="medicine-premium-qty-btn"
                      onClick={() => handleQuantityChange(item._id, Math.max(item.quantity - 1, 1))}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="medicine-premium-qty-value">{item.quantity}</span>
                    <button
                      className="medicine-premium-qty-btn medicine-premium-qty-btn-add"
                      onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="medicine-premium-item-price">
                    ₹{((item.tablet?.price || item.priceAtTime) * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="medicine-premium-remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="medicine-premium-cart-footer">
              <div className="medicine-premium-cart-summary">
                <div className="medicine-premium-summary-item">
                  <span className="medicine-premium-summary-label">Total Items: </span>
                  <span className="medicine-premium-summary-value">{cartItemCount}</span>
                </div>
                <div className="medicine-premium-cart-total">
                  Total: ₹{cartTotal.toFixed(2)}
                </div>
              </div>
              {/* <div className="medicine-premium-action-buttons">
                <button className="medicine-premium-btn medicine-premium-btn-primary">
                  <Receipt className="medicine-premium-btn-icon" />
                  Generate Bill
                </button>
                <button className="medicine-premium-btn medicine-premium-btn-secondary">
                  Save for Later
                </button>
              </div> */}
            </div>
          </>
        )}
      </div>

      {/* Search suggestions */}
      {suggestions.length > 0 && query.length >= 2 && (
        <div className="medicine-premium-suggestions">
          <div className="medicine-premium-suggestions-title">Suggestions:</div>
          <ul className="medicine-premium-suggestions-list">
            {suggestions.map((s, i) => (
              <li key={i} className="medicine-premium-suggestion-item">{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MedicineSearch;