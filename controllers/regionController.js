const regionService = require('../services/regionService');

class RegionController {
    async getAllRegions(req, res) {
        try {
            const regions = await regionService.getAllRegions();
            res.json(regions);
        } catch (error) {
            console.error('Error fetching regions:', error);
            res.status(500).json({ error: 'Failed to fetch regions' });
        }
    }

    async getRegionById(req, res) {
        try {
            const { id } = req.params;
            const region = await regionService.getRegionById(id);
            
            if (!region) {
                return res.status(404).json({ error: 'Region not found' });
            }
            
            res.json(region);
        } catch (error) {
            console.error('Error fetching region:', error);
            res.status(500).json({ error: 'Failed to fetch region' });
        }
    }

    async createRegion(req, res) {
        try {
            const { country, city, region } = req.body;
            
            if (!country || !city || !region) {
                return res.status(400).json({ error: 'Country, city, and region are required' });
            }
            
            const newRegion = await regionService.createRegion({ country, city, region });
            res.status(201).json(newRegion);
        } catch (error) {
            console.error('Error creating region:', error);
            res.status(500).json({ error: 'Failed to create region' });
        }
    }

    async updateRegion(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            
            const updatedRegion = await regionService.updateRegion(id, updates);
            res.json(updatedRegion);
        } catch (error) {
            console.error('Error updating region:', error);
            res.status(500).json({ error: 'Failed to update region' });
        }
    }

    async deleteRegion(req, res) {
        try {
            const { id } = req.params;
            await regionService.deleteRegion(id);
            res.json({ message: 'Region deleted successfully' });
        } catch (error) {
            console.error('Error deleting region:', error);
            res.status(500).json({ error: 'Failed to delete region' });
        }
    }

    async getRegionsByCountry(req, res) {
        try {
            const { country } = req.params;
            const regions = await regionService.getRegionsByCountry(country);
            res.json(regions);
        } catch (error) {
            console.error('Error fetching regions by country:', error);
            res.status(500).json({ error: 'Failed to fetch regions' });
        }
    }

    async getRegionsByCity(req, res) {
        try {
            const { city } = req.params;
            const regions = await regionService.getRegionsByCity(city);
            res.json(regions);
        } catch (error) {
            console.error('Error fetching regions by city:', error);
            res.status(500).json({ error: 'Failed to fetch regions' });
        }
    }
}

module.exports = new RegionController();
