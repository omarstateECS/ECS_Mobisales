import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Search, MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';

const RegionsView = () => {
  const { theme } = useTheme();
  const { showError, showSuccess } = useNotification();
  
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterCity, setFilterCity] = useState('');

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/regions');
      setRegions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching regions:', error);
      showError('Failed to load regions');
      setRegions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegions = regions.filter(region => {
    if (!region) return false;
    
    const matchesSearch = !searchTerm || 
      region.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      region.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      region.country?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = !filterCountry || region.country === filterCountry;
    const matchesCity = !filterCity || region.city === filterCity;
    
    return matchesSearch && matchesCountry && matchesCity;
  });

  // Get unique countries and cities for filters
  const countries = [...new Set(regions.map(r => r.country).filter(Boolean))].sort();
  const cities = [...new Set(regions.map(r => r.city).filter(Boolean))].sort();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Globe className="inline-block mr-3 mb-1" size={32} />
            Regions
          </h1>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage all regions in the system
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <Search className="w-4 h-4 inline mr-2" />
              Search
            </label>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <input
                type="text"
                placeholder="Search regions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>

          {/* Country Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <Globe className="w-4 h-4 inline mr-2" />
              Country
            </label>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <MapPin className="w-4 h-4 inline mr-2" />
              City
            </label>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Globe className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Regions
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {filteredRegions.length}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
              <Globe className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Countries
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {countries.length}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <MapPin className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Cities
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {cities.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Regions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
      ) : filteredRegions.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <Globe className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No regions found
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    ID
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Region
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    City
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Country
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredRegions.map((region, index) => (
                  <motion.tr
                    key={region.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={theme === 'dark' ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}
                  >
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      #{region.id}
                    </td>
                    <td className={`px-6 py-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                          <MapPin className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="font-medium">{region.region}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {region.city}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {region.country}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {formatDate(region.createdAt)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionsView;
