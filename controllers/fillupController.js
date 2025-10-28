const fillupService = require('../services/fillupService');

class FillupController {
    async create(req, res) {
        try {
            const { journeyId, salesId, items } = req.body;

            if (!journeyId || !salesId || !items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'journeyId, salesId, and items array are required'
                });
            }

            // Validate items
            for (const item of items) {
                if (!item.prodId || !item.quantity || !item.uom) {
                    return res.status(400).json({
                        success: false,
                        message: 'Each item must have prodId, quantity, and uom'
                    });
                }
            }

            const fillup = await fillupService.createFillup(req.body);
            
            res.status(201).json({
                success: true,
                data: fillup,
                message: 'Fillup created successfully'
            });
        } catch (error) {
            console.error('Error creating fillup:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    async getAll(req, res) {
        try {
            const fillups = await fillupService.getAllFillups();
            res.status(200).json({
                success: true,
                data: fillups
            });
        } catch (error) {
            console.error('Error fetching fillups:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    async getById(req, res) {
        try {
            const fillup = await fillupService.getFillupById(req.params.id);
            
            if (!fillup) {
                return res.status(404).json({
                    success: false,
                    message: 'Fillup not found'
                });
            }

            res.status(200).json({
                success: true,
                data: fillup
            });
        } catch (error) {
            console.error('Error fetching fillup:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    async getByJourney(req, res) {
        try {
            const { journeyId, salesId } = req.params;
            const fillups = await fillupService.getFillupsByJourney(journeyId, salesId);
            
            res.status(200).json({
                success: true,
                data: fillups
            });
        } catch (error) {
            console.error('Error fetching fillups by journey:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    async getBySalesman(req, res) {
        try {
            const fillups = await fillupService.getFillupsBySalesman(req.params.salesId);
            
            res.status(200).json({
                success: true,
                data: fillups
            });
        } catch (error) {
            console.error('Error fetching fillups by salesman:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    async updateStatus(req, res) {
        try {
            const { status } = req.body;
            
            if (!['PENDING', 'COMPLETED', 'CANCELLED'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be PENDING, COMPLETED, or CANCELLED'
                });
            }

            const fillup = await fillupService.updateFillupStatus(req.params.id, status);
            
            res.status(200).json({
                success: true,
                data: fillup,
                message: 'Fillup status updated successfully'
            });
        } catch (error) {
            console.error('Error updating fillup status:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    async delete(req, res) {
        try {
            await fillupService.deleteFillup(req.params.id);
            
            res.status(200).json({
                success: true,
                message: 'Fillup deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting fillup:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }
}

module.exports = new FillupController();
