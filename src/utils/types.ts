/**
 * Supported deployment environments
 */
export type Environment = 'development' | 'staging' | 'production';

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
 * Context data used for feature flag evaluation
 */
export interface FeatureFlagContextData {
  userId?: string;
  userRole?: string;
  environment?: string;
  region?: string;
  percentage?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Provider interface for accessing feature flag context
 */
export interface FeatureFlagContextProvider {
  getContext(): FeatureFlagContextData;
}

/**
 * Configuration for an individual feature flag
 */
export interface FeatureFlagValue {
  defaultValue: boolean;
  context: FeatureFlagContextData;
}

/**
 * Core feature flag management interface
 * Handles retrieval, evaluation and updates of feature flags
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
