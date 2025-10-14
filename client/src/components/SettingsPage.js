import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, RefreshCw, Edit3 } from 'lucide-react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    customInvoice: false,
    customInvoiceSequence: '',
    visitSequence: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings({
          customInvoice: data.data.customInvoice,
          customInvoiceSequence: data.data.customInvoiceSequence || '',
          visitSequence: data.data.visitSequence
        });
      } else {
        throw new Error('Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('http://localhost:3000/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400">Configure application settings</p>
          </div>
        </div>
      </motion.div>

      {/* Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Mobile App Settings</h2>
          
          {/* Settings Options */}
          <div className="space-y-6">
            {/* Custom Invoice Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-1">Custom Invoice</h3>
                  <p className="text-sm text-gray-400">
                    Enable custom invoice functionality for salesmen
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('customInvoice')}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                    settings.customInvoice ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      settings.customInvoice ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Custom Invoice Sequence Input - Shows when customInvoice is ON */}
              <AnimatePresence>
                {settings.customInvoice && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-gray-700/20 rounded-xl border border-gray-600/50">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <Edit3 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-white mb-2">
                            Custom Invoice Sequence
                          </label>
                          <p className="text-xs text-gray-400 mb-3">
                            Define the custom sequence pattern for invoice IDs (e.g., "INV-{'{'}year{'}'}-{'{'}month{'}'}-{'{'}number{'}'}")
                          </p>
                          <div className="flex space-x-3">
                            <input
                              type="text"
                              value={settings.customInvoiceSequence}
                              onChange={(e) => setSettings(prev => ({ ...prev, customInvoiceSequence: e.target.value }))}
                              placeholder="e.g., INV-{year}-{month}-{number}"
                              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
                            >
                              {saving ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4" />
                                  <span>Save</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Available placeholders: {'{'}year{'}'}, {'{'}month{'}'}, {'{'}day{'}'}, {'{'}number{'}'}, {'{'}salesId{'}'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Visit Sequence Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-white mb-1">Visit Sequence</h3>
                <p className="text-sm text-gray-400">
                  Enforce sequential visit order for salesmen
                </p>
              </div>
              <button
                onClick={() => handleToggle('visitSequence')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                  settings.visitSequence ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.visitSequence ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-xl ${
                message.type === 'success'
                  ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                  : 'bg-red-500/20 border border-red-500/50 text-red-400'
              }`}
            >
              {message.text}
            </motion.div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 bg-blue-500/10 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6"
      >
        <h3 className="text-lg font-semibold text-blue-400 mb-2">About Settings</h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          These settings will be synchronized with the mobile application during the next data sync. 
          Changes will affect all salesmen using the mobile app.
        </p>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
