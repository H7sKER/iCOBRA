import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import vsColors from '@/constants/vsColors';
import { useEditor } from '@/context/EditorContext';
import { getAllFiles } from '@/data/sampleProject';

const { width, height } = Dimensions.get('window');

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: keyof typeof Feather.glyphMap;
  category: string;
  shortcut?: string;
}

const COMMANDS: CommandItem[] = [
  { id: 'new-file', label: 'File: New File', icon: 'file-plus', category: 'File', shortcut: 'Ctrl+N' },
  { id: 'open-folder', label: 'File: Open Folder', icon: 'folder', category: 'File', shortcut: 'Ctrl+O' },
  { id: 'save', label: 'File: Save', icon: 'save', category: 'File', shortcut: 'Ctrl+S' },
  { id: 'save-all', label: 'File: Save All', icon: 'save', category: 'File', shortcut: 'Ctrl+Shift+S' },
  { id: 'close-editor', label: 'View: Close Editor', icon: 'x', category: 'View', shortcut: 'Ctrl+W' },
  { id: 'toggle-terminal', label: 'View: Toggle Terminal', icon: 'terminal', category: 'View', shortcut: 'Ctrl+`' },
  { id: 'toggle-explorer', label: 'View: Toggle Explorer', icon: 'copy', category: 'View', shortcut: 'Ctrl+B' },
  { id: 'format-document', label: 'Format Document', icon: 'align-left', category: 'Edit', shortcut: 'Shift+Alt+F' },
  { id: 'find', label: 'Find', icon: 'search', category: 'Edit', shortcut: 'Ctrl+F' },
  { id: 'replace', label: 'Replace', icon: 'refresh-cw', category: 'Edit', shortcut: 'Ctrl+H' },
  { id: 'go-to-line', label: 'Go to Line/Column...', icon: 'hash', category: 'Go', shortcut: 'Ctrl+G' },
  { id: 'go-to-symbol', label: 'Go to Symbol...', icon: 'at-sign', category: 'Go', shortcut: 'Ctrl+Shift+O' },
  { id: 'start-debug', label: 'Debug: Start Debugging', icon: 'play', category: 'Debug', shortcut: 'F5' },
  { id: 'toggle-breakpoint', label: 'Debug: Toggle Breakpoint', icon: 'circle', category: 'Debug', shortcut: 'F9' },
  { id: 'step-over', label: 'Debug: Step Over', icon: 'arrow-right', category: 'Debug', shortcut: 'F10' },
  { id: 'step-into', label: 'Debug: Step Into', icon: 'arrow-down', category: 'Debug', shortcut: 'F11' },
  { id: 'build-debug', label: 'Gradle: Assemble Debug', icon: 'package', category: 'Build', shortcut: 'Ctrl+Shift+B' },
  { id: 'build-release', label: 'Gradle: Assemble Release', icon: 'package', category: 'Build' },
  { id: 'git-commit', label: 'Git: Commit', icon: 'git-commit', category: 'Git', shortcut: 'Ctrl+Enter' },
  { id: 'git-push', label: 'Git: Push', icon: 'upload', category: 'Git' },
  { id: 'git-pull', label: 'Git: Pull', icon: 'download', category: 'Git' },
  { id: 'open-settings', label: 'Preferences: Open Settings', icon: 'settings', category: 'Preferences', shortcut: 'Ctrl+,' },
  { id: 'keyboard-shortcuts', label: 'Preferences: Keyboard Shortcuts', icon: 'key', category: 'Preferences', shortcut: 'Ctrl+K Ctrl+S' },
  { id: 'change-theme', label: 'Preferences: Color Theme', icon: 'eye', category: 'Preferences' },
  { id: 'adb-devices', label: 'ADB: List Devices', icon: 'smartphone', category: 'Android' },
  { id: 'install-apk', label: 'ADB: Install APK', icon: 'download', category: 'Android' },
  { id: 'clear-data', label: 'ADB: Clear App Data', icon: 'trash-2', category: 'Android' },
];

