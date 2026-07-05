import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import vsColors from '@/constants/vsColors';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  file?: string;
  line?: number;
  cursor?: { line: number; col: number };
  isHost: boolean;
  isFollowing?: boolean;
}

const COLLABORATORS: Collaborator[] = [
  { id: 'c1', name: 'You (Host)', avatar: 'YH', color: '#007ACC', file: 'MainActivity.kt', line: 42, cursor: { line: 42, col: 15 }, isHost: true },
  { id: 'c2', name: 'Ali Hassan', avatar: 'AH', color: '#C586C0', file: 'ShizukuService.kt', line: 156, cursor: { line: 156, col: 8 }, isHost: false },
  { id: 'c3', name: 'Sara Khan', avatar: 'SK', color: '#4EC9B0', file: 'MainActivity.kt', line: 89, cursor: { line: 89, col: 22 }, isHost: false, isFollowing: true },
];

interface ChatMessage {
  id: string;
  author: string;
  color: string;
  message: string;
  time: string;
}

const INITIAL_CHAT: ChatMessage[] = [
  { id: '1', author: 'Ali Hassan', color: '#C586C0', message: 'I found the bug in ShizukuService', time: '10:32' },
  { id: '2', author: 'You', color: '#007ACC', message: 'Great! Which line?', time: '10:33' },
  { id: '3', author: 'Ali Hassan', color: '#C586C0', message: 'Line 156 - the catch block swallows the exception', time: '10:33' },
  { id: '4', author: 'Sara Khan', color: '#4EC9B0', message: 'I can see it, following you Ali', time: '10:34' },
];

