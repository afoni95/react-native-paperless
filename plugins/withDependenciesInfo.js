// @ts-check
const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Expo config plugin that injects `dependenciesInfo` into the android {} block
 * of android/app/build.gradle, disabling dependency metadata in APK/bundle.
 */
const withDependenciesInfo = (config) => {
  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;

    if (contents.includes('dependenciesInfo')) {
      return mod;
    }

    const block = `
    dependenciesInfo {
        includeInApk = false
        includeInBundle = false
    }`;

    contents = contents.replace(
      /(androidResources\s*\{[^}]*\})\s*\n(\})/,
      `$1\n${block}\n$2`,
    );

    mod.modResults.contents = contents;
    return mod;
  });
};

module.exports = withDependenciesInfo;
