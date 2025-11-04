import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardContent from './components/DashboardContent';
import CustomersView from './components/CustomersView';
import ProductsView from './components/ProductsView';
import SalesmenView from './components/SalesmenView';
import PlanRoutesPage from './components/PlanRoutesPage';
import SettingsPage from './components/SettingsPage';
import AddCustomerModal from './components/AddCustomerModal';
import EditCustomerModal from './components/EditCustomerModal';
import CustomerDetailsPage from './components/CustomerDetailsPage';
import AddProductModal from './components/AddProductModal';
import AddSalesmanModal from './components/AddSalesmanModal';
import EditSalesmanModal from './components/EditSalesmanModal';
import SalesmanDetailsPage from './components/SalesmanDetailsPage';
import ToursView from './components/ToursView';
import TourDetailsPage from './components/TourDetailsPage';
import CancelReasonsView from './components/CancelReasonsView';
import AuthoritiesView from './components/AuthoritiesView';
import IndustriesView from './components/IndustriesView';
import FillupView from './components/FillupView';
import FillupHistoryView from './components/FillupHistoryView';
import InvoicesView from './components/InvoicesView';
import StockView from './components/StockView';
import LoadOrdersView from './components/LoadOrdersView';
import ConfirmationModal from './components/common/ConfirmationModal';
import NotificationModal from './components/common/NotificationModal';
import { useNotification } from './hooks/useNotification';
import { useTheme } from './contexts/ThemeContext';
import './theme.css';

