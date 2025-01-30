import { FeatureFlagContext } from '../../core';

describe('FeatureFlagContext', () => {
  describe('initialization', () => {
    it('should initialize with default values', () => {
      const context = new FeatureFlagContext();

      expect(context.getContext()).toEqual({
        userRole: null,
        environment: null,
        region: null,
        percentage: undefined,
      });
    });

    it('should initialize with provided values', () => {
      const context = new FeatureFlagContext({
        userRole: 'admin',
        environment: 'production',
        region: 'eu-west',
        percentage: 50,
      });

      expect(context.getContext()).toEqual({
        userRole: 'admin',
        environment: 'production',
        region: 'eu-west',
        percentage: 50,
      });
    });
  });

  describe('context updates', () => {
    it('should update context values', () => {
      const context = new FeatureFlagContext();

      context.updateContext({
        userRole: 'user',
        environment: 'staging',
      });

      expect(context.getContext()).toEqual({
        userRole: 'user',
        environment: 'staging',
        region: null,
        percentage: undefined,
      });
    });

    it('should partially update context', () => {
      const context = new FeatureFlagContext({
        userRole: 'admin',
        environment: 'production',
      });

      context.updateContext({
        environment: 'staging',
      });

      expect(context.getContext()).toEqual({
        userRole: 'admin',
        environment: 'staging',
        region: null,
        percentage: undefined,
      });
    });
  });

  describe('percentage rollout', () => {
    it('should return false for undefined percentage', () => {
      const context = new FeatureFlagContext();

      expect(context.isFeatureEnabledForPercentage('test-flag', 'user-1')).toBe(
        false
      );
    });

    it('should return false for invalid percentage values', () => {
      const context = new FeatureFlagContext({ percentage: -10 });
      expect(context.isFeatureEnabledForPercentage('test-flag', 'user-1')).toBe(
        false
      );

      context.updateContext({ percentage: 110 });
      expect(context.isFeatureEnabledForPercentage('test-flag', 'user-1')).toBe(
        false
      );
    });

    it('should return consistent results for same feature and user', () => {
      const context = new FeatureFlagContext({ percentage: 50 });
      const result = context.isFeatureEnabledForPercentage(
        'test-flag',
        'user-1'
      );

      for (let i = 0; i < 5; i++) {
        expect(
          context.isFeatureEnabledForPercentage('test-flag', 'user-1')
        ).toBe(result);
      }
    });

    it('should return different results for different users', () => {
      const context = new FeatureFlagContext({ percentage: 50 });
      const results = new Set();

      for (let i = 1; i <= 10; i++) {
        results.add(
          context.isFeatureEnabledForPercentage('test-flag', `user-${i}`)
        );
      }

      expect(results.size).toBeGreaterThan(1);
    });

    it('should return different results for different features with same user', () => {
      const context = new FeatureFlagContext({ percentage: 50 });
      const results = new Set();

      for (let i = 1; i <= 10; i++) {
        results.add(
          context.isFeatureEnabledForPercentage(`feature-${i}`, 'same-user')
        );
      }

      expect(results.size).toBeGreaterThan(1);
    });
  });
});
