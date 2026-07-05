import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import vsColors from '@/constants/vsColors';
import { formatBytes, formatDuration } from '@/utils/codeUtils';

interface ProfilerSample {
  time: number;
  cpu: number;
  memory: number;
  threads: number;
  gc: boolean;
}

interface HotMethod {
  name: string;
  className: string;
  inclusive: number;
  exclusive: number;
  calls: number;
}

const HOT_METHODS: HotMethod[] = [
  { name: 'executeCommand', className: 'ShizukuService', inclusive: 34.2, exclusive: 28.1, calls: 47 },
  { name: 'checkSelfPermission', className: 'Shizuku', inclusive: 18.7, exclusive: 18.7, calls: 12 },
  { name: 'readText', className: 'BufferedReader', inclusive: 15.3, exclusive: 15.3, calls: 47 },
  { name: 'initialize', className: 'ShizukuService', inclusive: 12.4, exclusive: 4.3, calls: 1 },
  { name: 'onBinderReceivedListener', className: 'MainActivity', inclusive: 8.1, exclusive: 8.1, calls: 1 },
  { name: 'getDeviceProperties', className: 'ShizukuService', inclusive: 6.0, exclusive: 2.8, calls: 3 },
  { name: 'isPackageInstalled', className: 'ShizukuService', inclusive: 3.5, exclusive: 3.5, calls: 8 },
  { name: 'formatFileSize', className: 'Utils', inclusive: 1.8, exclusive: 1.8, calls: 124 },
];

function MiniChart({ samples, key: _key }: { samples: number[]; key?: string }) {
  const max = Math.max(...samples, 1);
  return (
    <View style={chart.container}>
      {samples.map((v, i) => (
        <View
          key={i}
          style={[chart.bar, { height: `${Math.max(2, (v / max) * 100)}%` as any,
            backgroundColor: v > 70 ? vsColors.error : v > 50 ? vsColors.warning : vsColors.accent }]}
        />
      ))}
    </View>
  );
}

const chart = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', height: 40, gap: 1 },
  bar: { flex: 1, borderRadius: 1 },
});

