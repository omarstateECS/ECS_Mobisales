const visitService = require('../services/visitService');
const { visitValidation } = require('../models/visit');

class VisitController {
    async getAll(req, res) {
        try {
            const visits = await visitService.getAllVisits();
            res.json(visits);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const visit = await visitService.getVisitById(req.params.id);
            if (!visit) return res.status(404).json({ error: 'Visit not found' });
            res.json(visit);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        const { error } = visitValidation(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        try {
            const newVisit = await visitService.createVisit(req.body);
            res.status(201).json(newVisit);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        const { error } = visitValidation(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        try {
            const updatedVisit = await visitService.updateVisit(req.params.id, req.body);
            res.json(updatedVisit);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await visitService.deleteVisit(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async bulkCreate(req, res) {
        try {
            const { salesmanId, customerIds } = req.body;

            // Validate input
            if (!salesmanId) {
                return res.status(400).json({ 
                    success: false,
                    message: 'salesmanId is required' 
                });
            }

            if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
                return res.status(400).json({ 
                    success: false,
                    message: 'customerIds must be a non-empty array' 
                });
            }

            const result = await visitService.bulkCreateVisits(salesmanId, customerIds);
            
            res.status(201).json({
                success: true,
                message: `Successfully created ${result.count} visits`,
                data: result
            });
        } catch (error) {
            console.error('Error in bulk create visits:', error);
            res.status(500).json({ 
                success: false,
                message: error.message || 'Failed to create visits'
            });
        }
    }
}

module.exports = new VisitController();
