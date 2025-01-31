import {
  FeatureFlagContextData,
  FeatureFlagContextProvider,
  hash,
} from '../utils';

export class FeatureFlagContext implements FeatureFlagContextProvider {
  private context: FeatureFlagContextData;

  /**
   * Initializes the feature flag context with optional initial values.
   * @param initialContext - Optional initial values for context properties.
   */
  constructor(initialContext: Partial<FeatureFlagContextData> = {}) {
    this.context = {
      userRole: initialContext.userRole ?? null,
      environment: initialContext.environment ?? null,
      region: initialContext.region ?? null,
      percentage: initialContext.percentage ?? undefined,
    };
  }

  /**
   * Updates the context with new values.
   * @param newContext - Partial context update.
   */
  updateContext(newContext: Partial<FeatureFlagContextData>): void {
    this.context = { ...this.context, ...newContext };
  }

  /**
   * Retrieves the current context as a readonly object.
   */
  getContext(): Readonly<FeatureFlagContextData> {
    return this.context;
  }

  /**
   * Checks if a feature should be enabled based on percentage rollout.
   * @param featureName - Name of the feature to check.
   * @param userId - Unique user ID to determine rollout eligibility.
   * @returns boolean indicating if the feature should be enabled.
   */
  isFeatureEnabledForPercentage(featureName: string, userId: string): boolean {
    const percentage = this.context.percentage;

    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
      return false;
    }

    return hash(`${featureName}:${userId}`) < percentage;
  }
}
