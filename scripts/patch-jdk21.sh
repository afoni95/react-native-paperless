#!/usr/bin/env bash
# Patch node_modules for reproducible release builds.
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

# The RN gradle plugin bakes the build machine's IP into the
# react_native_dev_server_ip string resource, even in release builds,
# making resources.arsc differ on every machine. The value is only used
# by dev-mode Metro connections, so pin it.
sed -i 's/getHostIpAddress())/"localhost")/' \
  node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/src/main/kotlin/com/facebook/react/utils/AgpConfiguratorUtils.kt
