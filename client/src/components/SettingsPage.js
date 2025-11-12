import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Settings, Save, RefreshCw, Edit3, GripVertical, Plus, X } from 'lucide-react';
import { useLocalization } from '../contexts/LocalizationContext';

const SettingsPage = () => {
  const { t } = useLocalization();
  const [settings, setSettings] = useState({
    customInvoice: false,
    customInvoiceSequence: '',
    visitSequence: false,
    filterCustomersByRegion: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Draggable placeholders state
  const [sequenceParts, setSequenceParts] = useState([]);
  const [availablePlaceholders] = useState([
    { id: 'year', label: 'Year', value: '{year}' },
    { id: 'month', label: 'Month', value: '{month}' },
    { id: 'day', label: 'Day', value: '{day}' },
    { id: 'number', label: 'Number', value: '{number}' },
    { id: 'salesId', label: 'Sales ID', value: '{salesId}' }
  ]);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Parse sequence string into parts when settings load
  useEffect(() => {
    if (settings.customInvoiceSequence) {
      parseSequenceIntoParts(settings.customInvoiceSequence);
    }
  }, [settings.customInvoiceSequence]);

  // Update sequence string when parts change
  useEffect(() => {
    const newSequence = sequenceParts.map(part => part.value).join('');
    if (newSequence !== settings.customInvoiceSequence) {
      setSettings(prev => ({ ...prev, customInvoiceSequence: newSequence }));
    }
  }, [sequenceParts]);

  const parseSequenceIntoParts = (sequence) => {
    if (!sequence) {
      setSequenceParts([]);
      return;
    }
    
    const parts = [];
    let currentText = '';
    let i = 0;
    
    while (i < sequence.length) {
      if (sequence[i] === '{') {
        // Save any accumulated text
        if (currentText) {
          parts.push({
            id: `text-${Date.now()}-${Math.random()}`,
            type: 'text',
            value: currentText,
            label: currentText
          });
          currentText = '';
        }
        
        // Find the closing brace
        const closeIndex = sequence.indexOf('}', i);
        if (closeIndex !== -1) {
          const placeholder = sequence.substring(i, closeIndex + 1);
          const placeholderName = placeholder.slice(1, -1); // Remove braces
          parts.push({
            id: `${placeholderName}-${Date.now()}-${Math.random()}`,
            type: 'placeholder',
            value: placeholder,
            label: placeholderName.charAt(0).toUpperCase() + placeholderName.slice(1)
          });
          i = closeIndex + 1;
        } else {
          currentText += sequence[i];
          i++;
        }
      } else {
        currentText += sequence[i];
        i++;
      }
    }
    
    // Add any remaining text
    if (currentText) {
      parts.push({
        id: `text-${Date.now()}-${Math.random()}`,
        type: 'text',
        value: currentText,
        label: currentText
      });
    }
    
    setSequenceParts(parts);
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings({
          customInvoice: data.data.customInvoice,
          customInvoiceSequence: data.data.customInvoiceSequence || '',
          visitSequence: data.data.visitSequence,
          filterCustomersByRegion: data.data.filterCustomersByRegion || false
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

  const addPlaceholder = (placeholder) => {
    const newPart = {
      id: `${placeholder.id}-${Date.now()}-${Math.random()}`,
      type: 'placeholder',
      value: placeholder.value,
      label: placeholder.label
    };
    setSequenceParts(prev => [...prev, newPart]);
  };

  const addTextSeparator = () => {
    const separator = prompt('Enter separator text (e.g., "-", "_", "/"):');
    if (separator) {
      const newPart = {
        id: `text-${Date.now()}-${Math.random()}`,
        type: 'text',
        value: separator,
        label: separator
      };
      setSequenceParts(prev => [...prev, newPart]);
    }
  };

  const removePart = (partId) => {
    setSequenceParts(prev => prev.filter(part => part.id !== partId));
  };

  const clearSequence = () => {
    setSequenceParts([]);
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
        console.log('Settings saved response:', data);
        // Update local state with saved settings
        setSettings({
          customInvoice: data.data.customInvoice,
          customInvoiceSequence: data.data.customInvoiceSequence || '',
          visitSequence: data.data.visitSequence,
          filterCustomersByRegion: data.data.filterCustomersByRegion || false
        });
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
          <p className="text-gray-400">{t('settings.loading')}</p>
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
            <h1 className="text-3xl font-bold text-white">{t('settings.title')}</h1>
            <p className="text-gray-400">{t('settings.subtitle')}</p>
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
                            Custom Invoice Sequence Builder
                          </label>
                          <p className="text-xs text-gray-400 mb-3">
                            Drag and drop elements to build custom invoice sequence pattern
                          </p>
                          
                          {/* Draggable Sequence Builder */}
                          <div className="space-y-4">
                            {/* Current Sequence */}
                            <div className="min-h-[60px] p-3 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg">
                              {sequenceParts.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-2">
                                  Add elements below to build sequence
                                </p>
                              ) : (
                                <Reorder.Group
                                  axis="x"
                                  values={sequenceParts}
                                  onReorder={setSequenceParts}
                                  className="flex flex-wrap gap-2 items-center"
                                >
                                  {sequenceParts.map((part) => (
                                    <Reorder.Item
                                      key={part.id}
                                      value={part}
                                      className="cursor-grab active:cursor-grabbing"
                                    >
                                      <motion.div
                                        layout
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                                          part.type === 'placeholder'
                                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                            : 'bg-gray-700/50 text-gray-300 border border-gray-600/30'
                                        }`}
                                      >
                                        <GripVertical size={14} className="opacity-50" />
                                        <span>{part.label}</span>
                                        <button
                                          onClick={() => removePart(part.id)}
                                          className="ml-1 hover:text-red-400 transition-colors"
                                        >
                                          <X size={14} />
                                        </button>
                                      </motion.div>
                                    </Reorder.Item>
                                  ))}
                                </Reorder.Group>
                              )}
                            </div>

                            {/* Preview */}
                            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                              <p className="text-xs text-gray-500 mb-1">Preview:</p>
                              <p className="text-sm font-mono text-white">
                                {settings.customInvoiceSequence || 'No sequence defined'}
                              </p>
                            </div>

                            {/* Available Placeholders */}
                            <div>
                              <p className="text-xs text-gray-400 mb-2">Available elements:</p>
                              <div className="flex flex-wrap gap-2">
                                {availablePlaceholders.map((placeholder) => (
                                  <button
                                    key={placeholder.id}
                                    onClick={() => addPlaceholder(placeholder)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <Plus size={14} />
                                    {placeholder.label}
                                  </button>
                                ))}
                                <button
                                  onClick={addTextSeparator}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-700/30 hover:bg-gray-700/50 text-gray-300 border border-gray-600/30 rounded-lg text-sm font-medium transition-colors"
                                >
                                  <Plus size={14} />
                                  Add Text
                                </button>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={clearSequence}
                                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg transition-colors text-sm font-medium"
                              >
                                Clear All
                              </button>
                              <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
                              >
                                {saving ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Saving...</span>
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4" />
                                    <span>Save Sequence</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
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
                  Force sequential visit order for salesmen
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

            {/* Filter Customers by Region Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-white mb-1">Filter Customers by Region</h3>
                <p className="text-sm text-gray-400">
                  Send only customers in journey region to mobile app (when disabled, sends all customers)
                </p>
              </div>
              <button
                onClick={() => handleToggle('filterCustomersByRegion')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                  settings.filterCustomersByRegion ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.filterCustomersByRegion ? 'translate-x-7' : 'translate-x-1'
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
          These settings will be synced with the mobile app during the next data sync. 
          Changes will affect all salesmen using the mobile app.
        </p>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
