const visitService = require('../services/visitService');
const journeyService = require('../services/journeyService');
const salesmanService = require('../services/salesmanService');
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
            // Support composite key from body or legacy single ID from params
            const visitIdentifier = req.body.visitId && req.body.salesId && req.body.journeyId 
                ? { visitId: req.body.visitId, salesId: req.body.salesId, journeyId: req.body.journeyId }
                : req.params.id;
            
            const updatedVisit = await visitService.updateVisit(visitIdentifier, req.body);
            res.json(updatedVisit);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            // Support composite key from query params or legacy single ID
            const visitIdentifier = req.query.salesId && req.query.journeyId
                ? { visitId: req.params.id, salesId: req.query.salesId, journeyId: req.query.journeyId }
                : req.params.id;
            
            await visitService.deleteVisit(visitIdentifier);
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
                return res.status(400).json({ message: 'salesmanId is required' });
            }
    
            if (!Array.isArray(customerIds) || customerIds.length === 0) {
                return res.status(400).json({ message: 'customerIds must be a non-empty array' });
            }
    
            // Fetch salesman
            const salesman = await salesmanService.getSalesmanById(salesmanId);
            if (!salesman) {
                return res.status(404).json({ message: 'Salesman not found' });
            }
    
            if (salesman.status !== 'ACTIVE' || salesman.available === false) {
                return res.status(400).json({ message: 'Salesman is not available' });
            }
    
            // Check last journey
            const journey = await journeyService.checkLastJourney(
                salesman.lastJourneyId,
                salesmanId
            );
    
            // CASE 1: Journey exists and has not started → add visits
            if (journey && journey.startJourney === null) {
                const result = await visitService.bulkCreateVisits(
                    salesmanId,
                    customerIds,
                    journey.journeyId
                );
    
                return res.status(201).json({
                    message: `Added ${result.count} visits to existing journey`,
                    data: result
                });
            }
    
            // CASE 2: Journey exists and already started → block
            if (journey && journey.startJourney !== null && journey.endJourney === null) {
                return res.status(400).json({
                    message: 'Salesman has already started the journey. Cannot add more visits.'
                });
            }
    
            // CASE 3: No journey exists OR journey already ended → create new journey
            const newJourney = await journeyService.createJourney(salesmanId);
    
            // Update salesman's lastJourneyId
            await salesmanService.updateSalesman(salesmanId, {
                lastJourneyId: newJourney.journeyId
            });
    
            const result = await visitService.bulkCreateVisits(
                salesmanId,
                customerIds,
                newJourney.journeyId
            );
    
            return res.status(201).json({
                message: `Created ${result.count} visits in new journey`,
                data: result
            });
    
        } catch (error) {
            console.error('Error in bulk create visits:', error);
            res.status(500).json({
                message: error.message || 'Failed to create visits'
            });
        }
    }
}
module.exports = new VisitController();
