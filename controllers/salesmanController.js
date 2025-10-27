const salesmanService = require('../services/salesmanService');
const { SalesmanValidation } = require('../models/salesman');


class SalesmanController {
    async getAll(req, res) {
        try {
            const data = await salesmanService.getAllSalesmen();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try { 
            const salesman = await salesmanService.getSalesmanById(req.params.id);
            if (!salesman) return res.status(404).json({ error: 'Salesman not found' });
            res.status(200).json(salesman);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        const { error } = SalesmanValidation(req.body);
        if (error) {
            console.log('❌ Validation error:', error.details[0].message);
            return res.status(400).json({ 
                success: false,
                error: error.details[0].message 
            });
        }
        try {
            // Convert regionId to number or null
            const salesmanData = {
                ...req.body,
                regionId: req.body.regionId ? parseInt(req.body.regionId) : null
            };
            
            const salesman = await salesmanService.createSalesman(salesmanData);
            console.log('✅ Salesman created successfully:', salesman.salesId);
            res.status(201).json({
                success: true,
                data: salesman
            });
        } catch (error) {
            console.error('❌ Error creating salesman:', error.message);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    async update(req, res) {
        const { error } = SalesmanValidation(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });
        try {
            // Convert regionId to number or null
            const salesmanData = {
                ...req.body,
                regionId: req.body.regionId ? parseInt(req.body.regionId) : null
            };
            
            const salesman = await salesmanService.updateSalesman(req.params.id, salesmanData);
            res.status(200).json(salesman);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await salesmanService.deleteSalesman(req.params.id);
            res.status(200).json({ message: 'Salesman deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAuthorities(req, res) {
        try {
            const salesmanId = req.params.id;
            const authorities = await salesmanService.getSalesmanAuthorities(salesmanId);
            
            res.status(200).json({
                success: true,
                data: authorities,
                message: 'Authorities retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting salesman authorities:', error);
            res.status(500).json({ 
                success: false,
                message: error.message || 'Internal server error' 
            });
        }
    }

    async getAllAuthorities(req, res) {
        try {
            const salesmanId = req.params.id;
            const authorities = await salesmanService.getAllSalesmanAuthorities(salesmanId);
            
            res.status(200).json({
                success: true,
                data: authorities,
                message: 'All authorities retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting all salesman authorities:', error);
            res.status(500).json({ 
                success: false,
                message: error.message || 'Internal server error' 
            });
        }
    }

    async assignAuthorities(req, res) {
        try {
            const { authorityIds } = req.body;
            const salesmanId = req.params.id;

            if (!authorityIds || !Array.isArray(authorityIds)) {
                return res.status(400).json({ 
                    success: false,
                    message: 'authorityIds must be an array' 
                });
            }

            const updatedSalesman = await salesmanService.assignAuthorities(salesmanId, authorityIds);
            
            res.status(200).json({
                success: true,
                data: updatedSalesman,
                message: 'Authorities assigned successfully'
            });
        } catch (error) {
            console.error('Error assigning authorities:', error);
            res.status(500).json({ 
                success: false,
                message: error.message || 'Internal server error' 
            });
        }
    }

    async updateAuthorities(req, res) {
        try {
            const { authorityIds } = req.body;
            const salesmanId = req.params.id;

            if (!authorityIds || !Array.isArray(authorityIds)) {
                return res.status(400).json({ 
                    success: false,
                    message: 'authorityIds must be an array' 
                });
            }

            const updatedSalesman = await salesmanService.updateAuthorities(salesmanId, authorityIds);
            
            res.status(200).json({
                success: true,
                data: updatedSalesman,
                message: 'Authorities updated successfully'
            });
        } catch (error) {
            console.error('Error updating authorities:', error);
            res.status(500).json({ 
                success: false,
                message: error.message || 'Internal server error' 
            });
        }
    }

    async checkIn(req, res) {
        try {      
          const checkInData = req.body;
          
          // Validate request body
          if (!checkInData || Object.keys(checkInData).length === 0) {
            return res.status(400).json({
              message: 'Request body is empty or invalid. Please send JSON data with Content-Type: application/json'
            });
          }
          
          // Validate required fields
          if (!checkInData.salesmanId) {
            return res.status(400).json({
              success: false,
              message: 'salesmanId is required'
            });
          }
          
          if (!checkInData.deviceId) {
            return res.status(400).json({
              success: false,
              message: 'deviceId is required'
            });
          }
      
          const result = await salesmanService.checkIn(checkInData);
      
          res.status(200).json({
            success: true,
            data: result,
            message: 'Check-in successfull'
          });
        } catch (error) {
          console.error('❌ Error in checkIn:', error.message);
          
          // Determine status code based on error message
          let statusCode = 500;
          
          if (error.message.includes('not found')) {
            statusCode = 404;
          } else if (error.message.includes('Unauthorized') || 
                     error.message.includes('required') ||
                     error.message.includes('Invalid') ||
                     error.message.includes('already exists') ||
                     error.message.includes('Failed to create') ||
                     error.message.includes('Failed to update')) {
            statusCode = 400;
          }
          
          res.status(statusCode).json({
            success: false,
            message: error.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
        }
    }
    
    async createVisit(req, res) {
        const visitData = req.body;
        
        try {
            const result = await salesmanService.createVisit(visitData);
            res.status(201).json({
                customerId: result.customerId
            });
        } catch (error) {
            console.error('Error creating visit:', error);
            res.status(500).json({ 
                message: error.message || 'Internal server error' 
            });
        }
    }

    async getStats(req, res) {  
        try {
            const stats = await salesmanService.getStats();
            res.status(200).json({
                success: true,
                data: stats,
                message: 'Stats retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting stats:', error);
            res.status(500).json({ 
                success: false,
                message: error.message || 'Internal server error' 
            });
        }
    }

    async getInvoiceItems(req, res) {
        try {
            const { invId } = req.params;
            const items = await salesmanService.getInvoiceItems(invId);
            res.status(200).json({
                success: true,
                items: items
            });
        } catch (error) {
            console.error('Error getting invoice items:', error);
            res.status(500).json({ 
                success: false,
                message: error.message || 'Internal server error' 
            });
        }
    }

    async refreshAuthorities(req, res) { 
        const refreshedAuthoritites = await salesmanService.refreshAuthorities(req.body.salesmanId);
        res.status(200).json(refreshedAuthoritites);
    }

    async addExistingCustomer(req, res) {
        try {
            const { salesmanId, journeyId, visitId, customerId } = req.body;

            // Validate required fields
            if (!salesmanId || !journeyId || !visitId || !customerId) {
                return res.status(400).json({ 
                    error: 'Missing required fields: salesmanId, journeyId, visitId, customerId' 
                });
            }

            const visitService = require('../services/visitService');
            const visit = await visitService.addExistingCustomerVisit(
                salesmanId,
                journeyId,
                visitId,
                customerId
            );

            res.status(201).json({
                success: true,
                message: 'Customer added to journey successfully',
                visit
            });
        } catch (error) {
            console.error('Error adding existing customer:', error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }
}

module.exports = new SalesmanController();