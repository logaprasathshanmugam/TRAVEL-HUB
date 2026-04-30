import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable,
  Platform, useColorScheme, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData, CATEGORY_META, type ServiceCategory, type LocalService } from '@/lib/data-context';

const CATEGORIES: { key: ServiceCategory | 'all'; label: string; icon: string; color: string }[] = [
  { key: 'all', label: 'All', icon: 'grid', color: Colors.primary },
  { key: 'mechanic', label: 'Mechanic', icon: 'tool', color: '#E86B20' },
  { key: 'food', label: 'Food', icon: 'coffee', color: '#10B981' },
  { key: 'resort', label: 'Resort', icon: 'home', color: '#8B5CF6' },
  { key: 'restaurant', label: 'Restaurant', icon: 'map-pin', color: '#F59E0B' },
  { key: 'medical', label: 'Medical', icon: 'plus-circle', color: '#EF4444' },
  { key: 'hospital', label: 'Hospital', icon: 'activity', color: '#DC2626' },
  { key: 'ambulance', label: 'Ambulance', icon: 'truck', color: '#B91C1C' },
  { key: 'puncture', label: 'Puncture', icon: 'disc', color: '#6B7280' },
  { key: 'petrol', label: 'Petrol', icon: 'droplet', color: '#3B82F6' },
  { key: 'boys_hostel', label: 'Boys Hostel', icon: 'users', color: '#2563EB' },
  { key: 'girls_hostel', label: 'Girls Hostel', icon: 'users', color: '#EC4899' },
];

function ServiceCard({ service, isDark }: { service: LocalService; isDark: boolean }) {
  const meta = CATEGORY_META[service.category];
  const color = meta?.color || Colors.primary;
  const icon = meta?.icon || 'map-pin';

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({ pathname: '/service-detail', params: { id: service.id } });
      }}
      style={({ pressed }) => [
        styles.serviceCard,
        { backgroundColor: isDark ? Colors.darkCard : Colors.white, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={[styles.serviceIconWrap, { backgroundColor: color + '15' }]}>
        <Feather name={icon as any} size={22} color={color} />
      </View>
      <View style={styles.serviceInfo}>
        <Text style={[styles.serviceName, { color: isDark ? Colors.white : Colors.dark }]} numberOfLines={1}>
          {service.name}
        </Text>
        <Text style={styles.serviceAddress} numberOfLines={1}>
          {service.city}, {service.state}
        </Text>
        <View style={styles.serviceMetaRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color={Colors.warning} />
            <Text style={styles.ratingText}>{service.rating}</Text>
            <Text style={styles.reviewCount}>({service.reviews})</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: service.isOpen ? Colors.success + '18' : Colors.danger + '18' }]}>
            <View style={[styles.statusDot, { backgroundColor: service.isOpen ? Colors.success : Colors.danger }]} />
            <Text style={[styles.statusText, { color: service.isOpen ? Colors.success : Colors.danger }]}>
              {service.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.gray300} />
    </Pressable>
  );
}

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { services } = useData();
  const params = useLocalSearchParams<{ filter?: string }>();
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>(
    (params.filter as ServiceCategory) || 'all'
  );
  const [search, setSearch] = useState('');

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = useMemo(() => {
    let result = services;
    if (activeCategory !== 'all') {
      result = result.filter(s => s.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q)
      );
    }
    return result;
  }, [services, activeCategory, search]);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={[styles.title, { color: isDark ? Colors.white : Colors.dark }]}>Local Services</Text>
        <Text style={[styles.subtitle, { color: Colors.gray300 }]}>
          {services.length} services across India
        </Text>
        <View style={[styles.searchBar, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
          <Ionicons name="search" size={18} color={Colors.gray300} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? Colors.white : Colors.dark }]}
            placeholder="Search by name, city, or state..."
            placeholderTextColor={Colors.gray300}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.gray300} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
        {CATEGORIES.map(cat => {
          const isActive = cat.key === activeCategory;
          return (
            <Pressable
              key={cat.key}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveCategory(cat.key);
              }}
              style={[
                styles.catPill,
                isActive
                  ? { backgroundColor: cat.color }
                  : { backgroundColor: isDark ? Colors.darkCard : Colors.white },
              ]}
            >
              <Feather name={(CATEGORIES.find(c => c.key === cat.key)?.icon || 'grid') as any} size={14} color={isActive ? '#fff' : (isDark ? Colors.gray200 : Colors.gray400)} />
              <Text style={[styles.catPillText, { color: isActive ? '#fff' : (isDark ? Colors.gray200 : Colors.gray400) }]}>
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} style={styles.listScroll}>
        <Text style={styles.resultCount}>{filtered.length} service{filtered.length !== 1 ? 's' : ''} found</Text>
        {filtered.map(service => (
          <ServiceCard key={service.id} service={service} isDark={isDark} />
        ))}
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={Colors.gray300} />
            <Text style={[styles.emptyText, { color: isDark ? Colors.gray300 : Colors.gray400 }]}>
              No services found
            </Text>
            <Text style={styles.emptySubtext}>Try a different category or search term</Text>
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 28, marginBottom: 2 },
  subtitle: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.gray300, marginBottom: 14 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 44, borderRadius: 14, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  searchInput: { flex: 1, fontFamily: 'Outfit_400Regular', fontSize: 15, height: 44 },
  categoryScroll: { maxHeight: 48, marginBottom: 8 },
  categoryContent: { paddingHorizontal: 20, gap: 8 },
  catPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, height: 36 },
  catPillText: { fontFamily: 'Outfit_500Medium', fontSize: 13 },
  listScroll: { flex: 1 },
  resultCount: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.gray300, paddingHorizontal: 20, marginBottom: 10, marginTop: 6 },
  serviceCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  serviceIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  serviceInfo: { flex: 1 },
  serviceName: { fontFamily: 'Outfit_600SemiBold', fontSize: 15 },
  serviceAddress: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.gray300, marginTop: 2 },
  serviceMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: Colors.warning },
  reviewCount: { fontFamily: 'Outfit_400Regular', fontSize: 11, color: Colors.gray300 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontFamily: 'Outfit_500Medium', fontSize: 11 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyText: { fontFamily: 'Outfit_600SemiBold', fontSize: 18 },
  emptySubtext: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.gray300 },
});
