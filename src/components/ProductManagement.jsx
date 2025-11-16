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
  
  // Brands and Categories - In real app, these would come from API
  const [brands] = useState([
    { id: 1, name: 'Raymond' },
    { id: 2, name: 'Arrow' },
    { id: 3, name: 'Park Avenue' },
    { id: 4, name: 'Allen Solly' },
    { id: 5, name: 'Van Heusen' }
  ]);

  const [categories] = useState([
    { id: 1, name: 'Shirt Fabric' },
    { id: 2, name: 'Suiting' },
    { id: 3, name: 'Trouser Fabric' },
    { id: 4, name: 'Formal Wear' },
    { id: 5, name: 'Casual Wear' }
  ]);

  const [productImages, setProductImages] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({}); // Store field-level errors
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for form submission
  const [apiError, setApiError] = useState(''); // API error message
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [listError, setListError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [isActiveFilter, setIsActiveFilter] = useState(undefined); // undefined | true | false

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
      
      const response = await fetch('/api/products', {
        method: 'POST',
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
          setApiError(errorMessages || data.message || 'Failed to add product. Please check your input.');
        } else {
          setApiError(data.message || 'Failed to add product. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }
      
      // Success - add product to local state if needed
      if (data && data.id) {
        setProducts(prev => [...prev, {
          id: data.id,
          ...formData,
          images: productImages
        }]);
      }
      
      // Refresh list and show products
      await fetchProducts({ page: 1, limit: pageLimit, is_active: isActiveFilter });
      // Reset form and show the list view
      setFieldErrors({});
      resetForm();
      setShowAddForm(false);
      alert('Product added successfully!');
      
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
      stock_qty: product.stock_qty || '',
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
  };

  /**
   * Delete a product
   */
  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(product => product.id !== productId));
    }
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
          {/* Product List */}
          {!showAddForm && (
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
                    }}
                  >
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="pm-products-grid">
                  {products.map((product) => (
                    <div key={product.id} className="pm-product-card">
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
                          <div className="pm-product-stock">Stock: {product.stock_qty || 0} {product.unit || 'meter'}</div>
                        </div>
                      </div>
                      <div className="pm-product-actions">
                        <button 
                          className="pm-action-btn edit"
                          onClick={() => handleEdit(product)}
                          title="Edit Product"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button 
                          className="pm-action-btn delete"
                          onClick={() => handleDelete(product.id)}
                          title="Delete Product"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
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
                        >
                          <option value="">Select Brand</option>
                          {brands.map(brand => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                          ))}
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
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
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
                      >
                        <option value="">Select Type</option>
                        <option value="Shirt Fabric">Shirt Fabric</option>
                        <option value="Suiting">Suiting</option>
                        <option value="Trouser Fabric">Trouser Fabric</option>
                        <option value="Formal Wear">Formal Wear</option>
                        <option value="Casual Wear">Casual Wear</option>
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
    </div>
  );
};

export default ProductManagement;
