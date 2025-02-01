/**
 * Type helper for nullable values
 */
export type Nullable<T> = T | null;

/**
 * Extract flag names from a feature flag record type
 */
export type FeatureFlagNames<T extends Record<string, FeatureFlagValue>> =
  keyof T;

/**
 * Base context data used for feature flag evaluation
 */
export interface FeatureFlagContextData {
  userId?: string;
  userRole?: string;
  environment?: string;
  region?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Provider interface for accessing feature flag context
 */
export interface FeatureFlagContextProvider {
  getContext(): FeatureFlagContextData;
}

/**
 * Configuration for an individual feature flag.
 *
 * - conditions: key-value pairs that define the context requirements (excluding percentage rollout)
 * - rollout: optional percentage rollout configuration.
 * - customEvaluator: optional function for more complex evaluation logic.
 */
export interface FeatureFlagValue {
  defaultValue: boolean;
  conditions?: Partial<FeatureFlagContextData>;
  rollout?: {
    percentage: number;
  };
  customEvaluator?: CustomEvaluator;
}

/**
 * Custom evaluator function for feature flags.
 * Can be provided per-flag to override the default evaluation logic.
 */
export type CustomEvaluator = (
  flag: FeatureFlagValue,
  context: FeatureFlagContextData
) => boolean;

/**
 * Core feature flag management interface.
 * Handles retrieval, evaluation, and updates of feature flags.
 */
export interface IFeatureFlags<T extends string> {
  getFlag(flagName: T): Nullable<FeatureFlagValue>;
  listFlags(): Readonly<Record<T, FeatureFlagValue>>;
  updateFlag(flagName: T, value: FeatureFlagValue): void;
  deleteFlag(flagName: T): void;

  isEnabled(flagName: T, userContext: FeatureFlagContextData): boolean;

  setGlobalContext(context: FeatureFlagContextData): void;
  getGlobalContext(): FeatureFlagContextData;
}
