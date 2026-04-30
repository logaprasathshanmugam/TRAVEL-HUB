import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable,
  Platform, useColorScheme, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/auth-context';
import { useData, CATEGORY_META, type ServiceCategory, type TravelerPost } from '@/lib/data-context';

const QUICK_CATEGORIES: ServiceCategory[] = [
  'mechanic', 'food', 'petrol', 'hospital', 'puncture',
  'restaurant', 'resort', 'ambulance', 'medical',
  'boys_hostel', 'girls_hostel',
];

function PostCard({ post, isDark }: { post: TravelerPost; isDark: boolean }) {
  const timeAgo = getTimeAgo(post.timestamp);

  return (
    <View style={[styles.postCard, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
      <View style={styles.postHeader}>
        <View style={[styles.postAvatar, { backgroundColor: Colors.primary + '20' }]}>
          <Ionicons name="person" size={16} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.postUserName, { color: isDark ? Colors.white : Colors.dark }]}>
            {post.userName}
          </Text>
          <View style={styles.postMeta}>
            <Ionicons name="location" size={11} color={Colors.gray300} />
            <Text style={styles.postLocation}>{post.location}</Text>
            <Text style={styles.postTime}>{timeAgo}</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.postContent, { color: isDark ? Colors.gray100 : Colors.gray500 }]}>
        {post.content}
      </Text>
      <View style={styles.postActions}>
        <Pressable style={styles.postAction}>
          <Ionicons name="heart-outline" size={18} color={Colors.gray300} />
          <Text style={styles.postActionText}>{post.likes}</Text>
        </Pressable>
        <Pressable style={styles.postAction}>
          <Ionicons name="chatbubble-outline" size={16} color={Colors.gray300} />
          <Text style={styles.postActionText}>{post.replies}</Text>
        </Pressable>
        <Pressable style={styles.postAction}>
          <Ionicons name="share-outline" size={18} color={Colors.gray300} />
        </Pressable>
      </View>
    </View>
  );
}

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, isLoggedIn } = useAuth();
  const { services, gems, posts } = useData();
  const [refreshing, setRefreshing] = useState(false);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const navigateToCategory = (cat: ServiceCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/(tabs)/services', params: { filter: cat } });
  };

  const categoryCounts = QUICK_CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = services.filter(s => s.category === cat).length;
    return acc;
  }, {});

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: topInset + 16 }}>
          <View style={styles.headerSection}>
            <View>
              <Text style={[styles.greeting, { color: isDark ? Colors.gray300 : Colors.gray400 }]}>
                {isLoggedIn ? `Welcome back` : 'Welcome'}
              </Text>
              <Text style={[styles.headerTitle, { color: isDark ? Colors.white : Colors.dark }]}>
                {isLoggedIn ? user?.displayName : 'Rider'}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                if (!isLoggedIn) {
                  router.push('/(auth)/login');
                } else {
                  router.push('/(tabs)/profile');
                }
              }}
              style={[styles.profileBtn, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}
            >
              <Ionicons name="person" size={20} color={Colors.primary} />
            </Pressable>
          </View>

          <View style={[styles.heroCard, { backgroundColor: Colors.primary }]}>
            <View style={styles.heroContent}>
              <MaterialCommunityIcons name="motorbike" size={36} color={Colors.white} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.heroTitle}>RideConnect India</Text>
                <Text style={styles.heroSubtitle}>Find services, connect with riders, discover hidden gems across India</Text>
              </View>
            </View>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{services.length}</Text>
                <Text style={styles.heroStatLabel}>Services</Text>
              </View>
              <View style={[styles.heroStatDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{gems.length}</Text>
                <Text style={styles.heroStatLabel}>Hidden Gems</Text>
              </View>
              <View style={[styles.heroStatDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>11</Text>
                <Text style={styles.heroStatLabel}>Categories</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: isDark ? Colors.white : Colors.dark }]}>
            Browse Services
          </Text>
          <View style={styles.categoryGrid}>
            {QUICK_CATEGORIES.map(cat => {
              const meta = CATEGORY_META[cat];
              return (
                <Pressable
                  key={cat}
                  onPress={() => navigateToCategory(cat)}
                  style={[styles.categoryChip, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}
                >
                  <View style={[styles.categoryIconWrap, { backgroundColor: meta.color + '18' }]}>
                    <Feather name={meta.icon as any} size={18} color={meta.color} />
                  </View>
                  <Text style={[styles.categoryLabel, { color: isDark ? Colors.gray100 : Colors.gray500 }]}>
                    {meta.label}
                  </Text>
                  <Text style={[styles.categoryCount, { color: meta.color }]}>
                    {categoryCounts[cat] || 0}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.white : Colors.dark }]}>
              Hidden Gems
            </Text>
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Text style={[styles.seeAll, { color: Colors.primary }]}>See All</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gemsScroll}>
            {gems.slice(0, 5).map(gem => (
              <Pressable
                key={gem.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: '/gem-detail', params: { id: gem.id } });
                }}
                style={[styles.gemCard, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}
              >
                <View style={[styles.gemImage, { backgroundColor: gem.imageColor + '20' }]}>
                  <Ionicons name="diamond" size={28} color={gem.imageColor} />
                </View>
                <Text style={[styles.gemName, { color: isDark ? Colors.white : Colors.dark }]} numberOfLines={1}>
                  {gem.name}
                </Text>
                <View style={styles.gemMeta}>
                  <Ionicons name="location" size={11} color={Colors.gray300} />
                  <Text style={styles.gemLocation} numberOfLines={1}>{gem.location}</Text>
                </View>
                <View style={styles.gemRating}>
                  <Ionicons name="star" size={12} color={Colors.warning} />
                  <Text style={styles.gemRatingText}>{gem.rating}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.white : Colors.dark }]}>
              Rider Feed
            </Text>
          </View>
          {posts.slice(0, 4).map(post => (
            <PostCard key={post.id} post={post} isDark={isDark} />
          ))}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  greeting: { fontFamily: 'Outfit_400Regular', fontSize: 14, marginBottom: 2 },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 26 },
  profileBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  heroCard: { marginHorizontal: 20, borderRadius: 20, padding: 20, marginBottom: 24 },
  heroContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  heroTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#fff' },
  heroSubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  heroStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 12 },
  heroStat: { alignItems: 'center', flex: 1 },
  heroStatValue: { fontFamily: 'Outfit_700Bold', fontSize: 22, color: '#fff' },
  heroStatLabel: { fontFamily: 'Outfit_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  heroStatDivider: { width: 1, height: 30 },
  sectionTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 19, paddingHorizontal: 20, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20, marginBottom: 0 },
  seeAll: { fontFamily: 'Outfit_500Medium', fontSize: 14 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 24 },
  categoryChip: { alignItems: 'center', paddingVertical: 14, paddingHorizontal: 10, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, width: '30%' as any, flexGrow: 1, flexBasis: 100, maxWidth: '32%' as any },
  categoryIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  categoryLabel: { fontFamily: 'Outfit_500Medium', fontSize: 11, textAlign: 'center' },
  categoryCount: { fontFamily: 'Outfit_700Bold', fontSize: 13, marginTop: 2 },
  gemsScroll: { paddingLeft: 20, marginBottom: 24 },
  gemCard: { width: 170, marginRight: 14, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  gemImage: { height: 100, alignItems: 'center', justifyContent: 'center' },
  gemName: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, paddingHorizontal: 12, paddingTop: 10 },
  gemMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 12, marginTop: 4 },
  gemLocation: { fontFamily: 'Outfit_400Regular', fontSize: 11, color: Colors.gray300, flex: 1 },
  gemRating: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 12, paddingTop: 4, paddingBottom: 12 },
  gemRatingText: { fontFamily: 'Outfit_500Medium', fontSize: 12, color: Colors.warning },
  postCard: { marginHorizontal: 20, marginBottom: 14, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  postAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  postUserName: { fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  postLocation: { fontFamily: 'Outfit_400Regular', fontSize: 11, color: Colors.gray300 },
  postTime: { fontFamily: 'Outfit_400Regular', fontSize: 11, color: Colors.gray300, marginLeft: 6 },
  postContent: { fontFamily: 'Outfit_400Regular', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  postActions: { flexDirection: 'row', gap: 20 },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postActionText: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.gray300 },
});
