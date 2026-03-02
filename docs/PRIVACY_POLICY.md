# Privacy Policy

**Paperless Native**  
Last updated: 01.03.2026

---

### 1. Introduction

This privacy policy explains how the app "Paperless Native" (hereinafter "the app") handles your data. The app is an open-source project licensed under the GNU General Public License v3 (GPLv3).

The app is a mobile client for self-hosted [Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) instances. **The app itself does not collect, store, or transmit any personal data to the developer or any third parties.**

### 2. Data Controller

As this is an open-source project with no commercial intent and no personal data is processed by the developer, there is no data controller in the sense of the GDPR. For questions, you may open an issue in the project's [GitHub repository](https://github.com/afoni95/react-native-paperless/issues).

### 3. What Data Is Processed?

#### 3.1 Data Stored Locally on Your Device

The app stores the following data **exclusively on your device**:

- **Authentication token**: Stored securely in the device's encrypted storage (Secure Store) to maintain the connection to your Paperless-ngx server.
- **Server URL**: The address of your self-hosted Paperless-ngx server.
- **App settings**: Your preferred language (German/English) and theme (Light/Dark/Auto).

This data is **never** transmitted to the developer or third parties.

#### 3.2 Network Communication

The app communicates **exclusively** with the Paperless-ngx server you configure. No data is sent to the developer's servers or third-party services.

#### 3.3 No Analytics or Tracking

The app uses **no** analytics tools, tracking services, advertisements, or third-party SDKs that collect usage data. No crash reports, usage statistics, or telemetry data are sent to the developer.

### 4. Device Permissions

The app requests the following permissions, which are only used with your explicit consent:

| Permission | Purpose |
|---|---|
| **Camera** | To scan and photograph documents for upload |
| **Photo Library** | To select existing images/documents for upload |
| **Internet Access** | To communicate with your Paperless-ngx server |

These permissions are used exclusively for the stated purposes. Image and camera data is only transmitted to your own Paperless-ngx server.

### 5. Data Sharing with Third Parties

**No** data is shared with third parties. All communication occurs directly between your device and your self-hosted Paperless-ngx server.

### 6. Data Security

- Authentication tokens are stored in the operating system's encrypted Secure Store.
- The app supports HTTPS connections to your server.
- All data remains on your device or on your own server.

### 7. Your Rights

Since the app does not collect or transmit personal data to the developer, the usual data subject rights (access, deletion, rectification, etc.) do not apply with respect to the developer. You can delete all locally stored data at any time by:

- Logging out of the app (deletes the token), or
- Clearing the app data in your device settings, or
- Uninstalling the app.

### 8. Changes to This Privacy Policy

This privacy policy may be updated as needed. Changes will be published in this document in the GitHub repository. The date of the last update can be found at the top.

---

**Open Source**: This app is free and open-source software licensed under [GPLv3](LICENCE).
