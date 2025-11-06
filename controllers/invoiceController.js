const invoiceService = require('../services/invoiceService');

class InvoiceController {
    async getAll(req, res) {
        try {
            const { salesId, custId, invType, paymentMethod, dateFrom, dateTo } = req.query;
            
            const filters = {};
            if (salesId) filters.salesId = salesId;
            if (custId) filters.custId = custId;
            if (invType) filters.invType = invType;
            if (paymentMethod) filters.paymentMethod = paymentMethod;
            if (dateFrom) filters.dateFrom = dateFrom;
            if (dateTo) filters.dateTo = dateTo;
            
            const data = await invoiceService.getAllInvoices(filters);
            res.json(data);
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
