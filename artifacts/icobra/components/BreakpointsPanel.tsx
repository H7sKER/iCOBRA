import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import vsColors from '@/constants/vsColors';
import { useEditor } from '@/context/EditorContext';

interface ExtendedBreakpoint {
  id: string;
  file: string;
  line: number;
  enabled: boolean;
  type: 'line' | 'conditional' | 'function' | 'logpoint' | 'exception';
  condition?: string;
  logMessage?: string;
  hitCount?: number;
  functionName?: string;
}

const EXCEPTION_BREAKPOINTS = [
  { id: 'ex1', name: 'All Exceptions', enabled: false },
  { id: 'ex2', name: 'Uncaught Exceptions', enabled: true },
  { id: 'ex3', name: 'RuntimeException', enabled: false },
  { id: 'ex4', name: 'NullPointerException', enabled: false },
  { id: 'ex5', name: 'SecurityException', enabled: true },
];

const FUNCTION_BREAKPOINTS: ExtendedBreakpoint[] = [
  { id: 'fb1', file: '', line: 0, enabled: true, type: 'function', functionName: 'ShizukuService.executeCommand' },
  { id: 'fb2', file: '', line: 0, enabled: false, type: 'function', functionName: 'MainActivity.checkShizukuPermission' },
];

export default function BreakpointsPanel() {
  const { breakpoints, toggleBreakpoint } = useEditor();
  const [exceptionBps, setExceptionBps] = useState(EXCEPTION_BREAKPOINTS);
  const [functionBps, setFunctionBps] = useState(FUNCTION_BREAKPOINTS);

  const toggleException = (id: string) => {
    setExceptionBps(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e));
  };
  const toggleFunctionBp = (id: string) => {
    setFunctionBps(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>BREAKPOINTS</Text>
        <View style={styles.toolbarActions}>
          <Pressable style={styles.toolBtn}>
            <Feather name="plus" size={13} color={vsColors.textDim} />
          </Pressable>
          <Pressable style={styles.toolBtn}>
            <Feather name="toggle-left" size={13} color={vsColors.textDim} />
          </Pressable>
          <Pressable style={styles.toolBtn}>
            <Feather name="trash-2" size={13} color={vsColors.textDim} />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {/* Line Breakpoints Section */}
        <SectionHeader label={`BREAKPOINTS (${breakpoints.length})`} />
        {breakpoints.length === 0 && (
          <Text style={styles.emptyText}>No line breakpoints set. Click in gutter to add.</Text>
        )}
        {breakpoints.map((bp, i) => (
          <Pressable key={i} style={styles.bpRow}>
            <View style={styles.bpDot} />
            <View style={styles.bpContent}>
              <Text style={styles.bpName}>{bp.fileId}</Text>
              <Text style={styles.bpLocation}>Line {bp.line}</Text>
            </View>
            <Pressable onPress={() => toggleBreakpoint(bp.fileId, bp.line)}>
              <Feather name="x" size={13} color={vsColors.textDim} />
            </Pressable>
          </Pressable>
        ))}

        {/* Function Breakpoints */}
        <SectionHeader label={`FUNCTION BREAKPOINTS (${functionBps.length})`} />
        {functionBps.map(bp => (
          <Pressable key={bp.id} style={styles.bpRow} onPress={() => toggleFunctionBp(bp.id)}>
            <View style={[styles.bpDot, styles.bpDotFunction, !bp.enabled && styles.bpDotDisabled]} />
            <View style={styles.bpContent}>
              <Text style={[styles.bpName, !bp.enabled && styles.bpNameDisabled]}>{bp.functionName}</Text>
              <Text style={styles.bpType}>Function breakpoint</Text>
            </View>
            <Feather name={bp.enabled ? 'check-circle' : 'circle'} size={13} color={bp.enabled ? vsColors.accent : vsColors.textDim} />
          </Pressable>
        ))}

        {/* Exception Breakpoints */}
        <SectionHeader label={`EXCEPTION BREAKPOINTS`} />
        {exceptionBps.map(ep => (
          <Pressable key={ep.id} style={styles.bpRow} onPress={() => toggleException(ep.id)}>
            <View style={[styles.bpDot, styles.bpDotException, !ep.enabled && styles.bpDotDisabled]} />
            <Text style={[styles.bpName, { flex: 1 }, !ep.enabled && styles.bpNameDisabled]}>{ep.name}</Text>
            <View style={[styles.checkbox, ep.enabled && styles.checkboxActive]}>
              {ep.enabled && <Feather name="check" size={10} color={vsColors.accent} />}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vsColors.panelBg },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: vsColors.sidebarBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  toolbarTitle: { fontSize: 10, color: vsColors.textDim, fontWeight: '700', letterSpacing: 1 },
  toolbarActions: { flexDirection: 'row', gap: 2 },
  toolBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  list: { flex: 1 },
  sectionHeader: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: vsColors.panelHeaderBg,
  },
  sectionLabel: { fontSize: 10, color: vsColors.textDim, fontWeight: '700', letterSpacing: 0.8 },
  emptyText: { fontSize: 12, color: vsColors.textDisabled, padding: 12 },
  bpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border + '22',
  },
  bpDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#F44747' },
  bpDotFunction: { backgroundColor: vsColors.accent, borderRadius: 2 },
  bpDotException: { backgroundColor: vsColors.warning, borderRadius: 2 },
  bpDotDisabled: { backgroundColor: vsColors.textDisabled },
  bpContent: { flex: 1, gap: 1 },
  bpName: { fontSize: 12, color: vsColors.text, fontFamily: 'monospace' },
  bpNameDisabled: { color: vsColors.textDim },
  bpType: { fontSize: 10, color: vsColors.textDim },
  bpLocation: { fontSize: 11, color: vsColors.textDim },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: vsColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { borderColor: vsColors.accent },
});
