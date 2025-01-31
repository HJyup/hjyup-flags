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
export interface IFeatureFlags<T extends Record<string, FeatureFlagValue>> {
  getFlag<K extends keyof T>(flagName: K): Nullable<T[K]>;
  listFlags(): Readonly<T>;
  updateFlag(flagName: keyof T, value: T[keyof T]): void;
  deleteFlag(flagName: keyof T): void;

  isEnabled<K extends keyof T>(
    flagName: K,
    userContext: FeatureFlagContextData
  ): boolean;

  setGlobalContext(context: FeatureFlagContextData): void;
  getGlobalContext(): FeatureFlagContextData;
}
