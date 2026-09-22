import React, { useState, useEffect } from 'react';
// import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { apiClient } from '../../services/api';
import { authApi } from '../../services/authApi';
import { useAuth } from '../../context/AuthContext';

let GoogleSignin: any = null;
let statusCodes: any = {};

try {
  const GoogleModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = GoogleModule.GoogleSignin;
  statusCodes = GoogleModule.statusCodes || {};
} catch (e) {
  console.log('Native GoogleSignin module is not available in the current runtime (e.g. Expo Go)');
}

// Required so the OAuth browser popup can properly close/return control to the app
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }: any) {
  const { completeAuth } = useAuth();
  const [username, setUsername] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);

  useEffect(() => {
    if (GoogleSignin) {
      try {
        GoogleSignin.configure({
          webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com', // Configure your Google Web Client ID from Google Cloud Console
          offlineAccess: true,
        });
      } catch (e) {
        console.log('GoogleSignin configuration note:', e);
      }
    }
  }, []);

  // ---- Shared handler: sends provider payload to backend /auth/oauth ----
  const completeOAuthLogin = async (payload: {
    provider: 'GOOGLE' | 'APPLE';
    providerToken: string;
    email?: string | null;
    fullName?: string | null;
    givenName?: string | null;
    familyName?: string | null;
    photo?: string | null;
  }) => {
    try {
      setOauthLoading(true);

      const res = await authApi.oauthLogin({
        provider: payload.provider,
        providerToken: payload.providerToken,
        email: payload.email || undefined,
        fullName: payload.fullName || undefined,
      });

      if (res.success) {
        const data = res.data;
        const token = data.jwt_token;
        const profileCompleted = data.profile_completed;

        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('profileCompleted', profileCompleted ? 'true' : 'false');

        if (profileCompleted) {
          const savedRedirect = await AsyncStorage.getItem('redirectAfterLogin');
          if (savedRedirect) {
            await AsyncStorage.removeItem('redirectAfterLogin');
            console.log('Restoring post-login route:', savedRedirect);
          }
          completeAuth();
        } else {
          navigation.replace('ProfileSetup', {
            email: payload.email || undefined,
            firstName:
              payload.givenName ||
              (payload.fullName ? payload.fullName.split(' ')[0] : undefined),
            lastName:
              payload.familyName ||
              (payload.fullName ? payload.fullName.split(' ').slice(1).join(' ') : undefined),
            profilePhotoUrl: payload.photo || undefined,
          });
        }
      } else {
        Alert.alert('Error', res.message || `${payload.provider} Login Failed`);
      }
    } catch (error: any) {
      console.log(`${payload.provider} Login Error`, error);
      Alert.alert('Error', `${payload.provider === 'GOOGLE' ? 'Google' : 'Apple'} Login Failed`);
    } finally {
      setOauthLoading(false);
    }
  };

  // ---- Native Google Sign-In Handler ----
  const handleGooglePress = async () => {
    if (!GoogleSignin) {
      handleGoogleOtpFallback();
      return;
    }
    try {
      setOauthLoading(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();

      const data = (response as any)?.data || response;
      const idToken = data?.idToken;
      const user = data?.user;

      if (!idToken) {
        Alert.alert('Google Sign-In Error', 'Unable to obtain Google ID token.');
        return;
      }

      const fullName =
        user?.name || [user?.givenName, user?.familyName].filter(Boolean).join(' ');

      await completeOAuthLogin({
        provider: 'GOOGLE',
        providerToken: idToken,
        email: user?.email,
        fullName: fullName,
        givenName: user?.givenName,
        familyName: user?.familyName,
        photo: user?.photo,
      });
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return;
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          'Google Play Services',
          'Google Play Services is not available or outdated on this device.',
        );
      } else {
        console.log('Google Sign-In Error:', error);
        if (
          error?.message?.includes('DEVELOPMENT_BUILD') ||
          error?.message?.includes('null') ||
          error?.code === '12500'
        ) {
          handleGoogleOtpFallback();
        } else {
          Alert.alert('Google Sign-In Error', error?.message || 'Google authentication failed.');
        }
      }
    } finally {
      setOauthLoading(false);
    }
  };

  const handleGoogleOtpFallback = async () => {
    const emailInput = username.trim();
    if (!emailInput) {
      Alert.alert(
        'Google Sign-In',
        'Please enter your Gmail address in the field above to receive a verification OTP.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (!username) {
                setUsername('@gmail.com');
              }
            },
          },
        ],
      );
      return;
    }

    try {
      setOauthLoading(true);
      const res = await authApi.sendOtp({ username: emailInput });

      if (res.success) {
        navigation.navigate('OTP', { username: emailInput });
      } else {
        Alert.alert('Error', res.message || 'Failed to send OTP to Gmail');
      }
    } catch (error) {
      console.log('Google OTP Fallback Error:', error);
      Alert.alert('Network Error', 'Could not connect to the server.');
    } finally {
      setOauthLoading(false);
    }
  };

  // ---- Apple ----
  const handleApplePress = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Unavailable', 'Apple Sign-In is only available on iOS.');
      return;
    }
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // identityToken is what your backend should verify with Apple
      const fullName = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName]
            .filter(Boolean)
            .join(' ')
        : null;

      await completeOAuthLogin({
        provider: 'APPLE',
        providerToken: credential.identityToken || '',
        email: credential.email,
        fullName,
      });
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // user cancelled - no alert needed
        return;
      }
      console.log('Apple Login Error', error);
      Alert.alert('Error', 'Apple Login Failed');
    }
  };

  // ---- OTP (mobile/email) ----
  const handleSendOtp = async () => {
    if (username.length < 5) {
      Alert.alert('Invalid Input', 'Please enter a valid mobile number or email.');
      return;
    }

    try {
      const res = await authApi.sendOtp({ username: username.trim() });

      if (res.success) {
        navigation.navigate('OTP', { username: username.trim() });
      } else {
        Alert.alert('Error', res.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Network Error', 'Could not connect to the server.');
    }
  };

  return (
    <LinearGradient
      colors={['#7C3AED', '#EC4899', '#F97316']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back!</Text>
            <Text style={styles.subtitle}>Let's get you connected</Text>
            <Image
              source={require('../../../assets/login-illustration.png')}
              style={styles.familyImage}
              resizeMode="contain"
            />
          </View>

          <LinearGradient colors={['#FFFFFF', '#F7F1FF']} style={styles.card}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={22} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Mobile number or Email"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
              <Text style={styles.buttonText}>Send OTP</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>or continue with</Text>

            <View style={styles.socialRow}>
              <TouchableOpacity
                style={[styles.socialBtn, Platform.OS !== 'ios' && styles.socialBtnFull]}
                onPress={handleGooglePress}
                disabled={oauthLoading}
              >
                {oauthLoading ? (
                  <ActivityIndicator size="small" color="#7C3AED" />
                ) : (
                  <>
                    <Image
                      source={require('../../../assets/google.png')}
                      style={styles.socialIcon}
                    />
                    <Text style={styles.socialText}>Google</Text>
                  </>
                )}
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={handleApplePress}
                  disabled={oauthLoading}
                >
                  <Image
                    source={require('../../../assets/apple.png')}
                    style={styles.socialIcon}
                  />
                  <Text style={styles.socialText}>Apple</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    height: 370,
    overflow: 'hidden',
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 10,
    textAlign: 'center',
  },
  familyImage: {
    width: 520,
    height: 520,
    marginTop: -110,
    marginBottom: -230,
  },
  card: {
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 35,
    marginTop: -50,
    overflow: 'hidden',
  },
  inputContainer: {
    height: 58,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    height: 58,
    borderRadius: 18,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  orText: {
    textAlign: 'center',
    marginVertical: 28,
    color: '#71717A',
    fontSize: 15,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  socialBtn: {
    width: Platform.OS === 'ios' ? '48%' : '100%',
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialBtnFull: {
    width: '100%',
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  socialText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181B',
  },
});
