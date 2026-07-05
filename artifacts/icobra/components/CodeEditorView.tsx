import { Feather } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import vsColors from '@/constants/vsColors';
import { useEditor } from '@/context/EditorContext';
import { getLineTokens, Token } from '@/utils/syntaxHighlight';

const { width } = Dimensions.get('window');
const LINE_HEIGHT = 20;
const LINE_NUM_WIDTH = 44;
const FONT_SIZE = 13;

function TokenSpan({ tokens }: { tokens: Token[] }) {
  return (
    <Text>
      {tokens.map((t, i) => (
        <Text key={i} style={{ color: t.color }}>{t.text}</Text>
      ))}
    </Text>
  );
}

function HighlightedLine({
  tokens,
  lineNum,
  isActive,
  hasBreakpoint,
  onBpPress,
}: {
  tokens: Token[];
  lineNum: number;
  isActive: boolean;
  hasBreakpoint: boolean;
  onBpPress: () => void;
}) {
  return (
    <View style={[styles.line, isActive && styles.activeLine]}>
      <Pressable style={styles.bpArea} onPress={onBpPress}>
        {hasBreakpoint ? (
          <View style={styles.bpDot} />
        ) : (
          <View style={styles.bpEmpty} />
        )}
      </Pressable>
      <Text style={styles.lineNum}>{lineNum}</Text>
      <Text style={styles.code}>
        <TokenSpan tokens={tokens} />
      </Text>
    </View>
  );
}

