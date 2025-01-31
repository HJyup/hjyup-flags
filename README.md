# **hjyup-flags**  

A modern, lightweight, and type-safe feature flag management library for controlled feature rollouts in TypeScript applications.  

---

## **🚀 Overview**  

`hjyup-flags` provides an elegant and efficient way to manage feature flags in your TypeScript applications.  
- ✅ **Simple Boolean Flags** – Enable/disable features easily.  
- ✅ **Context-Aware Flags** – Activate features based on environment, user role, or region.  
- ✅ **Percentage-Based Rollouts** – Gradually enable features for a subset of users.  
- ✅ **Zero Dependencies** – Fully TypeScript-native and lightweight.  

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

## Usage

### Creating Feature Flags

Feature flags are initialized using the FeatureFlags class

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

Feature flags can be evaluated based on user roles, environment, or region.

```ts
const featureFlags = new FeatureFlags({
  'beta-feature': {
    defaultValue: false,
    context: { environment: 'staging', userRole: 'admin' },
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
    context: { percentage: 50 }, // Enable for 50% of users
  },
});

const userId = 'user-123';

if (featureFlags.isEnabled('new-ui', { userId })) {
  console.log('🎉 User has access to the new UI!');
}
```

## API Reference

### FeatureFlags Class

#### Constructor

```ts
new FeatureFlags<T extends Record<string, FeatureFlagValue>>(flags: T)
```

## 🔹 Feature Flag API Methods

| **Method** | **Description** |
|------------|----------------|
| `isEnabled(flagName, userContext?)`  | **Checks if a feature is enabled.** Optionally provide a `userContext` for contextual evaluation. |
| `getFlag(flagName)` | **Retrieves a feature flag’s value.** Returns `null` if the flag does not exist. |
| `updateFlag(flagName, value)` | **Updates a feature flag dynamically.** Use this to change flag values at runtime. |
| `deleteFlag(flagName)` | **Deletes a feature flag.** Removes the flag from the list of active flags. |
| `listFlags()` | **Lists all available feature flags.** Returns a `readonly` object containing all flag definitions. |
| `setGlobalContext(context)` | **Sets a global context for all feature evaluations.** This affects all `isEnabled` calls unless overridden by `userContext`. |
| `getGlobalContext()` | **Retrieves the current global context.** Useful for debugging and ensuring correct context settings. |

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue.

## License

[MIT License](https://choosealicense.com/licenses/mit/)
