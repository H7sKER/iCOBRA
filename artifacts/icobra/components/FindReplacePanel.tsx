import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import vsColors from '@/constants/vsColors';
import { findAllOccurrences, replaceAll } from '@/utils/codeUtils';
import { useEditor } from '@/context/EditorContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function FindReplacePanel({ visible, onClose }: Props) {
  const { activeFile, updateFileContent } = useEditor();
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!visible) return null;

  const occurrences = activeFile && searchText
    ? findAllOccurrences(activeFile.content, searchText, caseSensitive)
    : [];

  const handleReplaceOne = () => {
    if (!activeFile || occurrences.length === 0) return;
    const newContent = replaceAll(activeFile.content, searchText, replaceText, caseSensitive);
    updateFileContent(activeFile.id, newContent);
  };

  const handleReplaceAll = () => {
    if (!activeFile || !searchText) return;
    const newContent = replaceAll(activeFile.content, searchText, replaceText, caseSensitive);
    updateFileContent(activeFile.id, newContent);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.collapseBtn} onPress={() => setShowReplace(v => !v)}>
          <Feather name={showReplace ? 'chevron-down' : 'chevron-right'} size={14} color={vsColors.textDim} />
        </Pressable>
        <Text style={styles.title}>Find{showReplace ? ' & Replace' : ''}</Text>
        <Text style={styles.count}>
          {searchText ? (occurrences.length === 0 ? 'No results' : `${Math.min(currentIndex + 1, occurrences.length)} of ${occurrences.length}`) : ''}
        </Text>
        <Pressable onPress={onClose}>
          <Feather name="x" size={14} color={vsColors.textDim} />
        </Pressable>
      </View>

      {/* Search row */}
      <View style={styles.row}>
        <Feather name="search" size={14} color={vsColors.textDim} />
        <TextInput
          style={styles.input}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search..."
          placeholderTextColor={vsColors.textDisabled}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
        />
        {/* Options */}
        <Pressable style={[styles.optBtn, caseSensitive && styles.optBtnActive]} onPress={() => setCaseSensitive(v => !v)}>
          <Text style={[styles.optLabel, caseSensitive && styles.optLabelActive]}>Aa</Text>
        </Pressable>
        <Pressable style={[styles.optBtn, wholeWord && styles.optBtnActive]} onPress={() => setWholeWord(v => !v)}>
          <Text style={[styles.optLabel, wholeWord && styles.optLabelActive]}>W</Text>
        </Pressable>
        <Pressable style={[styles.optBtn, useRegex && styles.optBtnActive]} onPress={() => setUseRegex(v => !v)}>
          <Text style={[styles.optLabel, useRegex && styles.optLabelActive]}>.*</Text>
        </Pressable>
        <View style={styles.navBtns}>
          <Pressable style={styles.navBtn} onPress={() => setCurrentIndex(v => Math.max(0, v - 1))}>
            <Feather name="chevron-up" size={13} color={vsColors.textDim} />
          </Pressable>
          <Pressable style={styles.navBtn} onPress={() => setCurrentIndex(v => Math.min(occurrences.length - 1, v + 1))}>
            <Feather name="chevron-down" size={13} color={vsColors.textDim} />
          </Pressable>
        </View>
      </View>

      {/* Replace row */}
      {showReplace && (
        <View style={styles.row}>
          <Feather name="refresh-cw" size={14} color={vsColors.textDim} />
          <TextInput
            style={styles.input}
            value={replaceText}
            onChangeText={setReplaceText}
            placeholder="Replace..."
            placeholderTextColor={vsColors.textDisabled}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <Pressable style={styles.replaceBtn} onPress={handleReplaceOne}>
            <Text style={styles.replaceBtnText}>Replace</Text>
          </Pressable>
          <Pressable style={styles.replaceBtn} onPress={handleReplaceAll}>
            <Text style={styles.replaceBtnText}>All</Text>
          </Pressable>
        </View>
      )}

      {/* Match list preview */}
      {occurrences.length > 0 && (
        <View style={styles.matchInfo}>
          <Text style={styles.matchInfoText}>
            Found {occurrences.length} match{occurrences.length !== 1 ? 'es' : ''} in {activeFile?.name}
          </Text>
          {occurrences.slice(0, 3).map((o, i) => (
            <Text key={i} style={styles.matchLine}>
              Line {o.line}: {activeFile?.content.split('\n')[o.line - 1]?.trim().slice(0, 50)}
            </Text>
          ))}
          {occurrences.length > 3 && (
            <Text style={styles.matchMoreText}>+{occurrences.length - 3} more matches</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: vsColors.panelHeaderBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
    paddingBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
  },
  collapseBtn: { padding: 2 },
  title: { fontSize: 12, color: vsColors.text, fontWeight: '600', flex: 0 },
  count: { flex: 1, fontSize: 11, color: vsColors.textDim },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 6,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: vsColors.text,
    backgroundColor: vsColors.inputBg,
    borderWidth: 1,
    borderColor: vsColors.border,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  optBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optBtnActive: {
    backgroundColor: vsColors.accent + '33',
    borderColor: vsColors.accent,
  },
  optLabel: { fontSize: 11, color: vsColors.textDim, fontWeight: '700' },
  optLabelActive: { color: vsColors.accent },
  navBtns: { flexDirection: 'row' },
  navBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replaceBtn: {
    backgroundColor: vsColors.buttonBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
  },
  replaceBtnText: { fontSize: 11, color: vsColors.text },
  matchInfo: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 2,
  },
  matchInfoText: { fontSize: 11, color: vsColors.textDim },
  matchLine: { fontSize: 11, color: vsColors.textDim, fontFamily: 'monospace' },
  matchMoreText: { fontSize: 11, color: vsColors.accent },
});
