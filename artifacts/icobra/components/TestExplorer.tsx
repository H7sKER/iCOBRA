import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import vsColors from '@/constants/vsColors';
import { testSuites, getTestStats, TestSuite, TestCase, TestStatus } from '@/data/testData';

const STATUS_COLOR: Record<TestStatus, string> = {
  passed: vsColors.success,
  failed: vsColors.error,
  skipped: vsColors.warning,
  running: vsColors.accent,
  pending: vsColors.textDim,
};

const STATUS_ICON: Record<TestStatus, keyof typeof Feather.glyphMap> = {
  passed: 'check-circle',
  failed: 'x-circle',
  skipped: 'skip-forward',
  running: 'loader',
  pending: 'circle',
};

function TestCaseRow({ test, onRun }: { test: TestCase; onRun: () => void }) {
  const [expanded, setExpanded] = useState(!!test.error);
  return (
    <View>
      <Pressable
        style={styles.testCaseRow}
        onPress={() => test.error ? setExpanded(v => !v) : null}
        onLongPress={onRun}
      >
        <View style={{ width: 28 }} />
        <Feather name={STATUS_ICON[test.status]} size={13} color={STATUS_COLOR[test.status]} />
        <Text style={[styles.testName, test.status === 'failed' && { color: vsColors.error }]} numberOfLines={1}>
          {test.name}
        </Text>
        {test.duration !== undefined && (
          <Text style={styles.duration}>{test.duration}ms</Text>
        )}
        <Pressable style={styles.runBtn} onPress={onRun}>
          <Feather name="play" size={11} color={vsColors.textDim} />
        </Pressable>
      </Pressable>
      {expanded && test.error && (
        <View style={styles.errorBlock}>
          <Text style={styles.errorText}>{test.error}</Text>
          <Text style={styles.errorLine}>at line {test.line}</Text>
        </View>
      )}
    </View>
  );
}

