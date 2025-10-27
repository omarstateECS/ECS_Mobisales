const settingsService = require('../services/settingsService');

module.exports = {
  async getSettings(req, res) {
    try {
      const settings = await settingsService.getSettings();
      return res.json({
        success: true,
        data: {
          customInvoice: settings.customInvoice || false,
          customInvoiceSequence: settings.customInvoiceSequence || '',
          visitSequence: settings.visitSequence || false,
          filterCustomersByRegion: settings.filterCustomersByRegion || false
        }
      });
    } catch (error) {
      console.error('Error in getSettings:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch settings',
        message: error.message
      });
    }
  },

  async updateSettings(req, res) {
    try {
      const { customInvoice, customInvoiceSequence, visitSequence, filterCustomersByRegion } = req.body;
      
      const settings = await settingsService.updateSettings({
        customInvoice,
        customInvoiceSequence,
        visitSequence,
        filterCustomersByRegion
      });
      
      return res.json({
        success: true,
        data: {
          customInvoice: settings.customInvoice || false,
          customInvoiceSequence: settings.customInvoiceSequence || '',
          visitSequence: settings.visitSequence || false,
          filterCustomersByRegion: settings.filterCustomersByRegion || false
        },
        message: 'Settings updated successfully'
      });
    } catch (error) {
      console.error('Error in updateSettings:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update settings',
        message: error.message
      });
    }
  }
};
