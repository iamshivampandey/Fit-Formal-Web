import { useState, useEffect } from 'react';
import './BusinessInfoForm.css';

const BusinessInfoForm = ({ 
  onSubmit,
  onBack,
  sellerType = '',
  initialData = {},
  businessId = null,  // Add businessId prop for edit mode
  userId = null,      // Add userId prop
  authToken = null,   // Add auth token prop
  onShowToast = null,  // Add toast callback prop
  onSuccess = null     // Add success callback for navigation (e.g., redirect to dashboard)
}) => {
  // Check if we're in edit mode
  const isEditMode = !!businessId;
  
  // Check if user is a Tailor or TaylorSeller (services apply to both)
  const isTailorRole = sellerType === 'Tailor' || sellerType === 'Taylorseller';
  const [formData, setFormData] = useState({
    // Basic Information
    businessName: initialData.businessName || '',
    ownerName: initialData.ownerName || '',
    businessLogo: initialData.businessLogo || '',
    businessDescription: initialData.businessDescription || '',
    
    // Contact & Location
    mobileNumber: initialData.mobileNumber || '',
    alternateNumber: initialData.alternateNumber || '',
    email: initialData.email || '',
    shopAddress: initialData.shopAddress || '',
    googleMapLink: initialData.googleMapLink || '',
    gpsLatitude: initialData.gpsLatitude || '',
    gpsLongitude: initialData.gpsLongitude || '',
    workingCity: initialData.workingCity || '',
    
    // Services Details
    serviceTypes: initialData.serviceTypes || [],
    tailoringCategories: initialData.tailoringCategories || [],
    specialization: initialData.specialization || '',
    
    // Experience
    yearsOfExperience: initialData.yearsOfExperience || '',
    portfolioPhotos: initialData.portfolioPhotos || [],
    certifications: initialData.certifications || '',
    
    // Availability
    openingTime: initialData.openingTime || '',
    closingTime: initialData.closingTime || '',
    weeklyOff: initialData.weeklyOff || ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Parse serviceTypes if it's a JSON string, otherwise use as array
  const parseServiceTypes = (services) => {
    if (!services) return [];
    if (Array.isArray(services)) return services;
    if (typeof services === 'string') {
      try {
        return JSON.parse(services);
      } catch (e) {
        return [];
      }
    }
    return [];
  };
  
  const [selectedServices, setSelectedServices] = useState(parseServiceTypes(initialData.serviceTypes));
  const parseTailoringCategories = (categories) => {
    if (!categories) return [];
    if (Array.isArray(categories)) return categories;
    if (typeof categories === 'string') {
      try {
        return JSON.parse(categories);
      } catch (e) {
        return [];
      }
    }
    return [];
  };
  const initialTailoringCategories = parseTailoringCategories(initialData.tailoringCategories);
  const [selectedTailoringCategories, setSelectedTailoringCategories] = useState(initialTailoringCategories);
  
  // Initialize initiallyLoadedCategories with categories from initialData (for edit mode)
  useEffect(() => {
    if (isEditMode && initialTailoringCategories.length > 0) {
      setInitiallyLoadedCategories(new Set(initialTailoringCategories));
      setAllSelectedCategoriesHistory(new Set(initialTailoringCategories));
      console.log('📌 Initialized initiallyLoadedCategories from initialData:', initialTailoringCategories);
    }
  }, [isEditMode]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initialData.businessLogo || '');
  const [tailoringCategoryOptions, setTailoringCategoryOptions] = useState([]);
  const [tailoringCategoryObjects, setTailoringCategoryObjects] = useState([]); // Store full objects with ItemId
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  // Store details for each selected category
  const [categoryDetails, setCategoryDetails] = useState({});
  // Track initially loaded categories (from API) to handle deselection
  const [initiallyLoadedCategories, setInitiallyLoadedCategories] = useState(new Set());
  // Track all categories that have been selected at any point (for deselection tracking)
  const [allSelectedCategoriesHistory, setAllSelectedCategoriesHistory] = useState(new Set());

  const serviceOptions = [
    'Custom Tailoring',
    'Alterations',
    'Formal Suits',
    'Wedding Attire',
    'Party Wear',
    'Fabric Sales',
    'Measurements at Home',
    'Express Service'
  ];

  // Function to load tailor item prices into the form
  const loadTailorItemPricesIntoForm = (itemPrices) => {
    console.log('🚀 loadTailorItemPricesIntoForm CALLED with:', itemPrices);
    
    if (!Array.isArray(itemPrices) || itemPrices.length === 0) {
      console.warn('⚠️ loadTailorItemPricesIntoForm: Invalid or empty itemPrices array');
      return;
    }

    console.log('📝 Loading tailor item prices into form:', itemPrices);

    // Check if Name is in response - if so, we can proceed without waiting for categories
    const hasNameInResponse = itemPrices.some(item => item.Name || item.name);
    console.log('🔍 Has Name in response:', hasNameInResponse, 'Categories available:', tailoringCategoryObjects.length);
    
    // If Name is NOT in response, we need to wait for categories to map ItemId to Name
    if (!hasNameInResponse && tailoringCategoryObjects.length === 0) {
      console.log('⏳ Waiting for tailoring categories to load (Name not in response)...');
      // Retry after a short delay
      setTimeout(() => {
        if (tailoringCategoryObjects.length > 0) {
          console.log('✅ Categories loaded, retrying loadTailorItemPricesIntoForm...');
          loadTailorItemPricesIntoForm(itemPrices);
        } else {
          console.warn('⚠️ Categories still not loaded after timeout');
        }
      }, 500);
      return;
    }
    
    console.log('✅ Proceeding to load item prices into form...');

    // Create a map of ItemId to category name from tailoringCategoryObjects
    const itemIdToCategoryName = {};
    tailoringCategoryObjects.forEach(cat => {
      const itemId = cat.ItemId || cat.itemId || cat.id;
      const catName = cat.Name || cat.name || cat.categoryName || cat.itemName || String(cat);
      if (itemId) {
        itemIdToCategoryName[itemId] = catName;
      }
    });

    // Process each item price
    const loadedCategories = [];
    const loadedDetails = {};
    const categoriesToAddToOptions = [];

    itemPrices.forEach(itemPrice => {
      const itemId = itemPrice.ItemId || itemPrice.itemId || itemPrice.id;
      
      // Prioritize Name from API response, fallback to mapping from tailoringCategoryObjects
      let categoryName = itemPrice.Name || itemPrice.name || itemIdToCategoryName[itemId];

      if (categoryName) {
        // Add to selected categories if not already there
        if (!loadedCategories.includes(categoryName)) {
          loadedCategories.push(categoryName);
        }

        // If category name came from API response and not in options, add it to options
        if ((itemPrice.Name || itemPrice.name) && !tailoringCategoryOptions.includes(categoryName)) {
          categoriesToAddToOptions.push({
            Name: categoryName,
            ItemId: itemId
          });
        }

        // Load details for this category
        loadedDetails[categoryName] = {
          ItemId: itemId,
          FullPrice: itemPrice.FullPrice !== null && itemPrice.FullPrice !== undefined 
            ? String(itemPrice.FullPrice) 
            : (itemPrice.fullPrice !== null && itemPrice.fullPrice !== undefined ? String(itemPrice.fullPrice) : ''),
          DiscountPrice: itemPrice.DiscountPrice !== null && itemPrice.DiscountPrice !== undefined 
            ? String(itemPrice.DiscountPrice) 
            : (itemPrice.discountPrice !== null && itemPrice.discountPrice !== undefined ? String(itemPrice.discountPrice) : ''),
          DiscountType: itemPrice.DiscountType || itemPrice.discountType || '',
          DiscountValue: itemPrice.DiscountValue !== null && itemPrice.DiscountValue !== undefined 
            ? String(itemPrice.DiscountValue) 
            : (itemPrice.discountValue !== null && itemPrice.discountValue !== undefined ? String(itemPrice.discountValue) : ''),
          EstimatedDays: itemPrice.EstimatedDays !== null && itemPrice.EstimatedDays !== undefined 
            ? String(itemPrice.EstimatedDays) 
            : (itemPrice.estimatedDays !== null && itemPrice.estimatedDays !== undefined ? String(itemPrice.estimatedDays) : ''),
          IsAvailable: itemPrice.IsAvailable !== false && itemPrice.isAvailable !== false,
          Notes: itemPrice.Notes || itemPrice.notes || ''
        };
        
        console.log(`✅ Loaded category "${categoryName}" with details:`, loadedDetails[categoryName]);
      } else {
        console.warn('⚠️ Could not find category name for ItemId:', itemId, 'ItemPrice:', itemPrice);
      }
    });

    // Add missing categories to options and objects
    if (categoriesToAddToOptions.length > 0) {
      const newOptions = [...tailoringCategoryOptions];
      const newObjects = [...tailoringCategoryObjects];
      
      categoriesToAddToOptions.forEach(cat => {
        if (!newOptions.includes(cat.Name)) {
          newOptions.push(cat.Name);
        }
        // Add to objects if not already there
        const exists = newObjects.some(obj => {
          const objItemId = obj.ItemId || obj.itemId || obj.id;
          return objItemId === cat.ItemId;
        });
        if (!exists) {
          newObjects.push({ Name: cat.Name, ItemId: cat.ItemId });
        }
      });
      
      setTailoringCategoryOptions(newOptions);
      setTailoringCategoryObjects(newObjects);
      console.log('✅ Added categories to options:', categoriesToAddToOptions.map(c => c.Name));
    }

    // Update selected categories (replace existing ones)
    if (loadedCategories.length > 0) {
      setSelectedTailoringCategories(loadedCategories);
      setFormData(prev => ({
        ...prev,
        tailoringCategories: loadedCategories
      }));
      // Track initially loaded categories for deselection handling
      // IMPORTANT: Replace the set (don't merge) to ensure we track what was actually loaded from API
      const initialSet = new Set(loadedCategories);
      setInitiallyLoadedCategories(initialSet);
      // Also track in history for deselection
      setAllSelectedCategoriesHistory(prev => {
        const merged = new Set(prev);
        loadedCategories.forEach(cat => merged.add(cat));
        return merged;
      });
      console.log('✅ Updated selected tailoring categories:', loadedCategories);
      console.log('📌 Tracked initially loaded categories (from API):', Array.from(initialSet));
    }

    // Update category details
    if (Object.keys(loadedDetails).length > 0) {
      setCategoryDetails(loadedDetails);
      console.log('✅ Loaded category details:', loadedDetails);
    }
  };

  const fetchTailoringCategories = async () => {
    setLoadingCategories(true);
    setCategoriesError('');
    
    // Fallback categories to use if API fails
    const fallbackCategories = [
      'Pant',
      'Shirt',
      'Kurta',
      'Pyjama',
      'Kurta + Pyjama (Set)',
      'Suit (2-piece)',
      '3-piece Suit (Coat + Pant + Waistcoat)',
      'Blazer',
      'Jacket',
      'Nehru Jacket',
      'Sherwani',
      'Indo-Western',
      'Safari Suit',
      'Wedding Suit',
      'Coat',
      'Waistcoat',
      'Trousers',
      'Pathani Suit',
      'Safari Jacket'
    ];
    
    try {
      console.log('🚀 Fetching tailoring categories from /api/tailor-items');
      
      // Try to get auth token from props or localStorage (may not be available during signup)
      let token = authToken || null;
      if (!token) {
        // Try to get from localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            token = user?.token;
          } catch (e) {
            console.log('No user token available (expected during signup)');
          }
        }
      }
      
      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add auth token if available (may not be available during signup)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Adding authorization token to request');
      } else {
        console.log('⚠️ No auth token available - making unauthenticated request (expected during signup)');
      }
      
      const response = await fetch('/api/tailor-items', {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Response status:', response.status);

      // If unauthorized and we're in signup mode, silently use fallback
      if (response.status === 401 || response.status === 403) {
        console.log('⚠️ API requires authentication - using fallback categories (expected during signup)');
        setTailoringCategoryOptions(fallbackCategories);
        const fallbackObjects = fallbackCategories.map((name) => ({ Name: name, ItemId: null }));
        setTailoringCategoryObjects(fallbackObjects);
        setLoadingCategories(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch tailoring categories: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Tailoring categories data received:', data);

      // Check if response indicates an error
      if (data.success === false) {
        // If it's an auth error, silently use fallback
        if (data.message && (data.message.includes('token') || data.message.includes('Access') || data.message.includes('Unauthorized'))) {
          console.log('⚠️ API requires authentication - using fallback categories (expected during signup)');
          setTailoringCategoryOptions(fallbackCategories);
          const fallbackObjects = fallbackCategories.map((name) => ({ Name: name, ItemId: null }));
          setTailoringCategoryObjects(fallbackObjects);
          setLoadingCategories(false);
          return;
        }
        throw new Error(data.message || 'Failed to fetch tailoring categories');
      }

      // Handle different response structures
      // Expected: { success: true, data: [...] } or { data: [...] } or just [...]
      const categories = data.data || data.items || data.categories || data || [];
      
      if (Array.isArray(categories) && categories.length > 0) {
        // Store full category objects for ItemId access
        setTailoringCategoryObjects(categories);
        
        // If categories are objects with name/id, extract the name
        const categoryNames = categories.map(cat => {
          if (typeof cat === 'string') {
            return cat;
          } else if (cat.Name) {
            return cat.Name;
          } else if (cat.name) {
            return cat.name;
          } else if (cat.categoryName) {
            return cat.categoryName;
          } else if (cat.itemName) {
            return cat.itemName;
          } else {
            return String(cat);
          }
        });
        
        setTailoringCategoryOptions(categoryNames);
        console.log('✅ Tailoring categories set:', categoryNames);
        console.log('✅ Full category objects stored:', categories);
      } else {
        // If empty array or invalid format, use fallback
        console.log('⚠️ Empty or invalid response - using fallback categories');
        setTailoringCategoryOptions(fallbackCategories);
        // Create objects from fallback categories for consistency
        const fallbackObjects = fallbackCategories.map((name, index) => ({
          Name: name,
          ItemId: null
        }));
        setTailoringCategoryObjects(fallbackObjects);
      }
    } catch (err) {
      console.error('❌ Error fetching tailoring categories:', err);
      
      // During signup, auth errors are expected - don't show error message
      const isAuthError = err.message && (
        err.message.includes('Unauthorized') || 
        err.message.includes('token') || 
        err.message.includes('Access')
      );
      
      if (!isAuthError) {
        // Only show error for non-auth errors
        setCategoriesError(err.message || 'Failed to load tailoring categories');
      }
      
      // Always use fallback categories if API fails
      setTailoringCategoryOptions(fallbackCategories);
      const fallbackObjects = fallbackCategories.map((name) => ({ Name: name, ItemId: null }));
      setTailoringCategoryObjects(fallbackObjects);
      console.log('✅ Using fallback categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch tailoring categories from API when component mounts (only for tailor roles)
  useEffect(() => {
    if (isTailorRole) {
      fetchTailoringCategories();
    }
  }, [isTailorRole]);

  // Retry loading tailorItemPrices when categories finish loading (for edit mode)
  useEffect(() => {
    if (!isEditMode || !isTailorRole || loadingCategories) {
      return;
    }

    // Check if we have tailorItemPrices in initialData that haven't been loaded yet
    const itemPricesFromInitialData = initialData.tailorItemPrices || initialData.tailorItems || initialData.tailorItemsPrices;
    if (itemPricesFromInitialData && Array.isArray(itemPricesFromInitialData) && itemPricesFromInitialData.length > 0) {
      // Check if categories are already selected (meaning they've been loaded)
      const hasNameInResponse = itemPricesFromInitialData.some(item => item.Name || item.name);
      const firstItemName = itemPricesFromInitialData[0]?.Name || itemPricesFromInitialData[0]?.name;
      const isCategorySelected = firstItemName && selectedTailoringCategories.includes(firstItemName);
      
      // If categories are loaded but item prices aren't selected yet, load them
      if (tailoringCategoryObjects.length > 0 && !isCategorySelected) {
        console.log('🔄 Categories loaded, retrying to load tailorItemPrices...');
        loadTailorItemPricesIntoForm(itemPricesFromInitialData);
      }
    }
  }, [loadingCategories, tailoringCategoryObjects.length, isEditMode, isTailorRole]);

  // Check initialData for tailorItems when it changes (for edit mode)
  useEffect(() => {
    console.log('🔍 useEffect triggered - isEditMode:', isEditMode, 'isTailorRole:', isTailorRole, 'initialData:', initialData);
    
    if (!isEditMode || !isTailorRole) {
      console.log('⏭️ Skipping - not in edit mode or not tailor role');
      return;
    }

    // Check for tailorItems in initialData (check multiple possible property names)
    const itemPricesFromInitialData = initialData.tailorItemPrices || initialData.tailorItems || initialData.tailorItemsPrices;
    console.log('📦 Checking for tailorItemPrices:', {
      tailorItemPrices: initialData.tailorItemPrices,
      tailorItems: initialData.tailorItems,
      tailorItemsPrices: initialData.tailorItemsPrices,
      found: !!itemPricesFromInitialData,
      isArray: Array.isArray(itemPricesFromInitialData),
      length: itemPricesFromInitialData?.length
    });

    if (itemPricesFromInitialData && Array.isArray(itemPricesFromInitialData) && itemPricesFromInitialData.length > 0) {
      console.log('✅ Found tailorItemPrices in initialData:', itemPricesFromInitialData);
      // Check if Name is in response - if so, we can proceed immediately
      const hasNameInResponse = itemPricesFromInitialData.some(item => item.Name || item.name);
      console.log('📋 Has Name in response:', hasNameInResponse, 'Categories loaded:', tailoringCategoryObjects.length);
      
      // If Name is in response, proceed immediately; otherwise wait for categories
      if (hasNameInResponse || tailoringCategoryObjects.length > 0) {
        console.log('📝 Loading tailorItemPrices into form immediately...');
        loadTailorItemPricesIntoForm(itemPricesFromInitialData);
      } else {
        console.log('⏳ Waiting for tailoring categories to load before processing tailorItemPrices...');
      }
    } else {
      console.log('ℹ️ No tailorItemPrices found in initialData');
    }
  }, [initialData?.tailorItemPrices, initialData?.tailorItems, isEditMode, isTailorRole, tailoringCategoryObjects.length]);

  // Fetch existing tailor item prices when in edit mode
  useEffect(() => {
    const fetchTailorItemPrices = async () => {
      // Only fetch if in edit mode, is tailor role, and businessId is available
      if (!isEditMode || !isTailorRole || !businessId || !authToken) {
        return;
      }

      // Wait for tailoring categories to be loaded first
      if (tailoringCategoryObjects.length === 0 && !loadingCategories) {
        console.log('⏳ Waiting for tailoring categories to load before fetching item prices...');
        return;
      }

      // Skip if we already have data from initialData
      const itemPricesFromInitialData = initialData.tailorItemPrices || initialData.tailorItems || initialData.tailorItemsPrices;
      if (itemPricesFromInitialData && Array.isArray(itemPricesFromInitialData) && itemPricesFromInitialData.length > 0) {
        console.log('ℹ️ Skipping API fetch - using tailorItemPrices from initialData');
        return;
      }

      try {
        console.log('💰 Fetching tailor item prices from API for business:', businessId);
        
        // Fetch from API
        const response = await fetch(`/api/tailor-item-prices/business/${businessId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📡 Tailor item prices API response:', data);
          
          // Handle different response structures
          const itemPrices = data.data || data.itemPrices || data.items || data || [];
          
          if (Array.isArray(itemPrices) && itemPrices.length > 0) {
            console.log('✅ Loaded tailor item prices:', itemPrices);
            loadTailorItemPricesIntoForm(itemPrices);
          } else {
            console.log('ℹ️ No tailor item prices found for this business');
          }
        } else {
          console.warn('⚠️ Failed to fetch tailor item prices:', response.status);
        }
      } catch (error) {
        console.error('❌ Error fetching tailor item prices:', error);
        // Don't show error to user - it's okay if there are no existing prices
      }
    };

    fetchTailorItemPrices();
  }, [isEditMode, isTailorRole, businessId, authToken, tailoringCategoryObjects.length, loadingCategories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (apiError) {
      setApiError('');
    }
  };

  const handleServiceToggle = (service) => {
    const updatedServices = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];
    
    setSelectedServices(updatedServices);
    setFormData(prev => ({
      ...prev,
      serviceTypes: updatedServices
    }));
  };

  const handleTailoringCategoryToggle = (category) => {
    const isCurrentlySelected = selectedTailoringCategories.includes(category);
    const updatedCategories = isCurrentlySelected
      ? selectedTailoringCategories.filter(c => c !== category)
      : [...selectedTailoringCategories, category];
    
    setSelectedTailoringCategories(updatedCategories);
    setFormData(prev => ({
      ...prev,
      tailoringCategories: updatedCategories
    }));
    
    // Track all categories that have been selected (for deselection handling)
    setAllSelectedCategoriesHistory(prev => {
      const newSet = new Set(prev);
      newSet.add(category);
      return newSet;
    });
    
    // Initialize category details if adding, remove if removing
    if (!isCurrentlySelected) {
      // Find the category object to get ItemId
      const categoryObj = tailoringCategoryObjects.find(cat => {
        const catName = cat.Name || cat.name || cat.categoryName || cat.itemName || String(cat);
        return catName === category;
      });
      
      setCategoryDetails(prev => ({
        ...prev,
        [category]: {
          ItemId: categoryObj?.ItemId || categoryObj?.itemId || categoryObj?.id || null,
          FullPrice: '',
          DiscountPrice: '',
          DiscountType: '',
          DiscountValue: '',
          EstimatedDays: '',
          IsAvailable: true,
          Notes: ''
        }
      }));
    } else {
      // Remove details when category is deselected
      setCategoryDetails(prev => {
        const updated = { ...prev };
        delete updated[category];
        return updated;
      });
    }
  };

  const handleCategoryDetailChange = (categoryName, field, value) => {
    setCategoryDetails(prev => ({
      ...prev,
      [categoryName]: {
        ...prev[categoryName],
        [field]: value
      }
    }));
  };

  const getCategoryItemId = (categoryName) => {
    const categoryObj = tailoringCategoryObjects.find(cat => {
      const catName = cat.Name || cat.name || cat.categoryName || cat.itemName || String(cat);
      return catName === categoryName;
    });
    return categoryObj?.ItemId || categoryObj?.itemId || categoryObj?.id || null;
  };

  // Function to save tailor item prices to separate API endpoint
  const saveTailorItemPrices = async (businessId, categoriesWithDetails, token) => {
    try {
      console.log('💰 Saving tailor item prices for business:', businessId);
      console.log('📝 Item prices data:', categoriesWithDetails);
      
      // Prepare item prices data
      const itemPricesData = categoriesWithDetails.map(category => ({
        BusinessId: businessId,
        ItemId: category.ItemId,
        FullPrice: category.FullPrice ? parseFloat(category.FullPrice) : null,
        DiscountPrice: category.DiscountPrice ? parseFloat(category.DiscountPrice) : null,
        DiscountType: category.DiscountType || null,
        DiscountValue: category.DiscountValue ? parseFloat(category.DiscountValue) : null,
        EstimatedDays: category.EstimatedDays ? parseInt(category.EstimatedDays) : null,
        IsAvailable: category.IsAvailable !== false,
        Notes: category.Notes || null
      }));

      // Try batch endpoint first
      try {
        const batchResponse = await fetch('/api/tailor-item-prices/batch', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            businessId: businessId,
            itemPrices: itemPricesData
          })
        });

        if (batchResponse.ok) {
          const batchData = await batchResponse.json();
          console.log('✅ Item prices saved successfully (batch):', batchData);
          return;
        }
      } catch (batchError) {
        console.log('⚠️ Batch endpoint not available, trying individual endpoints...');
      }
      
      // If batch endpoint doesn't exist, send each item price individually
      const promises = itemPricesData.map(itemPrice => 
        fetch('/api/tailor-item-prices', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(itemPrice)
        }).then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to save item price for ItemId ${itemPrice.ItemId}`);
          }
          return response.json();
        })
      );
      
      const results = await Promise.allSettled(promises);
      const failures = results.filter(r => r.status === 'rejected');
      
      if (failures.length > 0) {
        console.warn('⚠️ Some item prices failed to save:', failures);
        failures.forEach(f => console.error('Failed:', f.reason));
      } else {
        console.log('✅ All item prices saved successfully');
      }
    } catch (error) {
      console.error('❌ Error saving tailor item prices:', error);
      // Don't throw error - business is already saved, item prices can be added later
      if (onShowToast) {
        onShowToast('Business saved, but some item prices may need to be added manually.', 'warning');
      }
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          businessLogo: 'Please upload a valid image file (JPG, PNG, GIF, or WebP)'
        }));
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          businessLogo: 'Image size should be less than 5MB'
        }));
        return;
      }
      
      // Clear any previous errors
      setErrors(prev => ({
        ...prev,
        businessLogo: ''
      }));
      
      // Store the file
      setLogoFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          businessLogo: reader.result // Store base64 for now
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setFormData(prev => ({
      ...prev,
      businessLogo: ''
    }));
    // Reset the file input
    const fileInput = document.querySelector('input[name="businessLogo"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[\+]?[1-9][\d]{9,15}$/.test(formData.mobileNumber.replace(/\s/g, ''))) {
      newErrors.mobileNumber = 'Enter a valid mobile number';
    }
    
    if (!formData.workingCity.trim()) {
      newErrors.workingCity = 'Working city is required';
    }
    
    // Service types required only for Tailor roles
    if (isTailorRole && selectedServices.length === 0) {
      newErrors.serviceTypes = 'Please select at least one service';
    }
    
    // Tailoring categories required only for Tailor roles
    if (isTailorRole && selectedTailoringCategories.length === 0) {
      newErrors.tailoringCategories = 'Please select at least one tailoring category';
    }
    
    // Validate category details for each selected category
    if (isTailorRole && selectedTailoringCategories.length > 0) {
      selectedTailoringCategories.forEach(categoryName => {
        const details = categoryDetails[categoryName];
        if (!details || !details.FullPrice || details.FullPrice === '') {
          newErrors[`category_${categoryName}_FullPrice`] = `${categoryName}: Full Price is required`;
        }
        if (!details || !details.EstimatedDays || details.EstimatedDays === '') {
          newErrors[`category_${categoryName}_EstimatedDays`] = `${categoryName}: Estimated Days is required`;
        }
      });
    }
    
    // Optional email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    
    // GPS coordinates validation if provided
    if (formData.gpsLatitude && (isNaN(formData.gpsLatitude) || formData.gpsLatitude < -90 || formData.gpsLatitude > 90)) {
      newErrors.gpsLatitude = 'Latitude must be between -90 and 90';
    }
    
    if (formData.gpsLongitude && (isNaN(formData.gpsLongitude) || formData.gpsLongitude < -180 || formData.gpsLongitude > 180)) {
      newErrors.gpsLongitude = 'Longitude must be between -180 and 180';
    }
    
    // Years of experience validation
    if (formData.yearsOfExperience && (isNaN(formData.yearsOfExperience) || formData.yearsOfExperience < 0)) {
      newErrors.yearsOfExperience = 'Please enter a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    // Prevent duplicate submissions
    if (isSubmitting || isLoading) {
      console.log('⚠️ Submission already in progress, ignoring duplicate request');
      return;
    }
    
    const isValid = validateForm();
    
    if (!isValid) {
      const firstErrorField = document.querySelector('.form-input.error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }
    
    setIsLoading(true);
    setIsSubmitting(true);
    
    try {
      // Prepare category details with ItemId for each selected category
      const tailoringCategoriesWithDetails = selectedTailoringCategories.map(categoryName => {
        const details = categoryDetails[categoryName] || {};
        const itemId = getCategoryItemId(categoryName);
        
        return {
          categoryName: categoryName,
          ItemId: itemId,
          FullPrice: details.FullPrice || null,
          DiscountPrice: details.DiscountPrice || null,
          DiscountType: details.DiscountType || null,
          DiscountValue: details.DiscountValue || null,
          EstimatedDays: details.EstimatedDays || null,
          IsAvailable: true, // Selected categories are always available
          Notes: details.Notes || null
        };
      });

      // Add deselected categories (that were previously loaded) with IsAvailable: false
      // Only send essential fields for deselected categories (no null values)
      // Use both initiallyLoadedCategories and allSelectedCategoriesHistory to catch all cases
      const allInitiallyLoaded = new Set([
        ...Array.from(initiallyLoadedCategories),
        ...Array.from(allSelectedCategoriesHistory)
      ]);
      
      const deselectedCategories = Array.from(allInitiallyLoaded)
        .filter(categoryName => !selectedTailoringCategories.includes(categoryName))
        .map(categoryName => {
          const itemId = getCategoryItemId(categoryName);
          
          // Only send essential fields for deselected categories
          return {
            categoryName: categoryName,
            ItemId: itemId,
            IsAvailable: false // Deselected categories are marked as unavailable
          };
        });
      
      console.log('📌 Initially loaded categories (Set):', Array.from(initiallyLoadedCategories));
      console.log('📌 All selected categories history:', Array.from(allSelectedCategoriesHistory));
      console.log('📌 Combined initially loaded:', Array.from(allInitiallyLoaded));
      console.log('✅ Currently selected categories:', selectedTailoringCategories);
      console.log('🚫 Deselected categories to send:', deselectedCategories);
      console.log('📊 Deselected count:', deselectedCategories.length);

      // Combine selected and deselected categories
      const allCategoriesWithDetails = [...tailoringCategoriesWithDetails, ...deselectedCategories];

      // Prepare data for submission
      const businessData = {
        ...formData,
        serviceTypes: JSON.stringify(selectedServices),
        tailoringCategories: JSON.stringify(selectedTailoringCategories),
        tailoringCategoriesDetails: allCategoriesWithDetails, // Send as array, includes both selected and deselected
        portfolioPhotos: JSON.stringify(formData.portfolioPhotos)
      };
      
      console.log('🏢 BusinessInfoForm - Submitting business data:', businessData);
      console.log('📋 Selected services:', selectedServices);
      console.log('👔 Selected tailoring categories:', selectedTailoringCategories);
      console.log('📝 Category details (selected + deselected):', allCategoriesWithDetails);
      console.log('🚫 Deselected categories:', deselectedCategories);
      console.log('🖼️ Logo file:', logoFile);
      console.log('🖼️ Logo preview:', logoPreview ? 'Present' : 'None');
      console.log('📝 Edit mode:', isEditMode);
      console.log('🆔 Business ID:', businessId);
      
      // If in edit mode, call the API directly
      if (isEditMode && businessId && authToken) {
        console.log('🔄 Calling PUT API to update business...');
        
        const response = await fetch(`/api/business/${businessId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userId,
            ...businessData
          })
        });
        
        const data = await response.json();
        console.log('📡 API Response:', data);
        
        if (response.ok && data.success) {
          console.log('✅ Business updated successfully');
          setApiError('');
          
          // Save the businessId from response or use existing
          const updatedBusinessId = data.data?.businessId || data.data?.id || businessId;
          
          // Save tailor item prices separately (includes both selected and deselected)
          if (isTailorRole && allCategoriesWithDetails.length > 0 && updatedBusinessId) {
            await saveTailorItemPrices(updatedBusinessId, allCategoriesWithDetails, authToken);
          }
          
          // Show success toast
          if (onShowToast) {
            onShowToast('Business information updated successfully!', 'success');
          }
          
          // Call onSuccess callback to navigate (e.g., to dashboard)
          if (onSuccess) {
            console.log('🔄 Calling onSuccess callback to navigate...');
            // Small delay to ensure toast is shown before navigation
            setTimeout(() => {
              onSuccess();
            }, 500);
          }
          
          // Don't call onSubmit in edit mode - we already updated via API
          // onSubmit is only for create mode during signup
        } else {
          throw new Error(data.message || 'Failed to update business information');
        }
      } else {
        // Create mode - use callback
        console.log('📤 Passing data to parent component (create mode)');
        // Include allCategoriesWithDetails in businessData so parent can handle it
        businessData.tailoringCategoriesWithDetailsArray = allCategoriesWithDetails;
        
        if (onSubmit) {
          await onSubmit(businessData);
        }
      }
    } catch (error) {
      console.error('❌ Business info submission error:', error);
      setApiError(error.message || 'An error occurred. Please try again.');
      
      // Show error toast
      if (onShowToast) {
        onShowToast(error.message || 'An error occurred. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="business-info-container">
      <div className="business-info-wrapper">
        {/* Header Section */}
        <div className="header-section">
          <h1 className="business-info-title">
            {isEditMode ? 'Edit Business' : 'Business'} <span className="app-name">Information</span>
          </h1>
          <p className="business-info-description">
            {isEditMode 
              ? 'Update your business information' 
              : 'Tell us about your business to complete your profile'
            }
          </p>
        </div>

        <form className="business-info-form" onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div className="form-section">
            <h2 className="section-title">Basic Information</h2>
            
            <div className="input-group">
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Business Name *"
                className={`form-input ${errors.businessName ? 'error' : ''}`}
              />
              {errors.businessName && <span className="error-message">{errors.businessName}</span>}
            </div>

            <div className="input-group">
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                placeholder="Owner Name"
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label className="service-label">Business Logo</label>
              
              {/* Show existing logo if available and no new upload */}
              {formData.businessLogo && !logoPreview && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e5e5ea',
                  marginBottom: '1rem'
                }}>
                  <img 
                    src={formData.businessLogo} 
                    alt="Current Business Logo" 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      objectFit: 'contain',
                      borderRadius: '8px',
                      background: 'white',
                      border: '1px solid #ddd',
                      padding: '0.5rem'
                    }} 
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
                      Current Logo
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#999' }}>
                      Upload a new file to replace
                    </p>
                  </div>
                </div>
              )}
              
              {/* Show new logo preview if uploaded */}
              {logoPreview && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  padding: '1rem',
                  background: '#e8f5e9',
                  borderRadius: '8px',
                  border: '2px solid #4caf50',
                  marginBottom: '1rem'
                }}>
                  <img 
                    src={logoPreview} 
                    alt="New Business Logo Preview" 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      objectFit: 'contain',
                      borderRadius: '8px',
                      background: 'white',
                      border: '1px solid #ddd',
                      padding: '0.5rem'
                    }} 
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#2e7d32', fontWeight: '600' }}>
                      ✓ New Logo Selected
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Remove New Logo
                    </button>
                  </div>
                </div>
              )}
              
              {/* Custom styled file upload */}
              <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                <label htmlFor="businessLogoInput" className="custom-file-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Choose file
                </label>
                <input
                  type="file"
                  name="businessLogo"
                  id="businessLogoInput"
                  onChange={handleLogoUpload}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  style={{
                    position: 'absolute',
                    width: '0.1px',
                    height: '0.1px',
                    opacity: 0,
                    overflow: 'hidden',
                    zIndex: -1
                  }}
                />
                {logoFile && (
                  <span style={{
                    marginLeft: '1rem',
                    color: '#666',
                    fontSize: '0.9rem',
                    verticalAlign: 'middle'
                  }}>
                    {logoFile.name}
                  </span>
                )}
                {!logoFile && !formData.businessLogo && (
                  <span style={{
                    marginLeft: '1rem',
                    color: '#999',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    verticalAlign: 'middle'
                  }}>
                    No file chosen
                  </span>
                )}
              </div>
              
              <span className="input-hint">
                {formData.businessLogo || logoPreview 
                  ? 'Upload a new logo to replace the current one' 
                  : 'Upload your business logo (JPG, PNG, GIF, or WebP, max 5MB)'
                }
              </span>
              {errors.businessLogo && <span className="error-message">{errors.businessLogo}</span>}
            </div>

            <div className="input-group">
              <textarea
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleInputChange}
                placeholder="Business Description"
                className="form-input textarea-input"
                rows="4"
              />
              <span className="input-hint">Tell customers about your business and services</span>
            </div>
          </div>

          {/* Contact & Location Section */}
          <div className="form-section">
            <h2 className="section-title">Contact & Location</h2>
            
            <div className="input-group">
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                placeholder="Mobile Number *"
                className={`form-input ${errors.mobileNumber ? 'error' : ''}`}
              />
              {errors.mobileNumber && <span className="error-message">{errors.mobileNumber}</span>}
            </div>

            <div className="input-group">
              <input
                type="tel"
                name="alternateNumber"
                value={formData.alternateNumber}
                onChange={handleInputChange}
                placeholder="Alternate Number"
                className="form-input"
              />
            </div>

            <div className="input-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Business Email"
                className={`form-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="input-group">
              <input
                type="text"
                name="workingCity"
                value={formData.workingCity}
                onChange={handleInputChange}
                placeholder="Working City *"
                className={`form-input ${errors.workingCity ? 'error' : ''}`}
              />
              {errors.workingCity && <span className="error-message">{errors.workingCity}</span>}
            </div>

            <div className="input-group">
              <textarea
                name="shopAddress"
                value={formData.shopAddress}
                onChange={handleInputChange}
                placeholder="Shop/Business Address"
                className="form-input textarea-input"
                rows="2"
              />
            </div>

            <div className="input-group">
              <input
                type="url"
                name="googleMapLink"
                value={formData.googleMapLink}
                onChange={handleInputChange}
                placeholder="Google Maps Link"
                className="form-input"
              />
              <span className="input-hint">Share your location for easier navigation</span>
            </div>

            <div className="input-row">
              <div className="input-group">
                <input
                  type="text"
                  name="gpsLatitude"
                  value={formData.gpsLatitude}
                  onChange={handleInputChange}
                  placeholder="GPS Latitude"
                  className={`form-input ${errors.gpsLatitude ? 'error' : ''}`}
                />
                {errors.gpsLatitude && <span className="error-message">{errors.gpsLatitude}</span>}
              </div>

              <div className="input-group">
                <input
                  type="text"
                  name="gpsLongitude"
                  value={formData.gpsLongitude}
                  onChange={handleInputChange}
                  placeholder="GPS Longitude"
                  className={`form-input ${errors.gpsLongitude ? 'error' : ''}`}
                />
                {errors.gpsLongitude && <span className="error-message">{errors.gpsLongitude}</span>}
              </div>
            </div>
          </div>

          {/* Services Section - Only for Tailor roles */}
          {isTailorRole && (
            <div className="form-section">
              <h2 className="section-title">Services Details</h2>
              
              <div className="input-group">
                <label className="service-label">Service Types *</label>
                <div className="service-chips">
                  {serviceOptions.map((service) => (
                    <button
                      key={service}
                      type="button"
                      className={`service-chip ${selectedServices.includes(service) ? 'selected' : ''}`}
                      onClick={() => handleServiceToggle(service)}
                    >
                      {service}
                    </button>
                  ))}
                </div>
                {errors.serviceTypes && <span className="error-message">{errors.serviceTypes}</span>}
              </div>

              <div className="input-group">
                <label className="service-label">Tailoring Categories *</label>
                {loadingCategories ? (
                  <div style={{ 
                    padding: '1rem', 
                    textAlign: 'center', 
                    color: '#666',
                    fontSize: '0.9rem' 
                  }}>
                    Loading categories...
                  </div>
                ) : categoriesError && !categoriesError.includes('Unauthorized') && !categoriesError.includes('token') && !categoriesError.includes('Access') ? (
                  <div style={{ 
                    padding: '1rem', 
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    color: '#856404',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem'
                  }}>
                    ⚠️ {categoriesError}. Using default categories.
                  </div>
                ) : tailoringCategoryOptions.length === 0 ? (
                  <div style={{ 
                    padding: '1rem', 
                    textAlign: 'center', 
                    color: '#999',
                    fontSize: '0.9rem' 
                  }}>
                    No categories available
                  </div>
                ) : (
                  <div className="service-chips">
                    {tailoringCategoryOptions.map((category) => (
                      <button
                        key={category}
                        type="button"
                        className={`service-chip ${selectedTailoringCategories.includes(category) ? 'selected' : ''}`}
                        onClick={() => handleTailoringCategoryToggle(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
                {errors.tailoringCategories && <span className="error-message">{errors.tailoringCategories}</span>}
              </div>

              {/* Selected Categories with Details */}
              {selectedTailoringCategories.length > 0 && (
                <div className="input-group" style={{ marginTop: '2rem' }}>
                  <label className="service-label">Category Details *</label>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                    Please fill in the details for each selected category
                  </p>
                  
                  {selectedTailoringCategories.map((categoryName) => {
                    const details = categoryDetails[categoryName] || {};
                    const itemId = getCategoryItemId(categoryName);
                    
                    return (
                      <div key={categoryName} className="category-details-card" style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        backgroundColor: '#fafafa'
                      }}>
                        <h4 style={{ 
                          margin: '0 0 1rem 0', 
                          color: '#654321',
                          fontSize: '1.1rem',
                          fontWeight: '600'
                        }}>
                          {categoryName}
                          {itemId && <span style={{ fontSize: '0.85rem', color: '#999', marginLeft: '0.5rem' }}>
                            (Item ID: {itemId})
                          </span>}
                        </h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                          {/* Full Price */}
                          <div className="input-group">
                            <label style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                              Full Price *
                            </label>
                            <input
                              type="number"
                              value={details.FullPrice || ''}
                              onChange={(e) => handleCategoryDetailChange(categoryName, 'FullPrice', e.target.value)}
                              placeholder="Enter full price"
                              className={`form-input ${errors[`category_${categoryName}_FullPrice`] ? 'error' : ''}`}
                              min="0"
                              step="0.01"
                            />
                            {errors[`category_${categoryName}_FullPrice`] && (
                              <span className="error-message">{errors[`category_${categoryName}_FullPrice`]}</span>
                            )}
                          </div>

                          {/* Discount Price */}
                          <div className="input-group">
                            <label style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                              Discount Price
                            </label>
                            <input
                              type="number"
                              value={details.DiscountPrice || ''}
                              onChange={(e) => handleCategoryDetailChange(categoryName, 'DiscountPrice', e.target.value)}
                              placeholder="Enter discount price"
                              className="form-input"
                              min="0"
                              step="0.01"
                            />
                          </div>

                          {/* Discount Type */}
                          <div className="input-group">
                            <label style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                              Discount Type
                            </label>
                            <select
                              value={details.DiscountType || ''}
                              onChange={(e) => handleCategoryDetailChange(categoryName, 'DiscountType', e.target.value)}
                              className="form-input"
                            >
                              <option value="">Select discount type</option>
                              <option value="percentage">Percentage</option>
                              <option value="fixed">Fixed Amount</option>
                            </select>
                          </div>

                          {/* Discount Value */}
                          <div className="input-group">
                            <label style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                              Discount Value
                            </label>
                            <input
                              type="number"
                              value={details.DiscountValue || ''}
                              onChange={(e) => handleCategoryDetailChange(categoryName, 'DiscountValue', e.target.value)}
                              placeholder="Enter discount value"
                              className="form-input"
                              min="0"
                              step="0.01"
                            />
                          </div>

                          {/* Estimated Days */}
                          <div className="input-group">
                            <label style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                              Estimated Days *
                            </label>
                            <input
                              type="number"
                              value={details.EstimatedDays || ''}
                              onChange={(e) => handleCategoryDetailChange(categoryName, 'EstimatedDays', e.target.value)}
                              placeholder="Enter estimated days"
                              className={`form-input ${errors[`category_${categoryName}_EstimatedDays`] ? 'error' : ''}`}
                              min="1"
                            />
                            {errors[`category_${categoryName}_EstimatedDays`] && (
                              <span className="error-message">{errors[`category_${categoryName}_EstimatedDays`]}</span>
                            )}
                          </div>

                          {/* Is Available */}
                          <div className="input-group">
                            <label style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                              Available
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={details.IsAvailable !== false}
                                onChange={(e) => handleCategoryDetailChange(categoryName, 'IsAvailable', e.target.checked)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                              <span>This item is available</span>
                            </label>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="input-group" style={{ marginTop: '1rem' }}>
                          <label style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                            Notes
                          </label>
                          <textarea
                            value={details.Notes || ''}
                            onChange={(e) => handleCategoryDetailChange(categoryName, 'Notes', e.target.value)}
                            placeholder="Additional notes about this category"
                            className="form-input textarea-input"
                            rows="3"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="input-group">
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="Specialization (e.g., Wedding Suits, Corporate Wear)"
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* Experience Section */}
          <div className="form-section">
            <h2 className="section-title">Experience & Portfolio</h2>
            
            <div className="input-group">
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                placeholder="Years of Experience"
                min="0"
                className={`form-input ${errors.yearsOfExperience ? 'error' : ''}`}
              />
              {errors.yearsOfExperience && <span className="error-message">{errors.yearsOfExperience}</span>}
            </div>

            <div className="input-group">
              <textarea
                name="certifications"
                value={formData.certifications}
                onChange={handleInputChange}
                placeholder="Certifications & Awards"
                className="form-input textarea-input"
                rows="2"
              />
              <span className="input-hint">List any professional certifications or awards</span>
            </div>
          </div>

          {/* Availability Section */}
          <div className="form-section">
            <h2 className="section-title">Business Hours</h2>
            
            <div className="input-row">
              <div className="input-group">
                <label className="time-label">Opening Time</label>
                <input
                  type="time"
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="time-label">Closing Time</label>
                <input
                  type="time"
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="input-group">
              <input
                type="text"
                name="weeklyOff"
                value={formData.weeklyOff}
                onChange={handleInputChange}
                placeholder="Weekly Off (e.g., Sunday, Monday)"
                className="form-input"
              />
            </div>
          </div>

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="validation-error-summary">
              <div className="error-summary-title">⚠️ Please fix the following errors:</div>
              <ul className="error-summary-list">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {apiError && (
            <div className="api-error-message">
              {apiError}
            </div>
          )}

          <div className="button-group">
            <button 
              type="button" 
              className="back-button"
              onClick={onBack}
              disabled={isLoading}
            >
              Back
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={isLoading || isSubmitting}
            >
              {(isLoading || isSubmitting)
                ? (isEditMode ? 'Updating...' : 'Submitting...') 
                : (isEditMode ? 'Update Business Info' : 'Complete Registration')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessInfoForm;

