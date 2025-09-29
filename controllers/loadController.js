const customerService = require('../services/customerService');
const salesmanService = require('../services/salesmanService');
const visitService = require('../services/visitService');
const productService = require('../services/productService');

module.exports = {
    async syncData(req, res) {
      try {
        const salesmanId = req.params.id || req.user?.id;
        
        if (!salesmanId) {
          return res.status(400).json({ error: 'Salesman ID is required' });
        }
  
        const [visits, products] = await Promise.all([
          visitService.getTodayVisits(salesmanId),
          productService.getAllProducts()
        ]);
  
        return res.json({
          visits,
          products
        });
      } catch (error) {
        console.error('Sync Error:', error);
        return res.status(500).json({ error: 'Failed to sync data.', message: error.message });
      }
    }
  };