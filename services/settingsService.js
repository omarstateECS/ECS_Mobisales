const { getPrismaClient } = require('../lib/prisma');
const { getLocalTimestamp } = require('../lib/dateUtils');

class SettingsService {
  async getSettings() {
    try {
      const prisma = getPrismaClient();
      // Get all settings as name-value pairs
      const settingsArray = await prisma.settings.findMany();
      
      // If no settings exist, create default settings
      if (!settingsArray || settingsArray.length === 0) {
        const timestamp = getLocalTimestamp();
        await prisma.settings.createMany({
          data: [
            { name: 'customInvoice', value: false, textValue: '', createdAt: timestamp, updatedAt: timestamp },
            { name: 'visitSequence', value: false, createdAt: timestamp, updatedAt: timestamp },
            { name: 'filterCustomersByRegion', value: false, createdAt: timestamp, updatedAt: timestamp }
          ]
        });
        
        // Return default settings
        return {
          customInvoice: false,
          customInvoiceSequence: '',
          visitSequence: false,
          filterCustomersByRegion: false
        };
      }
      
      // Transform array to object
      const settings = {
        customInvoice: false,
        customInvoiceSequence: '',
        visitSequence: false,
        filterCustomersByRegion: false
      };
      
      settingsArray.forEach(setting => {
        if (setting.name === 'customInvoice') {
          settings.customInvoice = setting.value;
          settings.customInvoiceSequence = setting.textValue || '';
        } else if (setting.name === 'visitSequence') {
          settings.visitSequence = setting.value;
        } else if (setting.name === 'filterCustomersByRegion') {
          settings.filterCustomersByRegion = setting.value;
        }
      });
      
      return settings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  }

  async updateSettings(data) {
    try {
      const prisma = getPrismaClient();
      console.log('💾 Updating settings with data:', data);
      
      // Update customInvoice (both toggle and sequence text)
      if (data.customInvoice !== undefined || data.customInvoiceSequence !== undefined) {
        const existing = await prisma.settings.findFirst({
          where: { name: 'customInvoice' }
        });
        
        const timestamp = getLocalTimestamp();
        await prisma.settings.upsert({
          where: { name: 'customInvoice' },
          update: { 
            value: data.customInvoice !== undefined ? data.customInvoice : existing?.value || false,
            textValue: data.customInvoiceSequence !== undefined ? data.customInvoiceSequence : existing?.textValue || '',
            updatedAt: timestamp
          },
          create: { 
            name: 'customInvoice', 
            value: data.customInvoice || false,
            textValue: data.customInvoiceSequence || '',
            createdAt: timestamp,
            updatedAt: timestamp
          }
        });
      }
      
      // Update visitSequence if provided
      if (data.visitSequence !== undefined) {
        const timestamp2 = getLocalTimestamp();
        await prisma.settings.upsert({
          where: { name: 'visitSequence' },
          update: { value: data.visitSequence, updatedAt: timestamp2 },
          create: { name: 'visitSequence', value: data.visitSequence, createdAt: timestamp2, updatedAt: timestamp2 }
        });
      }
      
      // Update filterCustomersByRegion if provided
      if (data.filterCustomersByRegion !== undefined) {
        console.log('✅ Updating filterCustomersByRegion to:', data.filterCustomersByRegion);
        const timestamp3 = getLocalTimestamp();
        await prisma.settings.upsert({
          where: { name: 'filterCustomersByRegion' },
          update: { value: data.filterCustomersByRegion, updatedAt: timestamp3 },
          create: { name: 'filterCustomersByRegion', value: data.filterCustomersByRegion, createdAt: timestamp3, updatedAt: timestamp3 }
        });
      }
      
      // Return updated settings
      const updatedSettings = await this.getSettings();
      console.log('📤 Returning updated settings:', updatedSettings);
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }
}

module.exports = new SettingsService();
