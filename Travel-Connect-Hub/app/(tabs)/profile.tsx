import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable,
  Platform, useColorScheme, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/auth-context';

function MenuRow({ icon, iconFamily, label, value, onPress, isDark, danger }: {
  icon: string; iconFamily?: string; label: string; value?: string;
  onPress?: () => void; isDark: boolean; danger?: boolean;
}) {
  const iconColor = danger ? Colors.danger : Colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        { backgroundColor: isDark ? Colors.darkCard : Colors.white, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: (danger ? Colors.danger : Colors.primary) + '12' }]}>
        {iconFamily === 'material' ? (
          <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} />
        ) : iconFamily === 'feather' ? (
          <Feather name={icon as any} size={18} color={iconColor} />
        ) : (
          <Ionicons name={icon as any} size={20} color={iconColor} />
        )}
      </View>
      <Text style={[styles.menuLabel, { color: danger ? Colors.danger : (isDark ? Colors.white : Colors.dark) }]}>
        {label}
      </Text>
      {value && <Text style={styles.menuValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={16} color={Colors.gray300} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, isLoggedIn, logout } = useAuth();

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  if (!isLoggedIn) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
        <View style={[styles.loginPrompt, { paddingTop: topInset + 40 }]}>
          <View style={[styles.loginIcon, { backgroundColor: Colors.primary + '12' }]}>
            <Ionicons name="person" size={48} color={Colors.primary} />
          </View>
          <Text style={[styles.loginTitle, { color: isDark ? Colors.white : Colors.dark }]}>
            Join the ride
          </Text>
          <Text style={[styles.loginSubtitle, { color: Colors.gray300 }]}>
            Sign in to connect with other riders, save your favorite spots, and access all features
          </Text>
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={[styles.loginBtn, { backgroundColor: Colors.primary }]}
          >
            <Text style={styles.loginBtnText}>Sign In</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(auth)/register')}
            style={[styles.registerBtn, { borderColor: Colors.primary }]}
          >
            <Text style={[styles.registerBtnText, { color: Colors.primary }]}>Create Account</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      logout();
      return;
    }
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: topInset + 16 }}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: Colors.primary + '18' }]}>
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={[styles.displayName, { color: isDark ? Colors.white : Colors.dark }]}>
              {user?.displayName}
            </Text>
            <Text style={styles.username}>@{user?.username}</Text>
            {user?.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={12} color={Colors.accent} />
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
              <MaterialCommunityIcons name="road-variant" size={22} color={Colors.primary} />
              <Text style={[styles.statValue, { color: isDark ? Colors.white : Colors.dark }]}>{user?.tripsCount || 0}</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
              <MaterialCommunityIcons name="map-marker-distance" size={22} color={Colors.accent} />
              <Text style={[styles.statValue, { color: isDark ? Colors.white : Colors.dark }]}>{user?.distanceKm || 0}</Text>
              <Text style={styles.statLabel}>km Ridden</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
              <Ionicons name="calendar" size={20} color={Colors.warning} />
              <Text style={[styles.statValue, { color: isDark ? Colors.white : Colors.dark }]}>
                {user?.joinDate ? new Date(user.joinDate).toLocaleDateString('en', { month: 'short', year: '2-digit' }) : '-'}
              </Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: isDark ? Colors.gray300 : Colors.gray400 }]}>Account</Text>
          <View style={styles.menuGroup}>
            <MenuRow icon="person" label="Edit Profile" isDark={isDark} onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)} />
            <MenuRow icon="bookmark" label="Saved Places" isDark={isDark} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
            <MenuRow icon="time" label="Ride History" isDark={isDark} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
          </View>

          {user?.role === 'admin' && (
            <>
              <Text style={[styles.sectionLabel, { color: isDark ? Colors.gray300 : Colors.gray400 }]}>Administration</Text>
              <View style={styles.menuGroup}>
                <MenuRow icon="shield-checkmark" label="Admin Panel" isDark={isDark} onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/admin');
                }} />
              </View>
            </>
          )}

          <Text style={[styles.sectionLabel, { color: isDark ? Colors.gray300 : Colors.gray400 }]}>Settings</Text>
          <View style={styles.menuGroup}>
            <MenuRow icon="notifications" label="Notifications" isDark={isDark} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
            <MenuRow icon="lock-closed" label="Privacy" isDark={isDark} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
            <MenuRow icon="help-circle" label="Help & Support" isDark={isDark} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
          </View>

          <View style={styles.menuGroup}>
            <MenuRow icon="log-out" iconFamily="feather" label="Sign Out" isDark={isDark} danger onPress={handleLogout} />
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loginPrompt: { flex: 1, alignItems: 'center', paddingHorizontal: 40 },
  loginIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  loginTitle: { fontFamily: 'Outfit_700Bold', fontSize: 28, marginBottom: 8 },
  loginSubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  loginBtn: { width: '100%', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  loginBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: '#fff' },
  registerBtn: { width: '100%', paddingVertical: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1.5 },
  registerBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16 },
  profileHeader: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontFamily: 'Outfit_700Bold', fontSize: 32, color: Colors.primary },
  displayName: { fontFamily: 'Outfit_700Bold', fontSize: 24, marginBottom: 2 },
  username: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.gray300 },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: Colors.accent + '15', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  adminBadgeText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: Colors.accent },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, gap: 6 },
  statValue: { fontFamily: 'Outfit_700Bold', fontSize: 18 },
  statLabel: { fontFamily: 'Outfit_400Regular', fontSize: 11, color: Colors.gray300 },
  sectionLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 20, marginBottom: 8, marginTop: 8 },
  menuGroup: { paddingHorizontal: 20, gap: 6, marginBottom: 16 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuLabel: { fontFamily: 'Outfit_500Medium', fontSize: 15, flex: 1 },
  menuValue: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.gray300, marginRight: 6 },
});
