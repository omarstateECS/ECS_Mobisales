const salesmanService = require('../services/salesmanService');
const visitService = require('../services/visitService');
const productService = require('../services/productService');
const reasonService = require('../services/reasonService');
const invoiceService = require('../services/invoiceService');
const journeyService = require('../services/journeyService');
const settingsService = require('../services/settingsService');
const customerService = require('../services/customerService');

module.exports = {
    async syncData(req, res) {
      try {
        const salesmanId = req.params.id || req.user?.id;
        
        if (!salesmanId) {
          return res.status(400).json({ error: 'Salesman ID is required' });
        }
  
        const [visits, products, reasons, lastInvoice, latestJourney, settings] = await Promise.all([
          visitService.getTodayVisits(salesmanId),
          productService.getAllProducts(),
          reasonService.getAllReasons(),
          invoiceService.getLastInvoice(salesmanId),
          journeyService.getLatestJourney(salesmanId),
          settingsService.getSettings(),
        ]);
        
        // Get customers based on filterCustomersByRegion setting
        let customers;
        console.log('🔍 Filter Settings:', {
          filterCustomersByRegion: settings?.filterCustomersByRegion,
          journeyRegionId: latestJourney?.regionId,
          journeyId: latestJourney?.journeyId
        });
        
        if (settings?.filterCustomersByRegion && latestJourney?.regionId) {
          // Filter by journey's region
          console.log('✅ Filtering customers by region:', latestJourney.regionId);
          customers = await customerService.getAvailableCustomersByRegion(salesmanId, latestJourney.regionId);
          console.log('📊 Filtered customers count:', customers.length);
        } else {
          // Get all available customers
          console.log('⚠️ Sending all customers (filter disabled or no journey region)');
          customers = await customerService.getAvailableCustomers(salesmanId);
          console.log('📊 All customers count:', customers.length);
        }
        
        // Get next visit ID for the latest journey (or 1 if no journey exists)
        const journeyId = latestJourney?.journeyId;
        const nextVisitId = journeyId 
          ? await visitService.getNextVisitIdForJourney(salesmanId, journeyId)
          : 1;

        // Generate startIdInvoice pattern: last 5 digits of salesId + 5-digit invoice sequence
        // Example: salesId 1000001 with invoice #1 = "0000100001" = 100001 (as integer)
        let startIdInvoice;
        if (lastInvoice?.invId) {
          startIdInvoice = lastInvoice.invId;
        } else {
          // Get last 5 digits of salesmanId and pad with zeros
          const salesIdStr = salesmanId.toString();
          const last5Digits = salesIdStr.slice(-5).padStart(5, '0');
          // Start with invoice sequence 0, padded to 5 digits
          const invoiceSequence = '00000';
          startIdInvoice = `${last5Digits}${invoiceSequence}`;
        }
  
        return res.json({
          visits,
          products,
          reasons,
          startIdInvoice,
          startIdVisit: nextVisitId,
          journeyId: latestJourney?.journeyId || null,
          customers,
          settings: {
            customInvoice: settings?.customInvoice || false,
            visitSequence: settings?.visitSequence || false,
            filterCustomersByRegion: settings?.filterCustomersByRegion || false
          }
        });
      } catch (error) {
        console.error('Load Data Error:', error);
        return res.status(500).json({ error: 'Failed to load data.', message: error.message });
      }
    }
  };