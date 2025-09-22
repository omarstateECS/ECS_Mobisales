// hooks/useCustomers.js
import { useState, useEffect } from 'react';
import ApiService from '../services/api';

export const useCustomers = (initialPage = 1, limit = 50) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);

  const fetchCustomers = async (pageNumber = page) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getCustomers(pageNumber, limit);
      setCustomers(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(page);
  }, [page]);

  const addCustomer = async (customerData) => {
    try {
      setError(null);
      const newCustomer = await ApiService.createCustomer(customerData);
      setCustomers(prev => [newCustomer, ...prev]); // put new on top
      return { success: true, data: newCustomer };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteCustomer = async (id) => {
    try {
      setError(null);
      await ApiService.deleteCustomer(id);
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    customers,
    loading,
    error,
    page,
    setPage,       
    fetchCustomers, 
    addCustomer,
    deleteCustomer,
  };
};
