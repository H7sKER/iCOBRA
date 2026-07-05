import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import vsColors from '@/constants/vsColors';
import { useEditor } from '@/context/EditorContext';
import WatchPanel from './WatchPanel';
import LocalsPanel from './LocalsPanel';
import CallStackPanel from './CallStackPanel';
import BreakpointsPanel from './BreakpointsPanel';
import ImmediateWindow from './ImmediateWindow';

type DebugSubTab = 'locals' | 'watch' | 'callstack' | 'breakpoints' | 'immediate';

const DEBUG_CONFIGS = [
  'Launch iCOBRA (Android)',
  'Attach to Process',
  'Launch on Device',
  'Debug Unit Tests',
];

export default function DebugPanel() {
  const { breakpoints, setBottomPanel } = useEditor();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(DEBUG_CONFIGS[0]);
  const [showConfigPicker, setShowConfigPicker] = useState(false);
  const [subTab, setSubTab] = useState<DebugSubTab>('locals');
  const [debugLine, setDebugLine] = useState<number | null>(null);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    setDebugLine(null);
    setBottomPanel('debug-console');
  };

  const handlePause = () => {
    setIsPaused(v => !v);
    if (!isPaused) setDebugLine(42);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setDebugLine(null);
  };

  const SUB_TABS: { id: DebugSubTab; label: string; count?: number }[] = [
    { id: 'locals', label: 'Variables' },
    { id: 'watch', label: 'Watch' },
    { id: 'callstack', label: 'Call Stack' },
    { id: 'breakpoints', label: 'Breakpoints', count: breakpoints.length },
    { id: 'immediate', label: 'Immediate' },
  ];

  const renderSubPanel = () => {
    switch (subTab) {
      case 'locals': return <LocalsPanel />;
      case 'watch': return <WatchPanel />;
      case 'callstack': return <CallStackPanel />;
      case 'breakpoints': return <BreakpointsPanel />;
      case 'immediate': return <ImmediateWindow />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>RUN AND DEBUG</Text>
        <Pressable style={styles.helpBtn}>
          <Feather name="help-circle" size={14} color={vsColors.textDim} />
        </Pressable>
      </View>

      {/* Debug toolbar */}
      <View style={styles.toolbar}>
        {/* Play/Pause/Stop */}
        <Pressable
          style={[styles.toolBtn, !isRunning && styles.toolBtnGreen]}
          onPress={isRunning ? handlePause : handleStart}
          disabled={isRunning && !isPaused && false}
        >
          <Feather
            name={isRunning && !isPaused ? 'pause' : 'play'}
            size={14}
            color={isRunning ? vsColors.warning : vsColors.success}
          />
        </Pressable>
        <Pressable
          style={[styles.toolBtn, isRunning && isPaused && styles.toolBtnActive]}
          onPress={handlePause}
          disabled={!isRunning}
        >
          <Feather name="skip-forward" size={14} color={isRunning ? vsColors.text : vsColors.textDisabled} />
        </Pressable>
        <Pressable style={styles.toolBtn} onPress={handleStop}>
          <Feather name="square" size={14} color={isRunning ? vsColors.error : vsColors.textDisabled} />
        </Pressable>
        <Pressable style={styles.toolBtn}>
          <Feather name="refresh-cw" size={14} color={isRunning ? vsColors.text : vsColors.textDisabled} />
        </Pressable>
        <View style={styles.toolSep} />

        {/* Step controls */}
        <Pressable style={styles.toolBtn}>
          <Feather name="arrow-right" size={14} color={isPaused ? vsColors.text : vsColors.textDisabled} />
        </Pressable>
        <Pressable style={styles.toolBtn}>
          <Feather name="arrow-down" size={14} color={isPaused ? vsColors.text : vsColors.textDisabled} />
        </Pressable>
        <Pressable style={styles.toolBtn}>
          <Feather name="arrow-up" size={14} color={isPaused ? vsColors.text : vsColors.textDisabled} />
        </Pressable>
        <View style={styles.toolSep} />

        {/* Exception */}
        <Pressable style={styles.toolBtn}>
          <Feather name="alert-triangle" size={14} color={vsColors.textDim} />
        </Pressable>
      </View>

      {/* Status bar for debug state */}
      {isRunning && (
        <View style={[styles.statusBanner, { backgroundColor: isPaused ? vsColors.warning + '33' : vsColors.success + '22' }]}>
          <Feather name={isPaused ? 'pause-circle' : 'loader'} size={12} color={isPaused ? vsColors.warning : vsColors.success} />
          <Text style={[styles.statusText, { color: isPaused ? vsColors.warning : vsColors.success }]}>
            {isPaused ? `Paused at MainActivity.kt:${debugLine}` : 'Running — iCOBRA debug session active'}
          </Text>
        </View>
      )}

      {/* Config selector */}
      <View style={styles.configRow}>
        <Pressable style={styles.configSelector} onPress={() => setShowConfigPicker(v => !v)}>
          <Feather name="play" size={12} color={vsColors.success} />
          <Text style={styles.configText} numberOfLines={1}>{selectedConfig}</Text>
          <Feather name="chevron-down" size={12} color={vsColors.textDim} />
        </Pressable>
        <Pressable style={styles.configAdd}>
          <Feather name="settings" size={14} color={vsColors.textDim} />
        </Pressable>
      </View>

      {/* Config picker */}
      {showConfigPicker && (
        <View style={styles.configPicker}>
          {DEBUG_CONFIGS.map(c => (
            <Pressable
              key={c}
              style={[styles.configPickerItem, selectedConfig === c && styles.configPickerItemActive]}
              onPress={() => { setSelectedConfig(c); setShowConfigPicker(false); }}
            >
              <Feather name="play" size={11} color={selectedConfig === c ? vsColors.accent : vsColors.textDim} />
              <Text style={[styles.configPickerText, selectedConfig === c && styles.configPickerTextActive]}>{c}</Text>
            </Pressable>
          ))}
          <Pressable style={[styles.configPickerItem, { borderTopWidth: 1, borderTopColor: vsColors.border }]}>
            <Feather name="plus" size={11} color={vsColors.accent} />
            <Text style={[styles.configPickerText, { color: vsColors.accent }]}>Add Configuration...</Text>
          </Pressable>
        </View>
      )}

      {/* Sub-tabs: Variables / Watch / Call Stack / Breakpoints / Immediate */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabBar}>
        {SUB_TABS.map(t => (
          <Pressable
            key={t.id}
            style={[styles.subTab, subTab === t.id && styles.subTabActive]}
            onPress={() => setSubTab(t.id)}
          >
            <Text style={[styles.subTabText, subTab === t.id && styles.subTabTextActive]}>{t.label}</Text>
            {t.count !== undefined && t.count > 0 && (
              <View style={styles.subTabBadge}>
                <Text style={styles.subTabBadgeText}>{t.count}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>

      {/* Sub-panel content */}
      <View style={styles.subPanel}>
        {!isRunning && subTab !== 'breakpoints' && subTab !== 'immediate' ? (
          <View style={styles.notRunning}>
            <Feather name="play-circle" size={32} color={vsColors.textDisabled} />
            <Text style={styles.notRunningText}>Not running</Text>
            <Text style={styles.notRunningHint}>Start debugging to see {subTab}</Text>
            <Pressable style={styles.startDebugBtn} onPress={handleStart}>
              <Feather name="play" size={13} color='#fff' />
              <Text style={styles.startDebugText}>Start Debugging (F5)</Text>
            </Pressable>
          </View>
        ) : (
          renderSubPanel()
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vsColors.sidebarBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerTitle: { fontSize: 11, fontWeight: '700', color: vsColors.textDim, letterSpacing: 1 },
  helpBtn: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
    gap: 2,
    backgroundColor: vsColors.panelHeaderBg,
  },
  toolBtn: {
    width: 28,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
  },
  toolBtnGreen: { borderWidth: 1, borderColor: vsColors.success + '55' },
  toolBtnActive: { backgroundColor: vsColors.selection },
  toolSep: { width: 1, height: 16, backgroundColor: vsColors.border, marginHorizontal: 3 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  statusText: { fontSize: 12, fontFamily: 'monospace', flex: 1 },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  configSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: vsColors.inputBg,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  configText: { flex: 1, fontSize: 12, color: vsColors.text },
  configAdd: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  configPicker: {
    backgroundColor: vsColors.dropdownBg,
    borderWidth: 1,
    borderColor: vsColors.border,
    marginHorizontal: 8,
    borderRadius: 4,
    elevation: 10,
  },
  configPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  configPickerItemActive: { backgroundColor: vsColors.selection },
  configPickerText: { fontSize: 13, color: vsColors.text },
  configPickerTextActive: { color: vsColors.accent },
  subTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
    backgroundColor: vsColors.panelHeaderBg,
  },
  subTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 4,
  },
  subTabActive: { borderBottomColor: vsColors.accent },
  subTabText: { fontSize: 11, color: vsColors.textDim, fontWeight: '600' },
  subTabTextActive: { color: vsColors.text },
  subTabBadge: {
    backgroundColor: vsColors.accent,
    borderRadius: 8,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  subTabBadgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  subPanel: { flex: 1, overflow: 'hidden' },
  notRunning: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  notRunningText: { fontSize: 14, color: vsColors.textDim, fontWeight: '600' },
  notRunningHint: { fontSize: 12, color: vsColors.textDisabled, textAlign: 'center' },
  startDebugBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: vsColors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  startDebugText: { fontSize: 13, color: '#fff', fontWeight: '700' },
});
