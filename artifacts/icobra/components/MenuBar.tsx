import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import vsColors from '@/constants/vsColors';
import { useEditor } from '@/context/EditorContext';

interface MenuEntry {
  label?: string;
  shortcut?: string;
  checked?: boolean;
  disabled?: boolean;
  separator?: boolean;
  submenu?: MenuEntry[];
}

interface MenuDef {
  label: string;
  entries: MenuEntry[];
}

const MENUS: MenuDef[] = [
  {
    label: 'File',
    entries: [
      { label: 'New File', shortcut: 'Ctrl+N' },
      { label: 'New Window', shortcut: 'Ctrl+Shift+N' },
      { separator: true },
      { label: 'Open File...', shortcut: 'Ctrl+O' },
      { label: 'Open Folder...', shortcut: 'Ctrl+K Ctrl+O' },
      { label: 'Open Recent', submenu: [
        { label: 'MainActivity.kt' },
        { label: 'ShizukuService.kt' },
        { label: 'build.gradle' },
        { separator: true },
        { label: 'Clear Recently Opened' },
      ]},
      { separator: true },
      { label: 'Save', shortcut: 'Ctrl+S' },
      { label: 'Save As...', shortcut: 'Ctrl+Shift+S' },
      { label: 'Save All', shortcut: 'Ctrl+K S' },
      { separator: true },
      { label: 'Auto Save', checked: true },
      { separator: true },
      { label: 'Revert File' },
      { label: 'Close Editor', shortcut: 'Ctrl+W' },
      { label: 'Close All Editors', shortcut: 'Ctrl+K W' },
      { separator: true },
      { label: 'Exit', shortcut: 'Alt+F4' },
    ],
  },
  {
    label: 'Edit',
    entries: [
      { label: 'Undo', shortcut: 'Ctrl+Z' },
      { label: 'Redo', shortcut: 'Ctrl+Y' },
      { separator: true },
      { label: 'Cut', shortcut: 'Ctrl+X' },
      { label: 'Copy', shortcut: 'Ctrl+C' },
      { label: 'Paste', shortcut: 'Ctrl+V' },
      { separator: true },
      { label: 'Find', shortcut: 'Ctrl+F' },
      { label: 'Replace', shortcut: 'Ctrl+H' },
      { label: 'Find in Files', shortcut: 'Ctrl+Shift+F' },
      { label: 'Replace in Files', shortcut: 'Ctrl+Shift+H' },
      { separator: true },
      { label: 'Select All', shortcut: 'Ctrl+A' },
      { label: 'Expand Selection', shortcut: 'Shift+Alt+Right' },
      { label: 'Shrink Selection', shortcut: 'Shift+Alt+Left' },
      { separator: true },
      { label: 'Toggle Line Comment', shortcut: 'Ctrl+/' },
      { label: 'Toggle Block Comment', shortcut: 'Shift+Alt+A' },
      { separator: true },
      { label: 'Format Document', shortcut: 'Shift+Alt+F' },
      { label: 'Format Selection', shortcut: 'Ctrl+K Ctrl+F' },
    ],
  },
  {
    label: 'Selection',
    entries: [
      { label: 'Select All', shortcut: 'Ctrl+A' },
      { label: 'Expand Selection', shortcut: 'Shift+Alt+Right' },
      { label: 'Shrink Selection', shortcut: 'Shift+Alt+Left' },
      { separator: true },
      { label: 'Copy Line Up', shortcut: 'Shift+Alt+Up' },
      { label: 'Copy Line Down', shortcut: 'Shift+Alt+Down' },
      { label: 'Move Line Up', shortcut: 'Alt+Up' },
      { label: 'Move Line Down', shortcut: 'Alt+Down' },
      { separator: true },
      { label: 'Add Cursor Above', shortcut: 'Ctrl+Alt+Up' },
      { label: 'Add Cursor Below', shortcut: 'Ctrl+Alt+Down' },
      { label: 'Add Cursors to Line Ends', shortcut: 'Shift+Alt+I' },
      { separator: true },
      { label: 'Select All Occurrences', shortcut: 'Ctrl+Shift+L' },
      { label: 'Select Next Occurrence', shortcut: 'Ctrl+D' },
    ],
  },
  {
    label: 'View',
    entries: [
      { label: 'Command Palette...', shortcut: 'Ctrl+Shift+P' },
      { label: 'Open View...', shortcut: 'Ctrl+Q' },
      { separator: true },
      { label: 'Explorer', shortcut: 'Ctrl+Shift+E', checked: true },
      { label: 'Search', shortcut: 'Ctrl+Shift+F' },
      { label: 'Source Control', shortcut: 'Ctrl+Shift+G' },
      { label: 'Run and Debug', shortcut: 'Ctrl+Shift+D' },
      { label: 'Extensions', shortcut: 'Ctrl+Shift+X' },
      { separator: true },
      { label: 'Problems', shortcut: 'Ctrl+Shift+M' },
      { label: 'Output', shortcut: 'Ctrl+Shift+U' },
      { label: 'Debug Console', shortcut: 'Ctrl+Shift+Y' },
      { label: 'Terminal', shortcut: 'Ctrl+`' },
      { separator: true },
      { label: 'Word Wrap', shortcut: 'Alt+Z', checked: false },
      { label: 'Minimap', checked: true },
      { label: 'Breadcrumbs', checked: true },
      { separator: true },
      { label: 'Zoom In', shortcut: 'Ctrl+=' },
      { label: 'Zoom Out', shortcut: 'Ctrl+-' },
      { label: 'Reset Zoom', shortcut: 'Ctrl+0' },
    ],
  },
  {
    label: 'Go',
    entries: [
      { label: 'Back', shortcut: 'Alt+Left' },
      { label: 'Forward', shortcut: 'Alt+Right' },
      { separator: true },
      { label: 'Go to File...', shortcut: 'Ctrl+P' },
      { label: 'Go to Symbol in File...', shortcut: 'Ctrl+Shift+O' },
      { label: 'Go to Symbol in Workspace...', shortcut: 'Ctrl+T' },
      { separator: true },
      { label: 'Go to Definition', shortcut: 'F12' },
      { label: 'Go to Declaration' },
      { label: 'Go to Type Definition' },
      { label: 'Go to Implementations', shortcut: 'Ctrl+F12' },
      { label: 'Go to References', shortcut: 'Shift+F12' },
      { separator: true },
      { label: 'Go to Line/Column...', shortcut: 'Ctrl+G' },
      { separator: true },
      { label: 'Next Problem', shortcut: 'F8' },
      { label: 'Previous Problem', shortcut: 'Shift+F8' },
    ],
  },
  {
    label: 'Run',
    entries: [
      { label: 'Start Debugging', shortcut: 'F5' },
      { label: 'Run Without Debugging', shortcut: 'Ctrl+F5' },
      { label: 'Stop Debugging', shortcut: 'Shift+F5' },
      { label: 'Restart Debugging', shortcut: 'Ctrl+Shift+F5' },
      { separator: true },
      { label: 'Open Configurations' },
      { label: 'Add Configuration...' },
      { separator: true },
      { label: 'Step Over', shortcut: 'F10' },
      { label: 'Step Into', shortcut: 'F11' },
      { label: 'Step Out', shortcut: 'Shift+F11' },
      { label: 'Continue', shortcut: 'F5' },
      { separator: true },
      { label: 'Toggle Breakpoint', shortcut: 'F9' },
      { label: 'New Breakpoint', submenu: [
        { label: 'Conditional Breakpoint...' },
        { label: 'Logpoint...' },
        { label: 'Function Breakpoint...' },
        { label: 'Exception Breakpoint...' },
      ]},
      { label: 'Enable All Breakpoints' },
      { label: 'Disable All Breakpoints' },
      { label: 'Remove All Breakpoints' },
    ],
  },
  {
    label: 'Terminal',
    entries: [
      { label: 'New Terminal', shortcut: 'Ctrl+`' },
      { label: 'Split Terminal', shortcut: 'Ctrl+Shift+5' },
      { separator: true },
      { label: 'Run Task...' },
      { label: 'Run Build Task', shortcut: 'Ctrl+Shift+B' },
      { label: 'Run Active File' },
      { label: 'Run Selected Text' },
      { separator: true },
      { label: 'Show Running Tasks...' },
      { label: 'Restart Running Task...' },
      { label: 'Terminate Task...' },
      { separator: true },
      { label: 'Configure Tasks...' },
      { label: 'Configure Default Build Task...' },
    ],
  },
  {
    label: 'Help',
    entries: [
      { label: 'Welcome' },
      { label: 'Interactive Playground' },
      { label: 'Documentation' },
      { label: 'Release Notes' },
      { separator: true },
      { label: 'Keyboard Shortcuts Reference', shortcut: 'Ctrl+K Ctrl+R' },
      { label: 'Video Tutorials' },
      { label: 'Tips and Tricks' },
      { separator: true },
      { label: 'Join Us on GitHub' },
      { label: 'Report Issue...' },
      { separator: true },
      { label: 'Check for Updates...' },
      { separator: true },
      { label: 'About iCOBRA' },
    ],
  },
];

