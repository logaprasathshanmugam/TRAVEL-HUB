import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable,
  Platform, useColorScheme, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/auth-context';
import { useData, CATEGORY_META, type ServiceCategory } from '@/lib/data-context';

type Tab = 'overview' | 'services' | 'gems';

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const { services, gems, removeService, removeGem } = useData();
  const [tab, setTab] = useState<Tab>('overview');

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  if (user?.role !== 'admin') {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
        <View style={{ paddingTop: topInset + 40, alignItems: 'center', padding: 40 }}>
          <Ionicons name="lock-closed" size={48} color={Colors.gray300} />
          <Text style={[styles.accessDenied, { color: isDark ? Colors.white : Colors.dark }]}>Access Denied</Text>
          <Text style={styles.accessSubtext}>Admin access required</Text>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: Colors.primary }]}>
            <Text style={styles.backBtnLabel}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleDeleteService = (id: string, name: string) => {
    if (Platform.OS === 'web') {
      removeService(id);
      return;
    }
    Alert.alert('Delete Service', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeService(id) },
    ]);
  };

  const handleDeleteGem = (id: string, name: string) => {
    if (Platform.OS === 'web') {
      removeGem(id);
      return;
    }
    Alert.alert('Delete Hidden Gem', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeGem(id) },
    ]);
  };

  const categoryCounts = (Object.keys(CATEGORY_META) as ServiceCategory[]).map(cat => ({
    key: cat,
    ...CATEGORY_META[cat],
    count: services.filter(s => s.category === cat).length,
  }));

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBackBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? Colors.white : Colors.dark} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: isDark ? Colors.white : Colors.dark }]}>Admin Panel</Text>
        <View style={[styles.adminTag, { backgroundColor: Colors.danger + '15' }]}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.danger} />
        </View>
      </View>

      <View style={styles.tabRow}>
        {(['overview', 'services', 'gems'] as Tab[]).map(t => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && { borderBottomColor: Colors.primary, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabText, { color: tab === t ? Colors.primary : Colors.gray300 }]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {tab === 'overview' && (
          <>
            <View style={styles.overviewStats}>
              <View style={[styles.overviewStat, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
                <Ionicons name="construct" size={24} color={Colors.primary} />
                <Text style={[styles.overviewValue, { color: Colors.primary }]}>{services.length}</Text>
                <Text style={styles.overviewLabel}>Total Services</Text>
              </View>
              <View style={[styles.overviewStat, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
                <Ionicons name="diamond" size={24} color={Colors.accent} />
                <Text style={[styles.overviewValue, { color: Colors.accent }]}>{gems.length}</Text>
                <Text style={styles.overviewLabel}>Hidden Gems</Text>
              </View>
            </View>

            <Text style={[styles.subTitle, { color: isDark ? Colors.white : Colors.dark }]}>Services by Category</Text>
            <View style={styles.catBreakdown}>
              {categoryCounts.map(c => (
                <View key={c.key} style={[styles.catRow, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
                  <View style={[styles.catIcon, { backgroundColor: c.color + '15' }]}>
                    <Feather name={c.icon as any} size={16} color={c.color} />
                  </View>
                  <Text style={[styles.catLabel, { color: isDark ? Colors.white : Colors.dark }]}>{c.label}</Text>
                  <Text style={[styles.catCount, { color: c.color }]}>{c.count}</Text>
                </View>
              ))}
            </View>

            <View style={styles.quickActions}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/add-service'); }}
                style={[styles.quickAction, { backgroundColor: Colors.primary }]}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.quickActionText}>Add Service</Text>
              </Pressable>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/add-gem'); }}
                style={[styles.quickAction, { backgroundColor: Colors.accent }]}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.quickActionText}>Add Gem</Text>
              </Pressable>
            </View>
          </>
        )}

        {tab === 'services' && (
          <>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/add-service'); }}
              style={[styles.addBtn, { backgroundColor: Colors.primary + '12' }]}
            >
              <Ionicons name="add-circle" size={20} color={Colors.primary} />
              <Text style={[styles.addBtnText, { color: Colors.primary }]}>Add New Service</Text>
            </Pressable>
            {services.map(s => {
              const meta = CATEGORY_META[s.category];
              return (
                <View key={s.id} style={[styles.adminItem, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
                  <View style={[styles.adminItemIcon, { backgroundColor: (meta?.color || Colors.primary) + '15' }]}>
                    <Feather name={(meta?.icon || 'map-pin') as any} size={16} color={meta?.color || Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.adminItemName, { color: isDark ? Colors.white : Colors.dark }]} numberOfLines={1}>{s.name}</Text>
                    <Text style={styles.adminItemMeta}>{meta?.label || s.category} | {s.city}, {s.state}</Text>
                  </View>
                  <Pressable
                    onPress={() => handleDeleteService(s.id, s.name)}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                  </Pressable>
                </View>
              );
            })}
          </>
        )}

        {tab === 'gems' && (
          <>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/add-gem'); }}
              style={[styles.addBtn, { backgroundColor: Colors.accent + '12' }]}
            >
              <Ionicons name="add-circle" size={20} color={Colors.accent} />
              <Text style={[styles.addBtnText, { color: Colors.accent }]}>Add New Hidden Gem</Text>
            </Pressable>
            {gems.map(g => (
              <View key={g.id} style={[styles.adminItem, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
                <View style={[styles.adminItemIcon, { backgroundColor: g.imageColor + '15' }]}>
                  <Ionicons name="diamond" size={16} color={g.imageColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.adminItemName, { color: isDark ? Colors.white : Colors.dark }]} numberOfLines={1}>{g.name}</Text>
                  <Text style={styles.adminItemMeta}>{g.location}</Text>
                </View>
                <Pressable
                  onPress={() => handleDeleteGem(g.id, g.name)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </Pressable>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
  headerBackBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, flex: 1 },
  adminTag: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  accessDenied: { fontFamily: 'Outfit_700Bold', fontSize: 24, marginTop: 20, marginBottom: 8 },
  accessSubtext: { fontFamily: 'Outfit_400Regular', fontSize: 15, color: Colors.gray300, marginBottom: 24 },
  backButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: '#fff' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.gray100 + '50' },
  tabBtn: { flex: 1, alignItems: 'center', paddingBottom: 12 },
  tabText: { fontFamily: 'Outfit_600SemiBold', fontSize: 15 },
  overviewStats: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20, marginTop: 4 },
  overviewStat: { flex: 1, alignItems: 'center', paddingVertical: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1, gap: 6 },
  overviewValue: { fontFamily: 'Outfit_700Bold', fontSize: 28 },
  overviewLabel: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.gray300 },
  subTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 17, paddingHorizontal: 20, marginBottom: 10 },
  catBreakdown: { paddingHorizontal: 20, gap: 6, marginBottom: 20 },
  catRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
  catIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  catLabel: { fontFamily: 'Outfit_500Medium', fontSize: 14, flex: 1 },
  catCount: { fontFamily: 'Outfit_700Bold', fontSize: 16 },
  quickActions: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  quickAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14 },
  quickActionText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: '#fff' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, marginBottom: 12, paddingVertical: 14, borderRadius: 14 },
  addBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 15 },
  adminItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 8, padding: 14, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  adminItemIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  adminItemName: { fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
  adminItemMeta: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.gray300, marginTop: 1 },
  deleteBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
