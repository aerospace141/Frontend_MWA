// src/pages/Owner/ManageTablets.js - Enhanced with Premium Styling
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, Package, Upload, Download,
  AlertTriangle, CheckCircle, FileSpreadsheet, X, Save
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ownerService } from '../../services/ownerService';
import '../../Styling/pages/Owner/ManageTabletsPremium.css';

const ManageTablets = () => {
  const [tablets, setTablets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    stockStatus: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [editingTablet, setEditingTablet] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1
  });

  useEffect(() => {
    fetchTablets();
  }, [searchQuery, filters, pagination.page]);

  const fetchTablets = async () => {
    try {
      setLoading(true);
      const data = await ownerService.getAllMedicines({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        category: filters.category,
        stockStatus: filters.stockStatus
      });

      setTablets(data.medicines);
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages
      }));
    } catch (error) {
      console.error('Failed to fetch tablets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        name: 'Paracetamol',
        brand: 'Crocin',
        company: 'GSK',
        strength: '500mg',
        price: 50,
        stock: 100,
        category: 'Pain Relief',
        minStockLevel: 10,
        maxStockLevel: 500,
        dosageForm: 'Tablet',
        description: 'Pain reliever and fever reducer'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Medicines');
    XLSX.writeFile(wb, 'medicine_upload_template.xlsx');
  };

  const handleDeleteTablet = async (tabletId, tabletName) => {
    if (window.confirm(`Are you sure you want to delete ${tabletName}?`)) {
      try {
        await ownerService.deleteMedicine(tabletId);
        fetchTablets();
      } catch (error) {
        console.error('Failed to delete tablet:', error);
      }
    }
  };

  const getStockStatusBadge = (tablet) => {
    if (tablet.stock === 0) {
      return <span className="tablets-premium-badge tablets-premium-badge-danger">Out of Stock</span>;
    }
    if (tablet.stock <= tablet.minStockLevel) {
      return <span className="tablets-premium-badge tablets-premium-badge-warning">Low Stock</span>;
    }
    return <span className="tablets-premium-badge tablets-premium-badge-success">In Stock</span>;
  };

  return (
    <div className="tablets-premium-container">
      {/* Header */}
      <div className="tablets-premium-header">
        <div className="tablets-premium-header-content">
          <div className="tablets-premium-header-top">
            <div className="tablets-premium-header-text">
              <h1 className="tablets-premium-title">Manage Medicines</h1>
              <p className="tablets-premium-subtitle">
                Add, edit, and manage your medicine inventory
              </p>
            </div>
            <div className="tablets-premium-header-actions">
              <button
                onClick={handleDownloadTemplate}
                className="tablets-premium-btn tablets-premium-btn-secondary"
              >
                <Download className="tablets-premium-btn-icon" />
                <span>Download Template</span>
              </button>
              <button
                onClick={() => setShowBulkUploadModal(true)}
                className="tablets-premium-btn tablets-premium-btn-accent"
              >
                <Upload className="tablets-premium-btn-icon" />
                <span>Bulk Upload</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="tablets-premium-btn tablets-premium-btn-primary"
              >
                <Plus className="tablets-premium-btn-icon" />
                <span>Add Medicine</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="tablets-premium-filters">
            <div className="tablets-premium-search-wrapper">
              <div className="tablets-premium-search-icon">
                <Search className="tablets-premium-icon" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tablets-premium-search-input"
                placeholder="Search medicines..."
              />
            </div>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="tablets-premium-select"
            >
              <option value="">All Categories</option>
              <option value="Pain Relief">Pain Relief</option>
              <option value="Antibiotic">Antibiotic</option>
              <option value="Vitamin">Vitamin</option>
              <option value="Diabetes">Diabetes</option>
              <option value="Cardio">Cardio</option>
            </select>

            <select
              value={filters.stockStatus}
              onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
              className="tablets-premium-select"
            >
              <option value="">All Stock Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tablets List */}
      <div className="tablets-premium-main">
        {loading ? (
          <div className="tablets-premium-loading">
            <div className="tablets-premium-spinner"></div>
          </div>
        ) : tablets.length === 0 ? (
          <div className="tablets-premium-empty">
            <Package className="tablets-premium-empty-icon" />
            <h3 className="tablets-premium-empty-title">No medicines found</h3>
            <p className="tablets-premium-empty-text">Get started by adding your first medicine</p>
          </div>
        ) : (
          <>
            <div className="tablets-premium-table-wrapper">
              <table className="tablets-premium-table">
                <thead className="tablets-premium-thead">
                  <tr>
                    <th className="tablets-premium-th">Medicine</th>
                    <th className="tablets-premium-th">Price</th>
                    <th className="tablets-premium-th">Stock</th>
                    <th className="tablets-premium-th">Category</th>
                    <th className="tablets-premium-th">Status</th>
                    <th className="tablets-premium-th tablets-premium-th-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="tablets-premium-tbody">
                  {tablets.map((tablet) => (
                    <tr key={tablet._id} className="tablets-premium-tr">
                      <td className="tablets-premium-td">
                        <div className="tablets-premium-medicine-info">
                          <div className="tablets-premium-medicine-name">{tablet.name}</div>
                          <div className="tablets-premium-medicine-meta">
                            {tablet.brand} • {tablet.company} • {tablet.strength}
                          </div>
                        </div>
                      </td>
                      <td className="tablets-premium-td tablets-premium-price">₹{tablet.price}</td>
                      <td className="tablets-premium-td">
                        <div className="tablets-premium-stock-info">
                          <div className="tablets-premium-stock-value">{tablet.stock}</div>
                          <div className="tablets-premium-stock-min">Min: {tablet.minStockLevel}</div>
                        </div>
                      </td>
                      <td className="tablets-premium-td">{tablet.category}</td>
                      <td className="tablets-premium-td">{getStockStatusBadge(tablet)}</td>
                      <td className="tablets-premium-td tablets-premium-td-actions">
                        <button
                          onClick={() => setEditingTablet(tablet)}
                          className="tablets-premium-action-btn tablets-premium-action-btn-edit"
                        >
                          <Edit className="tablets-premium-action-icon" />
                        </button>
                        <button
                          onClick={() => handleDeleteTablet(tablet._id, tablet.name)}
                          className="tablets-premium-action-btn tablets-premium-action-btn-delete"
                        >
                          <Trash2 className="tablets-premium-action-icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="tablets-premium-pagination">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="tablets-premium-pagination-btn"
                >
                  Previous
                </button>
                <span className="tablets-premium-pagination-text">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="tablets-premium-pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Medicine Modal */}
      {(showAddModal || editingTablet) && (
        <MedicineFormModal
          medicine={editingTablet}
          onClose={() => {
            setShowAddModal(false);
            setEditingTablet(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingTablet(null);
            fetchTablets();
          }}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <BulkUploadModal
          onClose={() => setShowBulkUploadModal(false)}
          onSuccess={() => {
            setShowBulkUploadModal(false);
            fetchTablets();
          }}
        />
      )}
    </div>
  );
};

// Medicine Form Modal Component
const MedicineFormModal = ({ medicine, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(medicine || {
    name: '',
    brand: '',
    company: '',
    strength: '',
    price: '',
    stock: '',
    category: 'General',
    minStockLevel: 10,
    maxStockLevel: 500,
    dosageForm: 'Tablet',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (medicine) {
        await ownerService.updateMedicine(medicine._id, formData);
      } else {
        await ownerService.createMedicine(formData);
      }
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save medicine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tablets-premium-modal-overlay">
      <div className="tablets-premium-modal">
        <div className="tablets-premium-modal-content">
          <h2 className="tablets-premium-modal-title">
            {medicine ? 'Edit Medicine' : 'Add New Medicine'}
          </h2>
          
          {error && (
            <div className="tablets-premium-alert tablets-premium-alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="tablets-premium-form">
            <div className="tablets-premium-form-grid">
              <div className="tablets-premium-form-group">
                <label className="tablets-premium-label">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="tablets-premium-input"
                />
              </div>

              <div className="tablets-premium-form-group">
                <label className="tablets-premium-label">Brand *</label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="tablets-premium-input"
                />
              </div>

              <div className="tablets-premium-form-group">
                <label className="tablets-premium-label">Company *</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="tablets-premium-input"
                />
              </div>

              <div className="tablets-premium-form-group">
                <label className="tablets-premium-label">Strength *</label>
                <input
                  type="text"
                  required
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  className="tablets-premium-input"
                  placeholder="500mg"
                />
              </div>

              <div className="tablets-premium-form-group">
                <label className="tablets-premium-label">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="tablets-premium-input"
                />
              </div>

              <div className="tablets-premium-form-group">
                <label className="tablets-premium-label">Stock *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="tablets-premium-input"
                />
              </div>

              <div className="tablets-premium-form-group">
                <label className="tablets-premium-label">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="tablets-premium-select"
                >
                  <option value="General">General</option>
                  <option value="Pain Relief">Pain Relief</option>
                  <option value="Antibiotic">Antibiotic</option>
                  <option value="Vitamin">Vitamin</option>
                  <option value="Diabetes">Diabetes</option>
                  <option value="Cardio">Cardio</option>
                </select>
              </div>

              <div className="tablets-premium-form-group">
                <label className="tablets-premium-label">Dosage Form</label>
                <select
                  value={formData.dosageForm}
                  onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                  className="tablets-premium-select"
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Cream">Cream</option>
                  <option value="Drops">Drops</option>
                </select>
              </div>

              <div className="tablets-premium-form-group">
                <label className="tablets-premium-label">Min Stock Level</label>
                <input
                  type="number"
                  min="0"
                  value={formData.minStockLevel}
                  onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                  className="tablets-premium-input"
                />
              </div>

              <div className="tablets-premium-form-group">
                <label className="tablets-premium-label">Max Stock Level</label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxStockLevel}
                  onChange={(e) => setFormData({ ...formData, maxStockLevel: e.target.value })}
                  className="tablets-premium-input"
                />
              </div>
            </div>

            <div className="tablets-premium-form-group tablets-premium-form-group-full">
              <label className="tablets-premium-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="tablets-premium-textarea"
              />
            </div>

            <div className="tablets-premium-form-actions">
              <button
                type="button"
                onClick={onClose}
                className="tablets-premium-btn tablets-premium-btn-secondary tablets-premium-btn-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="tablets-premium-btn tablets-premium-btn-primary tablets-premium-btn-full"
              >
                {loading ? 'Saving...' : medicine ? 'Update Medicine' : 'Add Medicine'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Bulk Upload Modal Component
const BulkUploadModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        setPreview(jsonData.slice(0, 5));
      } catch (error) {
        setErrors(['Failed to parse Excel file. Please check the format.']);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setErrors([]);
    setSuccess(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        let successCount = 0;
        const errorList = [];

        for (let i = 0; i < jsonData.length; i++) {
          try {
            const medicine = jsonData[i];
            await ownerService.createMedicine({
              name: medicine.name,
              brand: medicine.brand,
              company: medicine.company,
              strength: medicine.strength,
              price: parseFloat(medicine.price),
              stock: parseInt(medicine.stock),
              category: medicine.category || 'General',
              minStockLevel: parseInt(medicine.minStockLevel) || 10,
              maxStockLevel: parseInt(medicine.maxStockLevel) || 500,
              dosageForm: medicine.dosageForm || 'Tablet',
              description: medicine.description || ''
            });
            successCount++;
          } catch (error) {
            errorList.push(`Row ${i + 2}: ${error.response?.data?.message || error.message}`);
          }
        }

        setSuccess(successCount);
        setErrors(errorList);

        if (errorList.length === 0) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } catch (error) {
        setErrors(['Failed to process file. Please check the format.']);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="tablets-premium-modal-overlay">
      <div className="tablets-premium-modal tablets-premium-modal-wide">
        <div className="tablets-premium-modal-content">
          <div className="tablets-premium-modal-header">
            <h2 className="tablets-premium-modal-title">Bulk Upload Medicines</h2>
            <button onClick={onClose} className="tablets-premium-modal-close">
              <X className="tablets-premium-icon" />
            </button>
          </div>

          {/* Upload Section */}
          <div className="tablets-premium-upload-section">
            <label className="tablets-premium-label">
              Upload Excel File (.xlsx, .xls)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="tablets-premium-file-input"
            />
            <p className="tablets-premium-help-text">
              File should contain columns: name, brand, company, strength, price, stock, category
            </p>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="tablets-premium-preview-section">
              <h3 className="tablets-premium-preview-title">Preview (First 5 rows)</h3>
              <div className="tablets-premium-preview-table-wrapper">
                <table className="tablets-premium-preview-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Brand</th>
                      <th>Company</th>
                      <th>Price</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.name}</td>
                        <td>{row.brand}</td>
                        <td>{row.company}</td>
                        <td>₹{row.price}</td>
                        <td>{row.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Results */}
          {success > 0 && (
            <div className="tablets-premium-alert tablets-premium-alert-success">
              <CheckCircle className="tablets-premium-alert-icon" />
              <span>{success} medicines uploaded successfully!</span>
            </div>
          )}

          {errors.length > 0 && (
            <div className="tablets-premium-alert tablets-premium-alert-error tablets-premium-error-list">
              <AlertTriangle className="tablets-premium-alert-icon" />
              <div className="tablets-premium-error-content">
                <p className="tablets-premium-error-title">Errors ({errors.length}):</p>
                <ul className="tablets-premium-error-items">
                  {errors.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="tablets-premium-form-actions">
            <button
              onClick={onClose}
              className="tablets-premium-btn tablets-premium-btn-secondary tablets-premium-btn-full"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="tablets-premium-btn tablets-premium-btn-primary tablets-premium-btn-full"
            >
              {uploading ? (
                <>
                  <div className="tablets-premium-spinner-small"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="tablets-premium-btn-icon" />
                  <span>Upload {preview.length} Medicines</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTablets;