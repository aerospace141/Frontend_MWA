// src/components/SearchResults.js
import React from 'react';
import { Plus, Package, AlertCircle } from 'lucide-react';
import '../Styling/components/SearchResultsPremium.css';

// Highlight matching text in search results
const HighlightText = ({ text, searchTerm, matches }) => {
  if (!searchTerm && !matches) return <span>{text}</span>;

  // If we have specific match indices from Fuse.js
  if (matches && matches.length > 0) {
    const lowerText = text.toLowerCase();
    const lowerTerm = searchTerm.toLowerCase();
    const index = lowerText.indexOf(lowerTerm);
    
    if (index !== -1) {
      return (
        <span>
          {text.substring(0, index)}
          <mark className="searchresult-premium-highlight">
            {text.substring(index, index + searchTerm.length)}
          </mark>
          {text.substring(index + searchTerm.length)}
        </span>
      );
    }
  }

  // Fallback highlighting
  if (searchTerm) {
    const lowerText = text.toLowerCase();
    const lowerTerm = searchTerm.toLowerCase();
    const index = lowerText.indexOf(lowerTerm);
    
    if (index !== -1) {
      return (
        <span>
          {text.substring(0, index)}
          <mark className="searchresult-premium-highlight">
            {text.substring(index, index + searchTerm.length)}
          </mark>
          {text.substring(index + searchTerm.length)}
        </span>
      );
    }
  }

  return <span>{text}</span>;
};

const SearchResultItem = ({ result, searchTerm, onAddToCart, isSelected, onClick }) => {
  const { item: medicine, score, matches } = result;
  
  // Get match information for highlighting
  const nameMatch = matches?.find(m => m.key === 'name');
  const brandMatch = matches?.find(m => m.key === 'brand');
  const companyMatch = matches?.find(m => m.key === 'company');

  return (
    <div
      className={`searchresult-premium-item ${isSelected ? 'searchresult-premium-item--selected' : ''}`}
      onClick={onClick}
    >
      <div className="searchresult-premium-item-content">
        <div className="searchresult-premium-item-main">
          {/* Medicine name and brand */}
          <h3 className="searchresult-premium-title">
            <HighlightText 
              text={medicine.name} 
              searchTerm={searchTerm}
              matches={nameMatch}
            />
            {medicine.brand && (
              <>
                {' '}
                <span className="searchresult-premium-brand">
                  <HighlightText 
                    text={medicine.brand} 
                    searchTerm={searchTerm}
                    matches={brandMatch}
                  />
                </span>
              </>
            )}
          </h3>
          
          {/* Medicine details */}
          <div className="searchresult-premium-details">
            <span className="searchresult-premium-company">
              <HighlightText 
                text={medicine.company} 
                searchTerm={searchTerm}
                matches={companyMatch}
              />
            </span>
            <span className="searchresult-premium-separator">•</span>
            <span className="searchresult-premium-strength">
              {medicine.strength}
            </span>
            <span className="searchresult-premium-separator">•</span>
            <span className={`searchresult-premium-stock ${
              medicine.stock > 0 
                ? 'searchresult-premium-stock--available' 
                : 'searchresult-premium-stock--unavailable'
            }`}>
              <Package className="searchresult-premium-stock-icon" />
              Stock: {medicine.stock}
            </span>
          </div>
          
          {/* Category and description */}
          <div className="searchresult-premium-meta">
            <span className="searchresult-premium-category">
              {medicine.category}
            </span>
            {medicine.description && (
              <p className="searchresult-premium-description">
                {medicine.description}
              </p>
            )}
          </div>
          
          {/* Search relevance score (for debugging - remove in production) */}
          {process.env.NODE_ENV === 'development' && score && (
            <div className="searchresult-premium-score">
              Match: {Math.round(score * 100)}%
            </div>
          )}
        </div>
        
        {/* Price and Add button */}
        <div className="searchresult-premium-action">
          <p className="searchresult-premium-price">
            ₹{medicine.price}
          </p>
          
          {medicine.stock > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(medicine);
              }}
              className="searchresult-premium-btn-add"
            >
              <Plus className="searchresult-premium-btn-icon" />
              Add to Cart
            </button>
          ) : (
            <button
              disabled
              className="searchresult-premium-btn-disabled"
            >
              <AlertCircle className="searchresult-premium-btn-icon" />
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SearchResults = ({ 
  results, 
  searchTerm, 
  onAddToCart, 
  selectedIndex, 
  onResultClick,
  isVisible = true,
  className = ""
}) => {
  if (!isVisible || results.length === 0) {
    return null;
  }

  return (
    <div className={`searchresult-premium-container ${className}`}>
      {/* Results header */}
      <div className="searchresult-premium-header">
        <p className="searchresult-premium-header-text">
          {results.length} medicine{results.length !== 1 ? 's' : ''} found
          {searchTerm && (
            <span> for "<span className="searchresult-premium-header-term">{searchTerm}</span>"</span>
          )}
        </p>
      </div>
      
      {/* Results list */}
      <div className="searchresult-premium-list">
        {results.map((result, index) => (
          <SearchResultItem
            key={result.item.id}
            result={result}
            searchTerm={searchTerm}
            onAddToCart={onAddToCart}
            isSelected={selectedIndex === index}
            onClick={() => onResultClick && onResultClick(index)}
          />
        ))}
      </div>
      
      {/* Keyboard navigation hint */}
      <div className="searchresult-premium-footer">
        <p className="searchresult-premium-footer-text">
          ↑↓ Navigate • Enter to add • Esc to close
        </p>
      </div>
    </div>
  );
};

export default SearchResults;