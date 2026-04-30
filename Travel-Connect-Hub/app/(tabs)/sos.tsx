import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable,
  Platform, useColorScheme, Linking, Alert, Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';

const EMERGENCY_NUMBERS = [
  { id: 'police', label: 'Police', number: '100', icon: 'shield-checkmark', color: '#2563EB', description: 'Traffic accidents, theft, law enforcement' },
  { id: 'ambulance', label: 'Ambulance', number: '108', icon: 'medkit', color: '#DC2626', description: 'Medical emergency, accident rescue' },
  { id: 'fire', label: 'Fire Brigade', number: '101', icon: 'flame', color: '#F97316', description: 'Fire, rescue operations' },
  { id: 'women', label: 'Women Helpline', number: '1091', icon: 'people', color: '#EC4899', description: 'Women in distress, safety' },
  { id: 'road', label: 'Road Accident', number: '1073', icon: 'car', color: '#6B7280', description: 'Highway accidents, breakdown' },
  { id: 'disaster', label: 'Disaster Mgmt', number: '1078', icon: 'thunderstorm', color: '#8B5CF6', description: 'Natural disasters, floods, earthquakes' },
];

function EmergencyButton({ item, isDark }: { item: typeof EMERGENCY_NUMBERS[0]; isDark: boolean }) {
  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (Platform.OS === 'web') {
      Linking.openURL(`tel:${item.number}`);
      return;
    }
    Alert.alert(
      `Call ${item.label}?`,
      `Dial ${item.number} for ${item.description.toLowerCase()}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', style: 'destructive', onPress: () => Linking.openURL(`tel:${item.number}`) },
      ]
    );
  };

  return (
    <Pressable
      onPress={handleCall}
      style={({ pressed }) => [
        styles.emergencyCard,
        { backgroundColor: isDark ? Colors.darkCard : Colors.white, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={[styles.emergencyIcon, { backgroundColor: item.color + '15' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.emergencyLabel, { color: isDark ? Colors.white : Colors.dark }]}>
          {item.label}
        </Text>
        <Text style={styles.emergencyDesc}>{item.description}</Text>
      </View>
      <View style={[styles.callBadge, { backgroundColor: item.color }]}>
        <Ionicons name="call" size={16} color="#fff" />
        <Text style={styles.callNumber}>{item.number}</Text>
      </View>
    </Pressable>
  );
}

export default function SOSScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { services } = useData();
  const { isLoggedIn } = useAuth();
  const [sosActive, setSosActive] = useState(false);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const pulseScale = useSharedValue(1);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const triggerSOS = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 500, 200, 500, 200, 500]);
    }
    setSosActive(true);
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
      true
    );

    if (Platform.OS !== 'web') {
      Alert.alert(
        'SOS Activated',
        'Emergency contacts will be notified with your location. Call 108 for immediate ambulance assistance.',
        [
          { text: 'Call 108', style: 'destructive', onPress: () => Linking.openURL('tel:108') },
          { text: 'Cancel SOS', onPress: () => { setSosActive(false); pulseScale.value = 1; } },
        ]
      );
    }
  };

  const nearbyHospitals = services.filter(s => s.category === 'hospital').slice(0, 3);
  const nearbyAmbulance = services.filter(s => s.category === 'ambulance').slice(0, 2);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: topInset + 16 }}>
          <View style={styles.headerSection}>
            <Text style={[styles.headerTitle, { color: isDark ? Colors.white : Colors.dark }]}>
              Emergency SOS
            </Text>
            <Text style={[styles.headerSubtitle, { color: Colors.gray300 }]}>
              Quick access to emergency services across India
            </Text>
          </View>

          <View style={styles.sosBtnContainer}>
            <Animated.View style={[styles.sosPulseRing, sosActive && styles.sosPulseActive, pulseStyle]}>
              <Pressable
                onLongPress={triggerSOS}
                delayLongPress={1000}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  if (sosActive) {
                    setSosActive(false);
                    pulseScale.value = 1;
                  }
                }}
                style={({ pressed }) => [
                  styles.sosBtn,
                  { backgroundColor: sosActive ? '#B91C1C' : Colors.danger, transform: [{ scale: pressed ? 0.95 : 1 }] },
                ]}
              >
                <Ionicons name="warning" size={36} color="#fff" />
                <Text style={styles.sosBtnText}>{sosActive ? 'SOS ACTIVE' : 'HOLD FOR SOS'}</Text>
                <Text style={styles.sosBtnSub}>{sosActive ? 'Tap to cancel' : 'Long press to activate'}</Text>
              </Pressable>
            </Animated.View>
          </View>

          <Text style={[styles.sectionTitle, { color: isDark ? Colors.white : Colors.dark }]}>
            Emergency Contacts
          </Text>
          <View style={styles.emergencyList}>
            {EMERGENCY_NUMBERS.map(item => (
              <EmergencyButton key={item.id} item={item} isDark={isDark} />
            ))}
          </View>

          {nearbyHospitals.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: isDark ? Colors.white : Colors.dark }]}>
                Nearby Hospitals
              </Text>
              {nearbyHospitals.map(h => (
                <Pressable
                  key={h.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Linking.openURL(`tel:${h.phone.replace(/\s/g, '')}`);
                  }}
                  style={[styles.hospitalCard, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}
                >
                  <View style={[styles.hospitalIcon, { backgroundColor: '#DC262615' }]}>
                    <Ionicons name="medkit" size={20} color="#DC2626" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.hospitalName, { color: isDark ? Colors.white : Colors.dark }]} numberOfLines={1}>
                      {h.name}
                    </Text>
                    <Text style={styles.hospitalAddr} numberOfLines={1}>{h.city}, {h.state}</Text>
                  </View>
                  <View style={styles.hospitalCallBtn}>
                    <Ionicons name="call" size={18} color="#DC2626" />
                  </View>
                </Pressable>
              ))}
            </>
          )}

          <View style={[styles.tipCard, { backgroundColor: isDark ? Colors.darkSurface : '#FEF3C7' }]}>
            <Ionicons name="information-circle" size={22} color={Colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.tipTitle, { color: isDark ? Colors.warning : '#92400E' }]}>Safety Tips</Text>
              <Text style={[styles.tipText, { color: isDark ? Colors.gray200 : '#78350F' }]}>
                Always share your live location with a trusted contact before long rides. Keep emergency numbers saved offline.
              </Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: { paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 28, marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 14 },
  sosBtnContainer: { alignItems: 'center', marginBottom: 30 },
  sosPulseRing: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  sosPulseActive: { backgroundColor: '#EF444420' },
  sosBtn: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  sosBtnText: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#fff', marginTop: 6 },
  sosBtnSub: { fontFamily: 'Outfit_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  sectionTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 19, paddingHorizontal: 20, marginBottom: 12, marginTop: 8 },
  emergencyList: { paddingHorizontal: 20, gap: 8, marginBottom: 24 },
  emergencyCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  emergencyIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emergencyLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 15 },
  emergencyDesc: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.gray300, marginTop: 1 },
  callBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  callNumber: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#fff' },
  hospitalCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 8, padding: 14, borderRadius: 14, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  hospitalIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  hospitalName: { fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
  hospitalAddr: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.gray300, marginTop: 1 },
  hospitalCallBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DC262610' },
  tipCard: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginTop: 16, padding: 16, borderRadius: 16, alignItems: 'flex-start' },
  tipTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, marginBottom: 4 },
  tipText: { fontFamily: 'Outfit_400Regular', fontSize: 13, lineHeight: 19 },
});
