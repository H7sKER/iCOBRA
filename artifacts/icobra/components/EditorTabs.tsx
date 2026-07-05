import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import vsColors from '@/constants/vsColors';
import { useEditor } from '@/context/EditorContext';

export default function EditorTabs() {
  const { openFiles, activeFileId, closeFile, setActiveFile } = useEditor();

  if (openFiles.length === 0) {
    return (
      <View style={styles.emptyBar}>
        <Text style={styles.emptyText}>No files open</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {openFiles.map(file => {
        const isActive = file.id === activeFileId;
        return (
          <Pressable
            key={file.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => setActiveFile(file.id)}
          >
            {isActive && <View style={styles.activeTop} />}
            <View style={styles.tabInner}>
              <View style={[styles.langDot, { backgroundColor: getLangColor(file.language) }]} />
              <Text style={[styles.tabName, isActive && styles.tabNameActive]} numberOfLines={1}>
                {file.isDirty ? `● ${file.name}` : file.name}
              </Text>
              <Pressable
                style={styles.closeBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  closeFile(file.id);
                }}
                hitSlop={8}
              >
                <Feather name="x" size={12} color={isActive ? vsColors.textDim : vsColors.textDisabled} />
              </Pressable>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function getLangColor(lang: string): string {
  const map: Record<string, string> = {
    kotlin: '#A97BFF',
    java: '#B07219',
    xml: '#E44D26',
    groovy: '#4298B8',
    markdown: '#083fa1',
    typescript: '#3178C6',
    javascript: '#F7DF1E',
    python: '#3572A5',
    html: '#E44D26',
    css: '#563D7C',
  };
  return map[lang] ?? '#858585';
}

const styles = StyleSheet.create({
  container: {
    height: 35,
    backgroundColor: vsColors.tabInactiveBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  emptyBar: {
    height: 35,
    backgroundColor: vsColors.tabInactiveBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: vsColors.textDisabled,
  },
  tab: {
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: vsColors.tabInactiveBg,
    borderRightWidth: 1,
    borderRightColor: vsColors.border,
    minWidth: 100,
    maxWidth: 180,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: vsColors.tabActiveBg,
  },
  activeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: vsColors.accent,
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 6,
    flex: 1,
  },
  langDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tabName: {
    flex: 1,
    fontSize: 12,
    color: vsColors.tabInactiveFg,
  },
  tabNameActive: {
    color: vsColors.tabActiveFg,
  },
  closeBtn: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
