import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable,
  Platform, useColorScheme, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData, CATEGORY_META } from '@/lib/data-context';

export default function ServiceDetailScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id } = useLocalSearchParams<{ id: string }>();
  const { services } = useData();
  const service = services.find(s => s.id === id);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  if (!service) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
        <View style={{ paddingTop: topInset + 16, paddingHorizontal: 20 }}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={isDark ? Colors.white : Colors.dark} />
          </Pressable>
          <Text style={[styles.notFound, { color: isDark ? Colors.gray300 : Colors.gray400 }]}>
            Service not found
          </Text>
        </View>
      </View>
    );
  }

  const meta = CATEGORY_META[service.category];
  const color = meta?.color || Colors.primary;
  const icon = meta?.icon || 'map-pin';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? Colors.white : Colors.dark} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset + 100 }}>
        <View style={styles.heroSection}>
          <View style={[styles.heroBg, { backgroundColor: color + '15' }]}>
            <Feather name={icon as any} size={56} color={color} />
          </View>
        </View>

        <View style={styles.contentSection}>
          <View style={[styles.categoryBadge, { backgroundColor: color + '18' }]}>
            <Text style={[styles.categoryText, { color }]}>
              {meta?.label || service.category}
            </Text>
          </View>

          <Text style={[styles.serviceName, { color: isDark ? Colors.white : Colors.dark }]}>
            {service.name}
          </Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={Colors.warning} />
            <Text style={[styles.rating, { color: isDark ? Colors.white : Colors.dark }]}>{service.rating}</Text>
            <Text style={styles.reviewCount}>({service.reviews} reviews)</Text>
            <View style={[styles.statusPill, { backgroundColor: service.isOpen ? Colors.success + '18' : Colors.danger + '18' }]}>
              <View style={[styles.statusDot, { backgroundColor: service.isOpen ? Colors.success : Colors.danger }]} />
              <Text style={[styles.statusLabel, { color: service.isOpen ? Colors.success : Colors.danger }]}>
                {service.isOpen ? 'Open Now' : 'Closed'}
              </Text>
            </View>
          </View>

          <Text style={[styles.description, { color: isDark ? Colors.gray200 : Colors.gray500 }]}>
            {service.description}
          </Text>

          <View style={styles.infoCards}>
            <View style={[styles.infoCard, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
              <Ionicons name="location" size={20} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: Colors.gray300 }]}>Address</Text>
                <Text style={[styles.infoValue, { color: isDark ? Colors.white : Colors.dark }]}>{service.address}</Text>
                <Text style={[styles.infoSub, { color: Colors.gray300 }]}>{service.city}, {service.state}</Text>
              </View>
            </View>

            <View style={[styles.infoCard, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
              <Ionicons name="call" size={20} color={Colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: Colors.gray300 }]}>Phone</Text>
                <Text style={[styles.infoValue, { color: isDark ? Colors.white : Colors.dark }]}>{service.phone}</Text>
              </View>
            </View>

            <View style={[styles.infoCard, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
              <Ionicons name="time" size={20} color={Colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: Colors.gray300 }]}>Hours</Text>
                <Text style={[styles.infoValue, { color: isDark ? Colors.white : Colors.dark }]}>{service.openHours}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomInset + 12, backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Linking.openURL(`tel:${service.phone.replace(/\s/g, '')}`);
          }}
          style={[styles.callBtn, { backgroundColor: Colors.accent }]}
        >
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.callBtnText}>Call Now</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const url = Platform.select({
              ios: `maps:0,0?q=${service.latitude},${service.longitude}`,
              android: `geo:${service.latitude},${service.longitude}?q=${service.latitude},${service.longitude}`,
              default: `https://www.google.com/maps?q=${service.latitude},${service.longitude}`,
            });
            if (url) Linking.openURL(url);
          }}
          style={[styles.dirBtn, { backgroundColor: Colors.primary }]}
        >
          <Ionicons name="navigate" size={20} color="#fff" />
          <Text style={styles.dirBtnText}>Directions</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontFamily: 'Outfit_500Medium', fontSize: 16, textAlign: 'center', marginTop: 40 },
  heroSection: { alignItems: 'center', paddingVertical: 20 },
  heroBg: { width: 120, height: 120, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  contentSection: { paddingHorizontal: 24 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 10 },
  categoryText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12 },
  serviceName: { fontFamily: 'Outfit_700Bold', fontSize: 26, marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  rating: { fontFamily: 'Outfit_700Bold', fontSize: 16 },
  reviewCount: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.gray300 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginLeft: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontFamily: 'Outfit_500Medium', fontSize: 12 },
  description: { fontFamily: 'Outfit_400Regular', fontSize: 15, lineHeight: 23, marginBottom: 24 },
  infoCards: { gap: 10 },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  infoLabel: { fontFamily: 'Outfit_400Regular', fontSize: 12, marginBottom: 2 },
  infoValue: { fontFamily: 'Outfit_500Medium', fontSize: 14 },
  infoSub: { fontFamily: 'Outfit_400Regular', fontSize: 12, marginTop: 1 },
  bottomBar: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, gap: 12, borderTopWidth: 0.5, borderTopColor: Colors.gray100 },
  callBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  callBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: '#fff' },
  dirBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  dirBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: '#fff' },
});
