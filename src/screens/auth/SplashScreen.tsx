import React, { useEffect } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Splash'>;
};

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    // Navigate to Login after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2500);

    return () => clearTimeout(timer); // Cleanup timer
  }, [navigation]);

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
    flex: 1 
  },
  backgroundImage: { 
    flex: 1, 
    width: '100%', 
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  }
});