import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import vsColors from '@/constants/vsColors';

interface LocalVariable {
  name: string;
  value: string;
  type: string;
  scope: 'local' | 'argument' | 'closure';
  changed?: boolean;
  children?: LocalVariable[];
}

const LOCALS: LocalVariable[] = [
  { name: 'this', value: 'MainActivity@0x1234', type: 'MainActivity', scope: 'local' },
  { name: 'savedInstanceState', value: 'null', type: 'Bundle?', scope: 'argument' },
  { name: 'requestCode', value: '1001', type: 'Int', scope: 'argument', changed: true },
  { name: 'permissions', value: '["rikka.shizuku.permission.API_V23"]', type: 'Array<String>', scope: 'argument',
    children: [
      { name: '[0]', value: '"rikka.shizuku.permission.API_V23"', type: 'String', scope: 'local' },
    ]
  },
  { name: 'grantResults', value: '[0]', type: 'IntArray', scope: 'argument', changed: true,
    children: [
      { name: '[0]', value: '0', type: 'Int', scope: 'local' },
    ]
  },
  { name: 'isGranted', value: 'true', type: 'Boolean', scope: 'local', changed: true },
];

function VariableRow({ variable, depth = 0 }: { variable: LocalVariable; depth?: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = (variable.children?.length ?? 0) > 0;

  const scopeColor = variable.scope === 'argument' ? '#9CDCFE' : variable.scope === 'closure' ? '#C586C0' : vsColors.text;
  const valueColor = variable.changed ? '#F44747' : vsColors.warning;

  return (
    <>
      <Pressable
        style={[styles.row, { paddingLeft: 8 + depth * 12 }]}
        onPress={() => hasChildren && setExpanded(v => !v)}
      >
        {hasChildren ? (
          <Feather name={expanded ? 'chevron-down' : 'chevron-right'} size={12} color={vsColors.textDim} />
        ) : (
          <View style={{ width: 12 }} />
        )}
        <Text style={[styles.nameText, { color: scopeColor }]} numberOfLines={1}>{variable.name}</Text>
        <Text style={styles.equals}>=</Text>
        <Text style={[styles.valueText, { color: valueColor }]} numberOfLines={1}>{variable.value}</Text>
        <Text style={styles.typeText} numberOfLines={1}>{variable.type}</Text>
        {variable.changed && <View style={styles.changedDot} />}
      </Pressable>
      {expanded && variable.children?.map((child, i) => (
        <VariableRow key={i} variable={child} depth={depth + 1} />
      ))}
    </>
  );
}

export default function LocalsPanel() {
  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>LOCALS</Text>
        <View style={styles.legend}>
          <View style={[styles.legendDot, { backgroundColor: '#9CDCFE' }]} />
          <Text style={styles.legendText}>arg</Text>
          <View style={[styles.legendDot, { backgroundColor: '#C586C0' }]} />
          <Text style={styles.legendText}>closure</Text>
          <View style={[styles.legendDot, { backgroundColor: '#F44747' }]} />
          <Text style={styles.legendText}>changed</Text>
        </View>
      </View>

      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 1.5 }]}>Name</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Value</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Type</Text>
      </View>

      <ScrollView style={styles.list}>
        {LOCALS.map((v, i) => <VariableRow key={i} variable={v} />)}
      </ScrollView>
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
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: vsColors.textDisabled },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: vsColors.panelHeaderBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  headerCell: { fontSize: 11, color: vsColors.textDim, fontWeight: '600' },
  list: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border + '22',
    minHeight: 26,
  },
  nameText: { fontSize: 12, fontFamily: 'monospace', flex: 1.5 },
  equals: { fontSize: 12, color: vsColors.textDim },
  valueText: { fontSize: 12, fontFamily: 'monospace', flex: 2 },
  typeText: { fontSize: 11, color: '#4EC9B0', fontFamily: 'monospace', flex: 1 },
  changedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F44747',
  },
});
