const industryService = require('../services/industryService');

const create = async (req, res) => {
    try {
        const industry = await industryService.createIndustry(req.body);
        res.status(201).json({
            success: true,
            data: industry,
            message: 'Industry created successfully'
        });
    } catch (error) {
        console.error('Error creating industry:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create industry'
        });
    }
};

const getAll = async (req, res) => {
    try {
        const industries = await industryService.getAllIndustries();
        res.json({
            success: true,
            data: industries
        });
    } catch (error) {
        console.error('Error fetching industries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch industries'
        });
    }
};

const getById = async (req, res) => {
    try {
        const industry = await industryService.getIndustryById(req.params.id);
        if (!industry) {
            return res.status(404).json({
                success: false,
                message: 'Industry not found'
            });
        }
        res.json({
            success: true,
            data: industry
        });
    } catch (error) {
        console.error('Error fetching industry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch industry'
        });
    }
};

const update = async (req, res) => {
    try {
        const industry = await industryService.updateIndustry(req.params.id, req.body);
        res.json({
            success: true,
            data: industry,
            message: 'Industry updated successfully'
        });
    } catch (error) {
        console.error('Error updating industry:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update industry'
        });
    }
};

const deleteIndustry = async (req, res) => {
    try {
        await industryService.deleteIndustry(req.params.id);
        res.json({
            success: true,
            message: 'Industry deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting industry:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to delete industry'
        });
    }
};

module.exports = {
    create,
    getAll,
    getById,
    update,
    deleteIndustry
};
