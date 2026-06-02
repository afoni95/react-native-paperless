// @ts-check
const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Expo config plugin that pins jscFlavor to an exact version
 * for reproducible builds (required for F-Droid).
 * 
 * Dynamic versions like '2026004.+' can resolve to different artifacts over time.
 * This plugin replaces the dynamic version with a fixed one.
 */
const withJscFlavor = (config, { version = '2026004.0' } = {}) => {
  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;

    // Replace dynamic jscFlavor version with fixed version
    const dynamicPattern = /(def\s+jscFlavor\s*=\s*['"])([^'"]+)\+(['"])/;
    const fixedVersion = `$1$2${version.split('.').slice(-1)[0]}$3`;
    
    // More precise: replace the full dependency coordinate
    const fullPattern = /(def\s+jscFlavor\s*=\s*['"]io\.github\.react-native-community:jsc-android:)[\d.]+\+(['"])/;
    
    if (fullPattern.test(contents)) {
      contents = contents.replace(
        fullPattern,
        `$1${version}$2`
      );
    }

    mod.modResults.contents = contents;
    return mod;
  });
};

module.exports = withJscFlavor;
