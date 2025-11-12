const reasonService = require('../services/reasonService');

class ReasonController {
    async getAllReturnReasons(req, res) {
        try {
            const reasons = await reasonService.getAllReturnReasons();
            res.status(200).json(reasons);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async createReturnReason(req, res) {
        try {
            const reason = await reasonService.createReturnReason(req.body);
            res.status(201).json(reason);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateReturnReason(req, res) {
        try {
            const reason = await reasonService.updateReturnReason(req.params.id, req.body);
            res.status(200).json(reason);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteReturnReason(req, res) {
        try {
            await reasonService.deleteReturnReason(req.params.id);
            res.status(200).json({ message: 'Reason deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    // Cancel Reasons ----------------------------------------------------------------------------------------------------------


    async getAllCancelReasons(req, res) {
        try {
            const reasons = await reasonService.getAllCancelReasons();
            res.status(200).json(reasons);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async createCancelReason(req, res) {
        try {
            const reason = await reasonService.createCancelReason(req.body);
            res.status(201).json(reason);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateCancelReason(req, res) {
        try {
            const reason = await reasonService.updateCancelReason(req.params.id, req.body);
            res.status(200).json(reason);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteCancelReason(req, res) {
        try {
            await reasonService.deleteCancelReason(req.params.id);
            res.status(200).json({ message: 'Reason deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ReasonController();
