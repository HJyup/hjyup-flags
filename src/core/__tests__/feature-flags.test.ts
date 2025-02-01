import { FeatureFlags } from '../feature-flags';
import { FeatureFlagValue, FeatureFlagContextData } from '@/utils';

type TestFlags = 'test-flag' | 'rollout-flag' | 'default-flag';

describe('FeatureFlags', () => {
  describe('Initialization', () => {
    it('should initialize with a flag having an empty context', () => {
      const flag = new FeatureFlags<'test-flag'>({
        'test-flag': {
          defaultValue: false,
        },
      });

      expect(flag.listFlags()).toEqual({
        'test-flag': {
          defaultValue: false,
        },
      });

      expect(flag.getFlag('test-flag')).toEqual({
        defaultValue: false,
      });
    });

    it('should initialize with multiple flags', () => {
      const flags: Record<TestFlags, FeatureFlagValue> = {
        'test-flag': {
          defaultValue: true,
          conditions: {
            userRole: 'admin',
          },
        },
        'rollout-flag': {
          defaultValue: false,
          conditions: {
            percentage: 50,
          },
        },
        'default-flag': {
          defaultValue: true,
          conditions: {
            environment: 'production',
          },
        },
      };

      const featureFlags = new FeatureFlags<TestFlags>(flags);
      expect(featureFlags.listFlags()).toEqual(flags);
      expect(Object.keys(featureFlags.listFlags())).toHaveLength(3);
    });
  });

  describe('Flag Management', () => {
    let featureFlags: FeatureFlags<'test-flag'>;

    beforeEach(() => {
      featureFlags = new FeatureFlags<'test-flag'>({
        'test-flag': {
          defaultValue: true,
          conditions: {
            userRole: 'admin',
          },
        },
      });
    });

    it('should return null for non-existent flag', () => {
      // @ts-expect-error - testing invalid flag name behavior
      expect(featureFlags.getFlag('non-existent')).toBeNull();
    });

    it('should update a flag and retrieve the updated value', () => {
      const updatedFlag: FeatureFlagValue = {
        defaultValue: false,
        conditions: {
          userRole: 'user',
        },
      };

      featureFlags.updateFlag('test-flag', updatedFlag);
      expect(featureFlags.getFlag('test-flag')).toEqual(updatedFlag);
      expect(featureFlags.isEnabled('test-flag', { userRole: 'user' })).toBe(
        false
      );
    });

    it('should delete a flag and return null upon retrieval', () => {
      expect(featureFlags.getFlag('test-flag')).not.toBeNull();
      featureFlags.deleteFlag('test-flag');
      expect(featureFlags.getFlag('test-flag')).toBeNull();
      expect(Object.keys(featureFlags.listFlags())).toHaveLength(0);
    });
  });

  describe('Feature Evaluation', () => {
    let featureFlags: FeatureFlags<TestFlags>;

    beforeEach(() => {
      featureFlags = new FeatureFlags<TestFlags>({
        'test-flag': {
          defaultValue: true,
          conditions: {
            userRole: 'admin',
          },
        },
        'rollout-flag': {
          defaultValue: false,
          conditions: {
            percentage: 50,
          },
        },
        'default-flag': {
          defaultValue: true,
          conditions: {
            environment: 'production',
          },
        },
      });
    });

    it('should throw error for non-existent flag in non-production', () => {
      expect(() =>
        // @ts-expect-error - testing flag not found
        featureFlags.isEnabled('non-existent', { environment: 'development' })
      ).toThrow('Feature flag "non-existent" not found.');
    });

    it('should warn and return false for non-existent flag in production', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      expect(
        // @ts-expect-error - testing flag not found
        featureFlags.isEnabled('non-existent', { environment: 'production' })
      ).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[FeatureFlags] Flag "non-existent" not found.'
      );
      consoleSpy.mockRestore();
    });

    it('should correctly evaluate context-based conditions', () => {
      expect(featureFlags.isEnabled('test-flag', { userRole: 'admin' })).toBe(
        true
      );
      expect(featureFlags.isEnabled('test-flag', { userRole: 'user' })).toBe(
        false
      );
      expect(featureFlags.isEnabled('test-flag', { userRole: 'guest' })).toBe(
        false
      );
      expect(featureFlags.isEnabled('test-flag', {})).toBe(false);
    });

    it('should consistently handle percentage rollouts for the same user', () => {
      const testCases = [
        { userId: 'user-1', runs: 10 },
        { userId: 'user-2', runs: 10 },
        { userId: 'user-3', runs: 10 },
        { userId: 'user-4', runs: 10 },
      ];

      testCases.forEach(({ userId, runs }) => {
        const results = new Set<boolean>();
        for (let i = 0; i < runs; i++) {
          results.add(featureFlags.isEnabled('rollout-flag', { userId }));
        }
        expect(results.size).toBe(1);
      });
    });

    it('should handle different percentage rollout configurations', () => {
      featureFlags.updateFlag('rollout-flag', {
        defaultValue: false,
        rollout: { percentage: 0 },
      });
      expect(
        featureFlags.isEnabled('rollout-flag', { userId: 'test-user-1' })
      ).toBe(false);
      expect(
        featureFlags.isEnabled('rollout-flag', { userId: 'test-user-2' })
      ).toBe(false);

      featureFlags.updateFlag('rollout-flag', {
        defaultValue: false,
        rollout: { percentage: 100 },
      });
      expect(
        featureFlags.isEnabled('rollout-flag', { userId: 'test-user-1' })
      ).toBe(true);
      expect(
        featureFlags.isEnabled('rollout-flag', { userId: 'test-user-2' })
      ).toBe(true);

      featureFlags.updateFlag('rollout-flag', {
        defaultValue: true,
        rollout: { percentage: 50 },
      });
      expect(featureFlags.isEnabled('rollout-flag', {})).toBe(true);
    });

    it('should return the flag default value when no conditions are applied', () => {
      expect(featureFlags.isEnabled('default-flag')).toBe(false);
      expect(
        featureFlags.isEnabled('default-flag', { environment: 'staging' })
      ).toBe(false);

      featureFlags.updateFlag('default-flag', {
        defaultValue: false,
      });
      expect(featureFlags.isEnabled('default-flag', {})).toBe(false);
      expect(
        featureFlags.isEnabled('default-flag', { environment: 'production' })
      ).toBe(false);
    });
  });

  describe('Global Context', () => {
    let featureFlags: FeatureFlags<'test-flag'>;
    const productionFlag: FeatureFlagValue = {
      defaultValue: true,
      conditions: { environment: 'production' },
    };

    beforeEach(() => {
      featureFlags = new FeatureFlags<'test-flag'>({
        'test-flag': productionFlag,
      });
    });

    it('should set and return an immutable global context', () => {
      const globalContext: FeatureFlagContextData = {
        environment: 'production',
        region: 'us-east',
        userRole: 'admin',
      };
      featureFlags.setGlobalContext(globalContext);
      const retrievedContext = featureFlags.getGlobalContext();

      expect(retrievedContext).toEqual(globalContext);
      expect(retrievedContext).not.toBe(globalContext);

      globalContext.environment = 'development';
      expect(retrievedContext.environment).toBe('production');
    });

    it('should correctly merge global and local contexts for evaluation', () => {
      featureFlags.setGlobalContext({
        environment: 'staging',
        region: 'us-east',
      });

      expect(
        featureFlags.isEnabled('test-flag', { environment: 'production' })
      ).toBe(true);
      expect(featureFlags.isEnabled('test-flag', {})).toBe(false);
      expect(
        featureFlags.isEnabled('test-flag', { environment: 'development' })
      ).toBe(false);
      expect(
        featureFlags.isEnabled('test-flag', { environment: 'staging' })
      ).toBe(false);
    });
  });
});
