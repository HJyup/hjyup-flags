// FeatureFlags.ts
import {
  FeatureFlagValue,
  IFeatureFlags,
  FeatureFlagContextData,
  Nullable,
  hash,
} from '../utils';

class FeatureFlags<T extends string> implements IFeatureFlags<T> {
  private readonly flags: Record<T, FeatureFlagValue>;
  private globalContext: FeatureFlagContextData = {};

  /**
   * Initializes feature flags with provided flag definitions.
   * @param flags - Initial feature flag definitions
   */
  constructor(flags: Record<T, FeatureFlagValue>) {
    this.flags = { ...flags };
  }

  /**
   * Retrieves a specific feature flag.
   * @param flagName - Name of the flag to retrieve.
   * @returns The flag value or null if not found.
   */
  getFlag(flagName: T): Nullable<FeatureFlagValue> {
    return this.flags[flagName] ?? null;
  }

  /**
   * Lists all feature flags.
   * @returns Readonly copy of all flags.
   */
  listFlags(): Readonly<Record<T, FeatureFlagValue>> {
    return { ...this.flags };
  }

  /**
   * Updates a feature flag value.
   * @param flagName - Name of the flag to update.
   * @param value - New flag value.
   */
  updateFlag(flagName: T, value: FeatureFlagValue): void {
    this.flags[flagName] = { ...value };
  }

  /**
   * Deletes a feature flag.
   * @param flagName - Name of the flag to delete.
   */
  deleteFlag(flagName: T): void {
    delete this.flags[flagName];
  }

  /**
   * Sets global context for feature flag evaluation.
   * @param context - Context data to set globally.
   */
  setGlobalContext(context: FeatureFlagContextData): void {
    this.globalContext = { ...context };
  }

  /**
   * Retrieves the current global context.
   * @returns Readonly copy of global context.
   */
  getGlobalContext(): Readonly<FeatureFlagContextData> {
    return { ...this.globalContext };
  }

  /**
   * Evaluates if a feature flag is enabled for given context.
   * @param flagName - Name of the flag to evaluate.
   * @param userContext - Optional user-specific context.
   * @returns Boolean indicating if the feature is enabled.
   */
  isEnabled(flagName: T, userContext?: FeatureFlagContextData): boolean {
    const flag = this.getFlag(flagName);
    const context = {
      ...this.globalContext,
      ...userContext,
    };

    if (!flag) {
      if (context.environment !== 'production') {
        throw new Error(`Feature flag "${flagName}" not found.`);
      } else {
        console.warn(`[FeatureFlags] Flag "${String(flagName)}" not found.`);
        return false;
      }
    }

    if (typeof flag.customEvaluator === 'function') {
      return flag.customEvaluator(flag, context);
    }

    if (flag.conditions && !this.evaluateConditions(flag.conditions, context)) {
      return false;
    }

    const rolloutResult = this.evaluateRollout(flag, context, flagName);
    if (rolloutResult !== null) {
      return rolloutResult;
    }

    return flag.defaultValue;
  }

  /**
   * Checks if the provided context meets the flag's conditions.
   * @param conditions - Conditions defined in the flag.
   * @param context - Evaluation context with merged data.
   * @returns Boolean indicating if all conditions match.
   */
  private evaluateConditions(
    conditions: Partial<FeatureFlagContextData>,
    context: FeatureFlagContextData
  ): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      if (key === 'percentage') continue;
      if (value !== undefined && context[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Evaluates percentage-based rollout.
   * @param flag - Flag configuration.
   * @param context - Evaluation context.
   * @param flagName - Name of the flag.
   * @returns Boolean if percentage rollout applies, null otherwise.
   */
  private evaluateRollout(
    flag: FeatureFlagValue,
    context: FeatureFlagContextData,
    flagName: T
  ): boolean | null {
    if (flag.rollout?.percentage !== undefined && context.userId) {
      return (
        this.assignUserToBucket(context.userId, flagName) <
        flag.rollout.percentage
      );
    }
    return null;
  }

  /**
   * Assigns a user to a percentage bucket for rollout.
   * @param userId - User identifier.
   * @param flagName - Flag name.
   * @returns Number between 0-99 representing the user's bucket.
   */
  public assignUserToBucket(userId: string, flagName: T): number {
    return hash(userId + String(flagName)) % 100;
  }
}

export { FeatureFlags };
