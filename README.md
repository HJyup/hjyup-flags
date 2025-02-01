# **hjyup-flags**

A lightweight, type-safe feature flag management library for controlled feature rollouts and context-aware flag evaluation in TypeScript applications.

---

## **🚀 Overview**

`hjyup-flags` provides an efficient way to manage feature flags in your TypeScript applications.

- ✅ **Simple Boolean Flags** – Enable/disable features easily.
- ✅ **Context-Aware Flags** – Activate features based on environment, user role, region, or any custom criteria.
- ✅ **Percentage-Based Rollouts** – Gradually enable features for a subset of users using deterministic bucketing.
- ✅ **Custom Evaluators** – Override default evaluation with your own logic.
- ✅ **Zero Dependencies** – Fully TypeScript-native and extremely lightweight.

---

## **📦 Installation**

Install the package using your preferred package manager:

```sh
npm install hjyup-flags
# or
yarn add hjyup-flags
# or
pnpm add hjyup-flags
```

---

## **Usage**

### Creating Feature Flags

Feature flags are initialized using the `FeatureFlags` class.

#### Basic Feature Flag

```ts
import { FeatureFlags } from 'hjyup-flags';

const featureFlags = new FeatureFlags({
  'new-dashboard': { defaultValue: true },
});

if (featureFlags.isEnabled('new-dashboard')) {
  console.log('✅ New dashboard is enabled!');
}
```

#### Context-Based Feature Flag

Feature flags can be evaluated based on any context such as user roles, environment, or region.

```ts
const featureFlags = new FeatureFlags({
  'beta-feature': {
    defaultValue: false,
    conditions: { environment: 'staging', userRole: 'admin' },
  },
});

const userContext = { userRole: 'admin', environment: 'staging' };

if (featureFlags.isEnabled('beta-feature', userContext)) {
  console.log('🚀 Feature enabled for Admins in Staging.');
}
```

#### Percentage-Based Rollout

Enable features gradually for a subset of users using a hashed percentage-based rollout.

```ts
const featureFlags = new FeatureFlags({
  'new-ui': {
    defaultValue: false,
    rollout: { percentage: 50 }, // Enable for 50% of users
  },
});

const userId = 'user-123';

if (featureFlags.isEnabled('new-ui', { userId })) {
  console.log('🎉 User has access to the new UI!');
}
```

#### Custom Evaluator

Override the default evaluation logic with a custom evaluator for even more flexibility.

```ts
const featureFlags = new FeatureFlags({
  'custom-flag': {
    defaultValue: false,
    rollout: { percentage: 40 },
    customEvaluator: (flag, context) => {
      // Example: Disable the flag for a particular region regardless of rollout.
      if (context.region === 'restricted') return false;
      // Evaluate percentage rollout
      if (flag.rollout && context.userId) {
        const bucket = featureFlags.assignUserToBucket(context.userId, 'custom-flag');
        return bucket < flag.rollout.percentage;
      }
      return flag.defaultValue;
    },
  },
});

const userContext = { userId: 'user-456', region: 'eu-west' };

if (featureFlags.isEnabled('custom-flag', userContext)) {
  console.log('🚀 Custom flag active for this user.');
}
```

---

## **API Reference**

### **FeatureFlags Class**

#### **Constructor**

```ts
new FeatureFlags<T extends string>(flags: Record<T, FeatureFlagValue>)
```

Creates a new instance with the specified flag definitions.

#### **Methods**

| **Method**                           | **Description**                                                                                                      |
|--------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| `isEnabled(flagName, userContext?)`  | Checks if a feature is enabled. Optionally provide a `userContext` for contextual evaluation.                         |
| `getFlag(flagName)`                  | Retrieves a feature flag's configuration. Returns `null` if the flag does not exist.                                  |
| `updateFlag(flagName, value)`        | Dynamically updates a feature flag at runtime.                                                                      |
| `deleteFlag(flagName)`               | Deletes a feature flag, removing it from evaluation.                                                                |
| `listFlags()`                        | Returns a read-only copy of all flag definitions.                                                                     |
| `setGlobalContext(context)`          | Sets a global context for all feature evaluations. Global context is merged with individual user context.               |
| `getGlobalContext()`                 | Retrieves the current global context used during flag evaluation.                                                     |

### **Other Types**

- **FeatureFlagValue**  
  Represents an individual flag configuration.  
  - `defaultValue`: The default boolean value for the flag.  
  - `conditions` (optional): Key-value pairs used for direct context matching.  
  - `rollout` (optional): An object specifying a roll-out percentage.  
  - `customEvaluator` (optional): A function to override default evaluation logic.

- **FeatureFlagContextData**  
  Represents the context data for evaluating feature flags, such as `userRole`, `environment`, `region`, etc.

---

## **Contributing**

Contributions are welcome! Please feel free to submit a pull request or open an issue if you encounter a bug or have a feature request.

---

## **License**

[MIT License](https://choosealicense.com/licenses/mit/)
