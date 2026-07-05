import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import vsColors from '@/constants/vsColors';
import { useEditor } from '@/context/EditorContext';

export default function StatusBarView() {
  const { activeFile, currentBranch, setBottomPanel, bottomPanel, breakpoints } = useEditor();

  const errors = 0;
  const warnings = 5;

  return (
    <View style={styles.container}>
      {/* Left section */}
      <View style={styles.left}>
        <Pressable style={styles.item}>
          <Feather name="git-branch" size={12} color={vsColors.statusBarFg} />
          <Text style={styles.text}>{currentBranch}</Text>
        </Pressable>
        <Pressable
          style={styles.item}
          onPress={() => setBottomPanel(bottomPanel === 'problems' ? null : 'problems')}
        >
          <Feather name="x-circle" size={12} color={vsColors.statusBarFg} />
          <Text style={styles.text}>{errors}</Text>
          <Feather name="alert-triangle" size={12} color={vsColors.statusBarFg} />
          <Text style={styles.text}>{warnings}</Text>
        </Pressable>
      </View>

      {/* Right section */}
      <View style={styles.right}>
        {activeFile && (
          <>
            <Pressable style={styles.item}>
              <Text style={styles.text}>
                Ln {activeFile.cursorLine}, Col {activeFile.cursorCol}
              </Text>
            </Pressable>
            <Pressable style={styles.item}>
              <Text style={styles.text}>Spaces: 4</Text>
            </Pressable>
            <Pressable style={styles.item}>
              <Text style={styles.text}>UTF-8</Text>
            </Pressable>
            <Pressable style={styles.item}>
              <Text style={styles.text}>LF</Text>
            </Pressable>
            <Pressable style={styles.item}>
              <Text style={[styles.text, { color: '#DCDCAA' }]}>
                {getLanguageLabel(activeFile.language)}
              </Text>
            </Pressable>
          </>
        )}
        {!activeFile && (
          <Text style={styles.text}>iCOBRA v1.0.0</Text>
        )}
        <Pressable style={styles.item}>
          <Feather name="bell" size={12} color={vsColors.statusBarFg} />
        </Pressable>
      </View>
    </View>
  );
}

function getLanguageLabel(lang: string): string {
  const map: Record<string, string> = {
    kotlin: 'Kotlin',
    java: 'Java',
    xml: 'XML',
    groovy: 'Groovy',
    markdown: 'Markdown',
    typescript: 'TypeScript',
    javascript: 'JavaScript',
    python: 'Python',
    html: 'HTML',
    css: 'CSS',
    cpp: 'C++',
    csharp: 'C#',
    text: 'Plain Text',
  };
  return map[lang] ?? lang;
}

const styles = StyleSheet.create({
  container: {
    height: 22,
    backgroundColor: vsColors.statusBarBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    height: 22,
  },
  text: {
    fontSize: 11,
    color: vsColors.statusBarFg,
  },
});
