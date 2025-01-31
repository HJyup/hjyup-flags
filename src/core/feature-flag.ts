import {
  FeatureFlagContextData,
  FeatureFlagContextProvider,
  FeatureFlagValue,
  IFeatureFlag,
} from '../utils';
import { FeatureFlagContext } from './flag-context';

interface FeatureFlagProps {
  name: string;
  defaultValue?: FeatureFlagValue;
  context?: FeatureFlagContextData;
}

class FeatureFlag implements IFeatureFlag {
  public readonly name: string;
  public defaultValue: FeatureFlagValue;
  public readonly context: FeatureFlagContextProvider;

  /**
   * Initializes a single FeatureFlag with a value and context provider.
   * @param name - Name of the feature flag.
   * @param value - Initial value or function-based evaluation.
   * @param contextData - Context data as JSON for evaluation.
   */
  constructor(options: FeatureFlagProps) {
    this.name = options.name;
    this.defaultValue = options.defaultValue || false;
    this.context = new FeatureFlagContext(options.context);
  }

  /**
   * Updates the feature flag with a new value or function-based evaluation.
   * @param value - Boolean value or function determining the flag's state.
   */
  setValue(value: FeatureFlagValue) {
    if (typeof value !== 'boolean' && typeof value !== 'function') {
      throw new Error(
        `Invalid FeatureFlagValue for ${this.name}: Expected boolean or function.`
      );
    }
    this.defaultValue = value;
  }

  /**
   * Retrieves and evaluates the state of the feature flag.
   * Supports percentage-based rollouts and dynamic evaluation.
   * @param userId - Optional user ID for percentage-based rollouts.
   * @returns The evaluated boolean value of the flag.
   */
  getValue(userId?: string): boolean {
    const context = this.context.getContext();

    if (context.percentage !== undefined) {
      if (!userId) {
        return false;
      }
      return this.context.isFeatureEnabledForPercentage(this.name, userId);
    }

    if (typeof this.defaultValue === 'function') {
      return this.defaultValue(context);
    }

    return this.defaultValue;
  }
}

export {
  FeatureFlagContextProvider,
  FeatureFlag,
  FeatureFlagContextData,
  FeatureFlagValue,
  FeatureFlagContext,
};
