const invoiceService = require('../services/invoiceService');

class InvoiceController {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 50, q = '' } = req.query;
            const data = await invoiceService.getAllInvoices(
                parseInt(page),
                parseInt(limit),
                q
            );
            res.json(data); // includes { invoices, page, limit, hasMore }
        } catch (error) {
            console.error('Error fetching invoices:', error);
            res.status(500).json({ error: error.message });
        }
    }
    
    async getById(req, res) {
        try {
            const invoice = await invoiceService.getInvoiceById(req.params.id);
            if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
            res.json(invoice);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const newInvoice = await invoiceService.createInvoice(req.body);
            res.status(201).json(newInvoice);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}  

module.exports = new InvoiceController();
