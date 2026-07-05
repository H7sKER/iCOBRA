import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import vsColors from '@/constants/vsColors';

interface Problem {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  file: string;
  line: number;
  col: number;
  source: string;
}

const PROBLEMS: Problem[] = [
  { id: '1', type: 'warning', message: 'Variable \'isInitialized\' is never read', file: 'ShizukuService.kt', line: 12, col: 20, source: 'Kotlin' },
  { id: '2', type: 'warning', message: 'Unused import: android.os.Bundle', file: 'MainActivity.kt', line: 3, col: 1, source: 'Kotlin' },
  { id: '3', type: 'info', message: 'Consider using \'data class\' for simple value holder', file: 'Utils.kt', line: 45, col: 8, source: 'Kotlin' },
  { id: '4', type: 'warning', message: 'Hardcoded string "Error: " should use @string resource', file: 'ShizukuService.kt', line: 38, col: 20, source: 'Android Lint' },
  { id: '5', type: 'info', message: 'Target API level should be updated to 35', file: 'build.gradle', line: 8, col: 5, source: 'Android Lint' },
];

const ICON: Record<string, keyof typeof Feather.glyphMap> = {
  error: 'x-circle',
  warning: 'alert-triangle',
  info: 'info',
};
const COLOR: Record<string, string> = {
  error: vsColors.error,
  warning: vsColors.warning,
  info: vsColors.info,
};

export default function ProblemsView() {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const errors = PROBLEMS.filter(p => p.type === 'error').length;
  const warnings = PROBLEMS.filter(p => p.type === 'warning').length;
  const infos = PROBLEMS.filter(p => p.type === 'info').length;

  const filtered = PROBLEMS.filter(p => filter === 'all' || p.type === filter);

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        {(['all', 'error', 'warning', 'info'] as const).map(f => (
          <Pressable
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            {f !== 'all' && (
              <Feather name={ICON[f]} size={12} color={filter === f ? COLOR[f] : vsColors.textDim} />
            )}
            <Text style={[styles.filterText, filter === f && { color: vsColors.text }]}>
              {f === 'all' ? `All (${PROBLEMS.length})` :
               f === 'error' ? `Errors (${errors})` :
               f === 'warning' ? `Warnings (${warnings})` :
               `Info (${infos})`}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map(p => (
          <Pressable key={p.id} style={styles.row}>
            <Feather name={ICON[p.type]} size={14} color={COLOR[p.type]} />
            <View style={styles.rowContent}>
              <Text style={styles.message}>{p.message}</Text>
              <Text style={styles.location}>
                {p.file} [{p.line}, {p.col}]  {p.source}
              </Text>
            </View>
          </Pressable>
        ))}
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Feather name="check-circle" size={28} color={vsColors.success} />
            <Text style={styles.emptyText}>No problems detected</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vsColors.panelBg },
  filterBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
    paddingHorizontal: 4,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterBtnActive: { borderBottomColor: vsColors.accent },
  filterText: { fontSize: 12, color: vsColors.textDim },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border + '44',
  },
  rowContent: { flex: 1, gap: 2 },
  message: { fontSize: 13, color: vsColors.text },
  location: { fontSize: 11, color: vsColors.textDim },
  empty: { alignItems: 'center', paddingTop: 30, gap: 8 },
  emptyText: { fontSize: 13, color: vsColors.textDim },
});