export default function MenuBar() {
  const { setCommandPaletteVisible, saveFile, activeFileId, setFindReplaceVisible } = useEditor();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleMenuPress = (label: string) => {
    setOpenMenu(prev => prev === label ? null : label);
  };

  const handleItemPress = (menu: string, item: MenuEntry) => {
    if (!item.label || item.separator) return;
    setOpenMenu(null);
    if (item.label === 'Save' && activeFileId) saveFile(activeFileId);
    if (item.label === 'Find' || item.label === 'Replace') setFindReplaceVisible(true);
    if (item.label === 'Command Palette...') setCommandPaletteVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* App title */}
      <View style={styles.titleArea}>
        <Text style={styles.appIcon}>{'</>'}</Text>
        <Text style={styles.appTitle}>iCOBRA</Text>
      </View>

      {/* Menu items */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.menuScroll} contentContainerStyle={styles.menuContent}>
        {MENUS.map(menu => (
          <View key={menu.label} style={{ position: 'relative' }}>
            <Pressable
              style={[styles.menuItem, openMenu === menu.label && styles.menuItemActive]}
              onPress={() => handleMenuPress(menu.label)}
            >
              <Text style={[styles.menuLabel, openMenu === menu.label && styles.menuLabelActive]}>
                {menu.label}
              </Text>
            </Pressable>

            {openMenu === menu.label && (
              <View style={styles.dropdown}>
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                  {menu.entries.map((entry, idx) => {
                    if (entry.separator) {
                      return <View key={`sep-${idx}`} style={styles.separator} />;
                    }
                    return (
                      <Pressable
                        key={entry.label ?? idx}
                        style={({ pressed }) => [
                          styles.dropdownItem,
                          pressed && styles.dropdownItemHover,
                          entry.disabled && styles.dropdownItemDisabled,
                        ]}
                        onPress={() => !entry.disabled && handleItemPress(menu.label, entry)}
                      >
                        <View style={styles.dropdownItemLeft}>
                          {entry.checked !== undefined && (
                            <View style={styles.checkmarkBox}>
                              {entry.checked && <Feather name="check" size={11} color={vsColors.accent} />}
                            </View>
                          )}
                          {entry.checked === undefined && <View style={styles.checkmarkBox} />}
                          <Text style={[styles.dropdownText, entry.disabled && styles.dropdownTextDisabled]}>
                            {entry.label}
                          </Text>
                          {entry.submenu && (
                            <Feather name="chevron-right" size={11} color={vsColors.textDim} style={{ marginLeft: 4 }} />
                          )}
                        </View>
                        {entry.shortcut && (
                          <Text style={styles.shortcutText}>{entry.shortcut}</Text>
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Right actions */}
      <View style={styles.rightActions}>
        <Pressable style={styles.iconBtn} onPress={() => setCommandPaletteVisible(true)}>
          <Feather name="search" size={15} color={vsColors.textDim} />
        </Pressable>
        <Pressable style={styles.iconBtn}>
          <Feather name="settings" size={15} color={vsColors.textDim} />
        </Pressable>
      </View>

      {/* Dismiss overlay */}
      {openMenu && (
        <Pressable style={styles.dismissOverlay} onPress={() => setOpenMenu(null)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 36,
    backgroundColor: vsColors.menuBarBg,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
    zIndex: 50,
  },
  titleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 5,
    borderRightWidth: 1,
    borderRightColor: vsColors.border,
    height: '100%',
  },
  appIcon: { fontSize: 13, color: vsColors.accent, fontWeight: '700' },
  appTitle: { fontSize: 12, color: vsColors.textBright, fontWeight: '700', letterSpacing: 1.5 },
  menuScroll: { flex: 1 },
  menuContent: { alignItems: 'center' },
  menuItem: { paddingHorizontal: 10, height: 36, justifyContent: 'center' },
  menuItemActive: { backgroundColor: vsColors.selection },
  menuLabel: { fontSize: 12, color: vsColors.textDim },
  menuLabelActive: { color: vsColors.textBright },
  dropdown: {
    position: 'absolute',
    top: 36,
    left: 0,
    backgroundColor: vsColors.dropdownBg,
    borderWidth: 1,
    borderColor: vsColors.border,
    minWidth: 260,
    zIndex: 200,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  separator: {
    height: 1,
    backgroundColor: vsColors.border,
    marginVertical: 3,
    marginHorizontal: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  dropdownItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dropdownItemHover: { backgroundColor: vsColors.selection },
  dropdownItemDisabled: { opacity: 0.4 },
  checkmarkBox: { width: 18, alignItems: 'center' },
  dropdownText: { fontSize: 13, color: vsColors.text },
  dropdownTextDisabled: { color: vsColors.textDim },
  shortcutText: { fontSize: 11, color: vsColors.textDisabled, marginLeft: 20 },
  rightActions: { flexDirection: 'row', paddingHorizontal: 6, gap: 2 },
  iconBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  dismissOverlay: {
    position: 'absolute',
    top: 36,
    left: 0,
    right: 0,
    bottom: -2000,
    zIndex: 100,
  },
});
