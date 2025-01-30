import {
  FeatureFlagContextData,
  FeatureFlagContextProvider,
  FeatureFlagValue,
  IFeatureFlag,
} from '../utils';
import { FeatureFlagContext } from './flag-context';

interface FeatueFlagProps {
  name: string;
  defaultValue?: FeatureFlagValue;
  context?: FeatureFlagContextData;
}

class FeatureFlag implements IFeatureFlag {
  public readonly name: string;
  private defaultValue: FeatureFlagValue;
  public readonly context: FeatureFlagContextProvider;

  /**
   * Initializes a single FeatureFlag with a value and context provider.
   * @param name - Name of the feature flag.
   * @param value - Initial value or function-based evaluation.
   * @param contextData - Context data as JSON for evaluation.
   */
  constructor(options: FeatueFlagProps) {
    this.name = options.name;
    this.defaultValue = options.defaultValue || false;
    this.context = new FeatureFlagContext(options.context);
  }

  /**
   * Updates the feature flag with a new value or function-based evaluation.
   * @param value - Boolean value or function determining the flag's state.
   */
  setValue(value: FeatureFlagValue) {
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

    if (
      context.environment === 'production' &&
      this.defaultValue === undefined
    ) {
      return false;
    }

    return this.defaultValue ?? false;
  }
}

export {
  FeatureFlagContextProvider,
  FeatureFlag,
  FeatureFlagContextData,
  FeatureFlagValue,
  FeatureFlagContext,
};
