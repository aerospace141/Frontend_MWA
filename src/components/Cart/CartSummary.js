import React from 'react';
import { ShoppingCart, Package, CreditCard } from 'lucide-react';
import '../../Styling/components/Cart/CartSummaryPremium.css'; // ✅ ADD THIS

const CartSummary = ({ cart, onCheckout, isCheckingOut }) => {
  const subtotal = cart?.totalAmount || 0;
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <div className="cart-summary-premium-container"> {/* ✅ CHANGED */}
      <h3 className="cart-summary-premium-header"> {/* ✅ CHANGED */}
        <ShoppingCart className="h-5 w-5" />
        <span className="cart-summary-premium-title">Order Summary</span> {/* ✅ CHANGED */}
      </h3>

      <div className="cart-summary-premium-stats"> {/* ✅ CHANGED */}
        <div className="cart-summary-premium-stat-row"> {/* ✅ CHANGED */}
          <span className="cart-summary-premium-stat-label"> {/* ✅ CHANGED */}
            <Package className="h-4 w-4" />
            <span>Items</span>
          </span>
          <span className="cart-summary-premium-stat-value">{cart?.totalItems || 0}</span> {/* ✅ CHANGED */}
        </div>
        
        <div className="cart-summary-premium-stat-row"> {/* ✅ CHANGED */}
          <span className="cart-summary-premium-stat-label">Unique medicines</span> {/* ✅ CHANGED */}
          <span className="cart-summary-premium-stat-value">{cart?.items?.length || 0}</span> {/* ✅ CHANGED */}
        </div>
      </div>

      <div className="cart-summary-premium-pricing"> {/* ✅ CHANGED */}
        <div className="cart-summary-premium-price-row"> {/* ✅ CHANGED */}
          <span className="cart-summary-premium-price-label">Subtotal</span> {/* ✅ CHANGED */}
          <span className="cart-summary-premium-price-value">₹{subtotal.toFixed(2)}</span> {/* ✅ CHANGED */}
        </div>
        
        <div className="cart-summary-premium-price-row"> {/* ✅ CHANGED */}
          <span className="cart-summary-premium-price-label">Tax (5%)</span> {/* ✅ CHANGED */}
          <span className="cart-summary-premium-price-value">₹{tax.toFixed(2)}</span> {/* ✅ CHANGED */}
        </div>
      </div>
      
      <div className="cart-summary-premium-total-row"> {/* ✅ CHANGED */}
        <span className="cart-summary-premium-total-label">Total</span> {/* ✅ CHANGED */}
        <span className="cart-summary-premium-total-value">₹{total.toFixed(2)}</span> {/* ✅ CHANGED */}
      </div>

      <button
        onClick={onCheckout}
        disabled={!cart?.items?.length || isCheckingOut}
        className="cart-summary-premium-checkout-btn" // ✅ CHANGED
      >
        {isCheckingOut ? (
          <>
            <div className="cart-item-premium-spinner"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            <span>Proceed to Billing</span>
          </>
        )}
      </button>

      <div className="cart-summary-premium-info"> {/* ✅ CHANGED */}
        <p>• Stock availability verified at checkout</p>
        <p>• Prices may change based on current rates</p>
      </div>
    </div>
  );
};

export default CartSummary;