import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import vsColors from '@/constants/vsColors';
import { useEditor } from '@/context/EditorContext';

const STAGED = [
  { name: 'MainActivity.kt', status: 'M' },
  { name: 'ShizukuService.kt', status: 'A' },
];
const UNSTAGED = [
  { name: 'Utils.kt', status: 'M' },
  { name: 'build.gradle', status: 'M' },
  { name: 'README.md', status: '?' },
];
const UNTRACKED = [
  { name: 'CommandExecutor.kt', status: '?' },
];

const STATUS_COLOR: Record<string, string> = {
  M: vsColors.gitModified,
  A: vsColors.gitAdded,
  D: vsColors.gitDeleted,
  '?': vsColors.gitUntracked,
};

export default function GitPanel() {
  const { currentBranch } = useEditor();
  const [commitMsg, setCommitMsg] = useState('');
  const [staged, setStaged] = useState(STAGED);
  const [unstaged, setUnstaged] = useState(UNSTAGED);

  const stageAll = () => {
    setStaged(prev => [...prev, ...unstaged]);
    setUnstaged([]);
  };

  const unstageAll = () => {
    setUnstaged(prev => [...prev, ...staged]);
    setStaged([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SOURCE CONTROL</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerBtn}>
            <Feather name="refresh-cw" size={14} color={vsColors.textDim} />
          </Pressable>
          <Pressable style={styles.headerBtn}>
            <Feather name="more-horizontal" size={14} color={vsColors.textDim} />
          </Pressable>
        </View>
      </View>

      {/* Branch info */}
      <View style={styles.branchBar}>
        <Feather name="git-branch" size={13} color={vsColors.accent} />
        <Text style={styles.branchName}>{currentBranch}</Text>
        <Pressable style={styles.syncBtn}>
          <Feather name="upload-cloud" size={12} color={vsColors.textDim} />
          <Text style={styles.syncText}>Sync</Text>
        </Pressable>
      </View>

      {/* Commit input */}
      <View style={styles.commitArea}>
        <TextInput
          style={styles.commitInput}
          placeholder="Message (Ctrl+Enter to commit)"
          placeholderTextColor={vsColors.textDisabled}
          value={commitMsg}
          onChangeText={setCommitMsg}
          multiline
          numberOfLines={3}
        />
        <View style={styles.commitActions}>
          <Pressable style={styles.commitBtn}>
            <Feather name="check" size={13} color="#fff" />
            <Text style={styles.commitBtnText}>Commit</Text>
          </Pressable>
          <Pressable style={styles.moreCommitBtn}>
            <Feather name="chevron-down" size={13} color={vsColors.textDim} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Staged changes */}
        <Pressable style={styles.sectionHeader}>
          <Feather name="chevron-down" size={12} color={vsColors.textDim} />
          <Text style={styles.sectionTitle}>STAGED CHANGES ({staged.length})</Text>
          <View style={styles.sectionActions}>
            <Pressable onPress={unstageAll} style={styles.sectionBtn}>
              <Feather name="minus" size={12} color={vsColors.textDim} />
            </Pressable>
          </View>
        </Pressable>
        {staged.map((f, i) => (
          <View key={i} style={styles.fileRow}>
            <Feather name="file" size={13} color={vsColors.textDim} />
            <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
            <Text style={[styles.statusBadge, { color: STATUS_COLOR[f.status] }]}>{f.status}</Text>
            <Pressable style={styles.fileAction}>
              <Feather name="minus" size={12} color={vsColors.textDim} />
            </Pressable>
          </View>
        ))}

        {/* Unstaged changes */}
        <Pressable style={styles.sectionHeader}>
          <Feather name="chevron-down" size={12} color={vsColors.textDim} />
          <Text style={styles.sectionTitle}>CHANGES ({unstaged.length})</Text>
          <View style={styles.sectionActions}>
            <Pressable style={styles.sectionBtn}>
              <Feather name="rotate-ccw" size={12} color={vsColors.textDim} />
            </Pressable>
            <Pressable onPress={stageAll} style={styles.sectionBtn}>
              <Feather name="plus" size={12} color={vsColors.textDim} />
            </Pressable>
          </View>
        </Pressable>
        {unstaged.map((f, i) => (
          <View key={i} style={styles.fileRow}>
            <Feather name="file" size={13} color={vsColors.textDim} />
            <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
            <Text style={[styles.statusBadge, { color: STATUS_COLOR[f.status] }]}>{f.status}</Text>
            <Pressable style={styles.fileAction}>
              <Feather name="rotate-ccw" size={12} color={vsColors.textDim} />
            </Pressable>
            <Pressable style={styles.fileAction}>
              <Feather name="plus" size={12} color={vsColors.textDim} />
            </Pressable>
          </View>
        ))}

        {/* Branches section */}
        <Pressable style={styles.sectionHeader}>
          <Feather name="chevron-right" size={12} color={vsColors.textDim} />
          <Text style={styles.sectionTitle}>BRANCHES</Text>
        </Pressable>

        {/* Remotes section */}
        <Pressable style={styles.sectionHeader}>
          <Feather name="chevron-right" size={12} color={vsColors.textDim} />
          <Text style={styles.sectionTitle}>REMOTES</Text>
        </Pressable>

        {/* Stashes */}
        <Pressable style={styles.sectionHeader}>
          <Feather name="chevron-right" size={12} color={vsColors.textDim} />
          <Text style={styles.sectionTitle}>STASHES</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vsColors.sidebarBg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  headerTitle: { fontSize: 11, fontWeight: '700' as const, color: vsColors.textDim, letterSpacing: 1 },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  branchBar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: vsColors.panelHeaderBg, borderTopWidth: 1, borderTopColor: vsColors.border },
  branchName: { flex: 1, fontSize: 13, color: vsColors.text },
  syncBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, backgroundColor: vsColors.inputBg },
  syncText: { fontSize: 11, color: vsColors.textDim },
  commitArea: { padding: 8, gap: 6, borderBottomWidth: 1, borderBottomColor: vsColors.border },
  commitInput: { backgroundColor: vsColors.inputBg, borderRadius: 4, padding: 8, fontSize: 13, color: vsColors.text, minHeight: 60, textAlignVertical: 'top' as const },
  commitActions: { flexDirection: 'row', gap: 0 },
  commitBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: vsColors.buttonBg, paddingVertical: 7, borderRadius: 4, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  commitBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' as const },
  moreCommitBtn: { width: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: vsColors.buttonBg, borderLeftWidth: 1, borderLeftColor: vsColors.accent, borderRadius: 4, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: vsColors.panelHeaderBg, borderTopWidth: 1, borderTopColor: vsColors.border },
  sectionTitle: { flex: 1, fontSize: 11, fontWeight: '700' as const, color: vsColors.textDim, letterSpacing: 0.8 },
  sectionActions: { flexDirection: 'row', gap: 2 },
  sectionBtn: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 4 },
  fileName: { flex: 1, fontSize: 13, color: vsColors.sidebarFg },
  statusBadge: { fontSize: 12, fontWeight: '700' as const, width: 16, textAlign: 'center' as const },
  fileAction: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
});
