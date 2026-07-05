import { Feather } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import vsColors from '@/constants/vsColors';

interface ImmediateEntry {
  id: string;
  type: 'input' | 'output' | 'error';
  text: string;
}

const INITIAL: ImmediateEntry[] = [
  { id: '1', type: 'output', text: 'Immediate Window — evaluate expressions at the current debug step' },
  { id: '2', type: 'input', text: 'Shizuku.checkSelfPermission()' },
  { id: '3', type: 'output', text: '0 // PERMISSION_GRANTED' },
  { id: '4', type: 'input', text: 'Build.VERSION.SDK_INT' },
  { id: '5', type: 'output', text: '34' },
  { id: '6', type: 'input', text: 'applicationContext.packageName' },
  { id: '7', type: 'output', text: '"com.nexbytes.icobra"' },
];

const EVALUATE_RESPONSES: Record<string, string> = {
  '1+1': '2',
  '2*3': '6',
  'true': 'true',
  'false': 'false',
  'null': 'null',
  'Build.VERSION.SDK_INT': '34',
  'Shizuku.checkSelfPermission()': '0 // PERMISSION_GRANTED',
  'Shizuku.isPreV11()': 'false',
  'applicationContext.packageName': '"com.nexbytes.icobra"',
  'isInitialized': 'true',
  'this.javaClass.simpleName': '"MainActivity"',
};

export default function ImmediateWindow() {
  const [entries, setEntries] = useState<ImmediateEntry[]>(INITIAL);
  const [currentInput, setCurrentInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const scrollRef = useRef<ScrollView>(null);

  const evaluate = () => {
    if (!currentInput.trim()) return;
    const input = currentInput.trim();
    const result = EVALUATE_RESPONSES[input] ?? `<Not available in simulation: ${input}>`;
    const isError = result.startsWith('<');

    const newEntries: ImmediateEntry[] = [
      { id: Date.now() + 'i', type: 'input', text: input },
      { id: Date.now() + 'o', type: isError ? 'error' : 'output', text: result },
    ];
    setEntries(prev => [...prev, ...newEntries]);
    setHistory(prev => [input, ...prev]);
    setHistIdx(-1);
    setCurrentInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const navigateHistory = (dir: 'up' | 'down') => {
    if (dir === 'up' && histIdx < history.length - 1) {
      const newIdx = histIdx + 1;
      setHistIdx(newIdx);
      setCurrentInput(history[newIdx]);
    } else if (dir === 'down' && histIdx > -1) {
      const newIdx = histIdx - 1;
      setHistIdx(newIdx);
      setCurrentInput(newIdx >= 0 ? history[newIdx] : '');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>IMMEDIATE</Text>
        <Pressable style={styles.toolBtn} onPress={() => setEntries([])}>
          <Feather name="trash-2" size={13} color={vsColors.textDim} />
        </Pressable>
      </View>

      <ScrollView ref={scrollRef} style={styles.output} showsVerticalScrollIndicator={false}>
        {entries.map(e => (
          <View key={e.id} style={styles.entryRow}>
            {e.type === 'input' && (
              <Text style={styles.prompt}>{'>'} </Text>
            )}
            <Text style={[
              styles.entryText,
              e.type === 'input' && styles.inputText,
              e.type === 'error' && styles.errorText,
              e.type === 'output' && styles.outputText,
            ]}>
              {e.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <Text style={styles.inputPrompt}>{'>'}</Text>
        <TextInput
          style={styles.input}
          value={currentInput}
          onChangeText={setCurrentInput}
          placeholder="Evaluate expression..."
          placeholderTextColor={vsColors.textDisabled}
          onSubmitEditing={evaluate}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="done"
        />
        <Pressable style={styles.histBtn} onPress={() => navigateHistory('up')}>
          <Feather name="chevron-up" size={13} color={vsColors.textDim} />
        </Pressable>
        <Pressable style={styles.histBtn} onPress={() => navigateHistory('down')}>
          <Feather name="chevron-down" size={13} color={vsColors.textDim} />
        </Pressable>
        <Pressable style={styles.runBtn} onPress={evaluate}>
          <Feather name="play" size={13} color={vsColors.accent} />
        </Pressable>
      </View>
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
  toolBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  output: { flex: 1, paddingHorizontal: 8, paddingTop: 4 },
  entryRow: { flexDirection: 'row', marginBottom: 2 },
  prompt: { fontSize: 12, color: vsColors.accent, fontFamily: 'monospace' },
  entryText: { fontSize: 12, fontFamily: 'monospace', flex: 1, lineHeight: 18 },
  inputText: { color: vsColors.textBright },
  outputText: { color: vsColors.text, paddingLeft: 16 },
  errorText: { color: vsColors.error, paddingLeft: 16 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: vsColors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  inputPrompt: { fontSize: 13, color: vsColors.accent, fontFamily: 'monospace', fontWeight: '700' },
  input: {
    flex: 1,
    fontSize: 13,
    color: vsColors.text,
    fontFamily: 'monospace',
    paddingVertical: 4,
  },
  histBtn: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  runBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
});
