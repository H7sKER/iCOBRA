import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import vsColors from '@/constants/vsColors';
import { useEditor } from '@/context/EditorContext';
import { generateTodoList } from '@/utils/codeUtils';

type TaskType = 'TODO' | 'FIXME' | 'HACK' | 'BUG' | 'NOTE' | 'XXX' | 'REVIEW';

const TYPE_COLOR: Record<TaskType, string> = {
  TODO: vsColors.accent,
  FIXME: vsColors.warning,
  HACK: '#C586C0',
  BUG: vsColors.error,
  NOTE: vsColors.textDim,
  XXX: vsColors.error,
  REVIEW: '#4EC9B0',
};

const STATIC_TASKS = [
  { type: 'TODO' as TaskType, message: 'Add proper error handling for Shizuku binder death', file: 'ShizukuService.kt', line: 149 },
  { type: 'FIXME' as TaskType, message: 'Handle pre-V11 Shizuku gracefully instead of returning', file: 'MainActivity.kt', line: 76 },
  { type: 'TODO' as TaskType, message: 'Implement initializeApp() with full Shizuku IPC setup', file: 'MainActivity.kt', line: 95 },
  { type: 'HACK' as TaskType, message: 'Using Runtime.exec as fallback, should use Shizuku API', file: 'Utils.kt', line: 214 },
  { type: 'TODO' as TaskType, message: 'Add unit tests for formatFileSize edge cases', file: 'Utils.kt', line: 232 },
  { type: 'NOTE' as TaskType, message: 'ShizukuProvider requires INTERACT_ACROSS_USERS_FULL permission', file: 'AndroidManifest.xml', line: 14 },
  { type: 'REVIEW' as TaskType, message: 'Check if compileSdk 34 is latest stable, consider upgrading to 35', file: 'build.gradle', line: 8 },
  { type: 'BUG' as TaskType, message: 'getDeviceProperties() can crash if getprop output is malformed', file: 'ShizukuService.kt', line: 182 },
  { type: 'FIXME' as TaskType, message: 'Exception catch block loses original stack trace', file: 'ShizukuService.kt', line: 163 },
  { type: 'TODO' as TaskType, message: 'Add permission rationale dialog with proper UI', file: 'MainActivity.kt', line: 99 },
];

export default function TaskListPanel() {
  const { openFiles } = useEditor();
  const [filter, setFilter] = useState<TaskType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'type' | 'file'>('type');

  const allTasks = STATIC_TASKS;
  const filtered = filter === 'ALL' ? allTasks : allTasks.filter(t => t.type === filter);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'file') return a.file.localeCompare(b.file);
    return a.type.localeCompare(b.type);
  });

  const counts = STATIC_TASKS.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>TASK LIST</Text>
        <Pressable style={styles.sortBtn} onPress={() => setSortBy(s => s === 'type' ? 'file' : 'type')}>
          <Feather name="list" size={13} color={vsColors.textDim} />
          <Text style={styles.sortText}>Sort: {sortBy}</Text>
        </Pressable>
        <Pressable style={styles.toolBtn}>
          <Feather name="refresh-cw" size={13} color={vsColors.textDim} />
        </Pressable>
      </View>

      {/* Type filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        <Pressable
          style={[styles.filterPill, filter === 'ALL' && styles.filterPillActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterPillText, filter === 'ALL' && styles.filterPillTextActive]}>
            All ({STATIC_TASKS.length})
          </Text>
        </Pressable>
        {(Object.keys(TYPE_COLOR) as TaskType[]).map(t => (
          counts[t] ? (
            <Pressable
              key={t}
              style={[styles.filterPill, filter === t && styles.filterPillActive, { borderColor: TYPE_COLOR[t] + '66' }]}
              onPress={() => setFilter(f => f === t ? 'ALL' : t)}
            >
              <Text style={[styles.filterPillText, { color: TYPE_COLOR[t] }, filter === t && styles.filterPillTextActive]}>
                {t} ({counts[t]})
              </Text>
            </Pressable>
          ) : null
        ))}
      </ScrollView>

      {/* Column header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { width: 60 }]}>Type</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Description</Text>
        <Text style={[styles.headerCell, { width: 80 }]}>File</Text>
        <Text style={[styles.headerCell, { width: 40 }]}>Line</Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {sorted.map((task, i) => (
          <Pressable key={i} style={styles.taskRow}>
            <View style={[styles.typeBadge, { backgroundColor: TYPE_COLOR[task.type] + '22', borderColor: TYPE_COLOR[task.type] + '66' }]}>
              <Text style={[styles.typeText, { color: TYPE_COLOR[task.type] }]}>{task.type}</Text>
            </View>
            <Text style={styles.message} numberOfLines={2}>{task.message}</Text>
            <Text style={styles.file} numberOfLines={1}>{task.file}</Text>
            <Text style={styles.lineNum}>{task.line}</Text>
          </Pressable>
        ))}
        {sorted.length === 0 && (
          <View style={styles.empty}>
            <Feather name="check-circle" size={28} color={vsColors.success} />
            <Text style={styles.emptyText}>No tasks found</Text>
          </View>
        )}
      </ScrollView>

      {/* Summary footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {sorted.length} task{sorted.length !== 1 ? 's' : ''} in {[...new Set(sorted.map(t => t.file))].length} file{[...new Set(sorted.map(t => t.file))].length !== 1 ? 's' : ''}
        </Text>
        <Text style={[styles.footerText, { color: vsColors.error }]}>
          {counts['BUG'] ?? 0} bugs
        </Text>
        <Text style={[styles.footerText, { color: vsColors.warning }]}>
          {counts['FIXME'] ?? 0} fixmes
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vsColors.panelBg },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: vsColors.sidebarBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
    gap: 6,
  },
  toolbarTitle: { flex: 1, fontSize: 10, color: vsColors.textDim, fontWeight: '700', letterSpacing: 1 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { fontSize: 11, color: vsColors.textDim },
  toolBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  filterPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: vsColors.border,
    marginRight: 6,
  },
  filterPillActive: { backgroundColor: vsColors.selection },
  filterPillText: { fontSize: 11, color: vsColors.textDim },
  filterPillTextActive: { fontWeight: '700' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: vsColors.panelHeaderBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
    gap: 8,
  },
  headerCell: { fontSize: 11, color: vsColors.textDim, fontWeight: '700' },
  list: { flex: 1 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border + '22',
    gap: 8,
  },
  typeBadge: {
    width: 52,
    borderRadius: 3,
    borderWidth: 1,
    paddingVertical: 1,
    paddingHorizontal: 3,
    alignItems: 'center',
  },
  typeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  message: { flex: 1, fontSize: 12, color: vsColors.text, lineHeight: 16 },
  file: { width: 80, fontSize: 11, color: vsColors.textDim, fontFamily: 'monospace' },
  lineNum: { width: 32, fontSize: 11, color: vsColors.textDim, textAlign: 'right' },
  empty: { alignItems: 'center', paddingTop: 30, gap: 8 },
  emptyText: { fontSize: 13, color: vsColors.textDim },
  footer: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: vsColors.panelHeaderBg,
    borderTopWidth: 1,
    borderTopColor: vsColors.border,
  },
  footerText: { fontSize: 11, color: vsColors.textDim },
});
