import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable,
  useColorScheme, TextInput, Alert, Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';

const COLORS = ['#1A9B8F', '#E86B20', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981'];

export default function AddGemScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { addGem } = useData();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleSave = async () => {
    if (!name.trim() || !location.trim()) {
      if (Platform.OS !== 'web') {
        Alert.alert('Missing Info', 'Name and location are required');
      }
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addGem({
      name: name.trim(),
      description: description.trim() || 'A hidden gem waiting to be explored',
      location: location.trim(),
      latitude: 18.5 + Math.random() * 0.5,
      longitude: 73.5 + Math.random() * 0.5,
      rating: 4.5,
      reviews: 0,
      addedBy: 'Admin',
      tags: tags.trim() ? tags.split(',').map(t => t.trim().toLowerCase()) : ['hidden', 'gem'],
      imageColor: selectedColor,
    });
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <View style={styles.sheetHeader}>
        <Text style={[styles.sheetTitle, { color: isDark ? Colors.white : Colors.dark }]}>Add Hidden Gem</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
        <Text style={[styles.label, { color: isDark ? Colors.gray200 : Colors.gray500 }]}>Color Theme</Text>
        <View style={styles.colorRow}>
          {COLORS.map(c => (
            <Pressable
              key={c}
              onPress={() => { setSelectedColor(c); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={[styles.colorDot, { backgroundColor: c, borderWidth: selectedColor === c ? 3 : 0, borderColor: isDark ? Colors.white : Colors.dark }]}
            />
          ))}
        </View>

        <Text style={[styles.label, { color: isDark ? Colors.gray200 : Colors.gray500 }]}>Name *</Text>
        <TextInput style={[styles.input, { backgroundColor: isDark ? Colors.darkCard : Colors.white, color: isDark ? Colors.white : Colors.dark, borderColor: isDark ? Colors.darkBorder : Colors.gray100 }]} placeholder="Place name" placeholderTextColor={Colors.gray300} value={name} onChangeText={setName} />

        <Text style={[styles.label, { color: isDark ? Colors.gray200 : Colors.gray500 }]}>Location *</Text>
        <TextInput style={[styles.input, { backgroundColor: isDark ? Colors.darkCard : Colors.white, color: isDark ? Colors.white : Colors.dark, borderColor: isDark ? Colors.darkBorder : Colors.gray100 }]} placeholder="Area, District" placeholderTextColor={Colors.gray300} value={location} onChangeText={setLocation} />

        <Text style={[styles.label, { color: isDark ? Colors.gray200 : Colors.gray500 }]}>Tags (comma-separated)</Text>
        <TextInput style={[styles.input, { backgroundColor: isDark ? Colors.darkCard : Colors.white, color: isDark ? Colors.white : Colors.dark, borderColor: isDark ? Colors.darkBorder : Colors.gray100 }]} placeholder="waterfall, scenic, camping" placeholderTextColor={Colors.gray300} value={tags} onChangeText={setTags} />

        <Text style={[styles.label, { color: isDark ? Colors.gray200 : Colors.gray500 }]}>Description</Text>
        <TextInput style={[styles.textArea, { backgroundColor: isDark ? Colors.darkCard : Colors.white, color: isDark ? Colors.white : Colors.dark, borderColor: isDark ? Colors.darkBorder : Colors.gray100 }]} placeholder="Describe this hidden gem..." placeholderTextColor={Colors.gray300} value={description} onChangeText={setDescription} multiline numberOfLines={4} textAlignVertical="top" />

        <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: Colors.accent }]}>
          <Text style={styles.saveBtnText}>Add Hidden Gem</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sheetHeader: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },
  sheetTitle: { fontFamily: 'Outfit_700Bold', fontSize: 22 },
  form: { paddingHorizontal: 24, paddingBottom: 40, gap: 6 },
  label: { fontFamily: 'Outfit_500Medium', fontSize: 13, marginTop: 10 },
  colorRow: { flexDirection: 'row', gap: 12, marginVertical: 8 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  input: { fontFamily: 'Outfit_400Regular', fontSize: 15, paddingHorizontal: 14, height: 48, borderRadius: 14, borderWidth: 1 },
  textArea: { fontFamily: 'Outfit_400Regular', fontSize: 15, paddingHorizontal: 14, paddingTop: 14, height: 120, borderRadius: 14, borderWidth: 1 },
  saveBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 16 },
  saveBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: '#fff' },
});
