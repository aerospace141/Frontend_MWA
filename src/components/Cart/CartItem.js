import React, { useState } from 'react';
import { Plus, Minus, Trash2, Save, AlertTriangle } from 'lucide-react';
import '../../Styling/components/Cart/CartItemPremium.css'; // ✅ ADD THIS

const CartItem = ({ item, onUpdateQuantity, onRemoveItem, onSaveForLater }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(item.quantity);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > 100) return;
    
    setIsUpdating(true);
    setTempQuantity(newQuantity);
    
    try {
      await onUpdateQuantity(item._id, newQuantity);
    } catch (error) {
      setTempQuantity(item.quantity);
    }
    
    setIsUpdating(false);
  };

  const handleDirectQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setTempQuantity(value);
  };

  const handleQuantityBlur = () => {
    if (tempQuantity !== item.quantity) {
      handleQuantityChange(tempQuantity);
    }
  };

  const isOutOfStock = item.tablet?.stock === 0;
  const hasInsufficientStock = item.tablet?.stock < item.quantity;
  const maxAvailable = item.tablet?.stock || 0;

  return (
    <div className={`cart-item-premium-container ${isOutOfStock || hasInsufficientStock ? 'out-of-stock' : ''}`}> {/* ✅ CHANGED */}
      <div className="cart-item-premium-info-section"> {/* ✅ CHANGED */}
        <div className="cart-item-premium-details"> {/* ✅ CHANGED */}
          <div className="cart-item-premium-header"> {/* ✅ CHANGED */}
            <div>
              <h3 className="cart-item-premium-title"> {/* ✅ CHANGED */}
                {item.tablet?.name || 'Unknown Medicine'}
              </h3>
              <p className="cart-item-premium-meta"> {/* ✅ CHANGED */}
                {item.tablet?.brand} • {item.tablet?.company}
              </p>
              <p className="cart-item-premium-strength"> {/* ✅ CHANGED */}
                Strength: {item.tablet?.strength}
              </p>
            </div>
            
            <div className="cart-item-premium-price-box"> {/* ✅ CHANGED */}
              <p className="cart-item-premium-price"> {/* ✅ CHANGED */}
                ₹{item.tablet?.price || item.priceAtTime}
              </p>
              <p className="cart-item-premium-unit-label">per unit</p> {/* ✅ CHANGED */}
            </div>
          </div>

          {(isOutOfStock || hasInsufficientStock) && (
            <div className="cart-item-premium-alert"> {/* ✅ CHANGED */}
              <AlertTriangle className="h-4 w-4" />
              <span>
                {isOutOfStock ? 'Out of Stock' : `Only ${maxAvailable} available`}
              </span>
            </div>
          )}

          <div className="cart-item-premium-controls"> {/* ✅ CHANGED */}
            <div className="cart-item-premium-quantity-section"> {/* ✅ CHANGED */}
              <span className="cart-item-premium-quantity-label">Quantity:</span> {/* ✅ CHANGED */}
              <div className="cart-item-premium-quantity-controls"> {/* ✅ CHANGED */}
                <button
                  onClick={() => handleQuantityChange(tempQuantity - 1)}
                  disabled={tempQuantity <= 1 || isUpdating || isOutOfStock}
                  className="cart-item-premium-qty-btn" // ✅ CHANGED
                >
                  <Minus className="h-4 w-4" />
                </button>
                
                <input
                  type="number"
                  min="1"
                  max={maxAvailable}
                  value={tempQuantity}
                  onChange={handleDirectQuantityChange}
                  onBlur={handleQuantityBlur}
                  disabled={isUpdating || isOutOfStock}
                  className="cart-item-premium-qty-input" // ✅ CHANGED
                />
                
                <button
                  onClick={() => handleQuantityChange(tempQuantity + 1)}
                  disabled={tempQuantity >= maxAvailable || isUpdating || isOutOfStock}
                  className="cart-item-premium-qty-btn" // ✅ CHANGED
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {isUpdating && (
                <div className="cart-item-premium-spinner"></div> // ✅ CHANGED
              )}
            </div>

            <div className="cart-item-premium-total-price"> {/* ✅ CHANGED */}
              <p className="cart-item-premium-total-amount"> {/* ✅ CHANGED */}
                ₹{((item.tablet?.price || item.priceAtTime) * item.quantity).toFixed(2)}
              </p>
              <p className="cart-item-premium-breakdown"> {/* ✅ CHANGED */}
                {item.quantity} × ₹{item.tablet?.price || item.priceAtTime}
              </p>
            </div>
          </div>

          <div className="cart-item-premium-actions"> {/* ✅ CHANGED */}
            <button
              onClick={() => onSaveForLater(item._id)}
              className="cart-item-premium-action-btn save" // ✅ CHANGED
            >
              <Save className="h-4 w-4" />
              <span>Save for later</span>
            </button>
            
            <button
              onClick={() => onRemoveItem(item._id)}
              className="cart-item-premium-action-btn remove" // ✅ CHANGED
            >
              <Trash2 className="h-4 w-4" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;