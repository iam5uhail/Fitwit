import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, TextInput, Alert, NativeModules, Platform, ToastAndroid, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext, PALETTES } from '../theme/ThemeContext';
import { IconCheck } from '../components/Icons';

import { API_URL as BASE_API_URL } from '../config';
const API_URL = `${BASE_API_URL}/auth`;

export default function ProfileScreen({ setGoal }) {
  const { theme, setTheme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [authStatus, setAuthStatus] = useState('loading');
  const [email, setEmail] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('30');

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const loadPrefs = async () => {
      const w = await AsyncStorage.getItem('@pref_weight');
      const h = await AsyncStorage.getItem('@pref_height');
      const a = await AsyncStorage.getItem('@pref_age');
      if (w) setWeight(w);
      if (h) setHeight(h);
      if (a) setAge(a);
    };
    loadPrefs();
  }, []);

  const savePref = (key, value, setter) => {
    setter(value);
    AsyncStorage.setItem(key, value);
  };

  const calculateRecommendedSteps = () => {
    const w = parseFloat(weight) || 70;
    const a = parseInt(age, 10) || 30;

    let base = 7000;
    base += (40 - a) * 50; 
    base += (w - 60) * 50; 

    return Math.max(5000, Math.min(15000, Math.round(base / 500) * 500));
  };
  
  const recommendedSteps = calculateRecommendedSteps();

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    Animated.sequence([
      Animated.spring(slideAnim, { toValue: 60, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(slideAnim, { toValue: -100, duration: 300, useNativeDriver: true })
    ]).start(() => setToast({ visible: false, message: '', type: 'success' }));
  };

  useEffect(() => {
    const loadUser = async () => {
      const savedEmail = await AsyncStorage.getItem('@user_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setAuthStatus('logged_in');
      } else {
        setAuthStatus('logged_out');
      }
    };
    loadUser();
  }, []);

  const handleSendCode = async (isResend = false) => {
    if (!email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    if (isResend) {
      setIsResending(true);
    } else {
      setIsLoading(true);
    }
    try {
      const response = await fetch(`${API_URL}/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (data.success) {
        setAuthStatus('verifying');
        showToast(isResend ? 'Code resent! Check your inbox.' : 'Email sent! Check your inbox.', 'success');
      } else {
        showToast(data.error || 'Failed to send code', 'error');
      }
    } catch (err) {
      console.log("Fetch error:", err);
      showToast('Network Error. Could not connect to backend.', 'error');
    } finally {
      setIsLoading(false);
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: inputCode })
      });

      const data = await response.json();
      if (data.success) {
        await AsyncStorage.setItem('@user_email', email);
        setAuthStatus('logged_in');
        showToast('Logged in successfully!', 'success');
      } else {
        showToast(data.error || 'The code is incorrect.', 'error');
      }
    } catch (err) {
      showToast('Network Error. Could not connect to backend.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@user_email');
    setEmail('');
    setInputCode('');
    setAuthStatus('logged_out');
  };

  if (authStatus === 'loading') {
    return <View style={styles.container} />;
  }

  if (authStatus === 'logged_out' || authStatus === 'verifying') {
    return (
      <View style={styles.container}>
        {/* CUSTOM TOAST */}
        <Animated.View style={[
          styles.toastContainer,
          { transform: [{ translateY: slideAnim }], backgroundColor: toast.type === 'error' ? '#FF4B4B' : theme.primary }
        ]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>

        <View style={styles.authContent}>
          <Text style={styles.authTitle}>Welcome to FitWit</Text>
          <Text style={styles.authSubtitle}>
            {authStatus === 'logged_out'
              ? 'Enter your email to sign in or create an account.'
              : `We sent a verification code to ${email}`}
          </Text>

          {authStatus === 'logged_out' ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={theme.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                importantForAutofill="no"
                autoComplete="off"
                textContentType="oneTimeCode"
                autoCorrect={false}
                underlineColorAndroid="transparent"
                value={email}
                onChangeText={setEmail}
              />
              <TouchableOpacity style={[styles.authBtn, isLoading && { opacity: 0.7 }]} onPress={() => handleSendCode(false)} disabled={isLoading}>
                <Text style={styles.authBtnText}>{isLoading ? 'Sending...' : 'Send Code'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter 4-digit code from email"
                placeholderTextColor={theme.muted}
                keyboardType="number-pad"
                value={inputCode}
                onChangeText={setInputCode}
                maxLength={4}
              />
              <TouchableOpacity style={[styles.authBtn, isLoading && { opacity: 0.7 }]} onPress={handleVerify} disabled={isLoading || isResending}>
                <Text style={styles.authBtnText}>{isLoading ? 'Verifying...' : 'Verify & Login'}</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 24, paddingHorizontal: 10 }}>
                <TouchableOpacity onPress={() => setAuthStatus('logged_out')} disabled={isLoading || isResending}>
                  <Text style={{ color: theme.muted, fontSize: 14 }}>Change email</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSendCode(true)} disabled={isLoading || isResending}>
                  <Text style={{ color: theme.accent, fontSize: 14, fontWeight: 'bold', opacity: isResending ? 0.7 : 1 }}>{isResending ? 'Sending...' : 'Resend code'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    );
  }

  // LOGGED IN VIEW
  const avatarLetter = email ? email.charAt(0).toUpperCase() : 'U';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
            <Text style={[styles.avatarText, { color: theme.name === 'Mono' ? '#000' : '#FFF' }]}>{avatarLetter}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.profileName}>{email}</Text>
            <Text style={styles.profileSub}>Walking since {new Date().toLocaleString('default', { month: 'long' })}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>248k</Text>
            <Text style={styles.statLab}>Lifetime Steps</Text>
          </View>
          <View style={{width: 1, backgroundColor: theme.line}} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>189</Text>
            <Text style={styles.statLab}>Kilometers</Text>
          </View>
          <View style={{width: 1, backgroundColor: theme.line}} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>8.9k</Text>
            <Text style={styles.statLab}>Calories</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.colorHeader}>
          <Text style={styles.sectionTitle}>App color</Text>
          <Text style={styles.colorName}>{theme.name}</Text>
        </View>
        <View style={styles.colorRow}>
          {Object.values(PALETTES).map(color => {
            const isActive = theme.name === color.name;
            const isMono = color.name === 'Mono';
            return (
              <TouchableOpacity
                key={color.name}
                onPress={() => setTheme(color)}
                style={[
                  styles.colorOuter,
                  isActive && { borderColor: theme.muted, borderWidth: 2 }
                ]}
              >
                <View style={[styles.colorInner, { backgroundColor: color.accent }]}>
                  {isActive && <IconCheck color={isMono ? '#000' : '#FFF'} size={18} />}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={[styles.sectionTitle, {marginBottom: 20}]}>Personalization</Text>
        
        <View style={styles.inputRow}>
          <Text style={styles.settingLabel}>Age (years)</Text>
          <TextInput style={[styles.numberInput, { color: theme.ink, backgroundColor: theme.surface2 }]} keyboardType="numeric" value={age} onChangeText={(v) => savePref('@pref_age', v, setAge)} />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.settingLabel}>Height (cm)</Text>
          <TextInput style={[styles.numberInput, { color: theme.ink, backgroundColor: theme.surface2 }]} keyboardType="numeric" value={height} onChangeText={(v) => savePref('@pref_height', v, setHeight)} />
        </View>

        <View style={[styles.inputRow, {borderBottomWidth: 0, paddingBottom: 0}]}>
          <Text style={styles.settingLabel}>Weight (kg)</Text>
          <TextInput style={[styles.numberInput, { color: theme.ink, backgroundColor: theme.surface2 }]} keyboardType="numeric" value={weight} onChangeText={(v) => savePref('@pref_weight', v, setWeight)} />
        </View>

        <View style={{ backgroundColor: theme.surface2, padding: 16, borderRadius: 16, marginTop: 16 }}>
          <Text style={{ color: theme.ink, fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>Recommended Goal</Text>
          <Text style={{ color: theme.muted, fontSize: 13, marginBottom: 16 }}>Based on your age and weight, we suggest this daily target.</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.accent, fontSize: 28, fontWeight: '900' }}>{recommendedSteps.toLocaleString()}</Text>
            {setGoal && (
               <TouchableOpacity style={{ backgroundColor: theme.accent, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 }} onPress={() => { setGoal(recommendedSteps); showToast('Daily goal updated!', 'success'); }}>
                 <Text style={{ color: theme.name === 'Mono' ? '#000' : '#FFF', fontWeight: 'bold' }}>Set Goal</Text>
               </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  toastContainer: { position: 'absolute', top: 50, left: 20, right: 20, padding: 16, borderRadius: 12, zIndex: 100, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 6 },
  toastText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  content: { padding: 20, paddingTop: 40, paddingBottom: 60 },
  authContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  authTitle: { color: theme.ink, fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  authSubtitle: { color: theme.muted, fontSize: 14, textAlign: 'center', marginBottom: 32 },
  input: { width: '100%', height: 50, backgroundColor: theme.surface2, borderRadius: 25, paddingHorizontal: 20, color: theme.ink, marginBottom: 16 },
  authBtn: { width: '100%', height: 50, backgroundColor: theme.accent, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  authBtnText: { color: theme.name === 'Mono' ? '#000' : '#FFF', fontSize: 16, fontWeight: 'bold' },
  title: { color: theme.ink, fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  card: { backgroundColor: theme.surface, borderRadius: 32, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: theme.line },
  colorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: theme.ink, fontSize: 20, fontWeight: 'bold' },
  colorName: { color: theme.muted, fontSize: 14 },
  colorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  colorOuter: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  colorInner: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 24, fontWeight: 'bold' },
  profileName: { color: theme.ink, fontSize: 18, fontWeight: 'bold' },
  profileSub: { color: theme.muted, fontSize: 12, marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTopWidth: 1, borderTopColor: theme.line },
  statCol: { flex: 1, alignItems: 'center' },
  statVal: { color: theme.ink, fontSize: 20, fontWeight: '900' },
  statLab: { color: theme.muted, fontSize: 11, marginTop: 4, fontWeight: 'bold' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: theme.line },
  settingLabel: { color: theme.ink, fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  settingSub: { color: theme.muted, fontSize: 12, maxWidth: 220 },
  settingValue: { color: theme.ink, fontSize: 15, fontWeight: 'bold' },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.line },
  numberInput: { width: 80, height: 40, borderRadius: 8, textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: { backgroundColor: theme.surface2, borderRadius: 32, padding: 18, alignItems: 'center', marginTop: 8 },
  logoutBtnText: { color: '#ff4757', fontSize: 16, fontWeight: 'bold' }
});