export default function CommandPalette() {
  const { commandPaletteVisible, setCommandPaletteVisible, projectFiles, openFile } = useEditor();
  const [query, setQuery] = useState('');

  if (!commandPaletteVisible) return null;

  const isFileSearch = query.startsWith('>') ? false : true;
  const searchQuery = query.startsWith('>') ? query.slice(1).trim() : query.trim();

  const getResults = () => {
    if (!query.startsWith('>') && query.length > 0) {
      // File search mode
      const files = getAllFiles(projectFiles);
      return files
        .filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
        .map(f => ({ id: f.id, label: f.name, icon: 'file' as const, category: 'File', description: f.id, isFile: true, file: f }));
    }
    // Command mode
    if (!searchQuery) return COMMANDS.slice(0, 12);
    return COMMANDS.filter(c =>
      c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 15);
  };

  const results = getResults();

  const handleSelect = (item: typeof results[0]) => {
    if ('isFile' in item && item.isFile && 'file' in item) {
      openFile(item.file);
    }
    setCommandPaletteVisible(false);
    setQuery('');
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={() => { setCommandPaletteVisible(false); setQuery(''); }} />
      <View style={styles.palette}>
        {/* Input */}
        <View style={styles.inputRow}>
          <Feather name={query.startsWith('>') ? 'terminal' : 'search'} size={16} color={vsColors.textDim} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Type '>' for commands, or search files..."
            placeholderTextColor={vsColors.textDisabled}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Feather name="x" size={14} color={vsColors.textDim} />
            </Pressable>
          )}
        </View>

        {/* Hint bar */}
        <View style={styles.hintBar}>
          <Text style={styles.hint}>
            {query.startsWith('>') ? `Commands matching "${searchQuery}"` :
             query.length > 0 ? `Files matching "${query}"` :
             'Search files or type > for commands'}
          </Text>
          <Text style={styles.hintKey}>Esc to close</Text>
        </View>

        {/* Results */}
        <ScrollView style={styles.results} keyboardShouldPersistTaps="handled">
          {results.map((item, i) => (
            <Pressable
              key={item.id + i}
              style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowHover, i === 0 && styles.resultRowFirst]}
              onPress={() => handleSelect(item)}
            >
              <View style={styles.resultIcon}>
                <Feather name={item.icon} size={15} color={vsColors.textDim} />
              </View>
              <View style={styles.resultContent}>
                <Text style={styles.resultLabel} numberOfLines={1}>{item.label}</Text>
                {item.description && (
                  <Text style={styles.resultDesc} numberOfLines={1}>{item.description}</Text>
                )}
              </View>
              {'shortcut' in item && item.shortcut && (
                <Text style={styles.shortcut}>{item.shortcut}</Text>
              )}
              <Text style={styles.category}>{item.category}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>↑↓ to navigate  Enter to select  Esc to dismiss</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    alignItems: 'center',
    paddingTop: 60,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000066',
  },
  palette: {
    width: width - 20,
    maxHeight: height * 0.7,
    backgroundColor: vsColors.dropdownBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: vsColors.border,
    overflow: 'hidden',
    elevation: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: vsColors.textBright,
  },
  hintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: vsColors.panelHeaderBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  hint: { fontSize: 11, color: vsColors.textDim },
  hintKey: { fontSize: 11, color: vsColors.textDim },
  results: { maxHeight: 400 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border + '33',
  },
  resultRowFirst: { backgroundColor: vsColors.selection },
  resultRowHover: { backgroundColor: vsColors.lineHighlight },
  resultIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: { flex: 1, gap: 2 },
  resultLabel: { fontSize: 13, color: vsColors.text },
  resultDesc: { fontSize: 11, color: vsColors.textDim },
  shortcut: { fontSize: 11, color: vsColors.textDim },
  category: {
    fontSize: 10,
    color: vsColors.textDisabled,
    borderWidth: 1,
    borderColor: vsColors.border,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  footer: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: vsColors.panelHeaderBg,
    borderTopWidth: 1,
    borderTopColor: vsColors.border,
  },
  footerText: { fontSize: 11, color: vsColors.textDim },
});
