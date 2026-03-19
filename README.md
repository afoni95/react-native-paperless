# React Native Paperless

A React Native mobile application for [Paperless-ngx](https://docs.paperless-ngx.com/) document management system. Built with Expo, TypeScript, and React Navigation.

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

React Native Paperless is an open-source mobile client for the Paperless-ngx document management system. It allows you to browse, search, upload, and manage your documents on the go from any Android device. The app communicates with your self-hosted Paperless-ngx server via its REST API.

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

# Run type check
npm run typecheck

# Run  i18n check
npm run i18:unused
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
- [ ] Mail Accounts CRUD
- [ ] Mail Rules CRUD
- [ ] Processed Mail view
- [ ] Share Links CRUD
- [ ] Workflows
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
- [ ] User Profile

### Enhancements

- [x] Internationalization
- [x] Theme support (light/dark/system)
- [x] Biometric lock screen
- [ ] Object-level Permissions
- [ ] Custom Field query filtering
- [ ] More Like This search
- [ ] WebSocket status updates
- [X] Upload: add storage_path & custom_fields support

See the [open issues](https://github.com/afoni95/react-native-paperless/issues) for a full list of proposed features and known bugs.

## License

Distributed under the **GNU General Public License v3.0**. See [LICENCE](https://github.com/afoni95/react-native-paperless/blob/main/LICENCE) for more information.
