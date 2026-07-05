import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import vsColors from '@/constants/vsColors';
import { SidePanel, useEditor } from '@/context/EditorContext';

interface ActivityItem {
  id: SidePanel;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  badge?: number;
}

const TOP_ITEMS: ActivityItem[] = [
  { id: 'explorer', icon: 'copy', label: 'Explorer' },
  { id: 'search', icon: 'search', label: 'Search' },
  { id: 'git', icon: 'git-branch', label: 'Source Control', badge: 3 },
  { id: 'debug', icon: 'play-circle', label: 'Run & Debug' },
  { id: 'extensions', icon: 'grid', label: 'Extensions', badge: 4 },
  { id: 'test', icon: 'check-circle', label: 'Test Explorer', badge: 2 },
  { id: 'profiler', icon: 'activity', label: 'Performance Profiler' },
  { id: 'objectbrowser', icon: 'box', label: 'Object Browser' },
  { id: 'liveshare', icon: 'share-2', label: 'Live Share', badge: 2 },
];

export default function ActivityBar() {
  const { sidePanel, setSidePanel, setBottomPanel, bottomPanel } = useEditor();

  const handlePress = (id: SidePanel) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSidePanel(id);
  };

  const handleTerminal = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBottomPanel(bottomPanel === 'terminal' ? null : 'terminal');
  };

  return (
    <View style={styles.container}>
      {/* Top group — scrollable to fit all icons */}
      <ScrollView
        style={styles.topScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.topGroup}
      >
        {TOP_ITEMS.map(item => (
          <Pressable
            key={item.id}
            style={[styles.item, sidePanel === item.id && styles.itemActive]}
            onPress={() => handlePress(item.id)}
          >
            {sidePanel === item.id && <View style={styles.activeIndicator} />}
            <Feather
              name={item.icon}
              size={21}
              color={sidePanel === item.id ? vsColors.activityBarFg : vsColors.activityBarInactiveFg}
            />
            {item.badge !== undefined && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>

      {/* Bottom group */}
      <View style={styles.bottomGroup}>
        <Pressable style={styles.item} onPress={handleTerminal}>
          <Feather
            name="terminal"
            size={21}
            color={bottomPanel === 'terminal' ? vsColors.activityBarFg : vsColors.activityBarInactiveFg}
          />
        </Pressable>
        <Pressable style={styles.item}>
          <Feather name="bell" size={21} color={vsColors.activityBarInactiveFg} />
        </Pressable>
        <Pressable style={styles.item}>
          <Feather name="settings" size={21} color={vsColors.activityBarInactiveFg} />
        </Pressable>
        <Pressable style={styles.item}>
          <Feather name="user" size={21} color={vsColors.activityBarInactiveFg} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 46,
    backgroundColor: vsColors.activityBarBg,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  topScroll: { flex: 1 },
  topGroup: { gap: 2 },
  bottomGroup: { gap: 2, paddingBottom: 4 },
  item: {
    width: 46,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  itemActive: { opacity: 1 },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 2,
    backgroundColor: vsColors.activityBarFg,
    borderRadius: 1,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: vsColors.accent,
    borderRadius: 8,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
});
