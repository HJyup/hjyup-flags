import { FeatureFlags } from '../feature-flags';
import { FeatureFlagValue, FeatureFlagContextData } from '@/utils';

type TestFlags = 'test-flag' | 'rollout-flag' | 'default-flag';

describe('FeatureFlags', () => {
  describe('initialization', () => {
    it('should initialize with empty context flag', () => {
      const flag = new FeatureFlags<'test-flag'>({
        'test-flag': {
          defaultValue: false,
          context: {},
        },
      });
      expect(flag.listFlags()).toEqual({
        'test-flag': {
          defaultValue: false,
          context: {},
        },
      });
    });

    it('should initialize with multiple flags', () => {
      const flags: Record<TestFlags, FeatureFlagValue> = {
        'test-flag': {
          defaultValue: true,
          context: { userRole: 'admin' },
        },
        'rollout-flag': {
          defaultValue: false,
          context: { percentage: 50 },
        },
        'default-flag': {
          defaultValue: true,
          context: { environment: 'production' },
        },
      };
      const featureFlags = new FeatureFlags<TestFlags>(flags);
      expect(featureFlags.listFlags()).toEqual(flags);
    });
  });

  describe('flag management', () => {
    let featureFlags: FeatureFlags<'test-flag'>;

    beforeEach(() => {
      featureFlags = new FeatureFlags<'test-flag'>({
        'test-flag': {
          defaultValue: true,
          context: { userRole: 'admin' },
        },
      });
    });

    it('should get null for non-existent flag', () => {
      // @ts-expect-error - testing invalid flag name
      expect(featureFlags.getFlag('non-existent')).toBeNull();
    });

    it('should update flag and retrieve updated value', () => {
      const updatedFlag: FeatureFlagValue = {
        defaultValue: false,
        context: { userRole: 'user' },
      };

      featureFlags.updateFlag('test-flag', updatedFlag);
      expect(featureFlags.getFlag('test-flag')).toEqual(updatedFlag);
    });

    it('should delete flag and return null when accessed', () => {
      expect(featureFlags.getFlag('test-flag')).not.toBeNull();
      featureFlags.deleteFlag('test-flag');
      expect(featureFlags.getFlag('test-flag')).toBeNull();
    });
  });

  describe('feature evaluation', () => {
    let featureFlags: FeatureFlags<TestFlags>;

    beforeEach(() => {
      featureFlags = new FeatureFlags<TestFlags>({
        'test-flag': {
          defaultValue: true,
          context: {
            userRole: 'admin',
          },
        },
        'rollout-flag': {
          defaultValue: false,
          context: {
            percentage: 50,
          },
        },
        'default-flag': {
          defaultValue: true,
          context: {},
        },
      });
    });

    it('should return false and warn for non-existent flag', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      // @ts-expect-error - testing invalid flag name
      expect(featureFlags.isEnabled('non-existent')).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[FeatureFlags] Flag "non-existent" not found.'
      );
      consoleSpy.mockRestore();
    });

    it('should correctly evaluate context conditions', () => {
      // Test admin role
      expect(featureFlags.isEnabled('test-flag', { userRole: 'admin' })).toBe(
        true
      );

      // Test non-admin role
      expect(featureFlags.isEnabled('test-flag', { userRole: 'user' })).toBe(
        false
      );

      // Test missing role
      expect(featureFlags.isEnabled('test-flag', {})).toBe(false);
    });

    it('should consistently handle percentage rollouts', () => {
      const testCases = [
        { userId: 'user-1', runs: 5 },
        { userId: 'user-2', runs: 5 },
        { userId: 'user-3', runs: 5 },
      ];

      testCases.forEach(({ userId, runs }) => {
        const results = new Set();
        for (let i = 0; i < runs; i++) {
          results.add(featureFlags.isEnabled('rollout-flag', { userId }));
        }
        // Result should be consistent for the same user
        expect(results.size).toBe(1);
      });
    });

    it('should properly handle different percentage rollouts', () => {
      featureFlags.updateFlag('rollout-flag', {
        defaultValue: false,
        context: { percentage: 0 },
      });
      expect(featureFlags.isEnabled('rollout-flag', { userId: 'test-user' })).toBe(false);

      featureFlags.updateFlag('rollout-flag', {
        defaultValue: false,
        context: { percentage: 100 },
      });
      expect(featureFlags.isEnabled('rollout-flag', { userId: 'test-user' })).toBe(true);

      featureFlags.updateFlag('rollout-flag', {
        defaultValue: true,
        context: { percentage: 50 },
      });
      expect(featureFlags.isEnabled('rollout-flag', {})).toBe(true);
    });

    it('should use default value when no context conditions apply', () => {
      expect(featureFlags.isEnabled('default-flag', {})).toBe(true);

      featureFlags.updateFlag('default-flag', {
        defaultValue: false,
        context: {},
      });
      expect(featureFlags.isEnabled('default-flag', {})).toBe(false);
    });
  });

  describe('global context', () => {
    let featureFlags: FeatureFlags<'test-flag'>;
    const productionFlag: FeatureFlagValue = {
      defaultValue: true,
      context: {
        environment: 'production',
      },
    };

    beforeEach(() => {
      featureFlags = new FeatureFlags<'test-flag'>({
        'test-flag': productionFlag,
      });
    });

    it('should set and get global context immutably', () => {
      const globalContext: FeatureFlagContextData = {
        environment: 'production',
        region: 'us-east',
      };

      featureFlags.setGlobalContext(globalContext);
      const retrievedContext = featureFlags.getGlobalContext();

      expect(retrievedContext).toEqual(globalContext);
      // Ensure returned context is a copy
      expect(retrievedContext).not.toBe(globalContext);
    });

    it('should properly combine global and local contexts', () => {
      // Set global context
      featureFlags.setGlobalContext({
        environment: 'staging',
        region: 'us-east',
      });

      // Test with matching local context
      expect(
        featureFlags.isEnabled('test-flag', { environment: 'production' })
      ).toBe(true);

      // Test with no local context (uses global)
      expect(featureFlags.isEnabled('test-flag', {})).toBe(false);

      // Test with different local context
      expect(
        featureFlags.isEnabled('test-flag', { environment: 'development' })
      ).toBe(false);
    });
  });
});
