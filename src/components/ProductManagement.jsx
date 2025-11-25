import React, { useState, useEffect } from 'react';
import './ProductManagement.css';

/**
 * ProductManagement Component
 * Form aligned with database schema for UnstitchedFabricProducts
 */
const ProductManagement = ({ user, onBackToDashboard }) => {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeSection, setActiveSection] = useState('basic'); // basic, details, pricing, images, inventory, compliance
  
  // Section order for progress indicator
  const sections = ['basic', 'details', 'pricing', 'images', 'inventory', 'compliance'];
  const sectionLabels = {
    basic: 'Basic Info',
    details: 'Product Details',
    pricing: 'Pricing',
    images: 'Images',
    inventory: 'Inventory',
    compliance: 'Compliance'
  };
  
  // Dynamic data from API
  const [brands, setBrands] = useState([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const [productTypes, setProductTypes] = useState([]);
  const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);

  const [productImages, setProductImages] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({}); // Store field-level errors
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for form submission
  const [apiError, setApiError] = useState(''); // API error message
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [listError, setListError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [isActiveFilter, setIsActiveFilter] = useState(undefined); // undefined | true | false
  
  // Product Detail View States
  const [viewingProduct, setViewingProduct] = useState(null);
  const [isLoadingProductDetail, setIsLoadingProductDetail] = useState(false);
  const [productDetailError, setProductDetailError] = useState('');
  
  // Delete State
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: '' }); // type: 'success' | 'error'

  // Comprehensive form data matching database schema
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    brand_id: '',
    category_id: '',
    sku: '',
    style_code: '',
    model_name: '',
    
    // Product Details
    product_type: '',
    color: '',
    brand_color: '',
    fabric: '',
    fabric_purity: '',
    composition: '',
    pattern: '',
    stitching_type: '',
    ideal_for: '',
    
    // Dimensions
    unit: 'meter',
    top_length_value: '',
    top_length_unit: 'm',
    
    // Descriptions
    sales_package: '',
    short_description: '',
    long_description: '',
    
    // Status
    is_active: true,
    
    // Pricing
    price_mrp: '',
    price_sale: '',
    currency_code: 'INR',
    
    // Inventory
    stock_qty: '',
    
    // Compliance
    country_of_origin: '',
    manufacturer_details: '',
    packer_details: '',
    importer_details: '',
    mfg_month_year: '',
    customer_care: ''
  });

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Remove error styling and error message when user starts typing
    if (e.target.classList.contains('error')) {
      e.target.classList.remove('error');
    }
    
    // Clear error message for this field
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // (removed duplicate fetchProducts and useEffect)

  /**
   * Handle image file selection from computer
   */
  const handleImageFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Check total image count (max 10)
      const currentCount = productImages.length;
      const newFiles = Array.from(files);
      const totalAfterAdd = currentCount + newFiles.length;
      
      if (totalAfterAdd > 10) {
        alert(`You can only upload a maximum of 10 images. Currently you have ${currentCount} image(s). Please select ${10 - currentCount} or fewer images.`);
        e.target.value = '';
        return;
      }
      
      newFiles.forEach((file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not a valid image file. Please select an image file (jpg, png, gif, etc.).`);
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Please select an image smaller than 5MB.`);
          return;
        }

        // Read file and convert to base64 data URL
        const reader = new FileReader();
        reader.onload = (event) => {
          setProductImages(prev => [...prev, {
            id: Date.now() + Math.random(), // Ensure unique ID
            url: event.target.result, // Base64 data URL
            file: file, // Keep reference to original file
            fileName: file.name,
            is_primary: prev.length === 0 // First image is primary by default
          }]);
        };
        reader.onerror = () => {
          alert(`Failed to read ${file.name}. Please try again.`);
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  /**
   * Trigger file input click
   */
  const handleAddImage = () => {
    const fileInput = document.getElementById('image-file-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  /**
   * Remove image
   */
  const handleRemoveImage = (imageId) => {
    setProductImages(prev => prev.filter(img => img.id !== imageId));
    // If removed image was primary, make first image primary
    if (productImages.find(img => img.id === imageId)?.is_primary) {
      const remaining = productImages.filter(img => img.id !== imageId);
      if (remaining.length > 0) {
        setProductImages(prev => prev.map((img, index) => ({
          ...img,
          is_primary: index === 0 && img.id === remaining[0].id
        })));
      }
    }
  };

  /**
   * Set primary image
   */
  const handleSetPrimaryImage = (imageId) => {
    setProductImages(prev => prev.map(img => ({
      ...img,
      is_primary: img.id === imageId
    })));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    // Validation - Based on database schema NOT NULL constraints
    const errors = [];
    
    // Required fields from API
    if (!formData.title || formData.title.trim() === '') {
      errors.push('Product Title');
    }
    
    // Required fields from API
    if (!formData.price_mrp || parseFloat(formData.price_mrp) <= 0) {
      errors.push('MRP Price');
    }
    
    // Validate images count (max 10)
    if (productImages && productImages.length > 10) {
      errors.push('Maximum 10 images allowed');
    }
    
    // Validate image sizes (max 5MB each)
    if (productImages && productImages.length > 0) {
      const oversizedImages = productImages.filter(img => img.file && img.file.size > 5 * 1024 * 1024);
      if (oversizedImages.length > 0) {
        errors.push('Some images exceed 5MB limit');
      }
    }
    
    if (errors.length > 0) {
      // Set field errors for inline display
      const newFieldErrors = {};
      
      errors.forEach((errorField) => {
        let fieldName = '';
        let errorMessage = '';
        
        if (errorField === 'Product Title') {
          fieldName = 'title';
          errorMessage = 'Please enter product title';
        } else if (errorField === 'MRP Price') {
          fieldName = 'price_mrp';
          errorMessage = 'Please enter MRP price';
        } else if (errorField === 'Maximum 10 images allowed') {
          fieldName = 'images';
          errorMessage = 'Maximum 10 images allowed';
        } else if (errorField === 'Some images exceed 5MB limit') {
          fieldName = 'images';
          errorMessage = 'Some images exceed 5MB limit. Please remove oversized images.';
        }
        
        if (fieldName) {
          newFieldErrors[fieldName] = errorMessage;
        }
      });
      
      setFieldErrors(newFieldErrors);
      
      // Navigate to the relevant section and add error styling
      let targetSection = activeSection;
      if (errors.includes('Product Title')) {
        targetSection = 'basic';
      } else if (errors.includes('MRP Price')) {
        targetSection = 'pricing';
      } else if (errors.some(e => e.includes('image'))) {
        targetSection = 'images';
      }
      
      setActiveSection(targetSection);
      
      // Add error styling to fields
      setTimeout(() => {
        Object.keys(newFieldErrors).forEach((fieldName, index) => {
          if (fieldName !== 'images') {
            const field = document.querySelector(`[name="${fieldName}"]`) || 
                         document.querySelector(`#${fieldName}`);
            if (field) {
              field.classList.add('error');
              if (index === 0) {
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => field.focus(), 300);
              }
            }
          }
        });
      }, 100);
      
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add user ID if available
      if (user && user.id) {
        formDataToSend.append('user_id', user.id);
      }
      
      // Required fields
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('price_mrp', formData.price_mrp);
      
      // Optional fields - only append if they have values
      if (formData.brand_id) {
        formDataToSend.append('brand', formData.brand_id);
      }
      if (formData.category_id) {
        formDataToSend.append('category', formData.category_id);
      }
      if (formData.sku) {
        formDataToSend.append('sku', formData.sku);
      }
      if (formData.style_code) {
        formDataToSend.append('style_code', formData.style_code);
      }
      if (formData.model_name) {
        formDataToSend.append('model_name', formData.model_name);
      }
      if (formData.product_type) {
        formDataToSend.append('product_type', formData.product_type);
      }
      if (formData.color) {
        formDataToSend.append('color', formData.color);
      }
      if (formData.brand_color) {
        formDataToSend.append('brand_color', formData.brand_color);
      }
      if (formData.fabric) {
        formDataToSend.append('fabric', formData.fabric);
      }
      if (formData.fabric_purity) {
        formDataToSend.append('fabric_purity', formData.fabric_purity);
      }
      if (formData.composition) {
        formDataToSend.append('composition', formData.composition);
      }
      if (formData.pattern) {
        formDataToSend.append('pattern', formData.pattern);
      }
      if (formData.stitching_type) {
        formDataToSend.append('stitching_type', formData.stitching_type);
      }
      if (formData.ideal_for) {
        formDataToSend.append('ideal_for', formData.ideal_for);
      }
      if (formData.unit) {
        formDataToSend.append('unit', formData.unit);
      }
      if (formData.top_length_value) {
        formDataToSend.append('top_length_value', formData.top_length_value);
      }
      if (formData.top_length_unit) {
        formDataToSend.append('top_length_unit', formData.top_length_unit);
      }
      if (formData.sales_package) {
        formDataToSend.append('sales_package', formData.sales_package);
      }
      if (formData.short_description) {
        formDataToSend.append('short_description', formData.short_description);
      }
      if (formData.long_description) {
        formDataToSend.append('long_description', formData.long_description);
      }
      if (formData.is_active !== undefined) {
        formDataToSend.append('is_active', formData.is_active);
      }
      if (formData.price_sale) {
        formDataToSend.append('price_sale', formData.price_sale);
      }
      if (formData.currency_code) {
        formDataToSend.append('currency_code', formData.currency_code);
      }
      // Compliance fields
      if (formData.country_of_origin) {
        formDataToSend.append('country_of_origin', formData.country_of_origin);
      }
      if (formData.manufacturer_details) {
        formDataToSend.append('manufacturer_details', formData.manufacturer_details);
      }
      if (formData.packer_details) {
        formDataToSend.append('packer_details', formData.packer_details);
      }
      if (formData.importer_details) {
        formDataToSend.append('importer_details', formData.importer_details);
      }
      if (formData.mfg_month_year) {
        formDataToSend.append('mfg_month_year', formData.mfg_month_year);
      }
      if (formData.customer_care) {
        formDataToSend.append('customer_care', formData.customer_care);
      }
      // Note: valid_from and valid_to are not in the form, but can be added if needed
      
      // Inventory field
      if (formData.stock_qty !== '' && formData.stock_qty !== null && formData.stock_qty !== undefined) {
        formDataToSend.append('stock_qty', formData.stock_qty);
      }
      
      // Add images as files (max 10)
      if (productImages && productImages.length > 0) {
        productImages.slice(0, 10).forEach((image) => {
          if (image.file) {
            formDataToSend.append('images', image.file);
          }
        });
      }
      
      console.log('📦 Sending product data to API...');
      console.log('👤 User ID:', user?.id);
      
      // Determine if we're editing or creating
      const isEditing = editingProduct && editingProduct.id;
      const url = isEditing ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';
      
      console.log(`🔄 ${isEditing ? 'Updating' : 'Creating'} product...`);
      if (isEditing) {
        console.log('📝 Editing Product ID:', editingProduct.id);
      }
      
      const response = await fetch(url, {
        method: method,
        body: formDataToSend
      });
      
      console.log('📡 Response status:', response.status);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error: API endpoint not available. Please ensure the backend server is running.');
      }
      
      const data = await response.json();
      console.log('✅ API Response data:', data);
      
      if (!response.ok) {
        // Handle backend validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => {
            if (typeof err === 'string') return err;
            if (err.message) return err.message;
            if (err.msg) return err.msg;
            return JSON.stringify(err);
          }).join('\n');
          setApiError(errorMessages || data.message || `Failed to ${isEditing ? 'update' : 'add'} product. Please check your input.`);
        } else {
          setApiError(data.message || `Failed to ${isEditing ? 'update' : 'add'} product. Please try again.`);
        }
        setIsSubmitting(false);
        return;
      }
      
      // Success - Refresh list from API to get proper nested structure
      // Don't update local state with formData as it has flat structure
      // API response has nested structure (brand: {}, category: {}, price: {}, inventory: {}, compliance: {})
      await fetchProducts({ page: 1, limit: pageLimit, is_active: isActiveFilter });
      // Reset form and show the list view
      setFieldErrors({});
      resetForm();
      setShowAddForm(false);
      showToast(isEditing ? 'Product updated successfully!' : 'Product added successfully!', 'success');
      
    } catch (error) {
      console.error('❌ Product submission error:', error);
      setApiError(error.message || 'An error occurred while adding the product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      title: '',
      brand_id: '',
      category_id: '',
      sku: '',
      style_code: '',
      model_name: '',
      product_type: '',
      color: '',
      brand_color: '',
      fabric: '',
      fabric_purity: '',
      composition: '',
      pattern: '',
      stitching_type: '',
      ideal_for: '',
      unit: 'meter',
      top_length_value: '',
      top_length_unit: 'm',
      sales_package: '',
      short_description: '',
      long_description: '',
      is_active: true,
      price_mrp: '',
      price_sale: '',
      currency_code: 'INR',
      stock_qty: '',
      country_of_origin: '',
      manufacturer_details: '',
      packer_details: '',
      importer_details: '',
      mfg_month_year: '',
      customer_care: ''
    });
    setProductImages([]);
    setEditingProduct(null);
    setShowAddForm(false);
    setActiveSection('basic');
    setFieldErrors({});
    setApiError('');
  };

  /**
   * Start editing a product
   */
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || '',
      brand_id: product.brand?.id || product.brand_id || '',
      category_id: product.category?.id || product.category_id || '',
      sku: product.sku || '',
      style_code: product.style_code || '',
      model_name: product.model_name || '',
      product_type: product.product_type || '',
      color: product.color || '',
      brand_color: product.brand_color || '',
      fabric: product.fabric || '',
      fabric_purity: product.fabric_purity || '',
      composition: product.composition || '',
      pattern: product.pattern || '',
      stitching_type: product.stitching_type || '',
      ideal_for: product.ideal_for || '',
      unit: product.unit || 'meter',
      top_length_value: product.top_length_value || '',
      top_length_unit: product.top_length_unit || 'm',
      sales_package: product.sales_package || '',
      short_description: product.short_description || '',
      long_description: product.long_description || '',
      is_active: product.is_active !== undefined ? product.is_active : true,
      price_mrp: product.price?.price_mrp || product.price_mrp || '',
      price_sale: product.price?.price_sale || product.price_sale || '',
      currency_code: product.price?.currency_code || product.currency_code || 'INR',
      stock_qty: product.inventory?.stock_qty || product.stock_qty || '',
      country_of_origin: product.compliance?.country_of_origin || product.country_of_origin || '',
      manufacturer_details: product.compliance?.manufacturer_details || product.manufacturer_details || '',
      packer_details: product.compliance?.packer_details || product.packer_details || '',
      importer_details: product.compliance?.importer_details || product.importer_details || '',
      mfg_month_year: product.compliance?.mfg_month_year || product.mfg_month_year || '',
      customer_care: product.compliance?.customer_care || product.customer_care || ''
    });
    setProductImages(product.images || []);
    setShowAddForm(true);
    setActiveSection('basic');
    // Fetch dropdown data when opening edit form
    fetchProductTypes();
    fetchBrands();
    fetchCategories();
  };

  /**
   * Delete a product
   */
  /**
   * Open delete confirmation modal
   */
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  /**
   * Confirm and execute delete
   */
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    const productId = typeof productToDelete === 'object' ? productToDelete.id : productToDelete;
    setDeletingProductId(productId);
    setShowDeleteModal(false);

    try {
      console.log('🗑️ Deleting product:', productId);
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      
      console.log('📡 Delete response status:', response.status);
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('📦 Delete response:', data);
        
        if (!response.ok) {
          const message = data?.message || 'Failed to delete product.';
          throw new Error(message);
        }
      } else if (!response.ok) {
        throw new Error('Failed to delete product.');
      }
      
      // Remove from local state
      setProducts(prev => prev.filter(product => product.id !== productId));
      
      console.log('✅ Product deleted successfully');
      showToast('Product deleted successfully!', 'success');
      
      // Close detail view if viewing deleted product
      if (viewingProduct && viewingProduct.id === productId) {
        setViewingProduct(null);
      }
      
      // Refresh the list from server
      await fetchProducts({ page: currentPage, limit: pageLimit, is_active: isActiveFilter });
      
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      showToast(`Failed to delete product: ${error.message}`, 'error');
    } finally {
      setDeletingProductId(null);
      setProductToDelete(null);
    }
  };

  /**
   * Cancel delete
   */
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  /**
   * Show toast notification
   */
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  /**
   * Cancel form editing/adding
   */
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      resetForm();
    }
  };

  /**
   * Validate mandatory fields for a specific section
   */
  const validateSection = (section) => {
    const errors = [];
    
    switch(section) {
      case 'basic':
        if (!formData.title || formData.title.trim() === '') {
          errors.push('Product Title');
        }
        if (!formData.category_id || formData.category_id === '') {
          errors.push('Category');
        }
        break;
        
      case 'details':
        // Product details section has no mandatory fields
        break;
        
      case 'pricing':
        if (!formData.price_mrp || parseFloat(formData.price_mrp) <= 0) {
          errors.push('MRP Price');
        }
        break;
        
      case 'images':
        if (!productImages || productImages.length === 0) {
          errors.push('At least one Product Image');
        }
        break;
        
      case 'inventory':
        const stockQty = formData.stock_qty !== '' && formData.stock_qty !== null && formData.stock_qty !== undefined 
          ? parseFloat(formData.stock_qty) 
          : null;
        if (stockQty === null || isNaN(stockQty) || stockQty < 0) {
          errors.push('Stock Quantity');
        }
        break;
        
      case 'compliance':
        // Compliance section has no mandatory fields
        break;
        
      default:
        break;
    }
    
    return errors;
  };

  /**
   * Fetch product types from API
   */
  const fetchProductTypes = async () => {
    setIsLoadingProductTypes(true);
    try {
      const response = await fetch('/api/products/getAllProductTypes', {
        method: 'GET'
      });
      
      console.log('📡 Product Types Response status:', response.status);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error: Product types API not available.');
      }
      
      const data = await response.json();
      console.log('📦 Product Types Response:', data);
      
      if (!response.ok) {
        const message = data?.message || 'Failed to fetch product types.';
        throw new Error(message);
      }
      
      // Handle different API response structures
      let types = [];
      
      console.log('🔍 Checking response structure...');
      console.log('🔍 data keys:', Object.keys(data));
      if (data?.data) {
        console.log('🔍 data.data keys:', Object.keys(data.data));
      }
      
      if (Array.isArray(data)) {
        types = data;
        console.log('✅ Direct array detected');
      } else if (data?.data?.productTypes && Array.isArray(data.data.productTypes)) {
        // Response structure: { data: { productTypes: [...], count: N } }
        types = data.data.productTypes;
        console.log('✅ Nested in data.productTypes property');
      } else if (data?.data?.product_types && Array.isArray(data.data.product_types)) {
        // Response structure with snake_case: { data: { product_types: [...], count: N } }
        types = data.data.product_types;
        console.log('✅ Nested in data.product_types property');
      } else if (data?.data?.types && Array.isArray(data.data.types)) {
        // Response structure: { data: { types: [...], count: N } }
        types = data.data.types;
        console.log('✅ Nested in data.types property');
      } else if (data?.data && Array.isArray(data.data)) {
        types = data.data;
        console.log('✅ Nested in data property (direct array)');
      } else if (data?.productTypes && Array.isArray(data.productTypes)) {
        types = data.productTypes;
        console.log('✅ Nested in productTypes property');
      } else if (data?.product_types && Array.isArray(data.product_types)) {
        types = data.product_types;
        console.log('✅ Nested in product_types property');
      } else if (data?.types && Array.isArray(data.types)) {
        types = data.types;
        console.log('✅ Nested in types property');
      } else {
        console.log('⚠️ Unknown response structure:', data);
        console.log('⚠️ Available properties:', Object.keys(data));
      }
      
      // Filter out any objects that don't have required properties
      types = types.filter(item => {
        if (!item) return false;
        // If it's a string, keep it
        if (typeof item === 'string') return true;
        // If it's an object, check for various property name formats
        if (typeof item === 'object') {
          // Check for lowercase: {id, name} or {id, type}
          if ((item.id || item.id === 0) && (item.name || item.type)) return true;
          // Check for PascalCase: {ProductTypeId, ProductType}
          if ((item.ProductTypeId || item.ProductTypeId === 0) && item.ProductType) return true;
          // Check for other variations
          if ((item.product_type_id || item.product_type_id === 0) && item.product_type) return true;
        }
        // Filter out objects like {count: 6}
        return false;
      });
      
      console.log('✅ Product Types parsed:', types);
      console.log('✅ Product Types count:', types.length);
      setProductTypes(types);
      console.log('✅ Product Types state set');
      
    } catch (error) {
      console.error('❌ Error fetching product types:', error);
      // Use fallback values if API fails
      setProductTypes([
        'Shirt Fabric',
        'Suiting',
        'Trouser Fabric',
        'Formal Wear',
        'Casual Wear'
      ]);
    } finally {
      setIsLoadingProductTypes(false);
    }
  };

  /**
   * Fetch brands from API
   */
  const fetchBrands = async () => {
    setIsLoadingBrands(true);
    try {
      const response = await fetch('/api/products/getAllBrands', {
        method: 'GET'
      });
      
      console.log('📡 Brands Response status:', response.status);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error: Brands API not available.');
      }
      
      const data = await response.json();
      console.log('📦 Brands Response:', data);
      
      if (!response.ok) {
        const message = data?.message || 'Failed to fetch brands.';
        throw new Error(message);
      }
      
      // Handle different API response structures
      let brandsList = [];
      if (Array.isArray(data)) {
        brandsList = data;
        console.log('✅ Direct array detected');
      } else if (data?.data?.brands && Array.isArray(data.data.brands)) {
        // Response structure: { data: { brands: [...], count: N } }
        brandsList = data.data.brands;
        console.log('✅ Nested in data.brands property');
      } else if (data?.data && Array.isArray(data.data)) {
        brandsList = data.data;
        console.log('✅ Nested in data property');
      } else if (data?.brands && Array.isArray(data.brands)) {
        brandsList = data.brands;
        console.log('✅ Nested in brands property');
      } else {
        console.log('⚠️ Unknown response structure:', data);
      }
      
      // Filter out any non-brand objects (like count objects)
      brandsList = brandsList.filter(item => {
        if (!item) return false;
        // Check for lowercase: {id, name}
        if ((item.id || item.id === 0) && item.name) return true;
        // Check for PascalCase: {BrandId, BrandName} or {BrandId, Brand}
        if ((item.BrandId || item.BrandId === 0) && (item.BrandName || item.Brand)) return true;
        // Check for snake_case
        if ((item.brand_id || item.brand_id === 0) && item.brand_name) return true;
        return false;
      });
      
      console.log('✅ Brands parsed:', brandsList);
      console.log('✅ Brands count:', brandsList.length);
      setBrands(brandsList);
      console.log('✅ Brands state set');
      
    } catch (error) {
      console.error('❌ Error fetching brands:', error);
      // Use empty array or fallback values if API fails
      setBrands([]);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  /**
   * Fetch categories from API
   */
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await fetch('/api/products/getAllCategories', {
        method: 'GET'
      });
      
      console.log('📡 Categories Response status:', response.status);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error: Categories API not available.');
      }
      
      const data = await response.json();
      console.log('📦 Categories Response:', data);
      
      if (!response.ok) {
        const message = data?.message || 'Failed to fetch categories.';
        throw new Error(message);
      }
      
      // Handle different API response structures
      let categoriesList = [];
      if (Array.isArray(data)) {
        categoriesList = data;
        console.log('✅ Direct array detected');
      } else if (data?.data?.categories && Array.isArray(data.data.categories)) {
        // Response structure: { data: { categories: [...], count: N } }
        categoriesList = data.data.categories;
        console.log('✅ Nested in data.categories property');
      } else if (data?.data && Array.isArray(data.data)) {
        categoriesList = data.data;
        console.log('✅ Nested in data property');
      } else if (data?.categories && Array.isArray(data.categories)) {
        categoriesList = data.categories;
        console.log('✅ Nested in categories property');
      } else {
        console.log('⚠️ Unknown response structure:', data);
      }
      
      // Filter out any non-category objects (like count objects)
      categoriesList = categoriesList.filter(item => {
        if (!item) return false;
        // Check for lowercase: {id, name}
        if ((item.id || item.id === 0) && item.name) return true;
        // Check for PascalCase: {CategoryId, CategoryName} or {CategoryId, Category}
        if ((item.CategoryId || item.CategoryId === 0) && (item.CategoryName || item.Category)) return true;
        // Check for snake_case
        if ((item.category_id || item.category_id === 0) && item.category_name) return true;
        return false;
      });
      
      console.log('✅ Categories parsed:', categoriesList);
      console.log('✅ Categories count:', categoriesList.length);
      setCategories(categoriesList);
      console.log('✅ Categories state set');
      
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      // Use empty array or fallback values if API fails
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  /**
   * Fetch products list from API with optional query params
   */
  const fetchProducts = async (opts = {}) => {
    const { page = currentPage, limit = pageLimit, is_active = isActiveFilter } = opts;
    setIsLoadingProducts(true);
    setListError('');
    try {
      const params = new URLSearchParams();
      
      // Add user ID if available
      if (user && user.id) {
        params.set('user_id', String(user.id));
      }
      
      if (page) params.set('page', String(page));
      if (limit) params.set('limit', String(limit));
      if (typeof is_active === 'boolean') params.set('is_active', String(is_active));
      
      const query = params.toString();
      const url = `/api/products${query ? `?${query}` : ''}`;
      
      console.log('🔍 Fetching products from:', url);
      console.log('👤 User ID:', user?.id);
      
      const response = await fetch(url, { method: 'GET' });
      
      console.log('📡 Response status:', response.status);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error: products API not available.');
      }
      const data = await response.json();
      
      console.log('📦 Raw API response:', data);
      
      if (!response.ok) {
        const message = data?.message || 'Failed to fetch products.';
        throw new Error(message);
      }
      // Handle different API response structures
      let items = [];
      if (Array.isArray(data)) {
        // Response is directly an array
        items = data;
      } else if (data?.data?.products && Array.isArray(data.data.products)) {
        // Response structure: { data: { products: [...] } }
        items = data.data.products;
      } else if (Array.isArray(data?.data)) {
        // Response structure: { data: [...] }
        items = data.data;
      } else if (Array.isArray(data?.products)) {
        // Response structure: { products: [...] }
        items = data.products;
      }
      
      console.log('✅ Parsed products:', items);
      console.log('📊 Products count:', items.length);
      
      setProducts(items);
      setCurrentPage(page);
      setPageLimit(limit);
      setIsActiveFilter(is_active);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setListError(error.message || 'Unable to load products.');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  /**
   * Fetch single product detail by ID
   */
  const fetchProductDetail = async (productId) => {
    setIsLoadingProductDetail(true);
    setProductDetailError('');
    try {
      const url = `/api/products/${productId}`;
      
      console.log('🔍 Fetching product detail from:', url);
      
      const response = await fetch(url, { method: 'GET' });
      
      console.log('📡 Response status:', response.status);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error: product API not available.');
      }
      
      const data = await response.json();
      
      console.log('📦 Product detail response:', data);
      
      if (!response.ok) {
        const message = data?.message || 'Failed to fetch product details.';
        throw new Error(message);
      }
      
      // Handle different response structures
      let productData = null;
      if (data?.data?.product) {
        productData = data.data.product;
      } else if (data?.data) {
        productData = data.data;
      } else if (data?.product) {
        productData = data.product;
      } else {
        productData = data;
      }
      
      console.log('✅ Product detail:', productData);
      
      setViewingProduct(productData);
    } catch (error) {
      console.error('❌ Error fetching product detail:', error);
      setProductDetailError(error.message || 'Unable to load product details.');
    } finally {
      setIsLoadingProductDetail(false);
    }
  };

  /**
   * Handle viewing a product detail
   */
  const handleViewProduct = (product) => {
    console.log('👁️ Viewing product:', product.id);
    fetchProductDetail(product.id);
  };

  /**
   * Close product detail view
   */
  const handleCloseProductDetail = () => {
    setViewingProduct(null);
    setProductDetailError('');
  };

  // Load products on mount
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handle section navigation with validation
   */
  const handleSectionChange = (targetSection, direction = 'next') => {
    // Allow going back without validation
    if (direction === 'prev') {
      const currentIndex = sections.indexOf(activeSection);
      if (currentIndex > 0) {
        // Clear errors when going back
        setFieldErrors({});
        setActiveSection(sections[currentIndex - 1]);
      }
      return;
    }
    
    // Validate current section before allowing navigation forward
    const errors = validateSection(activeSection);
    
    if (errors.length > 0) {
      // Set field errors for inline display
      const newFieldErrors = {};
      
      errors.forEach((errorField) => {
        let fieldName = '';
        let errorMessage = '';
        
        // Map error field names to actual form field names and messages
        if (errorField === 'Product Title') {
          fieldName = 'title';
          errorMessage = 'Please enter product title';
        } else if (errorField === 'Category') {
          fieldName = 'category_id';
          errorMessage = 'Please select a category';
        } else if (errorField === 'MRP Price') {
          fieldName = 'price_mrp';
          errorMessage = 'Please enter MRP price';
        } else if (errorField === 'Stock Quantity') {
          fieldName = 'stock_qty';
          errorMessage = 'Please enter stock quantity';
        } else if (errorField === 'At least one Product Image') {
          fieldName = 'images';
          errorMessage = 'Please add at least one product image';
        }
        
        if (fieldName) {
          newFieldErrors[fieldName] = errorMessage;
        }
      });
      
      setFieldErrors(newFieldErrors);
      
      // Add error styling to missing fields
      setTimeout(() => {
        // Remove previous error classes
        document.querySelectorAll('.pm-form-input.error, .pm-form-textarea.error').forEach(el => {
          el.classList.remove('error');
        });
        
        // Add error class to missing fields
        Object.keys(newFieldErrors).forEach((fieldName, index) => {
          if (fieldName === 'images') {
            // Special handling for images section
            const imagesSection = document.querySelector('.pm-images-section');
            if (imagesSection) {
              imagesSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          } else {
            const field = document.querySelector(`[name="${fieldName}"]`) || 
                         document.querySelector(`#${fieldName}`);
            
            if (field) {
              field.classList.add('error');
              // Scroll to first error
              if (index === 0) {
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => field.focus(), 300);
              }
            }
          }
        });
      }, 100);
      
      return;
    }
    
    // If validation passes, clear errors and allow navigation
    setFieldErrors({});
    setActiveSection(targetSection);
    
    // Remove error classes when navigating successfully
    setTimeout(() => {
      document.querySelectorAll('.pm-form-input.error, .pm-form-textarea.error').forEach(el => {
        el.classList.remove('error');
      });
    }, 200);
  };

  return (
    <div className="product-management-container">
      {/* Header */}
      <header className="pm-header">
        <div className="pm-header-content">
          <div className="pm-header-left">
            <button className="pm-back-btn" onClick={onBackToDashboard}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back to Dashboard
            </button>
            <h1 className="pm-title">Product Management</h1>
          </div>
          {!showAddForm && (
            <button 
              className="pm-add-btn"
              onClick={() => {
                resetForm();
                setShowAddForm(true);
                // Fetch dropdown data when opening add form
                fetchProductTypes();
                fetchBrands();
                fetchCategories();
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Product
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pm-main">
        <div className="pm-content-wrapper">
          {/* Product Detail View */}
          {viewingProduct && !showAddForm && (
            <div className="pm-product-detail">
              <div className="pm-detail-header">
                <button className="pm-back-btn" onClick={handleCloseProductDetail}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Back to Products
                </button>
              </div>

              {isLoadingProductDetail ? (
                <div className="pm-empty-state">
                  <h3>Loading product details...</h3>
                  <p>Please wait...</p>
                </div>
              ) : productDetailError ? (
                <div className="pm-form-content" style={{padding: '2rem'}}>
                  <div className="pm-api-error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <div>
                      <strong>Couldn't load product details</strong>
                      <p>{productDetailError}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pm-detail-content">
                  {/* Product Images Gallery */}
                  <div className="pm-detail-images">
                    <div className="pm-detail-main-image">
                      {viewingProduct.primary_image ? (
                        <img src={viewingProduct.primary_image} alt={viewingProduct.title} />
                      ) : viewingProduct.images && viewingProduct.images.length > 0 ? (
                        <img src={viewingProduct.images.find(img => img.is_primary)?.url || viewingProduct.images[0].url} alt={viewingProduct.title} />
                      ) : (
                        <div className="pm-detail-placeholder">
                          <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                          <p>No Image</p>
                        </div>
                      )}
                    </div>
                    {viewingProduct.images && viewingProduct.images.length > 1 && (
                      <div className="pm-detail-thumbnails">
                        {viewingProduct.images.map((img, index) => (
                          <div key={index} className="pm-detail-thumbnail">
                            <img src={img.url} alt={`${viewingProduct.title} ${index + 1}`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="pm-detail-info">
                    <h1 className="pm-detail-title">{viewingProduct.title}</h1>
                    
                    <div className="pm-detail-meta">
                      <span className="pm-detail-brand">
                        {viewingProduct.brand?.name || brands.find(b => b.id == viewingProduct.brand_id)?.name || 'No Brand'}
                      </span>
                      <span className="pm-detail-separator">•</span>
                      <span className="pm-detail-category">
                        {viewingProduct.category?.name || categories.find(c => c.id == viewingProduct.category_id)?.name || 'No Category'}
                      </span>
                    </div>

                    <div className="pm-detail-price">
                      <span className="pm-detail-price-mrp">₹{viewingProduct.price?.price_mrp || viewingProduct.price_mrp}</span>
                      {(viewingProduct.price?.price_sale || viewingProduct.price_sale) && (
                        <span className="pm-detail-price-sale">₹{viewingProduct.price?.price_sale || viewingProduct.price_sale}</span>
                      )}
                    </div>

                    <div className="pm-detail-stock">
                      <strong>Stock:</strong> {viewingProduct.inventory?.stock_qty || viewingProduct.stock_qty || 0} {viewingProduct.unit || 'meter'}
                    </div>

                    {viewingProduct.short_description && (
                      <div className="pm-detail-description">
                        <h3>Description</h3>
                        <p>{viewingProduct.short_description}</p>
                      </div>
                    )}

                    {viewingProduct.long_description && (
                      <div className="pm-detail-description">
                        <h3>Detailed Description</h3>
                        <p>{viewingProduct.long_description}</p>
                      </div>
                    )}

                    {/* Product Specifications */}
                    <div className="pm-detail-specs">
                      <h3>Specifications</h3>
                      <div className="pm-detail-specs-grid">
                        {viewingProduct.sku && (
                          <div className="pm-detail-spec-item">
                            <span className="pm-spec-label">SKU:</span>
                            <span className="pm-spec-value">{viewingProduct.sku}</span>
                          </div>
                        )}
                        {viewingProduct.style_code && (
                          <div className="pm-detail-spec-item">
                            <span className="pm-spec-label">Style Code:</span>
                            <span className="pm-spec-value">{viewingProduct.style_code}</span>
                          </div>
                        )}
                        {viewingProduct.model_name && (
                          <div className="pm-detail-spec-item">
                            <span className="pm-spec-label">Model:</span>
                            <span className="pm-spec-value">{viewingProduct.model_name}</span>
                          </div>
                        )}
                        {viewingProduct.product_type && (
                          <div className="pm-detail-spec-item">
                            <span className="pm-spec-label">Type:</span>
                            <span className="pm-spec-value">{viewingProduct.product_type}</span>
                          </div>
                        )}
                        {viewingProduct.color && (
                          <div className="pm-detail-spec-item">
                            <span className="pm-spec-label">Color:</span>
                            <span className="pm-spec-value">{viewingProduct.color}</span>
                          </div>
                        )}
                        {viewingProduct.fabric && (
                          <div className="pm-detail-spec-item">
                            <span className="pm-spec-label">Fabric:</span>
                            <span className="pm-spec-value">{viewingProduct.fabric}</span>
                          </div>
                        )}
                        {viewingProduct.fabric_purity && (
                          <div className="pm-detail-spec-item">
                            <span className="pm-spec-label">Fabric Purity:</span>
                            <span className="pm-spec-value">{viewingProduct.fabric_purity}</span>
                          </div>
                        )}
                        {viewingProduct.pattern && (
                          <div className="pm-detail-spec-item">
                            <span className="pm-spec-label">Pattern:</span>
                            <span className="pm-spec-value">{viewingProduct.pattern}</span>
                          </div>
                        )}
                        {viewingProduct.ideal_for && (
                          <div className="pm-detail-spec-item">
                            <span className="pm-spec-label">Ideal For:</span>
                            <span className="pm-spec-value">{viewingProduct.ideal_for}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Compliance Information */}
                    {(viewingProduct.compliance || viewingProduct.country_of_origin) && (
                      <div className="pm-detail-compliance">
                        <h3>Compliance Information</h3>
                        <div className="pm-detail-specs-grid">
                          {(viewingProduct.compliance?.country_of_origin || viewingProduct.country_of_origin) && (
                            <div className="pm-detail-spec-item">
                              <span className="pm-spec-label">Country of Origin:</span>
                              <span className="pm-spec-value">{viewingProduct.compliance?.country_of_origin || viewingProduct.country_of_origin}</span>
                            </div>
                          )}
                          {(viewingProduct.compliance?.manufacturer_details || viewingProduct.manufacturer_details) && (
                            <div className="pm-detail-spec-item">
                              <span className="pm-spec-label">Manufacturer:</span>
                              <span className="pm-spec-value">{viewingProduct.compliance?.manufacturer_details || viewingProduct.manufacturer_details}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pm-detail-actions">
                      <button 
                        className="pm-detail-btn edit"
                        onClick={() => {
                          handleEdit(viewingProduct);
                          setViewingProduct(null);
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit Product
                      </button>
                      <button 
                        className="pm-detail-btn delete"
                        onClick={() => handleDeleteClick(viewingProduct)}
                        disabled={deletingProductId === viewingProduct.id}
                      >
                        {deletingProductId === viewingProduct.id ? (
                          <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pm-spinner">
                              <circle cx="12" cy="12" r="10" opacity="0.25"/>
                              <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"/>
                            </svg>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                            Delete Product
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Product List */}
          {!showAddForm && !viewingProduct && (
            <div className="pm-products-section">
              {isLoadingProducts ? (
                <div className="pm-empty-state">
                  <h3>Loading products...</h3>
                  <p>Please wait while we fetch your products.</p>
                </div>
              ) : listError ? (
                <div className="pm-form-content" style={{padding: 0}}>
                  <div className="pm-api-error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <div>
                      <strong>Couldn’t load products</strong>
                      <p>{listError}</p>
                    </div>
                    <button 
                      type="button" 
                      className="pm-error-close"
                      onClick={() => { setListError(''); fetchProducts({ page: currentPage, limit: pageLimit, is_active: isActiveFilter }); }}
                      title="Retry"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10"/>
                        <polyline points="1 20 1 14 7 14"/>
                        <path d="M3.51 9A9 9 0 0 1 21 10M20.49 15A9 9 0 0 1 3 14"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="pm-empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/>
                    <line x1="18" y1="2" x2="18" y2="10"/>
                    <line x1="14" y1="6" x2="22" y2="6"/>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  </svg>
                  <h3>No Products Yet</h3>
                  <p>Start by adding your first product</p>
                  <button 
                    className="pm-empty-add-btn"
                    onClick={() => {
                      resetForm();
                      setShowAddForm(true);
                      // Fetch dropdown data when opening add form
                      fetchProductTypes();
                      fetchBrands();
                      fetchCategories();
                    }}
                  >
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="pm-products-grid">
                  {products.map((product) => (
                    <div 
                      key={product.id} 
                      className="pm-product-card"
                      onClick={() => handleViewProduct(product)}
                    >
                      <div className="pm-product-image">
                        {product.primary_image ? (
                          <img src={product.primary_image} alt={product.title} />
                        ) : product.images && product.images.length > 0 && product.images.find(img => img.is_primary) ? (
                          <img src={product.images.find(img => img.is_primary).url} alt={product.title} />
                        ) : (
                          <div className="pm-product-placeholder">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="pm-product-info">
                        <h3 className="pm-product-name">{product.title}</h3>
                        <p className="pm-product-meta">
                          {product.brand?.name || brands.find(b => b.id == product.brand_id)?.name || 'No Brand'} • 
                          {product.category?.name || categories.find(c => c.id == product.category_id)?.name || 'No Category'}
                        </p>
                        <p className="pm-product-description">{product.short_description || 'No description'}</p>
                        <div className="pm-product-footer">
                          <div className="pm-product-price">
                            ₹{product.price?.price_mrp || product.price_mrp}
                            {(product.price?.price_sale || product.price_sale) && (
                              <span className="pm-price-original">₹{product.price?.price_sale || product.price_sale}</span>
                            )}
                          </div>
                          <div className="pm-product-stock">Stock: {product.inventory?.stock_qty || product.stock_qty || 0} {product.unit || 'meter'}</div>
                        </div>
                      </div>
                      <div className="pm-product-actions">
                        <button 
                          className="pm-action-btn edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(product);
                          }}
                          title="Edit Product"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button 
                          className="pm-action-btn delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(product);
                          }}
                          title="Delete Product"
                          disabled={deletingProductId === product.id}
                          style={{
                            opacity: deletingProductId === product.id ? 0.6 : 1,
                            cursor: deletingProductId === product.id ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {deletingProductId === product.id ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pm-spinner">
                              <circle cx="12" cy="12" r="10" opacity="0.25"/>
                              <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"/>
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add/Edit Product Form */}
          {showAddForm && (
            <div className="pm-form-layout">
              {/* Progress Indicator */}
              <div className="pm-progress-container">
                <div className="pm-progress-steps">
                  {sections.map((section, index) => {
                    const currentIndex = sections.indexOf(activeSection);
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;
                    const isNext = index === currentIndex + 1;
                    
                    return (
                      <div key={section} className="pm-progress-step-wrapper">
                        <div className={`pm-progress-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isNext ? 'next' : ''}`}>
                          {isCompleted ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : (
                            <span className="pm-step-number">{index + 1}</span>
                          )}
                        </div>
                        <span className="pm-step-label">{sectionLabels[section]}</span>
                        {index < sections.length - 1 && (
                          <div className={`pm-progress-line ${isCompleted ? 'completed' : ''}`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pm-form-main-layout">
                {/* Left: Form */}
                <div className="pm-form-section-wrapper">
                  <div className="pm-form-section">
                    <div className="pm-form-header">
                      <h2 className="pm-form-title">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </h2>
                      <button className="pm-form-close" onClick={handleCancel} title="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>

                    {/* Section Navigation */}
                    <div className="pm-form-sections">
                      {sections.map((section) => {
                        const sectionIndex = sections.indexOf(section);
                        const currentIndex = sections.indexOf(activeSection);
                        const currentSectionErrors = validateSection(activeSection);
                        
                        // Allow clicking on:
                        // 1. Current section (always allowed)
                        // 2. Previous sections (always allowed - can go back)
                        // 3. Next section only if current section has no errors
                        // 4. Future sections beyond next are disabled
                        const isCurrentSection = sectionIndex === currentIndex;
                        const isPreviousSection = sectionIndex < currentIndex;
                        const isNextSection = sectionIndex === currentIndex + 1;
                        const canNavigate = isCurrentSection || isPreviousSection || (isNextSection && currentSectionErrors.length === 0);
                        
                        return (
                          <button 
                            key={section}
                            className={`pm-section-tab ${activeSection === section ? 'active' : ''} ${!canNavigate ? 'disabled' : ''}`}
                            onClick={() => {
                              if (isCurrentSection) {
                                // Current section - just set it
                                setActiveSection(section);
                              } else if (isPreviousSection) {
                                // Going back - always allowed
                                setActiveSection(section);
                              } else if (isNextSection) {
                                // Going forward - validate first
                                handleSectionChange(section, 'next');
                              }
                              // Future sections beyond next are disabled, so no action
                            }}
                            disabled={!canNavigate}
                            title={!canNavigate ? 'Please complete all required fields in current section before proceeding' : ''}
                          >
                            {sectionLabels[section]}
                          </button>
                        );
                      })}
                    </div>

              <form className="pm-form" onSubmit={handleSubmit}>
                {/* Basic Information Section */}
                {activeSection === 'basic' && (
                  <div className="pm-form-content">
                    <h3 className="pm-section-title">Basic Information</h3>
                    
                    <div className="pm-form-group">
                      <label htmlFor="title" className="pm-form-label">
                        Product Title <span className="pm-required">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        className={`pm-form-input ${fieldErrors.title ? 'error' : ''}`}
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Premium Cotton Shirt Fabric"
                        required
                      />
                      {fieldErrors.title && (
                        <div className="pm-field-error">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          <span>{fieldErrors.title}</span>
                        </div>
                      )}
                    </div>

                    <div className="pm-form-row">
                      <div className="pm-form-group">
                        <label htmlFor="brand_id" className="pm-form-label">Brand</label>
                        <select
                          id="brand_id"
                          name="brand_id"
                          className="pm-form-input"
                          value={formData.brand_id}
                          onChange={handleInputChange}
                          disabled={isLoadingBrands}
                        >
                          <option value="">
                            {isLoadingBrands ? 'Loading...' : 'Select Brand'}
                          </option>
                          {brands && brands.length > 0 ? (
                            brands.map((brand, index) => {
                              const brandId = brand.BrandId || brand.id || brand.brand_id || index;
                              const brandName = brand.BrandName || brand.Brand || brand.name || brand.brand_name;
                              return (
                                <option key={brandId} value={brandId}>{brandName}</option>
                              );
                            })
                          ) : !isLoadingBrands && (
                            <option value="" disabled>No brands available</option>
                          )}
                        </select>
                      </div>

                      <div className="pm-form-group">
                        <label htmlFor="category_id" className="pm-form-label">
                          Category <span className="pm-required">*</span>
                        </label>
                        <select
                          id="category_id"
                          name="category_id"
                          className={`pm-form-input ${fieldErrors.category_id ? 'error' : ''}`}
                          value={formData.category_id}
                          onChange={handleInputChange}
                          disabled={isLoadingCategories}
                          required
                        >
                          <option value="">
                            {isLoadingCategories ? 'Loading...' : 'Select Category'}
                          </option>
                          {categories && categories.length > 0 ? (
                            categories.map((category, index) => {
                              const categoryId = category.CategoryId || category.id || category.category_id || index;
                              const categoryName = category.CategoryName || category.Category || category.name || category.category_name;
                              return (
                                <option key={categoryId} value={categoryId}>{categoryName}</option>
                              );
                            })
                          ) : !isLoadingCategories && (
                            <option value="" disabled>No categories available</option>
                          )}
                        </select>
                        {fieldErrors.category_id && (
                          <div className="pm-field-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="12" y1="8" x2="12" y2="12"/>
                              <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <span>{fieldErrors.category_id}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pm-form-row">
                      <div className="pm-form-group">
                        <label htmlFor="sku" className="pm-form-label">SKU</label>
                        <input
                          type="text"
                          id="sku"
                          name="sku"
                          className="pm-form-input"
                          value={formData.sku}
                          onChange={handleInputChange}
                          placeholder="Product SKU"
                        />
                      </div>

                      <div className="pm-form-group">
                        <label htmlFor="style_code" className="pm-form-label">Style Code</label>
                        <input
                          type="text"
                          id="style_code"
                          name="style_code"
                          className="pm-form-input"
                          value={formData.style_code}
                          onChange={handleInputChange}
                          placeholder="Style Code"
                        />
                      </div>
                    </div>

                    <div className="pm-form-group">
                      <label htmlFor="model_name" className="pm-form-label">Model Name</label>
                      <input
                        type="text"
                        id="model_name"
                        name="model_name"
                        className="pm-form-input"
                        value={formData.model_name}
                        onChange={handleInputChange}
                        placeholder="Model Name"
                      />
                    </div>

                    <div className="pm-form-group">
                      <label htmlFor="short_description" className="pm-form-label">Short Description</label>
                      <textarea
                        id="short_description"
                        name="short_description"
                        className="pm-form-textarea"
                        value={formData.short_description}
                        onChange={handleInputChange}
                        placeholder="Brief description (max 500 characters)"
                        rows="3"
                        maxLength="500"
                      />
                      <span className="pm-char-count">{formData.short_description.length}/500</span>
                    </div>

                    <div className="pm-form-group">
                      <label htmlFor="long_description" className="pm-form-label">Long Description</label>
                      <textarea
                        id="long_description"
                        name="long_description"
                        className="pm-form-textarea"
                        value={formData.long_description}
                        onChange={handleInputChange}
                        placeholder="Detailed product description"
                        rows="6"
                      />
                    </div>

                    <div className="pm-form-group">
                      <label htmlFor="sales_package" className="pm-form-label">Sales Package</label>
                      <input
                        type="text"
                        id="sales_package"
                        name="sales_package"
                        className="pm-form-input"
                        value={formData.sales_package}
                        onChange={handleInputChange}
                        placeholder="e.g., 1 Piece"
                      />
                    </div>

                    <div className="pm-form-group">
                      <label className="pm-form-label-checkbox">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                        />
                        <span>Product is Active</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Product Details Section */}
                {activeSection === 'details' && (
                  <div className="pm-form-content">
                    <h3 className="pm-section-title">Product Details</h3>
                    
                    <div className="pm-form-group">
                      <label htmlFor="product_type" className="pm-form-label">Product Type</label>
                      <select
                        id="product_type"
                        name="product_type"
                        className="pm-form-input"
                        value={formData.product_type}
                        onChange={handleInputChange}
                        disabled={isLoadingProductTypes}
                      >
                        <option value="">
                          {isLoadingProductTypes ? 'Loading...' : 'Select Type'}
                        </option>
                        {productTypes && productTypes.length > 0 ? (
                          productTypes.map((type, index) => {
                            // Handle both string and object formats
                            let typeValue, typeId;
                            
                            if (typeof type === 'string') {
                              typeValue = type;
                              typeId = index;
                            } else {
                              // Check various property name formats
                              typeValue = type.ProductType || type.name || type.type || type.product_type || type.value;
                              typeId = type.ProductTypeId || type.id || type.product_type_id || index;
                            }
                            
                            // Skip if no valid value
                            if (!typeValue) return null;
                            
                            return (
                              <option key={typeId} value={typeValue}>
                                {typeValue}
                              </option>
                            );
                          })
                        ) : !isLoadingProductTypes && (
                          <option value="" disabled>No product types available</option>
                        )}
                      </select>
                    </div>

                    <div className="pm-form-row">
                      <div className="pm-form-group">
                        <label htmlFor="color" className="pm-form-label">Color</label>
                        <input
                          type="text"
                          id="color"
                          name="color"
                          className="pm-form-input"
                          value={formData.color}
                          onChange={handleInputChange}
                          placeholder="e.g., Navy Blue"
                        />
                      </div>

                      <div className="pm-form-group">
                        <label htmlFor="brand_color" className="pm-form-label">Brand Color</label>
                        <input
                          type="text"
                          id="brand_color"
                          name="brand_color"
                          className="pm-form-input"
                          value={formData.brand_color}
                          onChange={handleInputChange}
                          placeholder="Brand specific color name"
                        />
                      </div>
                    </div>

                    <div className="pm-form-group">
                      <label htmlFor="fabric" className="pm-form-label">Fabric</label>
                      <input
                        type="text"
                        id="fabric"
                        name="fabric"
                        className="pm-form-input"
                        value={formData.fabric}
                        onChange={handleInputChange}
                        placeholder="e.g., Cotton, Linen, Giza Cotton"
                      />
                    </div>

                    <div className="pm-form-row">
                      <div className="pm-form-group">
                        <label htmlFor="fabric_purity" className="pm-form-label">Fabric Purity</label>
                        <select
                          id="fabric_purity"
                          name="fabric_purity"
                          className="pm-form-input"
                          value={formData.fabric_purity}
                          onChange={handleInputChange}
                        >
                          <option value="">Select</option>
                          <option value="Pure">Pure</option>
                          <option value="Blend">Blend</option>
                        </select>
                      </div>

                      <div className="pm-form-group">
                        <label htmlFor="pattern" className="pm-form-label">Pattern</label>
                        <select
                          id="pattern"
                          name="pattern"
                          className="pm-form-input"
                          value={formData.pattern}
                          onChange={handleInputChange}
                        >
                          <option value="">Select</option>
                          <option value="Solid">Solid</option>
                          <option value="Checkered">Checkered</option>
                          <option value="Striped">Striped</option>
                          <option value="Printed">Printed</option>
                          <option value="Plain">Plain</option>
                        </select>
                      </div>
                    </div>

                    <div className="pm-form-group">
                      <label htmlFor="composition" className="pm-form-label">Composition</label>
                      <input
                        type="text"
                        id="composition"
                        name="composition"
                        className="pm-form-input"
                        value={formData.composition}
                        onChange={handleInputChange}
                        placeholder="e.g., 90% Cotton / 10% Polyester"
                      />
                    </div>

                    <div className="pm-form-row">
                      <div className="pm-form-group">
                        <label htmlFor="stitching_type" className="pm-form-label">Stitching Type</label>
                        <select
                          id="stitching_type"
                          name="stitching_type"
                          className="pm-form-input"
                          value={formData.stitching_type}
                          onChange={handleInputChange}
                        >
                          <option value="">Select</option>
                          <option value="Unstitched">Unstitched</option>
                          <option value="Stitched">Stitched</option>
                        </select>
                      </div>

                      <div className="pm-form-group">
                        <label htmlFor="ideal_for" className="pm-form-label">Ideal For</label>
                        <select
                          id="ideal_for"
                          name="ideal_for"
                          className="pm-form-input"
                          value={formData.ideal_for}
                          onChange={handleInputChange}
                        >
                          <option value="">Select</option>
                          <option value="Men">Men</option>
                          <option value="Women">Women</option>
                          <option value="Unisex">Unisex</option>
                        </select>
                      </div>
                    </div>

                    <div className="pm-form-row">
                      <div className="pm-form-group">
                        <label htmlFor="top_length_value" className="pm-form-label">Top Length Value</label>
                        <input
                          type="number"
                          id="top_length_value"
                          name="top_length_value"
                          className="pm-form-input"
                          value={formData.top_length_value}
                          onChange={handleInputChange}
                          placeholder="1.6"
                          step="0.01"
                          min="0"
                        />
                      </div>

                      <div className="pm-form-group">
                        <label htmlFor="top_length_unit" className="pm-form-label">Unit</label>
                        <select
                          id="top_length_unit"
                          name="top_length_unit"
                          className="pm-form-input"
                          value={formData.top_length_unit}
                          onChange={handleInputChange}
                        >
                          <option value="m">Meter (m)</option>
                          <option value="cm">Centimeter (cm)</option>
                          <option value="ft">Feet (ft)</option>
                          <option value="yd">Yard (yd)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pm-form-group">
                      <label htmlFor="unit" className="pm-form-label">
                        Product Unit <span className="pm-required">*</span>
                      </label>
                      <select
                        id="unit"
                        name="unit"
                        className="pm-form-input"
                        value={formData.unit}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="meter">Meter</option>
                        <option value="piece">Piece</option>
                        <option value="yard">Yard</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Pricing Section */}
                {activeSection === 'pricing' && (
                  <div className="pm-form-content">
                    <h3 className="pm-section-title">Pricing Information</h3>
                    
                    <div className="pm-form-group">
                      <label htmlFor="currency_code" className="pm-form-label">Currency</label>
                      <select
                        id="currency_code"
                        name="currency_code"
                        className="pm-form-input"
                        value={formData.currency_code}
                        onChange={handleInputChange}
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>

                    <div className="pm-form-row">
                      <div className="pm-form-group">
                        <label htmlFor="price_mrp" className="pm-form-label">
                          MRP Price <span className="pm-required">*</span>
                        </label>
                        <input
                          type="number"
                          id="price_mrp"
                          name="price_mrp"
                          className={`pm-form-input ${fieldErrors.price_mrp ? 'error' : ''}`}
                          value={formData.price_mrp}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          required
                        />
                        {fieldErrors.price_mrp && (
                          <div className="pm-field-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="12" y1="8" x2="12" y2="12"/>
                              <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <span>{fieldErrors.price_mrp}</span>
                          </div>
                        )}
                      </div>

                      <div className="pm-form-group">
                        <label htmlFor="price_sale" className="pm-form-label">Sale Price (Optional)</label>
                        <input
                          type="number"
                          id="price_sale"
                          name="price_sale"
                          className="pm-form-input"
                          value={formData.price_sale}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                        {formData.price_mrp && formData.price_sale && (
                          <span className="pm-discount-info">
                            Discount: {((1 - formData.price_sale / formData.price_mrp) * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Images Section */}
                {activeSection === 'images' && (
                  <div className="pm-form-content">
                    <h3 className="pm-section-title">
                      Product Images <span className="pm-required" style={{fontSize: '0.9rem'}}>*</span>
                    </h3>
                    
                    <div className={`pm-images-section ${fieldErrors.images ? 'has-error' : ''}`}>
                      <input
                        type="file"
                        id="image-file-input"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleImageFileSelect}
                      />
                      <button
                        type="button"
                        className="pm-add-image-btn"
                        onClick={handleAddImage}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Upload Images
                      </button>
                      <p className="pm-image-upload-hint">
                        You can select multiple images at once (JPG, PNG, GIF, etc. Max 10 images, 5MB per image)
                      </p>

                      {fieldErrors.images && (
                        <div className="pm-field-error">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          <span>{fieldErrors.images}</span>
                        </div>
                      )}

                      <div className="pm-images-grid">
                        {productImages.map((image) => (
                          <div key={image.id} className="pm-image-card">
                            <img src={image.url} alt="Product" onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }} />
                            <div className="pm-image-placeholder" style={{ display: 'none' }}>
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              </svg>
                              <span>Invalid URL</span>
                            </div>
                            <div className="pm-image-actions">
                              {image.is_primary && (
                                <span className="pm-image-primary-badge">Primary</span>
                              )}
                              <button
                                type="button"
                                className="pm-image-btn primary"
                                onClick={() => handleSetPrimaryImage(image.id)}
                                disabled={image.is_primary}
                              >
                                Set Primary
                              </button>
                              <button
                                type="button"
                                className="pm-image-btn delete"
                                onClick={() => handleRemoveImage(image.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Inventory Section */}
                {activeSection === 'inventory' && (
                  <div className="pm-form-content">
                    <h3 className="pm-section-title">Inventory Management</h3>
                    
                    <div className="pm-form-group">
                      <label htmlFor="stock_qty" className="pm-form-label">
                        Stock Quantity <span className="pm-required">*</span>
                      </label>
                      <input
                        type="number"
                        id="stock_qty"
                        name="stock_qty"
                        className={`pm-form-input ${fieldErrors.stock_qty ? 'error' : ''}`}
                        value={formData.stock_qty}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                      <span className="pm-input-hint">Unit: {formData.unit || 'meter'}</span>
                      {fieldErrors.stock_qty && (
                        <div className="pm-field-error">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          <span>{fieldErrors.stock_qty}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Compliance Section */}
                {activeSection === 'compliance' && (
                  <div className="pm-form-content">
                    <h3 className="pm-section-title">Compliance Information</h3>
                    
                    <div className="pm-form-group">
                      <label htmlFor="country_of_origin" className="pm-form-label">Country of Origin</label>
                      <input
                        type="text"
                        id="country_of_origin"
                        name="country_of_origin"
                        className="pm-form-input"
                        value={formData.country_of_origin}
                        onChange={handleInputChange}
                        placeholder="e.g., India"
                      />
                    </div>

                    <div className="pm-form-group">
                      <label htmlFor="manufacturer_details" className="pm-form-label">Manufacturer Details</label>
                      <textarea
                        id="manufacturer_details"
                        name="manufacturer_details"
                        className="pm-form-textarea"
                        value={formData.manufacturer_details}
                        onChange={handleInputChange}
                        placeholder="Manufacturer name and address"
                        rows="3"
                      />
                    </div>

                    <div className="pm-form-group">
                      <label htmlFor="packer_details" className="pm-form-label">Packer Details</label>
                      <textarea
                        id="packer_details"
                        name="packer_details"
                        className="pm-form-textarea"
                        value={formData.packer_details}
                        onChange={handleInputChange}
                        placeholder="Packer name and address"
                        rows="3"
                      />
                    </div>

                    <div className="pm-form-group">
                      <label htmlFor="importer_details" className="pm-form-label">Importer Details</label>
                      <textarea
                        id="importer_details"
                        name="importer_details"
                        className="pm-form-textarea"
                        value={formData.importer_details}
                        onChange={handleInputChange}
                        placeholder="Importer name and address (if applicable)"
                        rows="3"
                      />
                    </div>

                    <div className="pm-form-group">
                      <label htmlFor="mfg_month_year" className="pm-form-label">Manufacturing Month & Year</label>
                      <input
                        type="text"
                        id="mfg_month_year"
                        name="mfg_month_year"
                        className="pm-form-input"
                        value={formData.mfg_month_year}
                        onChange={handleInputChange}
                        placeholder="e.g., Aug 2025"
                      />
                    </div>

                    <div className="pm-form-group">
                      <label htmlFor="customer_care" className="pm-form-label">Customer Care</label>
                      <textarea
                        id="customer_care"
                        name="customer_care"
                        className="pm-form-textarea"
                        value={formData.customer_care}
                        onChange={handleInputChange}
                        placeholder="Customer care contact details (phone/email/address)"
                        rows="3"
                      />
                    </div>

                    {/* API Error Display */}
                    {apiError && (
                      <div className="pm-api-error">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <div>
                          <strong>Error:</strong>
                          <p>{apiError}</p>
                        </div>
                        <button 
                          type="button" 
                          className="pm-error-close"
                          onClick={() => setApiError('')}
                          title="Dismiss error"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                    {/* Form Actions */}
                    <div className="pm-form-actions">
                      <button type="button" className="pm-form-btn cancel" onClick={handleCancel}>
                        Cancel
                      </button>
                      <div className="pm-form-nav-buttons">
                        {activeSection !== 'basic' && (
                          <button 
                            type="button" 
                            className="pm-form-btn secondary"
                            onClick={() => handleSectionChange(sections[sections.indexOf(activeSection) - 1], 'prev')}
                          >
                            ← Previous
                          </button>
                        )}
                        {activeSection !== 'compliance' && (
                          <button 
                            type="button" 
                            className="pm-form-btn secondary"
                            onClick={() => {
                              const currentIndex = sections.indexOf(activeSection);
                              if (currentIndex < sections.length - 1) {
                                handleSectionChange(sections[currentIndex + 1], 'next');
                              }
                            }}
                          >
                            Next →
                          </button>
                        )}
                        {activeSection === 'compliance' && (
                          <button 
                            type="submit" 
                            className="pm-form-btn submit"
                            disabled={isSubmitting}
                          >
                            <span>
                              {isSubmitting 
                                ? 'Adding Product...' 
                                : (editingProduct ? 'Update Product' : 'Add Product')
                              }
                            </span>
                            {!isSubmitting && (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"/>
                              </svg>
                            )}
                            {isSubmitting && (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spinning">
                                <circle cx="12" cy="12" r="10" opacity="0.25"/>
                                <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"/>
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    </form>
                  </div>
                </div>

                {/* Right: Sidebar */}
                <div className="pm-sidebar">
                <div className="pm-sidebar-card">
                  <div className="pm-sidebar-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    <h3>Why Sell on Fit Formal?</h3>
                  </div>
                  <ul className="pm-benefits-list">
                    <li>
                      <div className="pm-benefit-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                      <div>
                        <strong>Sell Across India</strong>
                        <p>Reach customers across all major cities and regions</p>
                      </div>
                    </li>
                    <li>
                      <div className="pm-benefit-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23"/>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                      </div>
                      <div>
                        <strong>Higher Profits</strong>
                        <p>Low commission rates, keep more of your earnings</p>
                      </div>
                    </li>
                    <li>
                      <div className="pm-benefit-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                      </div>
                      <div>
                        <strong>Account Management</strong>
                        <p>Dedicated support team to help grow your business</p>
                      </div>
                    </li>
                    <li>
                      <div className="pm-benefit-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                          <line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                      </div>
                      <div>
                        <strong>Easy Returns</strong>
                        <p>Low return charges, ship products stress-free</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="pm-sidebar-card testimonial">
                  <div className="pm-testimonial-avatar">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <p className="pm-testimonial-text">
                    "Starting with 1 product, Fit Formal helped me expand to multiple categories with significant growth!"
                  </p>
                  <p className="pm-testimonial-author">
                    <strong>Raju Lunawath</strong>
                    <span>Amazestore</span>
                  </p>
                </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`pm-toast ${toast.type}`}>
          <div className="pm-toast-content">
            {toast.type === 'success' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
            <span className="pm-toast-message">{toast.message}</span>
          </div>
          <button 
            className="pm-toast-close" 
            onClick={() => setToast({ show: false, message: '', type: '' })}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="pm-modal-overlay" onClick={handleDeleteCancel}>
          <div className="pm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pm-modal-header">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pm-modal-icon">
                <circle cx="12" cy="12" r="10" style={{ stroke: '#FF3B30' }}/>
                <line x1="12" y1="8" x2="12" y2="12" style={{ stroke: '#FF3B30' }}/>
                <line x1="12" y1="16" x2="12.01" y2="16" style={{ stroke: '#FF3B30' }}/>
              </svg>
              <h2 className="pm-modal-title">Delete Product?</h2>
            </div>
            <div className="pm-modal-body">
              <p className="pm-modal-message">
                Are you sure you want to delete <strong>{productToDelete?.title || 'this product'}</strong>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="pm-modal-actions">
              <button 
                className="pm-modal-btn cancel" 
                onClick={handleDeleteCancel}
                disabled={deletingProductId !== null}
              >
                Cancel
              </button>
              <button 
                className="pm-modal-btn confirm" 
                onClick={handleDeleteConfirm}
                disabled={deletingProductId !== null}
              >
                {deletingProductId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