function TestSuiteRow({ suite }: { suite: TestSuite }) {
  const [expanded, setExpanded] = useState(suite.status === 'failed');
  const passedCount = suite.tests.filter(t => t.status === 'passed').length;
  const failedCount = suite.tests.filter(t => t.status === 'failed').length;

  return (
    <View>
      <Pressable style={styles.suiteRow} onPress={() => setExpanded(v => !v)}>
        <Feather name={expanded ? 'chevron-down' : 'chevron-right'} size={14} color={vsColors.textDim} />
        <Feather name={STATUS_ICON[suite.status]} size={14} color={STATUS_COLOR[suite.status]} />
        <Text style={styles.suiteName} numberOfLines={1}>{suite.name}</Text>
        <Text style={styles.suiteStats}>
          <Text style={{ color: vsColors.success }}>{passedCount}</Text>
          {failedCount > 0 && <Text style={{ color: vsColors.error }}> / {failedCount}</Text>}
          {suite.totalDuration !== undefined && <Text style={{ color: vsColors.textDim }}> ({suite.totalDuration}ms)</Text>}
        </Text>
        <Pressable style={styles.runBtn}>
          <Feather name="play" size={11} color={vsColors.textDim} />
        </Pressable>
      </Pressable>
      {expanded && (
        <View style={styles.testList}>
          {suite.tests.map(test => (
            <TestCaseRow key={test.id} test={test} onRun={() => {}} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function TestExplorer() {
  const [suites, setSuites] = useState(testSuites);
  const [filter, setFilter] = useState<'all' | 'failed' | 'passed'>('all');
  const stats = getTestStats(suites);

  const filteredSuites = filter === 'all' ? suites
    : filter === 'failed' ? suites.filter(s => s.status === 'failed')
    : suites.filter(s => s.status === 'passed');

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <Pressable style={styles.runAllBtn}>
          <Feather name="play" size={13} color={vsColors.text} />
          <Text style={styles.runAllText}>Run All</Text>
        </Pressable>
        <Pressable style={styles.toolBtn}>
          <Feather name="refresh-cw" size={13} color={vsColors.textDim} />
        </Pressable>
        <Pressable style={styles.toolBtn}>
          <Feather name="filter" size={13} color={vsColors.textDim} />
        </Pressable>
        <Pressable style={styles.toolBtn}>
          <Feather name="more-vertical" size={13} color={vsColors.textDim} />
        </Pressable>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        {[
          { label: 'Passed', count: stats.passed, color: vsColors.success, filter: 'passed' as const },
          { label: 'Failed', count: stats.failed, color: vsColors.error, filter: 'failed' as const },
          { label: 'Skipped', count: stats.skipped, color: vsColors.warning },
          { label: 'Pending', count: stats.pending, color: vsColors.textDim },
        ].map(s => (
          <Pressable
            key={s.label}
            style={[styles.statItem, 'filter' in s && filter === s.filter && styles.statItemActive]}
            onPress={() => 'filter' in s ? setFilter((f) => { const sf = (s as any).filter as 'all' | 'failed' | 'passed'; return f === sf ? 'all' : sf; }) : null}
          >
            <Text style={[styles.statCount, { color: s.color }]}>{s.count}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Pressable>
        ))}
        <View style={styles.statSeparator} />
        <Text style={styles.totalTests}>{stats.total} tests</Text>
      </View>

      {/* Test tree */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredSuites.map(suite => (
          <TestSuiteRow key={suite.id} suite={suite} />
        ))}
      </ScrollView>

      {/* Coverage bar */}
      <View style={styles.coverageBar}>
        <Text style={styles.coverageLabel}>Code Coverage</Text>
        <View style={styles.coverageTrack}>
          <View style={[styles.coverageFill, { width: `${Math.round((stats.passed / stats.total) * 100)}%` as any }]} />
        </View>
        <Text style={styles.coveragePct}>
          {Math.round((stats.passed / stats.total) * 100)}%
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
    gap: 4,
  },
  runAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: vsColors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
    marginRight: 4,
  },
  runAllText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  toolBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: vsColors.panelHeaderBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  statItemActive: { backgroundColor: vsColors.selection },
  statCount: { fontSize: 13, fontWeight: '700' },
  statLabel: { fontSize: 11, color: vsColors.textDim },
  statSeparator: { flex: 1 },
  totalTests: { fontSize: 11, color: vsColors.textDim },
  list: { flex: 1 },
  suiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
    backgroundColor: vsColors.sidebarBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  suiteName: { flex: 1, fontSize: 13, color: vsColors.text, fontWeight: '600' },
  suiteStats: { fontSize: 11 },
  runBtn: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  testList: { backgroundColor: vsColors.panelBg },
  testCaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border + '22',
  },
  testName: { flex: 1, fontSize: 12, color: vsColors.text, fontFamily: 'monospace' },
  duration: { fontSize: 11, color: vsColors.textDim },
  errorBlock: {
    backgroundColor: vsColors.error + '11',
    borderLeftWidth: 3,
    borderLeftColor: vsColors.error,
    marginLeft: 36,
    marginRight: 8,
    padding: 8,
    marginBottom: 4,
  },
  errorText: { fontSize: 11, color: vsColors.error, fontFamily: 'monospace' },
  errorLine: { fontSize: 10, color: vsColors.textDim, marginTop: 4 },
  coverageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
    backgroundColor: vsColors.panelHeaderBg,
    borderTopWidth: 1,
    borderTopColor: vsColors.border,
  },
  coverageLabel: { fontSize: 11, color: vsColors.textDim },
  coverageTrack: {
    flex: 1,
    height: 6,
    backgroundColor: vsColors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  coverageFill: { height: '100%', backgroundColor: vsColors.success, borderRadius: 3 },
  coveragePct: { fontSize: 11, color: vsColors.success, fontWeight: '700' },
});
