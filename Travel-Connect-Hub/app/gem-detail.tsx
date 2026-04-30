import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable,
  Platform, useColorScheme, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';

export default function GemDetailScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id } = useLocalSearchParams<{ id: string }>();
  const { gems } = useData();
  const gem = gems.find(g => g.id === id);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  if (!gem) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
        <View style={{ paddingTop: topInset + 16, paddingHorizontal: 20 }}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={isDark ? Colors.white : Colors.dark} />
          </Pressable>
          <Text style={[styles.notFound, { color: Colors.gray300 }]}>Place not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? Colors.white : Colors.dark} />
        </Pressable>
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={styles.backBtn}
        >
          <Ionicons name="bookmark-outline" size={22} color={isDark ? Colors.white : Colors.dark} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset + 100 }}>
        <View style={[styles.heroImage, { backgroundColor: gem.imageColor + '18' }]}>
          <Ionicons name="diamond" size={64} color={gem.imageColor} />
        </View>

        <View style={styles.contentSection}>
          <View style={styles.tagsRow}>
            {gem.tags.map((tag, i) => (
              <View key={i} style={[styles.tag, { backgroundColor: gem.imageColor + '15' }]}>
                <Text style={[styles.tagText, { color: gem.imageColor }]}>#{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.gemName, { color: isDark ? Colors.white : Colors.dark }]}>
            {gem.name}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location" size={14} color={Colors.primary} />
              <Text style={styles.metaText}>{gem.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color={Colors.warning} />
              <Text style={styles.metaText}>{gem.rating} ({gem.reviews})</Text>
            </View>
          </View>

          <View style={[styles.discoveredBy, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
            <View style={[styles.discovererAvatar, { backgroundColor: Colors.primary + '15' }]}>
              <Ionicons name="person" size={14} color={Colors.primary} />
            </View>
            <View>
              <Text style={[styles.discoveredLabel, { color: Colors.gray300 }]}>Discovered by</Text>
              <Text style={[styles.discovererName, { color: isDark ? Colors.white : Colors.dark }]}>{gem.addedBy}</Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: isDark ? Colors.gray300 : Colors.gray400 }]}>About this place</Text>
          <Text style={[styles.description, { color: isDark ? Colors.gray200 : Colors.gray500 }]}>
            {gem.description}
          </Text>

          <Text style={[styles.sectionLabel, { color: isDark ? Colors.gray300 : Colors.gray400 }]}>Coordinates</Text>
          <View style={[styles.coordCard, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
            <Ionicons name="navigate" size={20} color={Colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.coordText, { color: isDark ? Colors.white : Colors.dark }]}>
                {gem.latitude.toFixed(4)}, {gem.longitude.toFixed(4)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomInset + 12, backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const url = Platform.select({
              ios: `maps:0,0?q=${gem.latitude},${gem.longitude}`,
              android: `geo:${gem.latitude},${gem.longitude}?q=${gem.latitude},${gem.longitude}`,
              default: `https://www.google.com/maps?q=${gem.latitude},${gem.longitude}`,
            });
            if (url) Linking.openURL(url);
          }}
          style={[styles.navBtn, { backgroundColor: Colors.primary }]}
        >
          <Ionicons name="navigate" size={20} color="#fff" />
          <Text style={styles.navBtnText}>Navigate Here</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontFamily: 'Outfit_500Medium', fontSize: 16, textAlign: 'center', marginTop: 40 },
  heroImage: { height: 200, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, borderRadius: 24 },
  contentSection: { paddingHorizontal: 24, paddingTop: 20 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontFamily: 'Outfit_500Medium', fontSize: 12 },
  gemName: { fontFamily: 'Outfit_700Bold', fontSize: 26, marginBottom: 10 },
  metaRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.gray300 },
  discoveredBy: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  discovererAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  discoveredLabel: { fontFamily: 'Outfit_400Regular', fontSize: 11 },
  discovererName: { fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
  sectionLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  description: { fontFamily: 'Outfit_400Regular', fontSize: 15, lineHeight: 23, marginBottom: 24 },
  coordCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  coordText: { fontFamily: 'Outfit_500Medium', fontSize: 14 },
  bottomBar: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: Colors.gray100 },
  navBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  navBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: '#fff' },
});
