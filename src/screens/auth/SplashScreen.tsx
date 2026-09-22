import React, { useEffect } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../context/AuthContext';
import { isTokenExpired } from '../../util/authUtils';
import { clearAuthSession } from '../../services/api';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Splash'>;
};

export default function SplashScreen({ navigation }: Props) {
  const { completeAuth } = useAuth();

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const profileCompleted = await AsyncStorage.getItem('profileCompleted');

        // Proactive token expiration check on app load
        if (token && isTokenExpired(token)) {
          console.log('SplashScreen: Token expired client-side. Clearing session and redirecting to Login.');
          await clearAuthSession();
          navigation.replace('Login');
          return;
        }

        if (token && profileCompleted === 'true') {
          // Existing valid user with completed profile -> go to Dashboard
          completeAuth();
        } else if (token && profileCompleted !== 'true') {
          // Token exists & valid but profile setup pending -> go to ProfileSetup
          navigation.replace('ProfileSetup');
        } else {
          // No token -> go to Login
          navigation.replace('Login');
        }
      } catch (error) {
        console.log('SplashScreen check error:', error);
        await clearAuthSession();
        navigation.replace('Login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, completeAuth]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/splash-logo.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});