const reasonService = require('../services/reasonService');

class ReasonController {
    async getAll(req, res) {
        try {
            const reasons = await reasonService.getAllReasons();
            res.status(200).json(reasons);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const reason = await reasonService.createReason(req.body);
            res.status(201).json(reason);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const reason = await reasonService.updateReason(req.params.id, req.body);
            res.status(200).json(reason);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await reasonService.deleteReason(req.params.id);
            res.status(200).json({ message: 'Reason deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ReasonController();
