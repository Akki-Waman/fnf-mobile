import React, { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { apiClient } from '../../services/api';


type Props = {
  navigation: NativeStackNavigationProp<
    AuthStackParamList,
    'OTP'
  >;
  route: RouteProp<
    AuthStackParamList,
    'OTP'
  >;
};

export default function OtpVerificationScreen({
  navigation,
  route,
}: Props) {
  const { username } = route.params;

  const [otp, setOtp] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

 const [seconds, setSeconds] =
  useState(30);

const [isResending, setIsResending] =
  useState(false);

const inputRefs = useRef<
  Array<TextInput | null>
>([]);

useEffect(() => {
  if (seconds <= 0) {
    return;
  }

  const timer = setTimeout(() => {
    setSeconds(prev => prev - 1);
  }, 1000);

  return () => clearTimeout(timer);
}, [seconds]);

  const resendOtp = async () => {
  try {
    setIsResending(true);

    const response = await apiClient.post(
      '/auth/send-otp',
      {
        username,
      }
    );

    if (response.data.success) {
      Alert.alert(
        'Success',
        'OTP sent successfully.'
      );

      setIsResending(false);
      // restart timer
      setSeconds(30);
    } else {
      Alert.alert(
        'Error',
        response.data.message ||
          'Failed to resend OTP.'
      );
    }
  } catch (error: any) {
    console.log(
      'Resend OTP Error:',
      error?.response?.data || error
    );

    Alert.alert(
      'Error',
      'Could not resend OTP.'
    );
  } finally {
    setIsResending(false);
  }
};

  const handleOtpChange = (
    text: string,
    index: number,
  ) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (
      text.length > 0 &&
      index < 5
    ) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  const handleKeyPress = (
    e: any,
    index: number,
  ) => {
    if (
      e.nativeEvent.key ===
        'Backspace' &&
      otp[index] === '' &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }
  };

  const verifyOtp = async () => {
    const otpString =
      otp.join('');

    if (
      otpString.length !== 6
    ) {
      Alert.alert(
        'Error',
        'Please enter the complete OTP.',
      );
      return;
    }

    try {
      const response =
        await apiClient.post(
          '/auth/verify-otp',
          {
            username,
            otp: otpString,
          },
        );

      console.log(
        'OTP Response:',
        JSON.stringify(
          response.data,
          null,
          2,
        ),
      );

      if (
        response.data.success
      ) {
        const data =
          response.data.data;

        const token =
          data?.jwt_token;

        const profileCompleted =
          data?.profile_completed;

        if (!token) {
          Alert.alert(
            'Error',
            'JWT token not received from server.',
          );
          return;
        }

        await AsyncStorage.setItem(
          'userToken',
          token,
        );

        if (
          profileCompleted
        ) {
          navigation.reset({
            index: 0,
            routes: [
              {
                name:
                  'Dashboard',
              },
            ],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [
              {
                name:
                  'ProfileSetup',
              },
            ],
          });
        }
      } else {
        Alert.alert(
          'Verification Failed',
          response.data
            .message ||
            'Invalid OTP.',
        );
      }
    } catch (error: any) {
      console.log(
        error?.response
          ?.data || error,
      );

      Alert.alert(
        'Error',
        error?.response
          ?.data
          ?.message ||
          'Could not verify OTP.',
      );
    }
  };

  return (
    <LinearGradient
      colors={[
        '#FF9A62',
        '#FF6B8A',
        '#A53FE7',
      ]}
      start={{
        x: 0,
        y: 1,
      }}
      end={{
        x: 1,
        y: 0,
      }}
      style={
        styles.container
      }
    >
      <SafeAreaView
        style={
          styles.safeArea
        }
      >
        <KeyboardAvoidingView
          style={{
            flex: 1,
          }}
          behavior={
            Platform.OS ===
            'ios'
              ? 'padding'
              : undefined
          }
        >
          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
            style={
              styles.backButton
            }
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>

          <View
            style={
              styles.content
            }
          >
            <Text
              style={
                styles.title
              }
            >
              Verify your
              number
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Enter the
              6-digit code
              sent to
            </Text>

            <View
              style={
                styles.usernameContainer
              }
            >
              <Text
                style={
                  styles.usernameText
                }
                numberOfLines={
                  1
                }
              >
                {username}
              </Text>
            </View>

            <Image
              source={require('../../../assets/otp-illustration.png')}
              style={
                styles.illustration
              }
              resizeMode="contain"
            />

            <View
              style={
                styles.otpContainer
              }
            >
              {otp.map(
                (
                  digit,
                  index,
                ) => (
                  <TextInput
                    key={
                      index
                    }
                    ref={ref =>
                      (inputRefs.current[
                        index
                      ] =
                        ref)
                    }
                    style={
                      styles.otpBox
                    }
                    keyboardType="number-pad"
                    maxLength={
                      1
                    }
                    value={
                      digit
                    }
                    onChangeText={text =>
                      handleOtpChange(
                        text,
                        index,
                      )
                    }
                    onKeyPress={e =>
                      handleKeyPress(
                        e,
                        index,
                      )
                    }
                    textAlign="center"
                  />
                ),
              )}
            </View>

           {seconds > 0 ? (
  <Text style={styles.timer}>
    Resend code in
    <Text style={styles.timerValue}>
      {' '}
      00:
      {seconds
        .toString()
        .padStart(2, '0')}
    </Text>
  </Text>
) : (
  <TouchableOpacity
    onPress={resendOtp}
    disabled={isResending}
  >
    <Text
      style={styles.resendText}
    >
      {isResending
        ? 'Sending...'
        : 'Resend OTP'}
    </Text>
  </TouchableOpacity>
)}

            <TouchableOpacity
              onPress={
                verifyOtp
              }
              activeOpacity={
                0.9
              }
              style={
                styles.buttonContainer
              }
            >
              <LinearGradient
                colors={[
                  '#FF4E7A',
                  '#FF7A4E',
                ]}
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 0,
                }}
                style={
                  styles.button
                }
              >
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  Verify
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    safeArea: {
      flex: 1,
    },

    backButton: {
      position:
        'absolute',
      top: 20,
      left: 20,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor:
        'rgba(255,255,255,0.18)',
      justifyContent:
        'center',
      alignItems:
        'center',
      zIndex: 100,
    },

    content: {
      flex: 1,
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal: 24,
    },

    title: {
      fontSize: 38,
      fontWeight: '800',
      color: '#FFF',
      textAlign:
        'center',
    },

    subtitle: {
      marginTop: 12,
      fontSize: 18,
      color:
        'rgba(255,255,255,0.9)',
      textAlign:
        'center',
    },

    usernameContainer:
      {
        marginTop: 20,
        backgroundColor:
          'rgba(255,255,255,0.18)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
        maxWidth:
          '90%',
      },

    usernameText: {
      color: '#FFF',
      fontSize: 18,
      fontWeight:
        '700',
    },

    illustration: {
  width: 330,
  height: 330,
  marginTop: -10,
  marginBottom: -20,
},

   otpContainer: {
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: -15,
  paddingHorizontal: 5,
},

    otpBox: {
      width: 52,
      height: 72,
      backgroundColor:
        '#FFF',
      borderRadius: 18,
      fontSize: 28,
      fontWeight:
        '700',
      color: '#222',
      elevation: 8,
      shadowColor:
        '#000',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 4,
      },
    },

    timer: {
      marginTop: 35,
      fontSize: 18,
      color: '#FFF',
      fontWeight:
        '500',
    },

    timerValue: {
      color: '#FFE082',
      fontWeight:
        '700',
    },
   resendText: {
  marginTop: 35,
  fontSize: 18,
  fontWeight: '700',
  color: '#FFE082',
  textAlign: 'center',
},

    buttonContainer: {
      width: '100%',
      marginTop: 45,
    },

    button: {
      height: 62,
      borderRadius: 31,
      justifyContent:
        'center',
      alignItems:
        'center',
      elevation: 10,
    },

    buttonText: {
      color: '#FFF',
      fontSize: 22,
      fontWeight:
        '800',
    },
  });