function EmptyEditor() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyLogo}>
        <Text style={styles.emptyLogoText}>{'</>'}</Text>
      </View>
      <Text style={styles.emptyTitle}>iCOBRA</Text>
      <Text style={styles.emptySubtitle}>by NexBytes</Text>
      <View style={styles.emptyActions}>
        {[
          { icon: 'file-plus' as const, label: 'New File', hint: 'Ctrl+N' },
          { icon: 'folder' as const, label: 'Open Folder', hint: 'Ctrl+K Ctrl+O' },
          { icon: 'git-branch' as const, label: 'Clone Repository', hint: 'Ctrl+Shift+P' },
        ].map(a => (
          <View key={a.label} style={styles.emptyAction}>
            <Feather name={a.icon} size={16} color={vsColors.accent} />
            <Text style={styles.emptyActionLabel}>{a.label}</Text>
            <Text style={styles.emptyActionHint}>{a.hint}</Text>
          </View>
        ))}
      </View>
      <View style={styles.emptyRecent}>
        <Text style={styles.emptyRecentTitle}>Recent</Text>
        {['iCOBRA-Project', 'ShizukuDemo', 'AndroidTools'].map(p => (
          <Pressable key={p} style={styles.emptyRecentItem}>
            <Feather name="folder" size={14} color="#DCBA6B" />
            <Text style={styles.emptyRecentName}>{p}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function CodeEditorView() {
  const { activeFile, breakpoints, toggleBreakpoint, updateFileContent, saveFile, setCursorPosition } = useEditor();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const textInputRef = useRef<TextInput>(null);

  const startEditing = useCallback(() => {
    if (!activeFile) return;
    setEditContent(activeFile.content);
    setIsEditing(true);
    setTimeout(() => textInputRef.current?.focus(), 100);
  }, [activeFile]);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
    if (activeFile) saveFile(activeFile.id);
  }, [activeFile, saveFile]);

  const handleChange = useCallback((text: string) => {
    setEditContent(text);
    if (activeFile) updateFileContent(activeFile.id, text);
  }, [activeFile, updateFileContent]);

  if (!activeFile) return <EmptyEditor />;

  const content = isEditing ? editContent : activeFile.content;
  const lines = content.split('\n');
  const tokenLines = getLineTokens(content, activeFile.language);
  const fileBreakpoints = breakpoints.filter(b => b.fileId === activeFile.id);

  return (
    <View style={styles.container}>
      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Feather name="chevron-right" size={12} color={vsColors.textDim} />
        <Text style={styles.breadcrumbText}>
          {activeFile.path.split('/').join(' > ')}
        </Text>
        <View style={{ flex: 1 }} />
        {isEditing ? (
          <Pressable style={styles.editBtn} onPress={stopEditing}>
            <Feather name="check" size={13} color={vsColors.success} />
            <Text style={styles.editBtnText}>Done</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.editBtn} onPress={startEditing}>
            <Feather name="edit-2" size={13} color={vsColors.textDim} />
            <Text style={styles.editBtnText}>Edit</Text>
          </Pressable>
        )}
      </View>

      {/* Editor area */}
      <ScrollView
        style={styles.editorScroll}
        showsVerticalScrollIndicator
        indicatorStyle="white"
      >
        <ScrollView horizontal showsHorizontalScrollIndicator indicatorStyle="white">
          <View style={styles.editorContent}>
            {isEditing ? (
              // Edit mode: plain TextInput
              <View style={styles.editModeContainer}>
                {/* Line numbers */}
                <View style={styles.editLineNums}>
                  {Array.from({ length: Math.max(lines.length, editContent.split('\n').length) }).map((_, i) => (
                    <Text key={i} style={styles.lineNum}>{i + 1}</Text>
                  ))}
                </View>
                <TextInput
                  ref={textInputRef}
                  style={styles.editTextInput}
                  value={editContent}
                  onChangeText={handleChange}
                  multiline
                  autoCorrect={false}
                  autoCapitalize="none"
                  spellCheck={false}
                  keyboardType="default"
                  selectionColor={vsColors.selection}
                  cursorColor={vsColors.textBright}
                  onBlur={stopEditing}
                />
              </View>
            ) : (
              // View mode: syntax highlighted
              <Pressable onPress={startEditing}>
                {tokenLines.map((tokens, i) => {
                  const lineNum = i + 1;
                  const hasBp = fileBreakpoints.some(b => b.line === lineNum);
                  const isActiveLine = lineNum === activeFile.cursorLine;
                  return (
                    <HighlightedLine
                      key={i}
                      tokens={tokens}
                      lineNum={lineNum}
                      isActive={isActiveLine}
                      hasBreakpoint={hasBp}
                      onBpPress={() => toggleBreakpoint(activeFile.id, lineNum)}
                    />
                  );
                })}
                {/* Extra blank lines for visual space */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <View key={`blank-${i}`} style={styles.line} />
                ))}
              </Pressable>
            )}
          </View>
        </ScrollView>
      </ScrollView>

      {/* MiniMap (VS-like) */}
      <View style={styles.minimap}>
        {lines.slice(0, 40).map((line, i) => (
          <View
            key={i}
            style={[
              styles.minimapLine,
              { width: Math.min(line.trim().length * 1.5, 60) },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: vsColors.editorBg,
    flexDirection: 'column',
    position: 'relative',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 26,
    paddingHorizontal: 8,
    backgroundColor: vsColors.editorBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
    gap: 4,
  },
  breadcrumbText: {
    fontSize: 12,
    color: vsColors.textDim,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    backgroundColor: vsColors.inputBg,
  },
  editBtnText: {
    fontSize: 11,
    color: vsColors.textDim,
  },
  editorScroll: {
    flex: 1,
  },
  editorContent: {
    minWidth: width,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: LINE_HEIGHT,
    paddingRight: 16,
  },
  activeLine: {
    backgroundColor: vsColors.currentLineBg,
  },
  bpArea: {
    width: 16,
    height: LINE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bpDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: vsColors.debugBreakpoint,
  },
  bpEmpty: {
    width: 6,
    height: 6,
  },
  lineNum: {
    width: LINE_NUM_WIDTH - 16,
    height: LINE_HEIGHT,
    lineHeight: LINE_HEIGHT,
    fontSize: FONT_SIZE - 1,
    color: vsColors.textDim,
    textAlign: 'right' as const,
    paddingRight: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  code: {
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: vsColors.text,
  },
  editModeContainer: {
    flexDirection: 'row',
    minHeight: 400,
  },
  editLineNums: {
    width: LINE_NUM_WIDTH,
    paddingTop: 0,
  },
  editTextInput: {
    flex: 1,
    minWidth: 300,
    fontSize: FONT_SIZE,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: vsColors.text,
    lineHeight: LINE_HEIGHT,
    backgroundColor: 'transparent',
    textAlignVertical: 'top' as const,
    padding: 0,
  },
  minimap: {
    position: 'absolute',
    right: 0,
    top: 26,
    bottom: 0,
    width: 70,
    backgroundColor: vsColors.editorBg,
    borderLeftWidth: 1,
    borderLeftColor: vsColors.border + '44',
    paddingTop: 4,
    paddingHorizontal: 5,
    gap: 2,
    overflow: 'hidden',
  },
  minimapLine: {
    height: 2,
    backgroundColor: vsColors.textDim,
    opacity: 0.4,
    borderRadius: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 8,
  },
  emptyLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: vsColors.accent + '22',
    borderWidth: 1,
    borderColor: vsColors.accent + '44',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyLogoText: {
    fontSize: 22,
    color: vsColors.accent,
    fontWeight: '700' as const,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: vsColors.textBright,
    letterSpacing: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: vsColors.textDim,
    letterSpacing: 2,
  },
  emptyActions: {
    alignSelf: 'stretch',
    marginTop: 20,
    gap: 4,
  },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: vsColors.sidebarBg,
  },
  emptyActionLabel: {
    flex: 1,
    fontSize: 14,
    color: vsColors.text,
  },
  emptyActionHint: {
    fontSize: 11,
    color: vsColors.textDim,
  },
  emptyRecent: {
    alignSelf: 'stretch',
    marginTop: 16,
    gap: 4,
  },
  emptyRecentTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: vsColors.textDim,
    letterSpacing: 1,
    marginBottom: 4,
  },
  emptyRecentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
  },
  emptyRecentName: {
    fontSize: 13,
    color: vsColors.text,
  },
});
