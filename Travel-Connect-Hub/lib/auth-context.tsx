import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  username: string;
  displayName: string;
  role: 'user' | 'admin';
  avatar?: string;
  bio?: string;
  joinDate: string;
  tripsCount: number;
  distanceKm: number;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = '@rideconnect_users';
const SESSION_KEY = '@rideconnect_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        setUser(parsed);
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function getUsers(): Promise<Record<string, { password: string; user: User }>> {
    const data = await AsyncStorage.getItem(USERS_KEY);
    if (!data) {
      const adminUser: User = {
        id: 'admin-001',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
        joinDate: new Date().toISOString(),
        tripsCount: 0,
        distanceKm: 0,
      };
      const defaults: Record<string, { password: string; user: User }> = {
        admin: { password: 'admin123', user: adminUser },
      };
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(data);
  }

  async function login(username: string, password: string): Promise<boolean> {
    const users = await getUsers();
    const entry = users[username.toLowerCase()];
    if (!entry || entry.password !== password) return false;
    setUser(entry.user);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(entry.user));
    return true;
  }

  async function register(username: string, password: string, displayName: string): Promise<boolean> {
    const users = await getUsers();
    if (users[username.toLowerCase()]) return false;
    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username: username.toLowerCase(),
      displayName,
      role: 'user',
      joinDate: new Date().toISOString(),
      tripsCount: 0,
      distanceKm: 0,
    };
    users[username.toLowerCase()] = { password, user: newUser };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    setUser(newUser);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return true;
  }

  async function logout() {
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  }

  async function updateProfile(updates: Partial<User>) {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    const users = await getUsers();
    if (users[user.username]) {
      users[user.username].user = updated;
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }

  const value = useMemo(() => ({
    user,
    isLoading,
    isLoggedIn: !!user,
    login,
    register,
    logout,
    updateProfile,
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
