import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme';
import RootNavigator from './src/navigation/RootNavigator';
import { AndroidSimulatorFrame } from './src/components/simulator/AndroidSimulatorFrame';

import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AndroidSimulatorFrame>
            <RootNavigator />
          </AndroidSimulatorFrame>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}