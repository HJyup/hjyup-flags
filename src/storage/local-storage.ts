import { IFeatureFlag } from '../utils';

class LocalStorageWrapper {
  private readonly storageKey = 'feature-flags';

  /**
   * Initializes LocalStorageWrapper with initial feature flags.
   * If flags already exist in localStorage, those values are preserved.
   * @param initialFlags - Record of feature flags to initialize
   */
  constructor(initialFlags: Record<string, IFeatureFlag> = {}) {
    const existingData = localStorage.getItem(this.storageKey);
    const existingFlags = existingData ? JSON.parse(existingData) : {};

    const mergedFlags = {
      ...initialFlags,
      ...existingFlags,
    };

    localStorage.setItem(this.storageKey, JSON.stringify(mergedFlags));
  }

  /**
   * Retrieves a feature flag from localStorage by key.
   * @param key - The unique identifier for the feature flag.
   * @returns The feature flag object if found, null otherwise.
   */
  getItem(key: string): IFeatureFlag | null {
    const storageData = localStorage.getItem(this.storageKey);
    if (!storageData) return null;

    const flags = JSON.parse(storageData) as Record<string, IFeatureFlag>;
    return flags[key] ?? null;
  }

  /**
   * Stores a feature flag in localStorage.
   * @param key - The unique identifier for the feature flag.
   * @param value - The feature flag object to store.
   */
  setItem(key: string, value: IFeatureFlag): void {
    const storageData = localStorage.getItem(this.storageKey);
    const flags = storageData ? JSON.parse(storageData) : {};

    flags[key] = value;
    localStorage.setItem(this.storageKey, JSON.stringify(flags));
  }

  /**
   * Removes a feature flag from localStorage by key.
   * @param key - The unique identifier for the feature flag to remove.
   */
  removeItem(key: string): void {
    const storageData = localStorage.getItem(this.storageKey);
    if (!storageData) return;

    const flags = JSON.parse(storageData);
    delete flags[key];
    localStorage.setItem(this.storageKey, JSON.stringify(flags));
  }

  /**
   * Clears all feature flags from localStorage.
   */
  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export { LocalStorageWrapper };
