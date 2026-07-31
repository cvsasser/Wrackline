import { SavedFind, LocationInfo, ShellIdentification } from '../types';

const FINDS_STORAGE_KEY = 'wrackline_saved_finds_v1';
const API_KEY_STORAGE_KEY = 'wrackline_gemini_key';

export const getStoredApiKey = (): string => {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
  } catch (e) {
    return '';
  }
};

export const setStoredApiKey = (key: string): void => {
  try {
    if (key.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save API key to localStorage:', e);
  }
};

export const getSavedFinds = (): SavedFind[] => {
  try {
    const raw = localStorage.getItem(FINDS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse saved finds from localStorage:', e);
    return [];
  }
};

export const saveFind = (
  photoUrl: string,
  identification: ShellIdentification,
  location: LocationInfo,
  userNotes: string = ''
): SavedFind => {
  const finds = getSavedFinds();
  const newFind: SavedFind = {
    id: 'find_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    photoUrl,
    identification,
    timestamp: new Date().toISOString(),
    location,
    userNotes,
  };

  const updated = [newFind, ...finds];
  try {
    localStorage.setItem(FINDS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to persist find to localStorage:', e);
  }
  return newFind;
};

export const deleteFind = (id: string): SavedFind[] => {
  const finds = getSavedFinds();
  const updated = finds.filter((f) => f.id !== id);
  try {
    localStorage.setItem(FINDS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete find from localStorage:', e);
  }
  return updated;
};

// Geolocation helper with reverse geocode fallback
export const getCurrentBeachLocation = (): Promise<LocationInfo> => {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      return resolve({ beachName: 'Coastal Beach Tag' });
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(4));
        const lng = parseFloat(position.coords.longitude.toFixed(4));
        const fallbackName = `Beach Coordinates • ${lat}° N, ${Math.abs(lng)}° W`;

        let placeName = fallbackName;
        try {
          const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lng}`);
          if (res.ok) {
            const data = await res.json();
            if (data.address) {
              const mainLoc =
                data.address.beach ||
                data.address.natural ||
                data.address.leisure ||
                data.address.suburb ||
                data.address.village ||
                data.address.town ||
                data.address.city;
              const region = data.address.county || data.address.state || data.address.country;
              const parts = [mainLoc, region].filter(Boolean);
              if (parts.length > 0) {
                placeName = parts.join(', ');
              } else if (data.placeName) {
                placeName = data.placeName.split(',').slice(0, 3).join(',');
              }
            } else if (data.placeName) {
              placeName = data.placeName.split(',').slice(0, 3).join(',');
            }
          }
        } catch (e) {
          console.warn('Reverse geocoding call failed, using coordinate string:', e);
        }

        resolve({
          latitude: lat,
          longitude: lng,
          beachName: placeName,
        });
      },
      (error) => {
        console.warn('Geolocation warning/denied:', error.message);
        resolve({ beachName: 'Coastal Tide Line • Beach Tag' });
      },
      { timeout: 7000, enableHighAccuracy: false }
    );
  });
};
