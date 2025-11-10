import React, { createContext, useContext, useState, useEffect } from 'react';

const LocalizationContext = createContext();

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

export const LocalizationProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to 'en'
    return localStorage.getItem('language') || 'en';
  });

  const [translations, setTranslations] = useState({});
  const [fallbackTranslations, setFallbackTranslations] = useState({});

  useEffect(() => {
    // Preload English fallback once
    const loadFallback = async () => {
      try {
        const enModule = await import('../locales/en.json');
        setFallbackTranslations(enModule.default || {});
      } catch (e) {
        console.error('Failed to load English fallback translations', e);
      }
    };
    loadFallback();
  }, []);

  useEffect(() => {
    // Load translations for the selected language
    loadTranslations(language);
  }, [language]);

  const loadTranslations = async (lang) => {
    try {
      const module = await import(`../locales/${lang}.json`);
      setTranslations(module.default);
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
      // Fallback to English if loading fails
      if (lang !== 'en') {
        const fallback = await import('../locales/en.json');
        setTranslations(fallback.default);
      }
    }
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    // Update HTML dir and lang attributes
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
  };

  const t = (key) => {
    const resolve = (obj, path) => {
      const keys = path.split('.');
      let v = obj;
      for (const k of keys) {
        v = v?.[k];
        if (v === undefined) return undefined;
      }
      return v;
    };

    // Try current language first
    let value = resolve(translations, key);
    if (value !== undefined) return value;

    // Fallback to English
    const fallbackValue = resolve(fallbackTranslations, key);
    if (fallbackValue !== undefined) return fallbackValue;

    console.warn(`Translation key not found: ${key}`);
    return key;
  };

  // Set initial direction
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    changeLanguage,
    t,
    isRTL: language === 'ar'
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};