const Dashboard = () => {
  const { theme } = useTheme();
  const { notification, showSuccess, showDelete, showError, showWarning, hideNotification } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    customers: false,
    products: false,
    salesmen: false
  });
  const [customers, setCustomers] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [deletingSalesmanId, setDeletingSalesmanId] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    loading: false,
    confirmText: 'Confirm',
    type: 'danger'
  });
  const [pendingCustomerData, setPendingCustomerData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [addCustomerLoading, setAddCustomerLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    industryId: '',
    phone: '',
    address: '',
    regionId: ''
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState(null);
  
  // Edit customer states
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [editCustomerLoading, setEditCustomerLoading] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    industryId: '',
    phone: '',
    address: ''
  });
  const [editSelectedLocation, setEditSelectedLocation] = useState(null);

  // Customer details view states
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Salesman details view states
  const [showSalesmanDetails, setShowSalesmanDetails] = useState(false);
  const [selectedSalesman, setSelectedSalesman] = useState(null);

  // Tour details view states
  const [showTourDetails, setShowTourDetails] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);

  // Add Product Modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productsRefreshKey, setProductsRefreshKey] = useState(0);

  // Function to open Add Product Modal
  const openAddProductModal = () => {
    setShowAddProductModal(true);
  };

  // Function to handle product added
  const handleProductAdded = (newProduct) => {
    setShowAddProductModal(false);
    setProductsRefreshKey(prev => prev + 1);
  };

  // Add Salesman Modal states
  const [showAddSalesmanModal, setShowAddSalesmanModal] = useState(false);
  const [showEditSalesmanModal, setShowEditSalesmanModal] = useState(false);
  const [editingSalesman, setEditingSalesman] = useState(null);
  const [salesmenRefreshKey, setSalesmenRefreshKey] = useState(0);

  // Function to open Add Salesman Modal
  const openAddSalesmanModal = () => {
    setShowAddSalesmanModal(true);
  };

  // Function to handle salesman added
  const handleSalesmanAdded = (newSalesman) => {
    setShowAddSalesmanModal(false);
    setSalesmenRefreshKey(prev => prev + 1);
    // Optionally add the new salesman to the current list
    if (newSalesman) {
      setSalesmen(prev => [...prev, newSalesman]);
    }
  };

  // Function to handle salesman updated
  const handleSalesmanUpdated = (updatedSalesman) => {
    setShowEditSalesmanModal(false);
    setEditingSalesman(null);
    
    // Update the salesman in the current list
    if (updatedSalesman) {
      setSalesmen(prev => prev.map(s => s.salesId === updatedSalesman.salesId ? updatedSalesman : s));
      // If we're currently viewing this salesman's details, update the selected salesman too
      if (selectedSalesman && selectedSalesman.salesId === updatedSalesman.salesId) {
        console.log('🔄 Updating selected salesman after edit:', updatedSalesman);
        setSelectedSalesman(updatedSalesman);
      }
    }
  };

  // Fetch customers function with pagination (default to first 50)
  const fetchCustomers = async (page = 1, limit = 50, q = '') => {
    setLoading(true);
    try {
      const url = `http://localhost:3000/api/customers?page=${page}&limit=${limit}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
      console.log('Fetching URL:', url); // Debug log
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        // Handle the response structure from your API
        if (data && typeof data === 'object' && data.customers) {
          // Standard response structure: { customers: [], page, limit, hasMore }
          setCustomers(data.customers || []);
          console.log('Set customers:', data.customers?.length, 'Page:', data.page, 'HasMore:', data.hasMore); // Debug log
        } else if (Array.isArray(data)) {
          // Fallback: response is directly an array
          setCustomers(data);
          console.log('Set customers (array):', data.length); // Debug log
        } else {
          // Unexpected response structure
          console.warn('Unexpected API response structure:', data);
          setCustomers([]);
        }
      } else {
        console.error('API request failed:', response.status, response.statusText);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    }
    setLoading(false);
  };

  // Fetch salesmen function
  const fetchSalesmen = async () => {
    setLoading(true);
    try {
      const url = `http://localhost:3000/api/salesmen`;
      console.log('Fetching Salesmen URL:', url); // Debug log
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('Salesmen API Response:', data); // Debug log
        
        // Handle the response structure from your API
        if (Array.isArray(data)) {
          // Direct array response
          setSalesmen(data);
          console.log('Set salesmen (array):', data.length); // Debug log
        } else if (data && typeof data === 'object' && data.salesmen) {
          // Wrapped response structure: { salesmen: [] }
          setSalesmen(data.salesmen || []);
          console.log('Set salesmen:', data.salesmen?.length); // Debug log
        } else {
          // Unexpected response structure
          console.warn('Unexpected Salesmen API response structure:', data);
          setSalesmen([]);
        }
      } else {
        console.error('Salesmen API request failed:', response.status, response.statusText);
        setSalesmen([]);
      }
    } catch (error) {
      console.error('Error fetching salesmen:', error);
      setSalesmen([]);
    }
    setLoading(false);
  };

  // Delete salesman function
  const handleDeleteSalesman = async (salesmanId, salesmanName) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Salesman',
      message: `Are you sure you want to delete salesman "${salesmanName}"? This action cannot be undone.`,
      onConfirm: () => confirmDeleteSalesman(salesmanId),
      loading: false
    });
  };

  const confirmDeleteSalesman = async (salesmanId) => {
    setConfirmationModal(prev => ({ ...prev, loading: true }));
    setDeletingSalesmanId(salesmanId);

    try {
      const response = await fetch(`http://localhost:3000/api/salesmen/${salesmanId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the salesman from the local state
        setSalesmen(prev => prev.filter(salesman => salesman.salesId !== salesmanId));
        setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false });
        showDelete('Salesman has been deleted successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete salesman`);
      }
    } catch (error) {
      console.error('Error deleting salesman:', error);
      setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false });
      showError('Error Deleting Salesman', error.message);
    } finally {
      setDeletingSalesmanId(null);
    }
  };

  // Edit salesman function
  const handleEditSalesman = (salesman) => {
    setEditingSalesman(salesman);
    setShowEditSalesmanModal(true);
  };

  // View salesman details function
  const handleViewSalesmanDetails = (salesman) => {
    setSelectedSalesman(salesman);
    setShowSalesmanDetails(true);
  };

  // Add new customer function
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.name || !formData.latitude || !formData.longitude || !formData.industryId) {
      showWarning('Please fill in all required fields');
      return;
    }
    
    setAddCustomerLoading(true);
    
    // Check for similar customer names first
    try {
      const checkResponse = await fetch(`http://localhost:3000/api/customers/check-similar?name=${encodeURIComponent(formData.name.trim())}`);
      
      if (checkResponse.ok) {
        const data = await checkResponse.json();
        const { similarCustomers } = data;
        
        if (similarCustomers && similarCustomers.length > 0) {
          setAddCustomerLoading(false);
          
          // Prepare customer data to save for later
          const newCustomer = {
            name: formData.name.trim(),
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            industryId: formData.industryId ? parseInt(formData.industryId) : null,
            phone: formData.phone.trim() || null,
            address: formData.address.trim(),
            regionId: formData.regionId || null
          };
          
          setPendingCustomerData(newCustomer);
          
          // Show warning modal with similar customers
          const customerNames = similarCustomers.map(c => c.name).join(', ');
          
          setConfirmationModal({
            isOpen: true,
            title: 'Similar Customer Found',
            message: customerNames,
            onConfirm: () => confirmAddCustomer(),
            loading: false,
            confirmText: 'Add Anyway',
            type: 'warning'
          });
          
          return; // Stop here and wait for user confirmation
        }
      }
    } catch (error) {
      console.error('Error checking similar names:', error);
      // Continue with adding customer even if check fails
    }
    
    // No duplicates found, proceed with adding
    await proceedWithAddingCustomer();
  };

  // Confirm adding customer after duplicate warning
  const confirmAddCustomer = async () => {
    if (!pendingCustomerData) {
      console.error('No pending customer data to add');
      setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Confirm', type: 'danger' });
      return;
    }
    
    setConfirmationModal(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch('http://localhost:3000/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pendingCustomerData),
      });
      
      if (response.ok) {
        const apiCustomer = await response.json();
        setCustomers(prev => [...prev, apiCustomer]);
        showSuccess('Customer added successfully!');
      } else {
        throw new Error(`API failed with status: ${response.status}`);
      }
    } catch (error) {
      const localCustomer = {
        ...pendingCustomerData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      
      setCustomers(prev => [...prev, localCustomer]);
      showWarning(`Customer added locally! (${error.message})`);
    }
    
    setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Confirm', type: 'danger' });
    setPendingCustomerData(null);
    setShowAddCustomerModal(false);
    resetForm();
  };

  // Proceed with adding customer (no duplicates found)
  const proceedWithAddingCustomer = async () => {
    const newCustomer = {
      name: formData.name.trim(),
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      industryId: formData.industryId ? parseInt(formData.industryId) : null,
      phone: formData.phone.trim() || null,
      address: formData.address.trim(),
      regionId: formData.regionId || null
    };
    
    try {
      console.log('📤 Sending customer data:', newCustomer);
      
      const response = await fetch('http://localhost:3000/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      });
      
      if (response.ok) {
        const apiCustomer = await response.json();
        setCustomers(prev => [...prev, apiCustomer]);
        showSuccess('Customer added successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.message || `API failed with status: ${response.status}`);
      }
    } catch (error) {
      const localCustomer = {
        ...newCustomer,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      
      setCustomers(prev => [...prev, localCustomer]);
      showWarning(`Customer added locally! (${error.message})`);
    }
    
    setAddCustomerLoading(false);
    setShowAddCustomerModal(false);
    resetForm();
  };

  // Reset form function
  const resetForm = () => {
    setFormData({
      name: '',
      latitude: '',
      longitude: '',
      industryId: '',
      phone: '',
      address: '',
      regionId: ''
    });
    setSelectedLocation(null);
  };

  // Handle map click to select location
  const handleMapClick = (...args) => {
    if (args.length > 1 && typeof args[0] === 'number') {
      const [lat, lng, address] = args;
      setSelectedLocation({ lat, lng });
      setFormData(prev => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString(),
        address: address || `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }));
    } else {
      const locationData = args[0];
      const { lat, lng, address, phone, name, industry } = locationData;
      
      setSelectedLocation({ lat, lng });
      setFormData(prev => ({
        ...prev,
        name: name || prev.name,
        latitude: lat.toString(),
        longitude: lng.toString(),
        address: address,
        phone: phone || prev.phone,
        industry: industry || prev.industry
      }));
    }
  };

  // Handle clearing location selection
  const handleClearLocationSelection = () => {
    setSelectedLocation(null);
    setFormData(prev => ({
      ...prev,
      latitude: '',
      longitude: '',
      address: ''
    }));
  };

  // Handle opening add customer modal
  const openAddCustomerModal = () => {
    setShowAddCustomerModal(true);
    resetForm();
  };

  // Handle customer block/unblock
  const handleDeleteCustomer = async (customerId, customerName, isBlocked) => {
    const action = isBlocked ? 'unblock' : 'block';
    const actionTitle = isBlocked ? 'Unblock Customer' : 'Block Customer';
    const actionMessage = isBlocked 
      ? `Are you sure you want to unblock "${customerName}"? They will be able to make purchases again.`
      : `Are you sure you want to block "${customerName}"? They won't be able to make purchases.`;
    
    setConfirmationModal({
      isOpen: true,
      title: actionTitle,
      message: actionMessage,
      onConfirm: () => confirmBlockCustomer(customerId, action),
      loading: false,
      confirmText: isBlocked ? 'Unblock' : 'Block',
      type: isBlocked ? 'warning' : 'danger'
    });
  };

  const confirmBlockCustomer = async (customerId, action) => {
    setConfirmationModal(prev => ({ ...prev, loading: true }));

    setDeletingCustomerId(customerId);
    
    try {
      const response = await fetch(`http://localhost:3000/api/customers/${customerId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Refresh customers list to get updated blocked status
        await fetchCustomers();
        setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false });
        showSuccess(
          action === 'block' ? 'Customer Blocked' : 'Customer Unblocked',
          action === 'block' 
            ? 'Customer has been blocked successfully!' 
            : 'Customer has been unblocked successfully!'
        );
      } else {
        throw new Error(`Failed to ${action} customer: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing customer:`, error);
      setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false });
      showError(`Error ${action === 'block' ? 'Blocking' : 'Unblocking'} Customer`, error.message);
    } finally {
      setDeletingCustomerId(null);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle opening edit customer modal
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setEditFormData({
      name: customer.name || '',
      latitude: customer.latitude?.toString() || '',
      longitude: customer.longitude?.toString() || '',
      industryId: customer.industryId?.toString() || '',
      phone: customer.phone || '',
      address: customer.address || ''
    });
    if (customer.latitude && customer.longitude) {
      setEditSelectedLocation({
        lat: parseFloat(customer.latitude),
        lng: parseFloat(customer.longitude)
      });
    } else {
      setEditSelectedLocation(null);
    }
    setShowEditCustomerModal(true);
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const handleEditFromDetails = (customer) => {
    // Don't close customer details - keep it open in background
    // setShowCustomerDetails(false);
    // setSelectedCustomer(null);
    
    setEditingCustomer(customer);
    setEditFormData({
      name: customer.name || '',
      latitude: customer.latitude?.toString() || '',
      longitude: customer.longitude?.toString() || '',
      industryId: customer.industryId?.toString() || '',
      phone: customer.phone || '',
      address: customer.address || ''
    });
    if (customer.latitude && customer.longitude) {
      setEditSelectedLocation({
        lat: parseFloat(customer.latitude),
        lng: parseFloat(customer.longitude)
      });
    } else {
      setEditSelectedLocation(null);
    }
    setShowEditCustomerModal(true);
  };

  const handleBackFromDetails = () => {
    setShowCustomerDetails(false);
    setSelectedCustomer(null);
  };

  // Salesman details functions
  const handleEditSalesmanFromDetails = (salesman) => {
    // Keep salesman details open in background
    setEditingSalesman(salesman);
    setShowEditSalesmanModal(true);
  };

  const handleBackFromSalesmanDetails = () => {
    setShowSalesmanDetails(false);
    setSelectedSalesman(null);
  };

  // Tour details functions
  const handleViewTourDetails = (tour) => {
    setSelectedTour(tour);
    setShowTourDetails(true);
  };

  const handleBackFromTourDetails = () => {
    setShowTourDetails(false);
    setSelectedTour(null);
  };

  // Function to refresh selected salesman data
  const refreshSelectedSalesman = async () => {
    if (!selectedSalesman?.id) return;
    
    try {
      console.log('🔄 Refreshing selected salesman data for ID:', selectedSalesman.salesId);
      const response = await fetch(`http://localhost:3000/api/salesmen/${selectedSalesman.salesId}`);
      if (response.ok) {
        const updatedSalesman = await response.json();
        console.log('✅ Updated salesman data received:', updatedSalesman);
        setSelectedSalesman(updatedSalesman);
      } else {
        console.error('Failed to refresh salesman data:', response.statusText);
      }
    } catch (error) {
      console.error('Error refreshing salesman data:', error);
    }
  };

  // Handle edit map click
  const handleEditMapClick = (...args) => {
    if (args.length > 1 && typeof args[0] === 'number') {
      const [lat, lng, address] = args;
      
      setEditSelectedLocation({ lat, lng });
      setEditFormData(prev => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString(),
        address: address || `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }));
    } else {
      const locationData = args[0];
      const { lat, lng, address, phone, name, industry } = locationData;
      
      setEditSelectedLocation({ lat, lng });
      setEditFormData(prev => ({
        ...prev,
        name: name || prev.name,
        latitude: lat.toString(),
        longitude: lng.toString(),
        address: address,
        phone: phone || prev.phone,
        industry: industry || prev.industry
      }));
    }
  };

  // Handle clearing edit location selection
  const handleEditClearLocationSelection = () => {
    setEditSelectedLocation(null);
    setEditFormData(prev => ({
      ...prev,
      latitude: '',
      longitude: '',
      address: ''
    }));
  };

  // Handle update customer function
  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!editFormData.name || !editFormData.latitude || !editFormData.longitude || !editFormData.industry) {
      showWarning('Please fill in all required fields');
      return;
    }
    
    setEditCustomerLoading(true);
    
    const updatedCustomer = {
      name: editFormData.name.trim(),
      latitude: parseFloat(editFormData.latitude),
      longitude: parseFloat(editFormData.longitude),
      industryId: editFormData.industryId ? parseInt(editFormData.industryId) : null,
      phone: editFormData.phone.trim() || null,
      address: editFormData.address.trim()
    };
    
    try {
      const response = await fetch(`http://localhost:3000/api/customers/${editingCustomer.customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCustomer),
      });
      
      if (response.ok) {
        const apiCustomer = await response.json();
        setCustomers(prev => prev.map(customer => 
          customer.customerId === editingCustomer.customerId ? apiCustomer : customer
        ));
        
        if (selectedCustomer && selectedCustomer.customerId === editingCustomer.customerId) {
          setSelectedCustomer(apiCustomer);
        }
        
        showSuccess('Customer updated successfully!');
      } else {
        throw new Error(`API failed with status: ${response.status}`);
      }
    } catch (error) {
      const localUpdatedCustomer = {
        ...editingCustomer,
        ...updatedCustomer
      };
      
      setCustomers(prev => prev.map(customer => 
        customer.id === editingCustomer.id ? localUpdatedCustomer : customer
      ));
      
      if (selectedCustomer && selectedCustomer.id === editingCustomer.id) {
        setSelectedCustomer(localUpdatedCustomer);
      }
      
      showWarning(`Customer updated locally! (${error.message})`);
    }
    
    setEditCustomerLoading(false);
    setShowEditCustomerModal(false);
    resetEditForm();
  };

  // Reset edit form function
  const resetEditForm = () => {
    setEditFormData({
      name: '',
      latitude: '',
      longitude: '',
      industryId: '',
      phone: '',
      address: ''
    });
    setEditSelectedLocation(null);
    setEditingCustomer(null);
  };

  // Fetch customers when component mounts
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch salesmen when navigating to salesmen view
  useEffect(() => {
    if (currentView === 'all-salesmen') {
      fetchSalesmen();
    }
  }, [currentView, salesmenRefreshKey]);

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
    setSidebarOpen(false);
    // Close any open detail pages when navigating
    setShowCustomerDetails(false);
    setShowSalesmanDetails(false);
    setShowTourDetails(false);
    setSelectedCustomer(null);
    setSelectedSalesman(null);
    setSelectedTour(null);
  };

  // Render different views based on currentView state
  const renderMainContent = () => {
    if (showCustomerDetails && selectedCustomer) {
      return (
        <motion.div
          key="customer-details"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <CustomerDetailsPage
            customer={selectedCustomer}
            onBack={handleBackFromDetails}
            onEdit={handleEditFromDetails}
          />
        </motion.div>
      );
    }

    if (showSalesmanDetails && selectedSalesman) {
      return (
        <motion.div
          key="salesman-details"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <SalesmanDetailsPage
            salesman={selectedSalesman}
            onBack={handleBackFromSalesmanDetails}
            onEdit={handleEditSalesmanFromDetails}
            onRefresh={refreshSelectedSalesman}
            handleNavigation={handleNavigation}
          />
        </motion.div>
      );
    }

    if (showTourDetails && selectedTour) {
      return (
        <motion.div
          key="tour-details"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <TourDetailsPage
            journey={selectedTour}
            onBack={handleBackFromTourDetails}
          />
        </motion.div>
      );
    }

    switch (currentView) {
      case 'all-customers':
        return (
          <motion.div
            key="customers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <CustomersView
              handleNavigation={handleNavigation}
              openAddCustomerModal={openAddCustomerModal}
              fetchCustomers={fetchCustomers}
              loading={loading}
              customers={customers}
              handleDeleteCustomer={handleDeleteCustomer}
              deletingCustomerId={deletingCustomerId}
              handleEditCustomer={handleEditCustomer}
              handleViewDetails={handleViewDetails}
            />
          </motion.div>
        );
      
      case 'products':
        return (
          <motion.div
            key="products"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <ProductsView
              openAddProductModal={openAddProductModal}
              refreshKey={productsRefreshKey}
            />
          </motion.div>
        );
      
      case 'all-salesmen':
        return (
          <motion.div
            key="salesmen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <SalesmenView
              handleNavigation={handleNavigation}
              openAddSalesmanModal={openAddSalesmanModal}
              fetchSalesmen={fetchSalesmen}
              loading={loading}
              salesmen={salesmen}
              handleDeleteSalesman={handleDeleteSalesman}
              deletingSalesmanId={deletingSalesmanId}
              handleEditSalesman={handleEditSalesman}
              handleViewDetails={handleViewSalesmanDetails}
            />
          </motion.div>
        );
      
      case 'plan-routes':
        return (
          <motion.div
            key="plan-routes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <PlanRoutesPage
              handleNavigation={handleNavigation}
              salesmenRefreshKey={salesmenRefreshKey}
            />
          </motion.div>
        );
      
      case 'tours':
        return (
          <motion.div
            key="tours"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <ToursView
              handleNavigation={handleNavigation}
              onViewTourDetails={handleViewTourDetails}
            />
          </motion.div>
        );
      
      case 'authorities':
        return (
          <motion.div
            key="authorities"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <AuthoritiesView />
          </motion.div>
        );

      case 'industries':
        return (
          <motion.div
            key="industries"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <IndustriesView />
          </motion.div>
        );

      case 'fillup':
        return (
          <motion.div
            key="fillup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <FillupView />
          </motion.div>
        );

      case 'fillup-history':
        return (
          <motion.div
            key="fillup-history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <FillupHistoryView />
          </motion.div>
        );

      case 'invoices':
        return (
          <motion.div
            key="invoices"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <InvoicesView />
          </motion.div>
        );

      case 'stock':
        return (
          <motion.div
            key="stock"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <StockView />
          </motion.div>
        );

      case 'loadorders':
        return (
          <motion.div
            key="loadorders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <LoadOrdersView />
          </motion.div>
        );

      case 'cancel-reasons':
        return (
          <motion.div
            key="cancel-reasons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <CancelReasonsView />
          </motion.div>
        );
      
      case 'settings':
        return (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <SettingsPage />
          </motion.div>
        );
      
      default:
        return (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <DashboardContent
              customers={customers}
              loading={loading}
              openAddCustomerModal={openAddCustomerModal}
              fetchCustomers={fetchCustomers}
              handleNavigation={handleNavigation}
            />
          </motion.div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900' 
        : 'bg-gray-50'
    }`}>
      {/* Add Customer Modal */}
      <AddCustomerModal
        showAddCustomerModal={showAddCustomerModal}
        setShowAddCustomerModal={setShowAddCustomerModal}
        formData={formData}
        handleInputChange={handleInputChange}
        handleAddCustomer={handleAddCustomer}
        addCustomerLoading={addCustomerLoading}
        selectedLocation={selectedLocation}
        handleMapClick={handleMapClick}
        handleClearLocationSelection={handleClearLocationSelection}
      />

      {/* Edit Customer Modal */}
      <EditCustomerModal
        showEditCustomerModal={showEditCustomerModal}
        setShowEditCustomerModal={setShowEditCustomerModal}
        editFormData={editFormData}
        handleEditInputChange={handleEditInputChange}
        handleUpdateCustomer={handleUpdateCustomer}
        editCustomerLoading={editCustomerLoading}
        editSelectedLocation={editSelectedLocation}
        handleEditMapClick={handleEditMapClick}
        handleEditClearLocationSelection={handleEditClearLocationSelection}
        editingCustomer={editingCustomer}
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onProductAdded={handleProductAdded}
      />

      {/* Add Salesman Modal */}
              <AddSalesmanModal
          isOpen={showAddSalesmanModal}
          onClose={() => setShowAddSalesmanModal(false)}
          onSalesmanAdded={handleSalesmanAdded}
          onSuccess={(title, message) => showSuccess(title, message)}
        />
        <EditSalesmanModal
          isOpen={showEditSalesmanModal}
          onClose={() => {
            setShowEditSalesmanModal(false);
            setEditingSalesman(null);
          }}
          salesman={editingSalesman}
          onSalesmanUpdated={handleSalesmanUpdated}
          onSuccess={(title, message) => showSuccess(title, message)}
        />

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        expandedMenus={expandedMenus}
        toggleMenu={toggleMenu}
        handleNavigation={handleNavigation}
        openAddCustomerModal={openAddCustomerModal}
        openAddProductModal={openAddProductModal}
        openAddSalesmanModal={openAddSalesmanModal}
      />

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Navigation */}
        <Header
          currentView={currentView}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content Area */}
        <main className="p-6">
          <AnimatePresence mode="wait">
            {renderMainContent()}
          </AnimatePresence>
        </main>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoClose={notification.autoClose}
        autoCloseDelay={notification.autoCloseDelay}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => {
          setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Confirm', type: 'danger' });
          setPendingCustomerData(null); // Clear pending data when modal is closed
        }}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        loading={confirmationModal.loading}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText}
        cancelText="Cancel"
      />
    </div>
  );
};

export default Dashboard;