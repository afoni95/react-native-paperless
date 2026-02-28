# React Native Paperless

A React Native mobile application for [Paperless-ngx](https://docs.paperless-ngx.com/) document management system. Built with Expo, TypeScript, and React Navigation.

## About the Project

React Native Paperless is an open-source mobile client for the Paperless-ngx document management system. It allows you to browse, search, upload, and manage your documents on the go from any Android or iOS device. The app communicates with your self-hosted Paperless-ngx server via its REST API, giving you full access to your document archive from anywhere.

## Features

- **Dashboard** — overview of total documents, inbox count, tags, correspondents, document types, and file-type statistics
- **Document browsing** — paginated list with sorting, full-text search, and multi-criteria filtering (tags, correspondent, document type, date)
- **Document detail & editing** — view and update title, correspondent, document type, tags, and notes
- **PDF viewer** — in-app PDF preview with download/share support
- **Upload** — upload files from local storage or capture documents directly with the camera
- **Tag management** — create, edit, delete tags with color and matching-algorithm support
- **Correspondent management** — create, edit, delete correspondents with matching rules
- **Document type management** — create, edit, delete document types with matching rules
- **Internationalization** — English and German translations (easily extendable)
- **Theming** — light, dark, and system-auto themes

## Prerequisites

- Node.js and npm
- Expo CLI (`npm install -g expo-cli`)
- Running Paperless server instance

## Installation

```bash
npm install
```

## Running the App

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## Roadmap

- [ ] Bulk editing (multi-select documents)
- [ ] Storage path management
- [ ] Full offline mode with local caching & sync
- [ ] Custom fields support

See the [open issues](https://github.com/afoni95/react-native-paperless/issues) for a full list of proposed features and known bugs.

## License

Distributed under the **GNU General Public License v3.0**. See [LICENCE](https://github.com/afoni95/react-native-paperless/blob/main/LICENCE) for more information.
