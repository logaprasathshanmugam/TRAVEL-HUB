import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, FlatList, Pressable,
  Platform, useColorScheme, TextInput, KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const SUGGESTIONS = [
  'Best bike routes near Lonavala',
  'Tips for monsoon riding',
  'Must-visit spots in Western Ghats',
  'Safety checklist for long rides',
];

const AI_RESPONSES: Record<string, string> = {
  'route': "Here are some amazing bike routes I'd recommend:\n\n1. Mumbai-Lonavala via Old Highway - Classic 83km ride with scenic ghats and winding roads. Best early morning.\n\n2. Pune-Mahabaleshwar Loop - 120km of lush green valleys, strawberry farms, and viewpoints.\n\n3. Tamhini Ghat Circuit - A monsoon paradise with 30+ waterfalls visible from the road.\n\n4. Malshej Ghat - 130km from Mumbai, known for flamingo sightings and misty mountain roads.\n\nAlways carry rain gear and check road conditions before starting!",
  'monsoon': "Monsoon riding tips for safety:\n\n1. Tire Check - Ensure adequate tread depth. Consider switching to rain-specific tires.\n\n2. Visibility - Use anti-fog visor spray. Wear bright or reflective gear.\n\n3. Braking - Apply brakes gently. Use engine braking on downhill stretches.\n\n4. Puddles - Avoid riding through standing water. Hidden potholes are dangerous.\n\n5. Speed - Reduce speed by 30-40% on wet roads. Maintain 2x normal following distance.\n\n6. Electronics - Waterproof your phone mount and electrical connections.\n\n7. Route - Stick to well-known routes. Avoid off-road trails during heavy rain.\n\nStay safe and enjoy the magical monsoon rides!",
  'spot': "Must-visit hidden spots in the Western Ghats:\n\n1. Bhandardara - Pristine lake surrounded by mountains. Wilson Dam is breathtaking during overflow season.\n\n2. Sandhan Valley - Known as the 'Valley of Shadows'. A canyon trek with rappelling and camping.\n\n3. Rajmachi Fort - Accessible by bike through a thrilling off-road trail. Star gazing at night is incredible.\n\n4. Koyna Backwaters - Serene boat rides with dense forest on both sides.\n\n5. Peth Hill - One of the least crowded viewpoints with 360-degree panoramic views.\n\nEach spot offers parking for bikes and basic food stalls nearby!",
  'safety': "Long ride safety checklist:\n\nBefore You Leave:\n- Full tank of fuel + know fuel stops\n- Tire pressure check (front & rear)\n- Brake pad inspection\n- Chain lubrication\n- All lights working\n\nGear:\n- Full-face helmet (ISI certified)\n- Riding jacket with armor\n- Riding gloves\n- Knee guards\n- Waterproof boot covers\n\nEssentials to Carry:\n- Basic tool kit (spanners, pliers)\n- Puncture repair kit\n- First aid kit\n- Phone charger + power bank\n- Emergency contacts card\n\nRiding Rules:\n- Rest every 100km or 2 hours\n- Stay hydrated\n- No night riding on unfamiliar roads\n- Share live location with someone\n\nRide safe, ride smart!",
  'default': "I'm your AI travel guide for bike trips! I can help you with:\n\n- Route recommendations for scenic rides\n- Safety tips for different weather conditions\n- Hidden gem locations along popular routes\n- Mechanic and service recommendations\n- Best food stops and rest areas\n- Trip planning and packing advice\n\nWhat would you like to know about? Just ask me anything about your next bike adventure!",
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('route') || lower.includes('road') || lower.includes('ride') || lower.includes('lonavala')) {
    return AI_RESPONSES['route'];
  }
  if (lower.includes('monsoon') || lower.includes('rain') || lower.includes('wet')) {
    return AI_RESPONSES['monsoon'];
  }
  if (lower.includes('spot') || lower.includes('place') || lower.includes('visit') || lower.includes('ghat') || lower.includes('gem')) {
    return AI_RESPONSES['spot'];
  }
  if (lower.includes('safety') || lower.includes('checklist') || lower.includes('gear') || lower.includes('tip')) {
    return AI_RESPONSES['safety'];
  }
  return AI_RESPONSES['default'];
}

