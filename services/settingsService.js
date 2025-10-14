const { getPrismaClient } = require('../lib/prisma');

class SettingsService {
  async getSettings() {
    try {
      const prisma = getPrismaClient();
      // Get all settings as name-value pairs
      const settingsArray = await prisma.settings.findMany();
      
      // If no settings exist, create default settings
      if (!settingsArray || settingsArray.length === 0) {
        await prisma.settings.createMany({
          data: [
            { name: 'customInvoice', value: false, textValue: '' },
            { name: 'visitSequence', value: false }
          ]
        });
        
        // Return default settings
        return {
          customInvoice: false,
          customInvoiceSequence: '',
          visitSequence: false
        };
      }
      
      // Transform array to object
      const settings = {
        customInvoice: false,
        customInvoiceSequence: '',
        visitSequence: false
      };
      
      settingsArray.forEach(setting => {
        if (setting.name === 'customInvoice') {
          settings.customInvoice = setting.value;
          settings.customInvoiceSequence = setting.textValue || '';
        } else if (setting.name === 'visitSequence') {
          settings.visitSequence = setting.value;
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
      
      // Update customInvoice (both toggle and sequence text)
      if (data.customInvoice !== undefined || data.customInvoiceSequence !== undefined) {
        const existing = await prisma.settings.findFirst({
          where: { name: 'customInvoice' }
        });
        
        await prisma.settings.upsert({
          where: { name: 'customInvoice' },
          update: { 
            value: data.customInvoice !== undefined ? data.customInvoice : existing?.value || false,
            textValue: data.customInvoiceSequence !== undefined ? data.customInvoiceSequence : existing?.textValue || ''
          },
          create: { 
            name: 'customInvoice', 
            value: data.customInvoice || false,
            textValue: data.customInvoiceSequence || ''
          }
        });
      }
      
      // Update visitSequence if provided
      if (data.visitSequence !== undefined) {
        await prisma.settings.upsert({
          where: { name: 'visitSequence' },
          update: { value: data.visitSequence },
          create: { name: 'visitSequence', value: data.visitSequence }
        });
      }
      
      // Return updated settings
      return await this.getSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }
}

module.exports = new SettingsService();
