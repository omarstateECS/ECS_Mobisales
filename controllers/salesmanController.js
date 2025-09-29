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
        if (error) return res.status(400).json({ error: error.details[0].message });
        try { 
            const salesman = await salesmanService.createSalesman(req.body);
            res.status(201).json(salesman);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        const { error } = SalesmanValidation(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });
        try { 
            const salesman = await salesmanService.updateSalesman(req.params.id, req.body);
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
          console.log("🧾 === CHECK-IN REQUEST DEBUG ===");
          console.log("🧾 Request method:", req.method);
          console.log("🧾 Request URL:", req.url);
          console.log("🧾 Content-Type:", req.get('Content-Type'));
          console.log("🧾 All headers:", req.headers);
          console.log("🧾 Body type:", typeof req.body);
          console.log("🧾 Body content:", req.body);
          console.log("🧾 Body keys:", req.body ? Object.keys(req.body) : 'No body');
          console.log("🧾 === END DEBUG ===");
          
          const checkInData = req.body;
          
          // Validate request body
          if (!checkInData || Object.keys(checkInData).length === 0) {
            return res.status(400).json({
              success: false,
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
      
          const journey = await salesmanService.checkIn(checkInData);
      
          res.status(200).json({
            success: true,
            data: journey,
            message: 'Salesman checked in successfully'
          });
        } catch (error) {
          console.error('Error checking in:', error);
          res.status(500).json({ 
            success: false,
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
}

module.exports = new SalesmanController();