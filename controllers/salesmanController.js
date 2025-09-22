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
}

module.exports = new SalesmanController();