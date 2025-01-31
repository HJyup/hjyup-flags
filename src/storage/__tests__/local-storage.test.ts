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
      expect(retrievedFlag?.name).toEqual(mockFeatureFlag.name);
      expect(retrievedFlag?.defaultValue).toEqual(mockFeatureFlag.defaultValue);
      expect(retrievedFlag?.context.getContext()).toEqual(
        mockFeatureFlag.context.getContext()
      );

      newStorage.clear();
      expect(localStorage.getItem('feature-flags')).toBeNull();
    });

    it('should merge initial flags with existing storage', () => {
      storage.setItem('test-flag', mockFeatureFlag);

      const anotherFlag: IFeatureFlag = new FeatureFlag({
        name: 'another-flag',
        defaultValue: true,
        context: {
          userRole: null,
          environment: null,
          region: null,
          percentage: undefined,
        },
      });

      const newStorage = new LocalStorageWrapper({
        anotherFlag,
      });

      const retrievedTestFlag = newStorage.getItem('test-flag');
      const retrievedAnotherFlag = newStorage.getItem('another-flag');

      expect(retrievedTestFlag?.name).toEqual(mockFeatureFlag.name);
      expect(retrievedTestFlag?.defaultValue).toEqual(
        mockFeatureFlag.defaultValue
      );
      expect(retrievedTestFlag?.context.getContext()).toEqual(
        mockFeatureFlag.context.getContext()
      );

      expect(retrievedAnotherFlag?.name).toEqual(anotherFlag.name);
      expect(retrievedAnotherFlag?.defaultValue).toEqual(
        anotherFlag.defaultValue
      );
      expect(retrievedAnotherFlag?.context.getContext()).toEqual(
        anotherFlag.context.getContext()
      );

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

      expect(storedData['test-flag'].name).toEqual(mockFeatureFlag.name);
      expect(storedData['test-flag'].defaultValue).toEqual(
        mockFeatureFlag.defaultValue
      );
      expect(storedData['test-flag'].context).toEqual(
        mockFeatureFlag.context.getContext()
      );
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

      expect(storedData['test-flag'].name).toEqual(mockFeatureFlag.name);
      expect(storedData['test-flag'].defaultValue).toEqual(
        mockFeatureFlag.defaultValue
      );
      expect(storedData['test-flag'].context).toEqual(
        mockFeatureFlag.context.getContext()
      );

      expect(storedData['another-flag'].name).toEqual(anotherFlag.name);
      expect(storedData['another-flag'].defaultValue).toEqual(
        anotherFlag.defaultValue
      );
      expect(storedData['another-flag'].context).toEqual(
        anotherFlag.context.getContext()
      );
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
