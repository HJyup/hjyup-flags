export type Nullable<T> = T | null;

export type Environment = 'development' | 'staging' | 'production';

export interface FeatureFlagContextData {
  userRole?: Nullable<string>;
  environment?: Nullable<Environment>;
  region?: Nullable<string>;
  percentage?: number;
}

export interface FeatureFlagContextProvider {
  getContext(): FeatureFlagContextData;
  isFeatureEnabledForPercentage(flagName: string, userId: string): boolean;
}

export type FeatureFlagValue =
  | boolean
  | ((context: FeatureFlagContextData) => boolean);

export interface IFeatureFlag {
  name: string;
  context: FeatureFlagContextProvider;
  defaultValue: FeatureFlagValue;
  getValue(userId?: string): boolean;
  setValue(value: FeatureFlagValue): void;
}
