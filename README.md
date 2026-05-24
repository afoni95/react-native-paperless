# React Native Paperless

A React Native mobile application for [Paperless-ngx](https://docs.paperless-ngx.com/) document management system. Built with Expo, TypeScript, and React Navigation.

[![Google Play: Coming Soon](https://img.shields.io/badge/Google%20Play-Coming%20Soon-34A853?style=for-the-badge&logo=googleplay&logoColor=white)]()

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://github.com/afoni95/react-native-paperless/blob/main/LICENCE)
[![Build](https://github.com/afoni95/react-native-paperless/actions/workflows/build-appbundle.yml/badge.svg)](https://github.com/afoni95/react-native-paperless/actions/workflows/build-appbundle.yml)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/afoni95/react-native-paperless)](https://github.com/afoni95/react-native-paperless/releases)
[![Platform](https://img.shields.io/badge/Platform-Android-green.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=white)](https://reactnative.dev/)
[![Paperless-ngx](https://img.shields.io/badge/Paperless--ngx-API%20v9-17541f)](https://docs.paperless-ngx.com/api/)
[![GitHub Issues](https://img.shields.io/github/issues/afoni95/react-native-paperless)](https://github.com/afoni95/react-native-paperless/issues)

## About the Project

A mobile client for Paperless-ngx. Browse, search, upload, and manage your documents from your Android device. Connects directly to your self-hosted Paperless-ngx instance via its REST API.

## Prerequisites

- Node.js and npm
- Running Paperless-ngx server instance

## Installation

```bash
npm install
```

## Running the App

```bash
# Start Metro bundler
npm run start

# Run on Android (via Expo)
npm run android

# Build Android locally
npm run android:build

# Run linter with auto fix
npm run lint:fix

# Type check
npm run ci:typecheck

# Check unused i18n translations
npm run ci:i18n

# Check version sync
npm run ci:version
```

## Roadmap

### Resource APIs

- [x] Documents CRUD (list, detail, edit, delete)
- [x] Tags CRUD
- [x] Correspondents CRUD
- [x] Document Types CRUD
- [x] Statistics / Dashboard
- [x] Tasks (polling)
- [X] Logs viewer
- [X] Storage Paths CRUD
- [X] Custom Fields CRUD
- [X] Mail Accounts CRUD
- [X] Mail Rules CRUD
- [X] Processed Mail view
- [X] Share Links CRUD
- [X] Workflows
- [X] Users/Groups management

### Special Endpoints

- [x] Search autocomplete
- [x] Document upload (file & camera)
- [x] PDF preview & download/share
- [X] Trash view & restore
- [X] Global Search
- [ ] Bulk Edit Documents
- [ ] Bulk Download Documents
- [ ] Bulk Edit Objects

### Enhancements

- [x] Internationalization
- [x] Theme support (light/dark/system)
- [X] Document Analytics 
- [x] Biometric lock screen
- [X] Object-level Permissions
- [X] Upload: add storage_path & custom_fields support
- [ ] WebSocket status updates | Currently not possible due to Managed Expo limitation

See the [open issues](https://github.com/afoni95/react-native-paperless/issues) for a full list of proposed features and known bugs.

## License

Distributed under the **GNU General Public License v3.0**. See [LICENCE](https://github.com/afoni95/react-native-paperless/blob/main/LICENCE) for more information.
