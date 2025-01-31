import {
  FeatureFlagValue,
  IFeatureFlags,
  FeatureFlagContextData,
  Nullable,
  hash,
} from '../utils';

class FeatureFlags<T extends string> implements IFeatureFlags<T> {
  private readonly flags: Record<T, FeatureFlagValue>;
  private globalContext?: FeatureFlagContextData;

  /**
   * Initializes feature flags with provided flag definitions
   * @param flags - Initial feature flag definitions
   */
  constructor(flags: Record<T, FeatureFlagValue>) {
    this.flags = { ...flags };
  }

  /**
   * Retrieves a specific feature flag
   * @param flagName - Name of the flag to retrieve
   * @returns The flag value or null if not found
   */
  getFlag(flagName: T): Nullable<FeatureFlagValue> {
    return this.flags[flagName] ?? null;
  }

  /**
   * Lists all feature flags
   * @returns Readonly copy of all flags
   */
  listFlags(): Readonly<Record<T, FeatureFlagValue>> {
    return this.flags;
  }

  /**
   * Updates a feature flag value
   * @param flagName - Name of the flag to update
   * @param value - New flag value
   */
  updateFlag(flagName: T, value: FeatureFlagValue): void {
    this.flags[flagName] = value;
  }

  /**
   * Deletes a feature flag
   * @param flagName - Name of the flag to delete
   */
  deleteFlag(flagName: T): void {
    delete this.flags[flagName];
  }

  /**
   * Sets global context for feature flag evaluation
   * @param context - Context data to set globally
   */
  setGlobalContext(context: FeatureFlagContextData): void {
    this.globalContext = { ...context };
  }

  /**
   * Retrieves the current global context
   * @returns Readonly copy of global context
   */
  getGlobalContext(): Readonly<FeatureFlagContextData> {
    return { ...this.globalContext };
  }

  /**
   * Evaluates if a feature flag is enabled for given context
   * @param flagName - Name of the flag to evaluate
   * @param userContext - Optional user-specific context
   * @returns Boolean indicating if feature is enabled
   */
  isEnabled(flagName: T, userContext?: FeatureFlagContextData): boolean {
    const flag = this.getFlag(flagName);
    if (!flag) {
      console.warn(`[FeatureFlags] Flag "${String(flagName)}" not found.`);
      return false;
    }

    const context = {
      ...this.globalContext,
      ...userContext,
    };

    if (!this.evaluateContext(flag.context, context)) return false;

    const isPercentageMatch = this.evaluatePercentage(flag, context, flagName);
    if (isPercentageMatch !== null) return isPercentageMatch;

    return flag.defaultValue;
  }

  /**
   * Evaluates if context matches flag requirements
   * @param flagContext - Context requirements from flag
   * @param context - Current context to evaluate
   * @returns Boolean indicating if context matches
   */
  private evaluateContext(
    flagContext: FeatureFlagContextData,
    context: FeatureFlagContextData
  ): boolean {
    for (const [key, value] of Object.entries(flagContext ?? {})) {
      if (value !== undefined && context[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Evaluates percentage-based rollout for a flag
   * @param flag - Flag to evaluate
   * @param context - Current context
   * @param flagName - Name of the flag
   * @returns Boolean if percentage applies, null otherwise
   */
  private evaluatePercentage(
    flag: FeatureFlagValue,
    context: FeatureFlagContextData,
    flagName: T
  ): boolean | null {
    if (flag.context?.percentage !== undefined && context.userId) {
      return (
        this.assignUserToBucket(context.userId, flagName) <
        flag.context.percentage
      );
    }
    return null;
  }

  /**
   * Assigns a user to a percentage bucket for rollouts
   * @param userId - User identifier
   * @param flagName - Name of the flag
   * @returns Number between 0-99 representing user's bucket
   */
  private assignUserToBucket(userId: string, flagName: T): number {
    return hash(userId + String(flagName)) % 100;
  }
}

export { FeatureFlags };
