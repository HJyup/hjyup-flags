import { FeatureFlags } from '../feature-flags';
import { FeatureFlagValue, FeatureFlagContextData } from '@/utils';

type TestFlags = Record<string, FeatureFlagValue>;

describe('FeatureFlag', () => {
  describe('initialization', () => {
    it('should initialize with empty flags', () => {
      const flag = new FeatureFlags<TestFlags>({});
      expect(flag.listFlags()).toEqual({});
    });

    it('should initialize with provided flags', () => {
      const flags: TestFlags = {
        'test-flag': {
          defaultValue: true,
          context: {},
        },
      };
      const flag = new FeatureFlags<TestFlags>(flags);
      expect(flag.listFlags()).toEqual(flags);
    });
  });

  describe('flag management', () => {
    let flag: FeatureFlags<TestFlags>;

    beforeEach(() => {
      flag = new FeatureFlags<TestFlags>({});
    });

    it('should get null for non-existent flag', () => {
      expect(flag.getFlag('non-existent')).toBeNull();
    });

    it('should update and retrieve flag', () => {
      const testFlag: FeatureFlagValue = {
        defaultValue: true,
        context: {},
      };

      flag.updateFlag('test-flag', testFlag);
      expect(flag.getFlag('test-flag')).toEqual(testFlag);
    });

    it('should delete flag', () => {
      const testFlag: FeatureFlagValue = {
        defaultValue: true,
        context: {},
      };

      flag.updateFlag('test-flag', testFlag);
      flag.deleteFlag('test-flag');
      expect(flag.getFlag('test-flag')).toBeNull();
    });
  });

  describe('feature evaluation', () => {
    let flag: FeatureFlags<TestFlags>;

    beforeEach(() => {
      flag = new FeatureFlags<TestFlags>({
        'test-flag': {
          defaultValue: true,
          context: {
            userRole: 'admin',
          },
        },
      });
    });

    it('should return false for non-existent flag', () => {
      expect(flag.isEnabled('non-existent')).toBe(false);
    });

    it('should evaluate context conditions', () => {
      expect(flag.isEnabled('test-flag', { userRole: 'admin' })).toBe(true);
      expect(flag.isEnabled('test-flag', { userRole: 'user' })).toBe(false);
    });

    it('should handle percentage rollout', () => {
      flag.updateFlag('rollout-flag', {
        defaultValue: true,
        context: {
          percentage: 50,
        },
      });

      const result1 = flag.isEnabled('rollout-flag', {
        userId: 'user-1',
      });
      const result2 = flag.isEnabled('rollout-flag', {
        userId: 'user-2',
      });

      expect(flag.isEnabled('rollout-flag', { userId: 'user-1' })).toBe(
        result1
      );
      expect(flag.isEnabled('rollout-flag', { userId: 'user-2' })).toBe(
        result2
      );
    });

    it('should use default value when no percentage or userId provided', () => {
      flag.updateFlag('default-flag', {
        defaultValue: true,
        context: {},
      });

      expect(flag.isEnabled('default-flag', {})).toBe(true);
    });
  });

  describe('global context', () => {
    let flag: FeatureFlags<TestFlags>;

    beforeEach(() => {
      flag = new FeatureFlags<TestFlags>({
        'test-flag': {
          defaultValue: true,
          context: {
            environment: 'production',
          },
        },
      });
    });

    it('should set and get global context', () => {
      const globalContext: FeatureFlagContextData = {
        region: 'us-east',
      };

      flag.setGlobalContext(globalContext);
      expect(flag.getGlobalContext()).toEqual(globalContext);
    });

    it('should combine global and flag context in evaluation', () => {
      flag.setGlobalContext({
        environment: 'staging',
      });

      expect(flag.isEnabled('test-flag', {})).toBe(false);
    });
  });
});
