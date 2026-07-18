#!/usr/bin/env bash
# Patch the JVM toolchain from 17 to 21 in node_modules.
#
# The F-Droid buildserver (Debian trixie) only ships JDK 21, so its build
# recipe patches the toolchain before compiling. The GitHub release build
# runs this exact same script so both produce byte-identical bytecode --
# required for F-Droid's reproducible-build verification against the
# GitHub release APK.
#
set -euo pipefail

sed -i '/jvmToolchain/s/17/21/' node_modules/@react-native/gradle-plugin/*/build.gradle.kts
sed -i -e 's/JavaVersion.VERSION_17/JavaVersion.VERSION_21/g' -e 's/jvmToolchain(17)/jvmToolchain(21)/g' \
  node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/src/main/kotlin/com/facebook/react/utils/JdkConfiguratorUtils.kt
sed -i 's/jvmToolchain(17)/jvmToolchain(21)/' node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle
