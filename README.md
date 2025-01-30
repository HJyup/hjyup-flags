# hjyup-flags

A modern, lightweight, and type-safe feature flag management library for controlled feature rollouts in TypeScript applications.

## Overview

`hjyup-flags` provides an elegant and efficient way to manage feature flags in your TypeScript applications. Whether you need simple on/off toggles, percentage-based rollouts, or dynamic context-aware flags, this library has you covered—all with zero dependencies and full TypeScript support.

## Installation

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

The core functionality of `hjyup-flags` revolves around the `FeatureFlag` class. Here’s how you can use it:

#### Basic Feature Flag

```ts
import { FeatureFlag } from 'hjyup-flags';

const flag = new FeatureFlag({
  name: 'new-header',
  defaultValue: true,
});

if (flag.getValue()) {
  // Show new header
}
```

#### Context-Based Feature Flag

Feature flags can be dynamically evaluated based on context:

```ts
const flag = new FeatureFlag({
  name: 'beta-feature',
  defaultValue: (context) => context.userRole === 'admin',
  context: {
    userRole: 'admin',
    environment: 'staging',
  },
});

if (flag.getValue()) {
  // Feature is enabled for admins in staging
}
```

#### Percentage-Based Rollout

Gradually enable features for a subset of users:

```ts
const flag = new FeatureFlag({
  name: 'new-ui',
  context: {
    percentage: 50, // Enable for 50% of users
  },
});

if (flag.getValue('user-123')) {
  // Show new UI
}
```

### Persistent Feature Flags with Local Storage

Store and retrieve feature flags using local storage:

```ts
import { LocalStorageWrapper, FeatureFlag } from 'hjyup-flags';

const flag = new FeatureFlag({
  name: 'persistent-flag',
  defaultValue: true,
});

const storage = new LocalStorageWrapper({
  'persistent-flag': flag,
});

const savedFlag = storage.getItem('persistent-flag');
```

### Dynamically Updating Feature Flags

Modify feature flags in real-time:

```ts
const flag = new FeatureFlag({
  name: 'dynamic-feature',
  defaultValue: false,
});

flag.setValue(true);

flag.context.updateContext({
  environment: 'production',
  percentage: 25,
});
```

## API Reference

### `FeatureFlag` Class

#### Constructor

```ts
new FeatureFlag({
  name: string;
  defaultValue?: boolean | ((context: FeatureFlagContextData) => boolean);
  context?: FeatureFlagContextData;
})
```

#### Methods

- `getValue(userId?: string): boolean` – Returns the flag value, optionally for a specific user.
- `setValue(value: boolean): void` – Updates the flag’s value dynamically.

### `FeatureFlagContext` Class

#### Constructor

```ts
new FeatureFlagContext({
  userRole?: string;
  environment?: string;
  region?: string;
  percentage?: number;
})
```

#### Methods

- `updateContext(newContext: Partial<FeatureFlagContextData>): void` – Updates the feature flag context dynamically.

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue.

## License

[MIT License](https://choosealicense.com/licenses/mit/)