import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import vsColors from '@/constants/vsColors';
import { BottomPanel as BottomPanelType, useEditor } from '@/context/EditorContext';
import TerminalView from './TerminalView';
import ProblemsView from './ProblemsView';
import TaskListPanel from './TaskListPanel';
import TestExplorer from './TestExplorer';

const TABS: { id: BottomPanelType; label: string; badge?: string }[] = [
  { id: 'terminal', label: 'TERMINAL' },
  { id: 'problems', label: 'PROBLEMS', badge: '5' },
  { id: 'output', label: 'OUTPUT' },
  { id: 'debug-console', label: 'DEBUG CONSOLE' },
  { id: 'task-list', label: 'TASK LIST', badge: '10' },
  { id: 'test-results', label: 'TEST RESULTS', badge: '3' },
];

export default function BottomPanel() {
  const { bottomPanel, setBottomPanel } = useEditor();

  const renderContent = () => {
    switch (bottomPanel) {
      case 'terminal': return <TerminalView />;
      case 'problems': return <ProblemsView />;
      case 'output': return <OutputView />;
      case 'debug-console': return <DebugConsoleView />;
      case 'task-list': return <TaskListPanel />;
      case 'test-results': return <TestExplorer />;
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
          {TABS.map(tab => (
            <Pressable
              key={tab.id}
              style={[styles.tab, bottomPanel === tab.id && styles.tabActive]}
              onPress={() => setBottomPanel(tab.id)}
            >
              <Text style={[styles.tabLabel, bottomPanel === tab.id && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {tab.badge && (
                <View style={[styles.badge, bottomPanel === tab.id && styles.badgeActive]}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.panelActions}>
          <Pressable style={styles.actionBtn}>
            <Feather name="plus" size={14} color={vsColors.textDim} />
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Feather name="chevron-down" size={14} color={vsColors.textDim} />
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Feather name="more-horizontal" size={14} color={vsColors.textDim} />
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={() => setBottomPanel(null)}>
            <Feather name="x" size={14} color={vsColors.textDim} />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

function OutputView() {
  const lines = [
    { text: '[2026-07-05 10:30:00] iCOBRA Output Channel', color: vsColors.textDim },
    { text: '[INFO] Project: com.nexbytes.icobra', color: vsColors.text },
    { text: '[INFO] Shizuku version: 13.5.4', color: vsColors.text },
    { text: '[INFO] Android SDK 34 detected (compileSdk 34)', color: vsColors.text },
    { text: '[INFO] Gradle 8.2 detected', color: vsColors.text },
    { text: '[INFO] Kotlin 1.9.22 detected', color: vsColors.text },
    { text: '[INFO] AGP 8.1.4 detected', color: vsColors.text },
    { text: '[INFO] minSdk 26, targetSdk 34', color: vsColors.text },
    { text: '[INFO] Build variant: debug', color: vsColors.text },
    { text: '[SUCCESS] Configuration complete — ready for development', color: vsColors.success },
  ];
  return (
    <ScrollView style={styles.logView} showsVerticalScrollIndicator={false}>
      {lines.map((l, i) => (
        <Text key={i} style={[styles.logLine, { color: l.color }]}>{l.text}</Text>
      ))}
    </ScrollView>
  );
}

function DebugConsoleView() {
  const lines = [
    { text: 'Debugger listening on Shizuku IPC bridge', color: vsColors.textDim },
    { text: 'D/ShizukuService: addBinderReceivedListenerSticky called', color: vsColors.textDim },
    { text: 'D/ShizukuService: Binder received — Shizuku is running', color: vsColors.success },
    { text: 'I/MainActivity: Shizuku permission check: PERMISSION_GRANTED (0)', color: vsColors.text },
    { text: 'I/MainActivity: onPermissionGranted() called', color: vsColors.text },
    { text: 'D/ShizukuService: isInitialized = true', color: vsColors.text },
    { text: 'I/ShizukuService: executeCommand("getprop ro.build.version.sdk")', color: vsColors.text },
    { text: 'I/ShizukuService: result = "34"', color: vsColors.accent },
    { text: 'I/System.out: App initialized successfully', color: vsColors.success },
    { text: 'W/MainActivity: Battery optimization may affect background services', color: vsColors.warning },
  ];
  return (
    <View style={styles.logView}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {lines.map((l, i) => (
          <Text key={i} style={[styles.logLine, { color: l.color }]}>{l.text}</Text>
        ))}
      </ScrollView>
      <View style={styles.debugInputRow}>
        <Text style={styles.debugPromptChar}>{'>'}</Text>
        <Text style={styles.debugInputHint}>Evaluate expression...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 230,
    backgroundColor: vsColors.panelBg,
    borderTopWidth: 1,
    borderTopColor: vsColors.border,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 35,
    backgroundColor: vsColors.panelHeaderBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  tabs: {
    flex: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 35,
    gap: 5,
    borderTopWidth: 2,
    borderTopColor: 'transparent',
  },
  tabActive: {
    borderTopColor: vsColors.accent,
    backgroundColor: vsColors.panelBg,
  },
  tabLabel: {
    fontSize: 11,
    color: vsColors.textDim,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  tabLabelActive: { color: vsColors.text },
  badge: {
    backgroundColor: vsColors.border,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeActive: { backgroundColor: vsColors.warning },
  badgeText: { fontSize: 10, color: '#000', fontWeight: '700' },
  panelActions: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  actionBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  logView: { flex: 1, padding: 8 },
  logLine: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  debugInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: vsColors.border,
  },
  debugPromptChar: { fontSize: 13, color: vsColors.accent, fontWeight: '700' },
  debugInputHint: { fontSize: 12, color: vsColors.textDisabled },
});
