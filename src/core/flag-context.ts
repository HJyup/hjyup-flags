import { FeatureFlagContextData, FeatureFlagContextProvider } from '../utils';

class FeatureFlagContext implements FeatureFlagContextProvider {
  private context: FeatureFlagContextData;

  /**
   * Initializes the feature flag context with optional initial values.
   * @param initialContext - Optional initial values for context properties.
   */
  constructor(initialContext: Partial<FeatureFlagContextData> = {}) {
    this.context = {
      userRole: initialContext.userRole ?? undefined,
      environment: initialContext.environment ?? undefined,
      region: initialContext.region ?? undefined,
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
}

export { FeatureFlagContext };
