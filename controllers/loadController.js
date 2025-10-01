const salesmanService = require('../services/salesmanService');
const visitService = require('../services/visitService');
const productService = require('../services/productService');
const reasonService = require('../services/reasonService');

module.exports = {
    async syncData(req, res) {
      try {
        const salesmanId = req.params.id || req.user?.id;
        
        if (!salesmanId) {
          return res.status(400).json({ error: 'Salesman ID is required' });
        }
  
        const [visits, products, reasons] = await Promise.all([
          visitService.getTodayVisits(salesmanId),
          productService.getAllProducts(),
          reasonService.getAllReasons()
        ]);
  
        return res.json({
          visits,
          products,
          reasons 
        });
      } catch (error) {
        console.error('Sync Error:', error);
        return res.status(500).json({ error: 'Failed to sync data.', message: error.message });
      }
    }
  };