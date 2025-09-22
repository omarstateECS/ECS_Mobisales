const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  async fetchData(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // 🔹 Customers API
  async getCustomers(page = 1, limit = 50, q = '') {
    const queryParam = q ? `&q=${encodeURIComponent(q)}` : '';
    const data = await this.fetchData(`/customers?page=${page}&limit=${limit}${queryParam}`);
    return Array.isArray(data) ? data : (data && data.customers ? data.customers : []);
  }

  async getCustomerById(id) {
    return this.fetchData(`/customers/${id}`);
  }

  async createCustomer(customerData) {
    return this.fetchData('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(id, customerData) {
    return this.fetchData(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(id) {
    return this.fetchData(`/customers/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
