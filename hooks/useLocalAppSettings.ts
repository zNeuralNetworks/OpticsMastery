import { useMemo, useState } from 'react';
import { Page } from '../types';

export type FeatureVisibility = Partial<Record<Page, boolean>>;

const STORAGE_KEY = 'optics_master_settings';

interface LocalAppSettings {
  featureVisibility: FeatureVisibility;
}

const DEFAULT_SETTINGS: LocalAppSettings = {
  featureVisibility: {},
};

export const useLocalAppSettings = () => {
  const [settings, setSettings] = useState<LocalAppSettings>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_SETTINGS;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return DEFAULT_SETTINGS;
      }

      return {
        ...DEFAULT_SETTINGS,
        ...JSON.parse(saved),
      };
    } catch (error) {
      console.warn('Failed to load local app settings:', error);
      return DEFAULT_SETTINGS;
    }
  });

  const persistSettings = (nextSettings: LocalAppSettings) => {
    setSettings(nextSettings);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
    } catch (error) {
      console.warn('Failed to persist local app settings:', error);
    }
  };

  const toggleFeatureVisibility = (page: Page) => {
    const currentVisibility = settings.featureVisibility[page] !== false;

    persistSettings({
      ...settings,
      featureVisibility: {
        ...settings.featureVisibility,
        [page]: !currentVisibility,
      },
    });
  };

  const resetFeatureVisibility = () => {
    persistSettings({
      ...settings,
      featureVisibility: {},
    });
  };

  return useMemo(
    () => ({
      featureVisibility: settings.featureVisibility,
      toggleFeatureVisibility,
      resetFeatureVisibility,
    }),
    [settings.featureVisibility]
  );
};
