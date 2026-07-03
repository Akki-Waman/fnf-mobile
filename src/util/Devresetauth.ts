// Dev-only utility. Run this once (e.g. temporarily call it from a button,
// or from a debug menu) to wipe the stored session and force a cold start
// back into the Splash -> Login -> OTP -> ProfileSetup flow.
//
// Usage from any screen during development:
//   import { devResetAuth } from '../../utils/devResetAuth';
//   <Button title="Dev: Reset Session" onPress={devResetAuth} />
//
// Remove this file (or the button that calls it) before shipping.

import AsyncStorage from '@react-native-async-storage/async-storage';

export async function devResetAuth() {
  await AsyncStorage.removeItem('userToken');
  console.log('userToken cleared — fully reload the app (not Fast Refresh) to see the Splash flow again.');
}