export default function ProfilerPanel() {
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState<'summary' | 'cpu' | 'memory' | 'hotmethods'>('summary');
  const [cpuSamples, setCpuSamples] = useState<number[]>([12, 28, 45, 67, 52, 38, 71, 84, 63, 41, 29, 38, 55, 72, 66, 44, 31]);
  const [memSamples, setMemSamples] = useState<number[]>([65, 67, 68, 71, 72, 70, 73, 75, 74, 76, 78, 77, 79, 80, 78, 82, 81]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setCpuSamples(prev => {
          const next = [...prev.slice(1), Math.floor(Math.random() * 80 + 10)];
          return next;
        });
        setMemSamples(prev => {
          const last = prev[prev.length - 1];
          const delta = (Math.random() - 0.4) * 3;
          const next = [...prev.slice(1), Math.max(60, Math.min(95, last + delta))];
          return next;
        });
      }, 800);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  const avgCpu = Math.round(cpuSamples.reduce((a, b) => a + b, 0) / cpuSamples.length);
  const peakCpu = Math.max(...cpuSamples);
  const avgMem = Math.round(memSamples[memSamples.length - 1] * 1024 * 1024 * 1.2);
  const peakMem = Math.round(Math.max(...memSamples) * 1024 * 1024 * 1.2);

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <Pressable style={[styles.startBtn, running && styles.stopBtn]} onPress={() => setRunning(v => !v)}>
          <Feather name={running ? 'square' : 'play'} size={13} color={running ? vsColors.error : vsColors.success} />
          <Text style={[styles.startText, running && { color: vsColors.error }]}>{running ? 'Stop' : 'Start'}</Text>
        </Pressable>
        <Pressable style={styles.toolBtn}>
          <Feather name="save" size={13} color={vsColors.textDim} />
        </Pressable>
        <Pressable style={styles.toolBtn}>
          <Feather name="trash-2" size={13} color={vsColors.textDim} />
        </Pressable>
        <View style={styles.flex} />
        {running && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>RECORDING</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['summary', 'cpu', 'memory', 'hotmethods'] as const).map(t => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'hotmethods' ? 'Hot Methods' : t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'summary' && (
          <View style={styles.summaryGrid}>
            <MetricCard label="Avg CPU" value={`${avgCpu}%`} icon="cpu" color={avgCpu > 60 ? vsColors.warning : vsColors.success} />
            <MetricCard label="Peak CPU" value={`${peakCpu}%`} icon="activity" color={peakCpu > 80 ? vsColors.error : vsColors.warning} />
            <MetricCard label="Memory" value={formatBytes(avgMem)} icon="database" color={vsColors.accent} />
            <MetricCard label="Peak Mem" value={formatBytes(peakMem)} icon="hard-drive" color={vsColors.info} />
            <MetricCard label="GC Events" value="3" icon="refresh-ccw" color={vsColors.warning} />
            <MetricCard label="Threads" value="8" icon="git-branch" color={vsColors.textDim} />
          </View>
        )}

        {tab === 'cpu' && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>CPU Usage Over Time</Text>
            <View style={styles.chartArea}>
              <MiniChart samples={cpuSamples} />
            </View>
            <View style={styles.chartLegend}>
              <Text style={styles.chartLegendText}>Avg: {avgCpu}% | Peak: {peakCpu}% | Samples: {cpuSamples.length}</Text>
            </View>
          </View>
        )}

        {tab === 'memory' && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Memory Usage (MB)</Text>
            <View style={styles.chartArea}>
              <MiniChart samples={memSamples} />
            </View>
            <View style={styles.chartLegend}>
              <Text style={styles.chartLegendText}>Current: {formatBytes(avgMem)} | Peak: {formatBytes(peakMem)}</Text>
            </View>
            <View style={styles.memBreakdown}>
              {[
                { label: 'Java Heap', value: '42 MB', color: vsColors.accent },
                { label: 'Native', value: '28 MB', color: vsColors.warning },
                { label: 'Graphics', value: '15 MB', color: '#C586C0' },
                { label: 'Stack', value: '2 MB', color: vsColors.success },
              ].map(m => (
                <View key={m.label} style={styles.memItem}>
                  <View style={[styles.memDot, { backgroundColor: m.color }]} />
                  <Text style={styles.memLabel}>{m.label}</Text>
                  <Text style={[styles.memValue, { color: m.color }]}>{m.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {tab === 'hotmethods' && (
          <View>
            <View style={styles.hotHeader}>
              <Text style={[styles.hotCell, { flex: 2 }]}>Method</Text>
              <Text style={styles.hotCell}>Incl%</Text>
              <Text style={styles.hotCell}>Excl%</Text>
              <Text style={styles.hotCell}>Calls</Text>
            </View>
            {HOT_METHODS.map((m, i) => (
              <Pressable key={i} style={styles.hotRow}>
                <View style={{ flex: 2, gap: 1 }}>
                  <Text style={styles.hotMethod} numberOfLines={1}>{m.name}</Text>
                  <Text style={styles.hotClass} numberOfLines={1}>{m.className}</Text>
                </View>
                <Text style={[styles.hotPct, { color: m.inclusive > 20 ? vsColors.warning : vsColors.text }]}>{m.inclusive}%</Text>
                <Text style={[styles.hotPct, { color: m.exclusive > 15 ? vsColors.error : vsColors.text }]}>{m.exclusive}%</Text>
                <Text style={styles.hotCalls}>{m.calls}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function MetricCard({ label, value, icon, color }: { label: string; value: string; icon: keyof typeof Feather.glyphMap; color: string }) {
  return (
    <View style={[metricStyles.card, { borderLeftColor: color }]}>
      <Feather name={icon} size={16} color={color} />
      <Text style={[metricStyles.value, { color }]}>{value}</Text>
      <Text style={metricStyles.label}>{label}</Text>
    </View>
  );
}

const metricStyles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: vsColors.sidebarBg,
    borderRadius: 4,
    borderLeftWidth: 3,
    padding: 10,
    gap: 4,
    marginBottom: 8,
  },
  value: { fontSize: 20, fontWeight: '700', fontFamily: 'monospace' },
  label: { fontSize: 11, color: vsColors.textDim },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vsColors.panelBg },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: vsColors.sidebarBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
    gap: 4,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: vsColors.success,
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  stopBtn: { borderColor: vsColors.error },
  startText: { fontSize: 12, color: vsColors.success, fontWeight: '600' },
  toolBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: vsColors.error },
  liveText: { fontSize: 10, color: vsColors.error, fontWeight: '700', letterSpacing: 1 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: vsColors.panelHeaderBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: vsColors.accent },
  tabText: { fontSize: 12, color: vsColors.textDim },
  tabTextActive: { color: vsColors.text },
  content: { flex: 1, padding: 10 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  chartSection: { gap: 8 },
  chartTitle: { fontSize: 12, color: vsColors.textDim, fontWeight: '600' },
  chartArea: {
    height: 80,
    backgroundColor: vsColors.sidebarBg,
    borderRadius: 4,
    padding: 8,
    overflow: 'hidden',
  },
  chartLegend: { alignItems: 'center' },
  chartLegendText: { fontSize: 11, color: vsColors.textDim },
  memBreakdown: { gap: 6, marginTop: 8 },
  memItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  memDot: { width: 10, height: 10, borderRadius: 5 },
  memLabel: { flex: 1, fontSize: 12, color: vsColors.text },
  memValue: { fontSize: 12, fontFamily: 'monospace', fontWeight: '600' },
  hotHeader: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: vsColors.panelHeaderBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  hotCell: { fontSize: 11, color: vsColors.textDim, fontWeight: '700', flex: 1, textAlign: 'right' },
  hotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border + '22',
    gap: 8,
  },
  hotMethod: { fontSize: 12, color: vsColors.text, fontFamily: 'monospace' },
  hotClass: { fontSize: 10, color: vsColors.textDim },
  hotPct: { flex: 1, fontSize: 12, fontFamily: 'monospace', textAlign: 'right' },
  hotCalls: { flex: 1, fontSize: 12, color: vsColors.textDim, textAlign: 'right' },
});
