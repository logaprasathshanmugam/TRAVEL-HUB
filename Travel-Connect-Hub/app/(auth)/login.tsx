import React, { useState } from 'react';
import {
  StyleSheet, Text, View, Pressable, TextInput,
  useColorScheme, Alert, Platform, ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/auth-context';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }
    setLoading(true);
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const success = await login(username.trim(), password);
    setLoading(false);

    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.dismissAll();
    } else {
      setError('Invalid username or password');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <View style={styles.content}>
        <View style={[styles.logoWrap, { backgroundColor: Colors.primary + '12' }]}>
          <MaterialCommunityIcons name="motorbike" size={36} color={Colors.primary} />
        </View>
        <Text style={[styles.title, { color: isDark ? Colors.white : Colors.dark }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: Colors.gray300 }]}>Sign in to continue your ride</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: isDark ? Colors.gray200 : Colors.gray500 }]}>Username</Text>
          <View style={[styles.inputWrap, { backgroundColor: isDark ? Colors.darkCard : Colors.white, borderColor: isDark ? Colors.darkBorder : Colors.gray100 }]}>
            <Ionicons name="person-outline" size={18} color={Colors.gray300} />
            <TextInput
              style={[styles.input, { color: isDark ? Colors.white : Colors.dark }]}
              placeholder="Enter username"
              placeholderTextColor={Colors.gray300}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: isDark ? Colors.gray200 : Colors.gray500 }]}>Password</Text>
          <View style={[styles.inputWrap, { backgroundColor: isDark ? Colors.darkCard : Colors.white, borderColor: isDark ? Colors.darkBorder : Colors.gray100 }]}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.gray300} />
            <TextInput
              style={[styles.input, { color: isDark ? Colors.white : Colors.dark }]}
              placeholder="Enter password"
              placeholderTextColor={Colors.gray300}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.gray300} />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={({ pressed }) => [
            styles.loginBtn,
            { backgroundColor: Colors.primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>Sign In</Text>
          )}
        </Pressable>

        <View style={styles.demoHint}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.gray300} />
          <Text style={[styles.demoText, { color: Colors.gray300 }]}>
            Demo: admin / admin123
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: Colors.gray300 }]}>Don't have an account?</Text>
        <Link href="/(auth)/register" asChild>
          <Pressable>
            <Text style={[styles.footerLink, { color: Colors.primary }]}>Sign Up</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, paddingTop: 20, gap: 14 },
  logoWrap: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 28 },
  subtitle: { fontFamily: 'Outfit_400Regular', fontSize: 15, marginBottom: 8 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.danger + '12', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  errorText: { fontFamily: 'Outfit_500Medium', fontSize: 13, color: Colors.danger },
  inputGroup: { gap: 6 },
  label: { fontFamily: 'Outfit_500Medium', fontSize: 13, marginLeft: 2 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 50, borderRadius: 14, gap: 10, borderWidth: 1 },
  input: { flex: 1, fontFamily: 'Outfit_400Regular', fontSize: 15, height: 50 },
  loginBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  loginBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: '#fff' },
  demoHint: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  demoText: { fontFamily: 'Outfit_400Regular', fontSize: 12 },
  footer: { flexDirection: 'row', justifyContent: 'center', padding: 24, gap: 4, alignItems: 'center' },
  footerText: { fontFamily: 'Outfit_400Regular', fontSize: 14 },
  footerLink: { fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
});
