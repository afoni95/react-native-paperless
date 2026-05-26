// @ts-check
const { withGradleProperties } = require('@expo/config-plugins');

/**
 * Expo config plugin that injects additional gradle.properties entries
 * that survive expo prebuild --clean.
 */
const withCustomGradleProperties = (config) => {
  return withGradleProperties(config, (mod) => {
    const props = mod.modResults;

    const set = (key, value) => {
      const existing = props.find((p) => p.type === 'property' && p.key === key);
      if (existing) {
        existing.value = value;
      } else {
        props.push({ type: 'property', key, value });
      }
    };

    set('android.enableBuildConfigAsBytecode', 'true');

    return mod;
  });
};

module.exports = withCustomGradleProperties;
