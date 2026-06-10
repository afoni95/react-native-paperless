# Android Widgets Implementation (react-native-android-widget)

## Current Architecture

This app now uses `react-native-android-widget` as the widget runtime.

### Plugin Configuration

Widget provider generation is configured in `app.json` using:

- Plugin: `react-native-android-widget`
- Widget name: `AnalyticsWidget`

### Entrypoint Registration

`index.ts` registers:

- `registerRootComponent(App)`
- `registerWidgetTaskHandler(widgetTaskHandler)`

Without this registration, no widget lifecycle events are handled.

### Runtime Flow

1. App syncs analytics data.
2. App calls `updateNativeWidget(...)`.
3. `updateNativeWidget(...)` stores a snapshot in AsyncStorage and calls `requestWidgetUpdate(...)`.
4. Widget task handler handles lifecycle actions (`WIDGET_ADDED`, `WIDGET_UPDATE`, `WIDGET_RESIZED`, `WIDGET_CLICK`) and renders `AnalyticsWidgetView`.

## Key Files

- `src/widgets/widgetTaskHandler.tsx`
- `src/widgets/AnalyticsWidgetView.tsx`
- `src/widgets/widgetStorage.ts`
- `src/widgets/nativeBridge.ts`
- `index.ts`
- `app.json`

## Notes

- Old `react-native-home-widget` wiring and custom manifest receiver entries were removed.
- Widget rendering is now task-handler driven via `renderWidget(...)`.
- Current implementation stores one shared analytics snapshot for `AnalyticsWidget` instances.

## Build Steps

Run a clean prebuild so Android native files are regenerated from `app.json`:

```bash
npx expo prebuild --clean
npx expo run:android
```

## Next Improvement

For per-widget analytics selection on add/configure, add a configuration screen and persist data keyed by Android `widgetId` from task-handler events.
