module.exports = {
  branches: [
    { name: 'main' },
    { name: 'pre/rc', channel: 'pre/rc', prerelease: 'rc' },
    { name: 'beta', channel: 'beta', prerelease: true },
  ],
};
