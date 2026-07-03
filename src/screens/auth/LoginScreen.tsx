import React, { useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { apiClient } from '../../services/api';

// Required so the OAuth browser popup can properly close/return control to the app
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        loginWithGoogle(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      Alert.alert('Error', 'Google Login was cancelled or failed.');
    }
  }, [response]);

  // ---- Shared handler: sends provider payload to backend /auth/oauth ----
  const completeOAuthLogin = async (payload: {
    provider: 'GOOGLE' | 'APPLE';
    providerToken: string;
    email?: string | null;
    fullName?: string | null;
  }) => {
    try {
      setOauthLoading(true);

      const res = await apiClient.post('/auth/oauth', payload);

      if (res.data.success) {
        const data = res.data.data;
        const token = data.jwt_token ?? data.jwtToken;
        const profileCompleted = data.profile_completed ?? data.profileCompleted;

        await AsyncStorage.setItem('userToken', token);

        navigation.reset({
          index: 0,
          routes: [{ name: profileCompleted ? 'Dashboard' : 'ProfileSetup' }],
        });
      } else {
        Alert.alert('Error', res.data.message || `${payload.provider} Login Failed`);
      }
    } catch (error) {
      console.log(`${payload.provider} Login Error`, error);
      Alert.alert('Error', `${payload.provider === 'GOOGLE' ? 'Google' : 'Apple'} Login Failed`);
    } finally {
      setOauthLoading(false);
    }
  };

  // ---- Google ----
  const loginWithGoogle = async (accessToken: string) => {
    try {
      setOauthLoading(true);

      const googleUserRes = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const profile = await googleUserRes.json();

      await completeOAuthLogin({
        provider: 'GOOGLE',
        providerToken: accessToken,
        email: profile.email,
        fullName: profile.name,
      });
    } catch (error) {
      console.log('Google Login Error', error);
      Alert.alert('Error', 'Google Login Failed');
      setOauthLoading(false);
    }
  };

  const handleGooglePress = () => {
    if (!request) return; // request not ready yet
    promptAsync();
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
    if (username.length < 10) {
      Alert.alert('Invalid Input', 'Please enter a valid mobile number or email.');
      return;
    }

    try {
      const res = await apiClient.post('/auth/send-otp', { username });

      if (res.data.success) {
        navigation.navigate('OTP', { username: username.trim() });
      } else {
        Alert.alert('Error', res.data.message || 'Failed to send OTP');
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
                style={styles.socialBtn}
                onPress={handleGooglePress}
                disabled={!request || oauthLoading}
              >
                <Image
                  source={require('../../../assets/google.png')}
                  style={styles.socialIcon}
                />
                <Text style={styles.socialText}>Google</Text>
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

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
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
  },
  socialBtn: {
    width: '47%',
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 35,
  },
  signupText: {
    fontSize: 15,
    color: '#71717A',
  },
  signupLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B5CF6',
    marginLeft: 5,
  },
});
