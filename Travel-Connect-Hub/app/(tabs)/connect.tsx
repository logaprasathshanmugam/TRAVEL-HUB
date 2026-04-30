import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable,
  Platform, useColorScheme, TextInput, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/auth-context';
import { useData, type NearbyTraveler, type TravelerPost } from '@/lib/data-context';

const STATUS_CONFIG = {
  riding: { label: 'Riding', color: '#10B981', icon: 'bicycle' as const },
  resting: { label: 'Resting', color: '#F59E0B', icon: 'cafe' as const },
  looking_for_group: { label: 'Looking for group', color: '#3B82F6', icon: 'people' as const },
};

function TravelerCard({ traveler, isDark }: { traveler: NearbyTraveler; isDark: boolean }) {
  const statusConfig = STATUS_CONFIG[traveler.status];

  return (
    <Pressable
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      style={[styles.travelerCard, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}
    >
      <View style={[styles.travelerAvatar, { backgroundColor: Colors.primary + '18' }]}>
        <Text style={styles.travelerInitial}>{traveler.name.charAt(0)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.travelerNameRow}>
          <Text style={[styles.travelerName, { color: isDark ? Colors.white : Colors.dark }]}>{traveler.name}</Text>
          <View style={[styles.statusPill, { backgroundColor: statusConfig.color + '18' }]}>
            <Ionicons name={statusConfig.icon} size={11} color={statusConfig.color} />
            <Text style={[styles.statusLabel, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
        </View>
        <View style={styles.travelerMeta}>
          <Ionicons name="location" size={11} color={Colors.gray300} />
          <Text style={styles.metaText}>{traveler.location}</Text>
        </View>
        <View style={styles.travelerMeta}>
          <MaterialCommunityIcons name="motorbike" size={13} color={Colors.gray300} />
          <Text style={styles.metaText}>{traveler.bike}</Text>
        </View>
        {traveler.route && (
          <View style={styles.travelerMeta}>
            <Feather name="navigation" size={11} color={Colors.accent} />
            <Text style={[styles.metaText, { color: Colors.accent }]}>{traveler.route}</Text>
          </View>
        )}
        <View style={styles.travelerBottom}>
          <Text style={styles.distanceText}>{traveler.distance} away</Text>
          <Text style={styles.seenText}>{traveler.lastSeen}</Text>
        </View>
      </View>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          if (Platform.OS !== 'web') {
            Alert.alert('Connect', `Send a wave to ${traveler.name}?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Wave', onPress: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) },
            ]);
          }
        }}
        style={[styles.waveBtn, { backgroundColor: Colors.primary + '12' }]}
      >
        <Ionicons name="hand-left" size={18} color={Colors.primary} />
      </Pressable>
    </Pressable>
  );
}

function PostCard({ post, isDark }: { post: TravelerPost; isDark: boolean }) {
  const timeAgo = getTimeAgo(post.timestamp);

  return (
    <View style={[styles.postCard, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
      <View style={styles.postHeader}>
        <View style={[styles.postAvatar, { backgroundColor: Colors.primary + '18' }]}>
          <Text style={styles.postInitial}>{post.userName.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.postUserName, { color: isDark ? Colors.white : Colors.dark }]}>{post.userName}</Text>
          <View style={styles.postMeta}>
            <Ionicons name="location" size={10} color={Colors.gray300} />
            <Text style={styles.postLocation}>{post.location}</Text>
            <Text style={styles.postTime}>{timeAgo}</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.postContent, { color: isDark ? Colors.gray100 : Colors.gray500 }]}>
        {post.content}
      </Text>
      <View style={styles.postActions}>
        <Pressable style={styles.postAction} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <Ionicons name="heart-outline" size={18} color={Colors.gray300} />
          <Text style={styles.postActionText}>{post.likes}</Text>
        </Pressable>
        <Pressable style={styles.postAction} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <Ionicons name="chatbubble-outline" size={16} color={Colors.gray300} />
          <Text style={styles.postActionText}>{post.replies}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function ConnectScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isLoggedIn, user } = useAuth();
  const { travelers, posts, addPost } = useData();
  const [tab, setTab] = useState<'riders' | 'feed'>('riders');
  const [newPost, setNewPost] = useState('');

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  if (!isLoggedIn) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
        <View style={[styles.loginPrompt, { paddingTop: topInset + 60 }]}>
          <View style={[styles.loginIcon, { backgroundColor: Colors.primary + '12' }]}>
            <Ionicons name="people" size={48} color={Colors.primary} />
          </View>
          <Text style={[styles.loginTitle, { color: isDark ? Colors.white : Colors.dark }]}>
            Traveler Connect
          </Text>
          <Text style={styles.loginSubtitle}>
            Sign in to connect with nearby riders, share updates, and find riding buddies
          </Text>
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={[styles.loginBtn, { backgroundColor: Colors.primary }]}
          >
            <Text style={styles.loginBtnText}>Sign In to Connect</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handlePost = async () => {
    if (!newPost.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await addPost({
      userId: user?.id || '',
      userName: user?.displayName || 'Unknown',
      content: newPost.trim(),
      location: 'On the road',
    });
    setNewPost('');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={[styles.headerTitle, { color: isDark ? Colors.white : Colors.dark }]}>Traveler Connect</Text>
        <Text style={[styles.headerSubtitle, { color: Colors.gray300 }]}>
          {travelers.length} riders nearby
        </Text>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setTab('riders')}
          style={[styles.tabBtn, tab === 'riders' && { borderBottomColor: Colors.primary, borderBottomWidth: 2 }]}
        >
          <Ionicons name="people" size={16} color={tab === 'riders' ? Colors.primary : Colors.gray300} />
          <Text style={[styles.tabText, { color: tab === 'riders' ? Colors.primary : Colors.gray300 }]}>Nearby Riders</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('feed')}
          style={[styles.tabBtn, tab === 'feed' && { borderBottomColor: Colors.accent, borderBottomWidth: 2 }]}
        >
          <Ionicons name="chatbubbles" size={16} color={tab === 'feed' ? Colors.accent : Colors.gray300} />
          <Text style={[styles.tabText, { color: tab === 'feed' ? Colors.accent : Colors.gray300 }]}>Rider Feed</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {tab === 'riders' ? (
          <View style={styles.listSection}>
            {travelers.map(t => (
              <TravelerCard key={t.id} traveler={t} isDark={isDark} />
            ))}
          </View>
        ) : (
          <View style={styles.listSection}>
            <View style={[styles.composeCard, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
              <View style={[styles.composeAvatar, { backgroundColor: Colors.primary + '18' }]}>
                <Text style={styles.composeInitial}>{user?.displayName?.charAt(0) || 'U'}</Text>
              </View>
              <TextInput
                style={[styles.composeInput, { color: isDark ? Colors.white : Colors.dark }]}
                placeholder="Share an update with riders..."
                placeholderTextColor={Colors.gray300}
                value={newPost}
                onChangeText={setNewPost}
                multiline
              />
              <Pressable
                onPress={handlePost}
                disabled={!newPost.trim()}
                style={[styles.postBtn, { backgroundColor: newPost.trim() ? Colors.primary : Colors.gray200 }]}
              >
                <Ionicons name="send" size={16} color="#fff" />
              </Pressable>
            </View>
            {posts.map(p => (
              <PostCard key={p.id} post={p} isDark={isDark} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 28 },
  headerSubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 13, marginTop: 2 },
  loginPrompt: { alignItems: 'center', paddingHorizontal: 40 },
  loginIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  loginTitle: { fontFamily: 'Outfit_700Bold', fontSize: 28, marginBottom: 8 },
  loginSubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 15, color: Colors.gray300, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  loginBtn: { paddingVertical: 16, paddingHorizontal: 40, borderRadius: 14, alignItems: 'center' },
  loginBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: '#fff' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: Colors.gray100 + '50' },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: 12 },
  tabText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
  listSection: { paddingHorizontal: 20, paddingTop: 8, gap: 10 },
  travelerCard: { flexDirection: 'row', padding: 14, borderRadius: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  travelerAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  travelerInitial: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.primary },
  travelerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  travelerName: { fontFamily: 'Outfit_600SemiBold', fontSize: 15 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusLabel: { fontFamily: 'Outfit_500Medium', fontSize: 10 },
  travelerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  metaText: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.gray300 },
  travelerBottom: { flexDirection: 'row', gap: 12, marginTop: 6 },
  distanceText: { fontFamily: 'Outfit_500Medium', fontSize: 12, color: Colors.primary },
  seenText: { fontFamily: 'Outfit_400Regular', fontSize: 11, color: Colors.gray300 },
  waveBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  composeCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderRadius: 16, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  composeAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  composeInitial: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: Colors.primary },
  composeInput: { flex: 1, fontFamily: 'Outfit_400Regular', fontSize: 14, minHeight: 40, maxHeight: 100, paddingTop: 10 },
  postBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  postCard: { padding: 14, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  postAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  postInitial: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.primary },
  postUserName: { fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  postLocation: { fontFamily: 'Outfit_400Regular', fontSize: 11, color: Colors.gray300 },
  postTime: { fontFamily: 'Outfit_400Regular', fontSize: 11, color: Colors.gray300, marginLeft: 6 },
  postContent: { fontFamily: 'Outfit_400Regular', fontSize: 14, lineHeight: 20, marginBottom: 10 },
  postActions: { flexDirection: 'row', gap: 20 },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postActionText: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.gray300 },
});
