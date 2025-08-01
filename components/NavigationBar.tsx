
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// THEME CONSTANTS
const ACTIVE_COLOR = '#157efb';       // ProFlash's brand blue
const ACTIVE_BG = '#eaf3fe';          // Subtle blue highlight for activated
const INACTIVE_COLOR = '#61707C';     // Soft mid-gray (legible on white)
const HOVER_COLOR = '#A2CBFA';        // Lighter blue accent for hover/focus
const BAR_BG = '#fff';                // White bar
const SHADOW = '#16191b40';           // Subtle shadow
const TAB_BAR_HEIGHT = 74;

const TAB_ITEMS = [

  { key: 'tasks', label: 'Tasks', icon: <Feather name="check-square" size={28} />, route: '/(tabs)/tasks' },
  { key: 'calendar', label: 'Calendar', icon: <Feather name="calendar" size={28} />, route: '/(tabs)/calendar' },
  { key: 'notes', label: 'Notes', icon: <Feather name="file-text" size={28} />, route: '/(tabs)/notes' },
    { key: 'dashboard', label: 'Dashboard', icon: <Feather name="home" size={28} />, route: '/(tabs)/dashboard' },
  { key: 'profile', label: 'Profile', icon: <Feather name="user" size={28} />, route: '/' },
];

export default function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

  const getActiveKey = () => {
    const current = TAB_ITEMS.find(tab => pathname.startsWith(tab.route.replace('/(tabs)', '')));
    return current?.key;
  };
  const activeKey = getActiveKey();

  const handlePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route);
  };

  return (
    <View style={styles.wrapper}>
      {TAB_ITEMS.map(tab => {
        const isActive = activeKey === tab.key;
        const isHovered = hovered === tab.key;
        const color = isActive
          ? ACTIVE_COLOR
          : isHovered && Platform.OS === 'web'
          ? HOVER_COLOR
          : INACTIVE_COLOR;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              isActive && styles.tabActive,
              isHovered && Platform.OS === 'web' && { backgroundColor: ACTIVE_BG },
            ]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => handlePress(tab.route)}
            onMouseEnter={() => Platform.OS === 'web' && setHovered(tab.key)}
            onMouseLeave={() => Platform.OS === 'web' && setHovered(null)}
          >
            <View style={{ alignItems: 'center' }}>
              <View style={[
                styles.iconWrapper,
                isActive && { backgroundColor: ACTIVE_COLOR, shadowColor: ACTIVE_COLOR, shadowOpacity: 0.18 },
              ]}>
                {React.cloneElement(tab.icon as React.ReactElement, {
                  color: isActive ? '#fff' : color,
                  size: 26,
                })}
              </View>
              <Text
                style={[
                  styles.label,
                  isActive && styles.labelActive,
                  isHovered && Platform.OS === 'web' && { color: HOVER_COLOR },
                ]}
              >
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: TAB_BAR_HEIGHT,
    backgroundColor: BAR_BG,
    borderTopWidth: 1,
    borderTopColor: '#f0f2f8',
    paddingBottom: 12,
    paddingTop: 7,
    shadowColor: SHADOW,
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 17,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    borderRadius: 14,
    backgroundColor: 'transparent',
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease-in',
    paddingVertical: 2,
  },
  tabActive: {
    backgroundColor: ACTIVE_BG,
    borderRadius: 12,

  },
  iconWrapper: {
    borderRadius: 24,
    padding: 7,
    backgroundColor: 'transparent',
    marginBottom: 1,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    ...Platform.select({
      web: {
        boxSizing: 'border-box',
      }
    }),
  },
  label: {
    marginTop: 2,
    fontSize: 13,
    color: INACTIVE_COLOR,
    fontWeight: '500',
    transitionProperty: 'color',
    transitionDuration: '125ms',
    transitionTimingFunction: 'ease-in',
    letterSpacing: 0.1,
  },
  labelActive: {
    color: ACTIVE_COLOR,
    fontWeight: '700',
  },
});

