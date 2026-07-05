import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import vsColors from '@/constants/vsColors';

interface WatchExpression {
  id: string;
  expression: string;
  value: string;
  type: string;
  hasError: boolean;
}

const DEFAULT_WATCHES: WatchExpression[] = [
  { id: 'w1', expression: 'Shizuku.isPreV11()', value: 'false', type: 'Boolean', hasError: false },
  { id: 'w2', expression: 'isInitialized', value: 'true', type: 'Boolean', hasError: false },
  { id: 'w3', expression: 'this.applicationContext', value: 'com.nexbytes.icobra@1f7a3c9', type: 'Context', hasError: false },
  { id: 'w4', expression: 'Build.VERSION.SDK_INT', value: '34', type: 'Int', hasError: false },
  { id: 'w5', expression: 'invalidExpression', value: 'Cannot evaluate expression', type: 'Error', hasError: true },
];

export default function WatchPanel() {
  const [watches, setWatches] = useState<WatchExpression[]>(DEFAULT_WATCHES);
  const [newExpr, setNewExpr] = useState('');
  const [adding, setAdding] = useState(false);

  const addWatch = () => {
    if (!newExpr.trim()) return;
    const newWatch: WatchExpression = {
      id: Date.now().toString(),
      expression: newExpr.trim(),
      value: '<Not yet evaluated>',
      type: 'Unknown',
      hasError: false,
    };
    setWatches(prev => [...prev, newWatch]);
    setNewExpr('');
    setAdding(false);
  };

  const removeWatch = (id: string) => {
    setWatches(prev => prev.filter(w => w.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>WATCH</Text>
        <View style={styles.toolbarActions}>
          <Pressable style={styles.toolBtn} onPress={() => setAdding(true)}>
            <Feather name="plus" size={13} color={vsColors.textDim} />
          </Pressable>
          <Pressable style={styles.toolBtn} onPress={() => setWatches([])}>
            <Feather name="trash-2" size={13} color={vsColors.textDim} />
          </Pressable>
          <Pressable style={styles.toolBtn}>
            <Feather name="refresh-cw" size={13} color={vsColors.textDim} />
          </Pressable>
        </View>
      </View>

      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 2 }]}>Name</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Value</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Type</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.list}>
        {watches.map(w => (
          <View key={w.id} style={styles.watchRow}>
            <Text style={[styles.exprText, { flex: 2 }]} numberOfLines={1}>{w.expression}</Text>
            <Text style={[styles.valueText, { flex: 2, color: w.hasError ? vsColors.error : vsColors.warning }]} numberOfLines={1}>{w.value}</Text>
            <Text style={[styles.typeText, { flex: 1 }]} numberOfLines={1}>{w.type}</Text>
            <Pressable onPress={() => removeWatch(w.id)} style={styles.removeBtn}>
              <Feather name="x" size={12} color={vsColors.textDisabled} />
            </Pressable>
          </View>
        ))}

        {/* Add new expression */}
        {adding ? (
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              value={newExpr}
              onChangeText={setNewExpr}
              placeholder="Add expression..."
              placeholderTextColor={vsColors.textDisabled}
              autoFocus
              onSubmitEditing={addWatch}
              onBlur={() => { if (!newExpr.trim()) setAdding(false); }}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <Pressable style={styles.addConfirmBtn} onPress={addWatch}>
              <Feather name="check" size={13} color={vsColors.success} />
            </Pressable>
            <Pressable style={styles.addCancelBtn} onPress={() => setAdding(false)}>
              <Feather name="x" size={13} color={vsColors.textDim} />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.addPlaceholder} onPress={() => setAdding(true)}>
            <Feather name="plus" size={12} color={vsColors.textDisabled} />
            <Text style={styles.addPlaceholderText}>Add expression to watch</Text>
          </Pressable>
        )}
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
  toolbarActions: { flexDirection: 'row', gap: 2 },
  toolBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: vsColors.panelHeaderBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  headerCell: { fontSize: 11, color: vsColors.textDim, fontWeight: '600' },
  list: { flex: 1 },
  watchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border + '33',
    gap: 8,
  },
  exprText: { fontSize: 12, color: vsColors.text, fontFamily: 'monospace' },
  valueText: { fontSize: 12, fontFamily: 'monospace' },
  typeText: { fontSize: 11, color: '#4EC9B0', fontFamily: 'monospace' },
  removeBtn: { width: 24, alignItems: 'center' },
  addRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 4 },
  addInput: {
    flex: 1,
    fontSize: 12,
    color: vsColors.text,
    fontFamily: 'monospace',
    borderBottomWidth: 1,
    borderBottomColor: vsColors.accent,
    paddingVertical: 4,
  },
  addConfirmBtn: { width: 24, height: 28, alignItems: 'center', justifyContent: 'center' },
  addCancelBtn: { width: 24, height: 28, alignItems: 'center', justifyContent: 'center' },
  addPlaceholder: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8, gap: 6 },
  addPlaceholderText: { fontSize: 12, color: vsColors.textDisabled },
});
