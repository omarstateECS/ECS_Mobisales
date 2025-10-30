const journeyService = require('../services/journeyService');

class JourneyController {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 50, startDate, endDate, salesmanId } = req.query;
            
            const result = await journeyService.getAllJourneysWithPagination(
                parseInt(page),
                parseInt(limit),
                startDate,
                endDate,
                salesmanId
            );
            
            res.json(result);
        } catch (error) {
            console.error('Error fetching journeys:', error);
            res.status(500).json({ error: 'Failed to fetch journeys' });
        }
    }

    async getById(req, res) {
        try {
            const { journeyId, salesId } = req.params;
            
            const journey = await journeyService.getJourneyById(
                parseInt(journeyId),
                parseInt(salesId)
            );
            
            if (!journey) {
                return res.status(404).json({ error: 'Journey not found' });
            }
            
            res.json(journey);
        } catch (error) {
            console.error('Error fetching journey:', error);
            res.status(500).json({ error: 'Failed to fetch journey' });
        }
    }

    async getJourneyStats(req, res) {
        try {
            const { journeyId, salesId } = req.params;
            
            const stats = await journeyService.getJourneyStats(
                parseInt(journeyId),
                parseInt(salesId)
            );
            
            res.json(stats);
        } catch (error) {
            console.error('Error fetching journey stats:', error);
            res.status(500).json({ error: 'Failed to fetch journey stats' });
        }
    }

    async getLatestJourney(req, res) {
        try {
            const journey = await journeyService.getLatestJourney(req.params.salesId);
            
            if (!journey) {
                return res.status(404).json({ error: 'Journey not found' });
            }

            if(journey.startJourney){
                return res.status(404).json({ error: 'No Journies Found' });
            }
            
            res.json(journey);
        } catch (error) {
            console.error('Error fetching latest journey:', error);
            res.status(500).json({ error: 'Failed to fetch latest journey' });
        }
    }
}

module.exports = new JourneyController();
