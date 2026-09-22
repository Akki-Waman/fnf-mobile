// src/components/simulator/AndroidSimulatorFrame.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  SafeAreaView,
  StatusBar as RNStatusBar,
} from 'react-native';
import { DevSimulatorDrawer, DeviceFrameType } from './DevSimulatorDrawer';

interface AndroidSimulatorFrameProps {
  children: React.ReactNode;
}

export const AndroidSimulatorFrame: React.FC<AndroidSimulatorFrameProps> = ({ children }) => {
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrameType>('pixel8');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formatted = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes}`;
      setCurrentTime(formatted);
    };

    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // On Native (iOS/Android device or emulator), render full native container
  if (Platform.OS !== 'web' || deviceFrame === 'fullscreen') {
    return (
      <View style={styles.fullScreenContainer}>
        {children}
        <DevSimulatorDrawer
          currentFrame={deviceFrame}
          onSelectFrame={(frame) => setDeviceFrame(frame)}
        />
      </View>
    );
  }

  const getFrameDimensions = () => {
    switch (deviceFrame) {
      case 'galaxyS24':
        return { width: 412, height: 915, name: 'Samsung Galaxy S24 Ultra' };
      case 'iphone15':
        return { width: 393, height: 852, name: 'iPhone 15 Pro' };
      case 'pixel8':
      default:
        return { width: 393, height: 852, name: 'Google Pixel 8 Pro' };
    }
  };

  const dims = getFrameDimensions();

  return (
    <View style={styles.desktopBackground}>
      {/* Top Banner */}
      <View style={styles.simulatorHeader}>
        <Text style={styles.simulatorTitle}>🤖 FNF Mobile Android Simulator</Text>
        <Text style={styles.simulatorBadge}>
          {dims.name} ({dims.width} × {dims.height}px)
        </Text>
      </View>

      {/* Outer Phone Shell */}
      <View
        style={[
          styles.phoneChassis,
          { width: dims.width + 24, height: dims.height + 40 },
        ]}
      >
        {/* Left Side Buttons */}
        <View style={styles.volumeButtonUp} />
        <View style={styles.volumeButtonDown} />
        {/* Right Side Power Button */}
        <View style={styles.powerButton} />

        {/* Screen Viewport */}
        <View style={[styles.screenViewport, { width: dims.width, height: dims.height }]}>
          {/* Top Android Status Bar */}
          <View style={styles.androidStatusBar}>
            <Text style={styles.statusTimeText}>{currentTime || '9:41'}</Text>
            {/* Camera Punch Hole */}
            <View style={styles.cameraPunchHole} />
            <View style={styles.statusIconsRow}>
              <Text style={styles.statusIcon}>5G</Text>
              <Text style={styles.statusIcon}>📶</Text>
              <Text style={styles.statusIcon}>🔋 98%</Text>
            </View>
          </View>

          {/* App Viewport */}
          <View style={styles.appContainer}>{children}</View>

          {/* Bottom Android Gesture Navigation Bar */}
          <View style={styles.androidGestureBarContainer}>
            <View style={styles.androidGesturePill} />
          </View>
        </View>
      </View>

      {/* Floating Dev Harness Controls */}
      <DevSimulatorDrawer
        currentFrame={deviceFrame}
        onSelectFrame={(frame) => setDeviceFrame(frame)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  desktopBackground: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark Slate Desktop
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    minHeight: '100vh' as any,
  },
  simulatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  simulatorTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  simulatorBadge: {
    backgroundColor: '#1E293B',
    color: '#818CF8',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#334155',
  },
  phoneChassis: {
    backgroundColor: '#1E293B', // Metallic frame border
    borderRadius: 48,
    padding: 12,
    borderWidth: 4,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    position: 'relative',
  },
  volumeButtonUp: {
    position: 'absolute',
    left: -8,
    top: 110,
    width: 6,
    height: 48,
    backgroundColor: '#475569',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  volumeButtonDown: {
    position: 'absolute',
    left: -8,
    top: 170,
    width: 6,
    height: 48,
    backgroundColor: '#475569',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  powerButton: {
    position: 'absolute',
    right: -8,
    top: 140,
    width: 6,
    height: 60,
    backgroundColor: '#475569',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  screenViewport: {
    backgroundColor: '#FFFFFF',
    borderRadius: 38,
    overflow: 'hidden',
    flexDirection: 'column',
    position: 'relative',
  },
  androidStatusBar: {
    height: 36,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    zIndex: 9999,
  },
  statusTimeText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  cameraPunchHole: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statusIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIcon: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  androidGestureBarContainer: {
    height: 20,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  androidGesturePill: {
    width: 120,
    height: 4,
    backgroundColor: '#94A3B8',
    borderRadius: 2,
  },
});
