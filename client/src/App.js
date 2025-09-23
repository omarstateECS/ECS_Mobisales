import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardContent from './components/DashboardContent';
import CustomersView from './components/CustomersView';
import ProductsView from './components/ProductsView';
import SalesmenView from './components/SalesmenView';
import AddCustomerModal from './components/AddCustomerModal';
import EditCustomerModal from './components/EditCustomerModal';
import CustomerDetailsPage from './components/CustomerDetailsPage';
import AddProductModal from './components/AddProductModal';
import AddSalesmanModal from './components/AddSalesmanModal';
import EditSalesmanModal from './components/EditSalesmanModal';
import SalesmanDetailsPage from './components/SalesmanDetailsPage';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    customers: false,
    products: false,
    salesmen: false
  });
  const [customers, setCustomers] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [deletingSalesmanId, setDeletingSalesmanId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [addCustomerLoading, setAddCustomerLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    industry: '',
    phone: '',
    address: ''
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
    industry: '',
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
      setSalesmen(prev => [newSalesman, ...prev]);
    }
  };

  // Function to handle salesman updated
  const handleSalesmanUpdated = (updatedSalesman) => {
    setShowEditSalesmanModal(false);
    setEditingSalesman(null);
    setSalesmenRefreshKey(prev => prev + 1);
    
    // Update the salesman in the current list
    if (updatedSalesman) {
      setSalesmen(prev => prev.map(s => s.id === updatedSalesman.id ? updatedSalesman : s));
      
      // If we're currently viewing this salesman's details, update the selected salesman too
      if (selectedSalesman && selectedSalesman.id === updatedSalesman.id) {
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
    if (!window.confirm(`Are you sure you want to delete salesman "${salesmanName}"?`)) {
      return;
    }

    setDeletingSalesmanId(salesmanId);

    try {
      const response = await fetch(`http://localhost:3000/api/salesmen/${salesmanId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the salesman from the local state
        setSalesmen(prev => prev.filter(salesman => salesman.id !== salesmanId));
        alert('Salesman deleted successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete salesman`);
      }
    } catch (error) {
      console.error('Error deleting salesman:', error);
      alert(`Error deleting salesman: ${error.message}`);
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
    
    if (!formData.name || !formData.latitude || !formData.longitude || !formData.industry) {
      alert('Please fill in all required fields');
      return;
    }
    
    setAddCustomerLoading(true);
    
    const newCustomer = {
      name: formData.name.trim(),
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      industry: formData.industry || null,
      phone: formData.phone.trim() || null,
      address: formData.address.trim()
    };
    
    try {
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
        alert('Customer added successfully!');
      } else {
        throw new Error(`API failed with status: ${response.status}`);
      }
    } catch (error) {
      const localCustomer = {
        ...newCustomer,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      
      setCustomers(prev => [...prev, localCustomer]);
      alert(`Customer added locally! (${error.message})`);
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
      industry: '',
      phone: '',
      address: ''
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

  // Handle customer deletion
  const handleDeleteCustomer = async (customerId, customerName) => {
    if (!window.confirm(`Are you sure you want to delete "${customerName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingCustomerId(customerId);
    
    try {
      const response = await fetch(`http://localhost:3000/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setCustomers(prev => prev.filter(customer => customer.id !== customerId));
        alert('Customer deleted successfully!');
      } else {
        throw new Error(`Failed to delete customer: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert(`Failed to delete customer: ${error.message}`);
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
      industry: customer.industry || '',
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
      industry: customer.industry || '',
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

  // Function to refresh selected salesman data
  const refreshSelectedSalesman = async () => {
    if (!selectedSalesman?.id) return;
    
    try {
      console.log('🔄 Refreshing selected salesman data for ID:', selectedSalesman.id);
      const response = await fetch(`http://localhost:3000/api/salesmen/${selectedSalesman.id}`);
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
      alert('Please fill in all required fields');
      return;
    }
    
    setEditCustomerLoading(true);
    
    const updatedCustomer = {
      name: editFormData.name.trim(),
      latitude: parseFloat(editFormData.latitude),
      longitude: parseFloat(editFormData.longitude),
      industry: editFormData.industry || null,
      phone: editFormData.phone.trim() || null,
      address: editFormData.address.trim()
    };
    
    try {
      const response = await fetch(`http://localhost:3000/api/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCustomer),
      });
      
      if (response.ok) {
        const apiCustomer = await response.json();
        setCustomers(prev => prev.map(customer => 
          customer.id === editingCustomer.id ? apiCustomer : customer
        ));
        
        if (selectedCustomer && selectedCustomer.id === editingCustomer.id) {
          setSelectedCustomer(apiCustomer);
        }
        
        alert('Customer updated successfully!');
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
      
      alert(`Customer updated locally! (${error.message})`);
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
      industry: '',
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
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
        />
        <EditSalesmanModal
          isOpen={showEditSalesmanModal}
          onClose={() => {
            setShowEditSalesmanModal(false);
            setEditingSalesman(null);
          }}
          salesman={editingSalesman}
          onSalesmanUpdated={handleSalesmanUpdated}
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
    </div>
  );
};

export default Dashboard;