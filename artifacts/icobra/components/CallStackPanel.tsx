import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import vsColors from '@/constants/vsColors';

interface StackFrame {
  id: string;
  name: string;
  file: string;
  line: number;
  column: number;
  isExternal?: boolean;
  isCurrent?: boolean;
  thread?: string;
}

const CALL_STACK: StackFrame[] = [
  { id: 'f1', name: 'onRequestPermissionsResult', file: 'MainActivity.kt', line: 108, column: 9, isCurrent: true },
  { id: 'f2', name: 'onPermissionGranted', file: 'MainActivity.kt', line: 89, column: 5 },
  { id: 'f3', name: 'initializeApp', file: 'MainActivity.kt', line: 94, column: 9 },
  { id: 'f4', name: 'initialize', file: 'ShizukuService.kt', line: 136, column: 9 },
  { id: 'f5', name: 'addBinderReceivedListenerSticky', file: 'Shizuku.java', line: 245, column: 5, isExternal: true },
  { id: 'f6', name: 'dispatchEvent', file: 'EventBus.java', line: 89, column: 13, isExternal: true },
  { id: 'f7', name: 'onCreate', file: 'MainActivity.kt', line: 67, column: 9, isExternal: true },
  { id: 'f8', name: 'performCreate', file: 'Activity.java', line: 8051, column: 19, isExternal: true },
  { id: 'f9', name: 'callActivityOnCreate', file: 'Instrumentation.java', line: 1327, column: 12, isExternal: true },
];

const THREADS = [
  { id: 't1', name: 'main', status: 'suspended', isCurrent: true },
  { id: 't2', name: 'OkHttp Dispatcher', status: 'running', isCurrent: false },
  { id: 't3', name: 'Coroutine #1', status: 'suspended', isCurrent: false },
];

export default function CallStackPanel() {
  const [selectedFrame, setSelectedFrame] = useState('f1');
  const [showExternalFrames, setShowExternalFrames] = useState(false);
  const [activeThread, setActiveThread] = useState('t1');

  const visibleFrames = showExternalFrames
    ? CALL_STACK
    : CALL_STACK.filter(f => !f.isExternal);

  return (
    <View style={styles.container}>
      {/* Thread selector */}
      <View style={styles.threadBar}>
        <Feather name="cpu" size={12} color={vsColors.textDim} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {THREADS.map(t => (
            <Pressable
              key={t.id}
              style={[styles.threadPill, t.isCurrent && styles.threadPillActive]}
              onPress={() => setActiveThread(t.id)}
            >
              <View style={[styles.threadStatusDot, { backgroundColor: t.status === 'running' ? vsColors.success : vsColors.warning }]} />
              <Text style={[styles.threadName, t.isCurrent && styles.threadNameActive]}>{t.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>CALL STACK</Text>
        <Pressable style={styles.filterBtn} onPress={() => setShowExternalFrames(v => !v)}>
          <Feather name="eye" size={12} color={showExternalFrames ? vsColors.accent : vsColors.textDim} />
          <Text style={[styles.filterText, showExternalFrames && { color: vsColors.accent }]}>
            {showExternalFrames ? 'Hide External' : 'Show External'}
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.list}>
        {visibleFrames.map((frame, idx) => (
          <Pressable
            key={frame.id}
            style={[styles.frame, selectedFrame === frame.id && styles.frameSelected, frame.isExternal && styles.frameExternal]}
            onPress={() => setSelectedFrame(frame.id)}
          >
            {/* Arrow indicator for current frame */}
            <View style={styles.frameIndicator}>
              {frame.isCurrent && <Feather name="arrow-right" size={12} color={vsColors.accent} />}
              {idx === 0 && !frame.isCurrent && <View style={styles.frameDot} />}
            </View>

            <View style={styles.frameContent}>
              <Text style={[styles.frameName, frame.isExternal && styles.frameNameExternal]} numberOfLines={1}>
                {frame.name}
              </Text>
              <Text style={[styles.frameLocation, frame.isExternal && styles.frameLocationExternal]} numberOfLines={1}>
                {frame.file}:{frame.line}
              </Text>
            </View>

            {frame.isExternal && (
              <View style={styles.externalBadge}>
                <Text style={styles.externalBadgeText}>ext</Text>
              </View>
            )}
          </Pressable>
        ))}

        {!showExternalFrames && CALL_STACK.filter(f => f.isExternal).length > 0 && (
          <Pressable style={styles.showMoreBtn} onPress={() => setShowExternalFrames(true)}>
            <Feather name="chevron-down" size={12} color={vsColors.accent} />
            <Text style={styles.showMoreText}>
              Show {CALL_STACK.filter(f => f.isExternal).length} external frames
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vsColors.panelBg },
  threadBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: vsColors.sidebarBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
    gap: 6,
  },
  threadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: vsColors.border,
    marginRight: 6,
  },
  threadPillActive: { borderColor: vsColors.accent, backgroundColor: vsColors.accent + '22' },
  threadStatusDot: { width: 6, height: 6, borderRadius: 3 },
  threadName: { fontSize: 11, color: vsColors.textDim },
  threadNameActive: { color: vsColors.accent },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: vsColors.panelHeaderBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  toolbarTitle: { fontSize: 10, color: vsColors.textDim, fontWeight: '700', letterSpacing: 1 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterText: { fontSize: 11, color: vsColors.textDim },
  list: { flex: 1 },
  frame: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingRight: 8,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border + '22',
    gap: 6,
  },
  frameSelected: { backgroundColor: vsColors.selection },
  frameExternal: { opacity: 0.7 },
  frameIndicator: { width: 20, alignItems: 'center' },
  frameDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: vsColors.textDim },
  frameContent: { flex: 1, gap: 1 },
  frameName: { fontSize: 13, color: vsColors.text, fontFamily: 'monospace' },
  frameNameExternal: { color: vsColors.textDim },
  frameLocation: { fontSize: 11, color: vsColors.textDim },
  frameLocationExternal: { color: vsColors.textDisabled },
  externalBadge: {
    backgroundColor: vsColors.border,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  externalBadgeText: { fontSize: 9, color: vsColors.textDim },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  showMoreText: { fontSize: 12, color: vsColors.accent },
});
