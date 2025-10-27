const customerService = require('../services/customerService');
const { customerValidation } = require('../models/customer');

class CustomerController {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 50, q = '' } = req.query;
            const data = await customerService.getAllCustomers(
                parseInt(page),
                parseInt(limit),
                q
            );
            res.json(data); // includes { customers, page, limit, hasMore }
        } catch (error) {
            console.error('Error fetching customers:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const customer = await customerService.getCustomerById(req.params.id);
            if (!customer) return res.status(404).json({ error: 'Customer not found' });
            res.json(customer);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        const { error } = customerValidation(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        try {
            // Convert regionId to number or null
            const customerData = {
                ...req.body,
                regionId: req.body.regionId ? parseInt(req.body.regionId) : null
            };
            
            const newCustomer = await customerService.createCustomer(customerData);
            res.status(201).json(newCustomer);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        const { error } = customerValidation(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        try {
            // Convert regionId to number or null
            const customerData = {
                ...req.body,
                regionId: req.body.regionId ? parseInt(req.body.regionId) : null
            };
            
            const updatedCustomer = await customerService.updateCustomer(req.params.id, customerData);
            res.json(updatedCustomer);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await customerService.deleteCustomer(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async block(req, res) {
        try {
            const blockedCustomer = await customerService.blockCustomer(req.params.id);
            res.json({ message: 'Customer blocked successfully', customer: blockedCustomer });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async unblock(req, res) {
        try {
            const unblockedCustomer = await customerService.unblockCustomer(req.params.id);
            res.json({ message: 'Customer unblocked successfully', customer: unblockedCustomer });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getStats(req, res) {
        try {
            const stats = await customerService.getStats();
            res.json(stats);
        } catch (error) {
            console.error('Error fetching customer stats:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async checkSimilarNames(req, res) {
        try {
            const { name } = req.query;
            if (!name) {
                return res.status(400).json({ error: 'Name parameter is required' });
            }
            
            const similarCustomers = await customerService.checkSimilarNames(name);
            res.json({ similarCustomers });
        } catch (error) {
            console.error('Error checking similar names:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new CustomerController();