export default function LiveSharePanel() {
  const [tab, setTab] = useState<'session' | 'chat' | 'terminal'>('session');
  const [chatMsg, setChatMsg] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [isSharing, setIsSharing] = useState(true);

  const sendMessage = () => {
    if (!chatMsg.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      author: 'You',
      color: '#007ACC',
      message: chatMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setChatMsg('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.statusDot, { backgroundColor: isSharing ? vsColors.success : vsColors.textDim }]} />
        <Text style={styles.headerTitle}>Live Share</Text>
        <Text style={styles.headerStatus}>{isSharing ? `${COLLABORATORS.length} participants` : 'Offline'}</Text>
        <Pressable style={[styles.shareBtn, !isSharing && styles.shareBtnInactive]} onPress={() => setIsSharing(v => !v)}>
          <Feather name={isSharing ? 'wifi-off' : 'share-2'} size={12} color={isSharing ? vsColors.error : vsColors.success} />
          <Text style={[styles.shareBtnText, { color: isSharing ? vsColors.error : vsColors.success }]}>
            {isSharing ? 'End' : 'Start'}
          </Text>
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['session', 'chat', 'terminal'] as const).map(t => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'chat' && messages.length > 0 && (
                <Text style={styles.badge}> {messages.length}</Text>
              )}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'session' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>PARTICIPANTS</Text>
          {COLLABORATORS.map(c => (
            <View key={c.id} style={styles.collaboratorRow}>
              <View style={[styles.avatar, { backgroundColor: c.color }]}>
                <Text style={styles.avatarText}>{c.avatar}</Text>
              </View>
              <View style={styles.collaboratorInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.collaboratorName}>{c.name}</Text>
                  {c.isHost && <View style={styles.hostBadge}><Text style={styles.hostText}>Host</Text></View>}
                  {c.isFollowing && <View style={styles.followingBadge}><Text style={styles.followingText}>Following you</Text></View>}
                </View>
                {c.file && (
                  <Text style={styles.collaboratorFile}>
                    {c.file} : {c.cursor?.line}:{c.cursor?.col}
                  </Text>
                )}
              </View>
              {!c.isHost && (
                <Pressable style={styles.followBtn}>
                  <Feather name="eye" size={13} color={vsColors.textDim} />
                </Pressable>
              )}
            </View>
          ))}

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>SESSION CONTROLS</Text>
          {[
            { icon: 'share-2' as const, label: 'Share Invite Link' },
            { icon: 'terminal' as const, label: 'Share Terminal' },
            { icon: 'server' as const, label: 'Share Server (Port 8080)' },
            { icon: 'eye' as const, label: 'Read-only Mode' },
            { icon: 'shield' as const, label: 'Guest Access Controls' },
          ].map(item => (
            <Pressable key={item.label} style={styles.controlRow}>
              <Feather name={item.icon} size={14} color={vsColors.accent} />
              <Text style={styles.controlLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={13} color={vsColors.textDim} />
            </Pressable>
          ))}
        </ScrollView>
      )}

      {tab === 'chat' && (
        <View style={styles.chatContainer}>
          <ScrollView style={styles.chatMessages} showsVerticalScrollIndicator={false}>
            {messages.map(msg => (
              <View key={msg.id} style={[styles.messageRow, msg.author === 'You' && styles.messageRowSelf]}>
                <View style={[styles.messageBubble, { borderLeftColor: msg.color }, msg.author === 'You' && styles.messageBubbleSelf]}>
                  <View style={styles.messageHeader}>
                    <Text style={[styles.messageAuthor, { color: msg.color }]}>{msg.author}</Text>
                    <Text style={styles.messageTime}>{msg.time}</Text>
                  </View>
                  <Text style={styles.messageText}>{msg.message}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.chatInput}>
            <TextInput
              style={styles.chatTextInput}
              value={chatMsg}
              onChangeText={setChatMsg}
              placeholder="Message team..."
              placeholderTextColor={vsColors.textDisabled}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <Pressable style={styles.sendBtn} onPress={sendMessage}>
              <Feather name="send" size={14} color={vsColors.accent} />
            </Pressable>
          </View>
        </View>
      )}

      {tab === 'terminal' && (
        <View style={styles.sharedTerminal}>
          <Text style={styles.sharedTerminalNote}>
            Shared terminal — all participants can view and input commands
          </Text>
          <View style={styles.terminalLines}>
            <Text style={styles.termLine}>{'$ ./gradlew assembleDebug'}</Text>
            <Text style={[styles.termLine, { color: vsColors.success }]}>{'> Task :app:assembleDebug'}</Text>
            <Text style={[styles.termLine, { color: vsColors.success }]}>{'BUILD SUCCESSFUL in 45s'}</Text>
            <Text style={styles.termLine}>{'[Ali Hassan] $ adb install -r app-debug.apk'}</Text>
            <Text style={[styles.termLine, { color: vsColors.success }]}>{'Success'}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vsColors.panelBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: vsColors.sidebarBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
    gap: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  headerTitle: { fontSize: 13, color: vsColors.text, fontWeight: '700', flex: 1 },
  headerStatus: { fontSize: 11, color: vsColors.textDim },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: vsColors.error,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  shareBtnInactive: { borderColor: vsColors.success },
  shareBtnText: { fontSize: 11, fontWeight: '600' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: vsColors.panelHeaderBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: vsColors.accent },
  tabText: { fontSize: 12, color: vsColors.textDim },
  tabTextActive: { color: vsColors.text },
  badge: { color: vsColors.accent },
  content: { flex: 1, padding: 8 },
  sectionTitle: { fontSize: 10, color: vsColors.textDim, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  collaboratorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border + '33',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  collaboratorInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  collaboratorName: { fontSize: 13, color: vsColors.text, fontWeight: '600' },
  hostBadge: {
    backgroundColor: vsColors.accent + '33',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  hostText: { fontSize: 9, color: vsColors.accent, fontWeight: '700' },
  followingBadge: {
    backgroundColor: '#4EC9B0' + '22',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  followingText: { fontSize: 9, color: '#4EC9B0' },
  collaboratorFile: { fontSize: 11, color: vsColors.textDim, fontFamily: 'monospace', marginTop: 2 },
  followBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border + '33',
  },
  controlLabel: { flex: 1, fontSize: 13, color: vsColors.text },
  chatContainer: { flex: 1 },
  chatMessages: { flex: 1, padding: 8 },
  messageRow: { marginBottom: 8 },
  messageRowSelf: { alignItems: 'flex-end' },
  messageBubble: {
    maxWidth: '85%',
    backgroundColor: vsColors.sidebarBg,
    borderRadius: 6,
    borderLeftWidth: 3,
    padding: 8,
  },
  messageBubbleSelf: { borderLeftColor: '#007ACC' },
  messageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  messageAuthor: { fontSize: 11, fontWeight: '700' },
  messageTime: { fontSize: 10, color: vsColors.textDisabled },
  messageText: { fontSize: 13, color: vsColors.text, lineHeight: 18 },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: vsColors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  chatTextInput: { flex: 1, fontSize: 13, color: vsColors.text, paddingVertical: 4 },
  sendBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  sharedTerminal: { flex: 1, padding: 10, gap: 8 },
  sharedTerminalNote: { fontSize: 11, color: vsColors.textDim, fontStyle: 'italic' },
  terminalLines: { gap: 2 },
  termLine: { fontSize: 12, color: vsColors.text, fontFamily: 'monospace', lineHeight: 18 },
});
