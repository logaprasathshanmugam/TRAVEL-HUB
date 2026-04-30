import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable,
  useColorScheme, TextInput, Alert, Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData, type ServiceCategory } from '@/lib/data-context';

const CATEGORIES: { key: ServiceCategory; label: string; icon: string }[] = [
  { key: 'mechanic', label: 'Mechanic', icon: 'tool' },
  { key: 'food', label: 'Food Stall', icon: 'coffee' },
  { key: 'resort', label: 'Resort', icon: 'home' },
  { key: 'restaurant', label: 'Restaurant', icon: 'map-pin' },
  { key: 'medical', label: 'Medical', icon: 'plus-circle' },
  { key: 'petrol', label: 'Petrol', icon: 'droplet' },
];

export default function AddServiceScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { addService } = useData();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('mechanic');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('');

  const handleSave = async () => {
    if (!name.trim() || !address.trim()) {
      if (Platform.OS !== 'web') {
        Alert.alert('Missing Info', 'Name and address are required');
      }
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addService({
      name: name.trim(),
      category,
      description: description.trim() || 'No description provided',
      address: address.trim(),
      phone: phone.trim() || 'N/A',
      rating: 4.0,
      reviews: 0,
      latitude: 18.5 + Math.random() * 0.5,
      longitude: 73.5 + Math.random() * 0.5,
      isOpen: true,
      openHours: hours.trim() || '9AM - 6PM',
    });
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <View style={styles.sheetHeader}>
        <Text style={[styles.sheetTitle, { color: isDark ? Colors.white : Colors.dark }]}>Add Service</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
        <Text style={[styles.label, { color: isDark ? Colors.gray200 : Colors.gray500 }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map(c => (
            <Pressable
              key={c.key}
              onPress={() => { setCategory(c.key); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={[styles.catOption, category === c.key ? { backgroundColor: Colors.primary, borderColor: Colors.primary } : { backgroundColor: isDark ? Colors.darkCard : Colors.white, borderColor: isDark ? Colors.darkBorder : Colors.gray100 }]}
            >
              <Feather name={c.icon as any} size={14} color={category === c.key ? '#fff' : Colors.gray400} />
              <Text style={[styles.catOptionText, { color: category === c.key ? '#fff' : (isDark ? Colors.gray200 : Colors.gray400) }]}>{c.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={[styles.label, { color: isDark ? Colors.gray200 : Colors.gray500 }]}>Name *</Text>
        <TextInput style={[styles.input, { backgroundColor: isDark ? Colors.darkCard : Colors.white, color: isDark ? Colors.white : Colors.dark, borderColor: isDark ? Colors.darkBorder : Colors.gray100 }]} placeholder="Service name" placeholderTextColor={Colors.gray300} value={name} onChangeText={setName} />

        <Text style={[styles.label, { color: isDark ? Colors.gray200 : Colors.gray500 }]}>Address *</Text>
        <TextInput style={[styles.input, { backgroundColor: isDark ? Colors.darkCard : Colors.white, color: isDark ? Colors.white : Colors.dark, borderColor: isDark ? Colors.darkBorder : Colors.gray100 }]} placeholder="Full address" placeholderTextColor={Colors.gray300} value={address} onChangeText={setAddress} />

        <Text style={[styles.label, { color: isDark ? Colors.gray200 : Colors.gray500 }]}>Phone</Text>
        <TextInput style={[styles.input, { backgroundColor: isDark ? Colors.darkCard : Colors.white, color: isDark ? Colors.white : Colors.dark, borderColor: isDark ? Colors.darkBorder : Colors.gray100 }]} placeholder="Phone number" placeholderTextColor={Colors.gray300} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <Text style={[styles.label, { color: isDark ? Colors.gray200 : Colors.gray500 }]}>Open Hours</Text>
        <TextInput style={[styles.input, { backgroundColor: isDark ? Colors.darkCard : Colors.white, color: isDark ? Colors.white : Colors.dark, borderColor: isDark ? Colors.darkBorder : Colors.gray100 }]} placeholder="e.g. 9AM - 6PM" placeholderTextColor={Colors.gray300} value={hours} onChangeText={setHours} />

        <Text style={[styles.label, { color: isDark ? Colors.gray200 : Colors.gray500 }]}>Description</Text>
        <TextInput style={[styles.textArea, { backgroundColor: isDark ? Colors.darkCard : Colors.white, color: isDark ? Colors.white : Colors.dark, borderColor: isDark ? Colors.darkBorder : Colors.gray100 }]} placeholder="Brief description" placeholderTextColor={Colors.gray300} value={description} onChangeText={setDescription} multiline numberOfLines={3} textAlignVertical="top" />

        <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: Colors.primary }]}>
          <Text style={styles.saveBtnText}>Add Service</Text>
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
  catScroll: { marginBottom: 4 },
  catOption: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginRight: 8, borderWidth: 1 },
  catOptionText: { fontFamily: 'Outfit_500Medium', fontSize: 13 },
  input: { fontFamily: 'Outfit_400Regular', fontSize: 15, paddingHorizontal: 14, height: 48, borderRadius: 14, borderWidth: 1 },
  textArea: { fontFamily: 'Outfit_400Regular', fontSize: 15, paddingHorizontal: 14, paddingTop: 14, height: 100, borderRadius: 14, borderWidth: 1 },
  saveBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 16 },
  saveBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: '#fff' },
});
