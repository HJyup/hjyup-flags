export type Environment = 'development' | 'staging' | 'production';

export type Nullable<T> = T | null;

export type FeatureFlagNames<T extends Record<string, FeatureFlagValue>> =
  keyof T;

export interface FeatureFlagContextData {
  userId?: string;
  userRole?: string;
  environment?: string;
  region?: string;
  percentage?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface FeatureFlagContextProvider {
  getContext(): FeatureFlagContextData;
}

export interface FeatureFlagValue {
  defaultValue: boolean;
  context: FeatureFlagContextData;
}

/**
 * 🔹 Feature Flag Manager: Handles retrieval and evaluation of feature flags
 */
export interface IFeatureFlags<T extends Record<string, FeatureFlagValue>> {
  getFlag<K extends keyof T>(flagName: K): Nullable<T[K]>;
  isEnabled<K extends keyof T>(
    flagName: K,
    userContext: FeatureFlagContextData
  ): boolean;
  listFlags(): Readonly<T>;
  updateFlag(flagName: keyof T, value: T[keyof T]): void;
  deleteFlag(flagName: keyof T): void;

  setGlobalContext(context: FeatureFlagContextData): void;
  getGlobalContext(): FeatureFlagContextData;
}
