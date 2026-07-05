import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import vsColors from '@/constants/vsColors';
import { getAllFiles } from '@/data/sampleProject';
import { useEditor } from '@/context/EditorContext';

interface SearchResult {
  fileId: string;
  fileName: string;
  line: number;
  lineText: string;
  matchStart: number;
  matchEnd: number;
}

export default function SearchPanel() {
  const { projectFiles, openFile } = useEditor();
  const [query, setQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showReplace, setShowReplace] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (!text.trim()) { setResults([]); return; }

    const allFiles = getAllFiles(projectFiles);
    const found: SearchResult[] = [];

    allFiles.forEach(file => {
      const content = file.content ?? '';
      const lines = content.split('\n');
      lines.forEach((lineText, lineIdx) => {
        const searchIn = caseSensitive ? lineText : lineText.toLowerCase();
        const searchFor = caseSensitive ? text : text.toLowerCase();
        let idx = searchIn.indexOf(searchFor);
        while (idx !== -1) {
          found.push({
            fileId: file.id,
            fileName: file.name,
            line: lineIdx + 1,
            lineText: lineText.trim(),
            matchStart: idx,
            matchEnd: idx + text.length,
          });
          idx = searchIn.indexOf(searchFor, idx + 1);
        }
      });
    });

    setResults(found.slice(0, 200));
  };

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.fileName]) acc[r.fileName] = [];
    acc[r.fileName].push(r);
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SEARCH</Text>
        <Pressable onPress={() => setShowReplace(s => !s)}>
          <Feather name={showReplace ? 'chevron-down' : 'chevron-right'} size={14} color={vsColors.textDim} />
        </Pressable>
      </View>

      <View style={styles.inputArea}>
        <View style={styles.inputRow}>
          <Feather name="search" size={13} color={vsColors.textDim} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search"
            placeholderTextColor={vsColors.textDisabled}
            value={query}
            onChangeText={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          <View style={styles.inputActions}>
            <Pressable
              style={[styles.filterBtn, caseSensitive && styles.filterBtnActive]}
              onPress={() => setCaseSensitive(s => !s)}
            >
              <Text style={styles.filterText}>Aa</Text>
            </Pressable>
            <Pressable
              style={[styles.filterBtn, wholeWord && styles.filterBtnActive]}
              onPress={() => setWholeWord(s => !s)}
            >
              <Text style={styles.filterText}>ab</Text>
            </Pressable>
            <Pressable
              style={[styles.filterBtn, useRegex && styles.filterBtnActive]}
              onPress={() => setUseRegex(s => !s)}
            >
              <Text style={styles.filterText}>.*</Text>
            </Pressable>
          </View>
        </View>

        {showReplace && (
          <View style={styles.inputRow}>
            <Feather name="edit-2" size={13} color={vsColors.textDim} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Replace"
              placeholderTextColor={vsColors.textDisabled}
              value={replaceQuery}
              onChangeText={setReplaceQuery}
              autoCorrect={false}
            />
            <View style={styles.inputActions}>
              <Pressable style={styles.filterBtn}>
                <Feather name="refresh-cw" size={12} color={vsColors.textDim} />
              </Pressable>
              <Pressable style={styles.filterBtn}>
                <Feather name="check" size={12} color={vsColors.textDim} />
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {results.length > 0 && (
        <View style={styles.resultCount}>
          <Text style={styles.resultCountText}>
            {results.length} result{results.length !== 1 ? 's' : ''} in {Object.keys(grouped).length} file{Object.keys(grouped).length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
        {Object.entries(grouped).map(([fileName, fileResults]) => (
          <View key={fileName}>
            <View style={styles.fileHeader}>
              <Feather name="file" size={13} color={vsColors.textDim} />
              <Text style={styles.fileName}>{fileName}</Text>
              <Text style={styles.fileCount}>{fileResults.length}</Text>
            </View>
            {fileResults.map((result, idx) => (
              <Pressable
                key={idx}
                style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowHover]}
                onPress={() => {
                  const allFiles = getAllFiles(projectFiles);
                  const f = allFiles.find(ff => ff.id === result.fileId);
                  if (f) openFile(f);
                }}
              >
                <Text style={styles.lineNum}>{result.line}</Text>
                <Text style={styles.lineText} numberOfLines={1}>
                  {result.lineText}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
        {query.length > 0 && results.length === 0 && (
          <View style={styles.noResults}>
            <Feather name="search" size={28} color={vsColors.textDisabled} />
            <Text style={styles.noResultsText}>No results for "{query}"</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vsColors.sidebarBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  headerTitle: { fontSize: 11, fontWeight: '700' as const, color: vsColors.textDim, letterSpacing: 1 },
  inputArea: { paddingHorizontal: 8, gap: 4, paddingBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: vsColors.inputBg, borderRadius: 4, height: 28, paddingHorizontal: 6,
  },
  inputIcon: { marginRight: 4 },
  input: { flex: 1, fontSize: 13, color: vsColors.text, height: '100%' },
  inputActions: { flexDirection: 'row', gap: 2 },
  filterBtn: {
    width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 3,
  },
  filterBtnActive: { backgroundColor: vsColors.accent + '44' },
  filterText: { fontSize: 11, color: vsColors.textDim, fontWeight: '600' as const },
  resultCount: { paddingHorizontal: 12, paddingVertical: 4 },
  resultCountText: { fontSize: 11, color: vsColors.textDim },
  results: { flex: 1 },
  fileHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 5, backgroundColor: vsColors.panelHeaderBg,
  },
  fileName: { flex: 1, fontSize: 13, color: vsColors.textBright, fontWeight: '500' as const },
  fileCount: {
    fontSize: 11, color: vsColors.textDim,
    backgroundColor: vsColors.border, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8,
  },
  resultRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, gap: 8,
  },
  resultRowHover: { backgroundColor: vsColors.lineHighlight },
  lineNum: { fontSize: 11, color: vsColors.textDim, width: 28, textAlign: 'right' as const },
  lineText: { flex: 1, fontSize: 12, color: vsColors.text, fontFamily: 'monospace' },
  noResults: { alignItems: 'center', paddingTop: 40, gap: 8 },
  noResultsText: { fontSize: 13, color: vsColors.textDim },
});
