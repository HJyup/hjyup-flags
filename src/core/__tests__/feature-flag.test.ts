import { FeatureFlag } from '../../core';

describe('FeatureFlag', () => {
  describe('initialization', () => {
    it('should create a feature flag with default values', () => {
      const flag = new FeatureFlag({
        name: 'test-flag',
      });

      expect(flag.name).toBe('test-flag');
      expect(flag.getValue()).toBe(false);
      expect(flag.context.getContext()).toEqual({
        userRole: null,
        environment: null,
        region: null,
        percentage: undefined,
      });
    });

    it('should create a feature flag with custom enabled state', () => {
      const flag = new FeatureFlag({
        name: 'test-flag',
        defaultValue: true,
      });

      expect(flag.name).toBe('test-flag');
      expect(flag.getValue()).toBe(true);
    });

    it('should create a feature flag with custom context', () => {
      const flag = new FeatureFlag({
        name: 'test-flag',
        context: {
          userRole: 'admin',
          environment: 'production',
          region: 'us-east',
        },
      });

      expect(flag.context.getContext()).toEqual({
        userRole: 'admin',
        environment: 'production',
        region: 'us-east',
        percentage: undefined,
      });
    });
  });

  describe('value management', () => {
    it('should update enabled state', () => {
      const flag = new FeatureFlag({
        name: 'test-flag',
      });

      expect(flag.getValue()).toBe(false);

      flag.setValue(true);
      expect(flag.getValue()).toBe(true);

      flag.setValue(false);
      expect(flag.getValue()).toBe(false);
    });

    it('should handle function value updates', () => {
      const flag = new FeatureFlag({
        name: 'test-flag',
      });

      flag.setValue(() => true);
      expect(flag.getValue()).toBe(true);

      flag.setValue(context => context.environment === 'production');
      expect(flag.getValue()).toBe(false);
    });
  });

  describe('context evaluation', () => {
    it('should correctly evaluate simple context conditions', () => {
      const flag = new FeatureFlag({
        name: 'test-flag',
        defaultValue: context => context.userRole === 'admin',
        context: {
          userRole: 'admin',
        },
      });

      expect(flag.getValue()).toBe(true);
    });

    it('should correctly evaluate complex context conditions', () => {
      const flag = new FeatureFlag({
        name: 'test-flag',
        defaultValue: context =>
          context.userRole === 'admin' && context.environment === 'staging',
        context: {
          userRole: 'admin',
          environment: 'staging',
        },
      });

      expect(flag.getValue()).toBe(true);
    });

    it('should evaluate region-based conditions', () => {
      const flag = new FeatureFlag({
        name: 'test-flag',
        defaultValue: context => context.region === 'eu-west',
        context: {
          region: 'eu-west',
        },
      });

      expect(flag.getValue()).toBe(true);
    });
  });

  describe('percentage rollout', () => {
    it('should correctly evaluate percentage-based flags', () => {
      const flag = new FeatureFlag({
        name: 'test-flag',
        defaultValue: true,
        context: {
          percentage: 50,
        },
      });

      expect(flag.getValue('user-1')).toBe(false);
      expect(flag.getValue('user-2')).toBe(false);
    });

    it('should ignore percentage when no userId is provided', () => {
      const flag = new FeatureFlag({
        name: 'test-flag',
        defaultValue: true,
        context: {
          percentage: 0,
        },
      });

      expect(flag.getValue()).toBe(false);
    });

    it('should handle 0% rollout', () => {
      const flag = new FeatureFlag({
        name: 'test-flag',
        defaultValue: true,
        context: {
          percentage: 0,
        },
      });

      expect(flag.getValue('any-user')).toBe(false);
    });

    it('should handle 100% rollout', () => {
      const flag = new FeatureFlag({
        name: 'test-flag',
        defaultValue: true,
        context: {
          percentage: 100,
        },
      });

      expect(flag.getValue('any-user')).toBe(true);
    });

    it('should combine percentage with context evaluation', () => {
      const flag = new FeatureFlag({
        name: 'test-flag',
        defaultValue: context => context.environment === 'production',
        context: {
          environment: 'production',
          percentage: 0,
        },
      });

      expect(flag.getValue('user-1')).toBe(false);
      expect(flag.getValue()).toBe(false);
    });

    it('should return consistent results for the same user id', () => {
      const flag = new FeatureFlag({
        name: 'test-flag',
        defaultValue: true,
        context: {
          percentage: 50,
        },
      });

      const userId = 'test-user-123';
      const firstResult = flag.getValue(userId);

      for (let i = 0; i < 5; i++) {
        expect(flag.getValue(userId)).toBe(firstResult);
      }
    });
  });
});