function MessageBubble({ message, isDark }: { message: Message; isDark: boolean }) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant]}>
      {!isUser && (
        <View style={[styles.avatarSmall, { backgroundColor: Colors.accent + '20' }]}>
          <Ionicons name="sparkles" size={14} color={Colors.accent} />
        </View>
      )}
      <View style={[
        styles.bubble,
        isUser
          ? { backgroundColor: Colors.primary, borderBottomRightRadius: 4 }
          : { backgroundColor: isDark ? Colors.darkCard : Colors.white, borderBottomLeftRadius: 4 },
      ]}>
        <Text style={[
          styles.bubbleText,
          { color: isUser ? '#fff' : (isDark ? Colors.gray100 : Colors.dark) },
        ]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

export default function GuideScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const response = getAIResponse(text);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const reversedMessages = [...messages].reverse();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <View style={[styles.aiAvatar, { backgroundColor: Colors.accent + '18' }]}>
          <Ionicons name="sparkles" size={22} color={Colors.accent} />
        </View>
        <View>
          <Text style={[styles.headerTitle, { color: isDark ? Colors.white : Colors.dark }]}>
            AI Tourist Guide
          </Text>
          <Text style={styles.headerSubtitle}>Your riding companion</Text>
        </View>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: Colors.accent + '12' }]}>
            <Ionicons name="sparkles" size={40} color={Colors.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: isDark ? Colors.white : Colors.dark }]}>
            Ask me anything
          </Text>
          <Text style={[styles.emptySubtitle, { color: Colors.gray300 }]}>
            Get route tips, safety advice, and discover hidden gems
          </Text>
          <View style={styles.suggestionsGrid}>
            {SUGGESTIONS.map((s, i) => (
              <Pressable
                key={i}
                onPress={() => sendMessage(s)}
                style={[styles.suggestionChip, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}
              >
                <Ionicons name="chatbubble-outline" size={14} color={Colors.accent} />
                <Text style={[styles.suggestionText, { color: isDark ? Colors.gray100 : Colors.gray500 }]} numberOfLines={2}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={reversedMessages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble message={item} isDark={isDark} />}
          inverted
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            isTyping ? (
              <View style={[styles.bubbleRow, styles.bubbleRowAssistant]}>
                <View style={[styles.avatarSmall, { backgroundColor: Colors.accent + '20' }]}>
                  <Ionicons name="sparkles" size={14} color={Colors.accent} />
                </View>
                <View style={[styles.bubble, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
                  <ActivityIndicator size="small" color={Colors.accent} />
                </View>
              </View>
            ) : null
          }
        />
      )}

      <View style={[styles.inputContainer, { paddingBottom: bottomInset + 8, backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
        <View style={[styles.inputBar, { backgroundColor: isDark ? Colors.darkCard : Colors.white }]}>
          <TextInput
            style={[styles.textInput, { color: isDark ? Colors.white : Colors.dark }]}
            placeholder="Ask about routes, tips..."
            placeholderTextColor={Colors.gray300}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            style={[styles.sendBtn, { backgroundColor: input.trim() ? Colors.primary : Colors.gray200 }]}
          >
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14, gap: 12, borderBottomWidth: 0.5, borderBottomColor: Colors.gray100 },
  aiAvatar: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20 },
  headerSubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.gray300 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontFamily: 'Outfit_700Bold', fontSize: 24, marginBottom: 6 },
  emptySubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 15, textAlign: 'center', marginBottom: 28 },
  suggestionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', width: '100%' },
  suggestionChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, width: '47%', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  suggestionText: { fontFamily: 'Outfit_400Regular', fontSize: 13, flex: 1 },
  messagesList: { paddingHorizontal: 16, paddingBottom: 8, paddingTop: 8 },
  bubbleRow: { flexDirection: 'row', marginBottom: 12, maxWidth: '85%' },
  bubbleRowUser: { alignSelf: 'flex-end' },
  bubbleRowAssistant: { alignSelf: 'flex-start' },
  avatarSmall: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 4 },
  bubble: { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12, maxWidth: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  bubbleText: { fontFamily: 'Outfit_400Regular', fontSize: 15, lineHeight: 22 },
  inputContainer: { paddingHorizontal: 16, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: Colors.gray100 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', borderRadius: 24, paddingLeft: 16, paddingRight: 6, paddingVertical: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  textInput: { flex: 1, fontFamily: 'Outfit_400Regular', fontSize: 15, maxHeight: 100, paddingVertical: 8 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
