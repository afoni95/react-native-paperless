// @ts-check
const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Expo config plugin that injects a release signingConfig into android/app/build.gradle.
 * - Adds the key.properties loader before the android {} block.
 * - Adds a `release` entry inside the existing signingConfigs block (alongside debug).
 * - Replaces `signingConfig signingConfigs.debug` in buildTypes.release with signingConfigs.release.
 * key.properties is NOT committed — it is generated in CI from secrets or locally from .env.
 */
const withAndroidSigning = (config) => {
  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;

    if (contents.includes('key.properties')) {
      return mod;
    }

    const keystoreLoader = `
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

`;

    contents = contents.replace(/^(android \{)/m, `${keystoreLoader}$1`);

    const releaseSigningConfig = `
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }`;

    contents = contents.replace(
      /(signingConfigs\s*\{[\s\S]*?debug\s*\{[\s\S]*?\})/,
      `$1${releaseSigningConfig}`,
    );

    // Fall back to an unsigned build when key.properties is absent: the
    // F-Droid buildserver has no keystore and expects an unsigned APK,
    // onto which it copies the signature from the published release APK.
    contents = contents.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/,
      '$1signingConfig(keystorePropertiesFile.exists() ? signingConfigs.release : null)',
    );

    mod.modResults.contents = contents;
    return mod;
  });
};

module.exports = withAndroidSigning;
