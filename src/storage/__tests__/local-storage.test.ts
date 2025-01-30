import { LocalStorageWrapper } from '../local-storage';
import { IFeatureFlag } from '../../utils';
import { FeatureFlag } from '../../core';

const mockLocalStorage = {
  store: {} as { [key: string]: string },
  getItem: function (key: string) {
    return this.store[key] || null;
  },
  setItem: function (key: string, value: string) {
    this.store[key] = value.toString();
  },
  clear: function () {
    this.store = {};
  },
  removeItem: function (key: string) {
    delete this.store[key];
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
});

describe('LocalStorageWrapper', () => {
  let storage: LocalStorageWrapper;
  const mockFeatureFlag: IFeatureFlag = new FeatureFlag({
    name: 'test-flag',
    defaultValue: true,
    context: {
      userRole: null,
      environment: null,
      region: null,
      percentage: undefined,
    },
  });

  beforeEach(() => {
    localStorage.clear();
    storage = new LocalStorageWrapper();
  });

  describe('constructor', () => {
    it('should preserve existing flags when reinitializing wrapper', () => {
      storage.setItem('test-flag', mockFeatureFlag);

      const newStorage = new LocalStorageWrapper();

      const retrievedFlag = newStorage.getItem('test-flag');
      expect(retrievedFlag).toEqual(mockFeatureFlag);

      newStorage.clear();
      expect(localStorage.getItem('feature-flags')).toBeNull();
    });

    it('should merge initial flags with existing storage', () => {
      storage.setItem('test-flag', mockFeatureFlag);

      const anotherFlag: IFeatureFlag = {
        ...mockFeatureFlag,
        name: 'another-flag',
      };

      const newStorage = new LocalStorageWrapper({
        'another-flag': anotherFlag,
      });

      expect(newStorage.getItem('test-flag')).toEqual(mockFeatureFlag);
      expect(newStorage.getItem('another-flag')).toEqual(anotherFlag);

      newStorage.clear();
      expect(localStorage.getItem('feature-flags')).toBeNull();
    });
  });

  describe('setItem', () => {
    it('should store a feature flag', () => {
      storage.setItem('test-flag', mockFeatureFlag);
      const storedData = JSON.parse(
        localStorage.getItem('feature-flags') || '{}'
      );

      expect(storedData['test-flag']).toEqual(mockFeatureFlag);
    });

    it('should preserve existing flags when adding new ones', () => {
      const anotherFlag: IFeatureFlag = {
        ...mockFeatureFlag,
        name: 'another-flag',
      };

      storage.setItem('test-flag', mockFeatureFlag);
      storage.setItem('another-flag', anotherFlag);

      const storedData = JSON.parse(
        localStorage.getItem('feature-flags') || '{}'
      );

      expect(storedData['test-flag']).toEqual(mockFeatureFlag);
      expect(storedData['another-flag']).toEqual(anotherFlag);
    });
  });

  describe('getItem', () => {
    it('should retrieve a stored feature flag', () => {
      storage.setItem('test-flag', mockFeatureFlag);

      const retrievedFlag = storage.getItem('test-flag');
      expect(retrievedFlag).toEqual(mockFeatureFlag);
    });

    it('should return null for non-existent flags', () => {
      const retrievedFlag = storage.getItem('non-existent');
      expect(retrievedFlag).toBeNull();
    });

    it('should return null when storage is empty', () => {
      const retrievedFlag = storage.getItem('test-flag');
      expect(retrievedFlag).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should remove a specific feature flag', () => {
      storage.setItem('test-flag', mockFeatureFlag);
      storage.removeItem('test-flag');

      const retrievedFlag = storage.getItem('test-flag');
      expect(retrievedFlag).toBeNull();
    });

    it('should not affect other stored flags', () => {
      const anotherFlag: IFeatureFlag = {
        ...mockFeatureFlag,
        name: 'another-flag',
      };

      storage.setItem('test-flag', mockFeatureFlag);
      storage.setItem('another-flag', anotherFlag);
      storage.removeItem('test-flag');

      expect(storage.getItem('test-flag')).toBeNull();
      expect(storage.getItem('another-flag')).toEqual(anotherFlag);
    });

    it('should handle removing non-existent flags', () => {
      storage.setItem('test-flag', mockFeatureFlag);
      storage.removeItem('non-existent');

      expect(storage.getItem('test-flag')).toEqual(mockFeatureFlag);
    });
  });

  describe('clear', () => {
    it('should remove all stored flags', () => {
      const anotherFlag: IFeatureFlag = {
        ...mockFeatureFlag,
        name: 'another-flag',
      };

      storage.setItem('test-flag', mockFeatureFlag);
      storage.setItem('another-flag', anotherFlag);
      storage.clear();

      expect(storage.getItem('test-flag')).toBeNull();
      expect(storage.getItem('another-flag')).toBeNull();
      expect(localStorage.getItem('feature-flags')).toBeNull();
    });

    it('should handle clearing empty storage', () => {
      storage.clear();
      expect(localStorage.getItem('feature-flags')).toBeNull();
    });
  });
});
