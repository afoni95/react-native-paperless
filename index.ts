import { registerRootComponent } from 'expo';
import {
  registerWidgetConfigurationScreen,
  registerWidgetTaskHandler,
} from 'react-native-android-widget';

import App from './App';
import { widgetTaskHandler } from './src/widgets/widgetTaskHandler';
import { WidgetConfigurationScreen } from './src/widgets/WidgetConfigurationScreen';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
registerWidgetTaskHandler(widgetTaskHandler);
registerWidgetConfigurationScreen(WidgetConfigurationScreen);
