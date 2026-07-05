import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import vsColors from '@/constants/vsColors';
import { useShizuku } from '@/context/ShizukuContext';
import { useEditor } from '@/context/EditorContext';
import ShizukuPermissionScreen from '@/components/ShizukuPermissionScreen';
import MenuBar from '@/components/MenuBar';
import EditorTabs from '@/components/EditorTabs';
import ActivityBar from '@/components/ActivityBar';
import FileExplorer from '@/components/FileExplorer';
import SearchPanel from '@/components/SearchPanel';
import GitPanel from '@/components/GitPanel';
import DebugPanel from '@/components/DebugPanel';
import ExtensionsPanel from '@/components/ExtensionsPanel';
import TestExplorer from '@/components/TestExplorer';
import ProfilerPanel from '@/components/ProfilerPanel';
import ObjectBrowser from '@/components/ObjectBrowser';
import LiveSharePanel from '@/components/LiveSharePanel';
import CodeEditorView from '@/components/CodeEditorView';
import BottomPanel from '@/components/BottomPanel';
import StatusBarView from '@/components/StatusBarView';
import CommandPalette from '@/components/CommandPalette';
import FindReplacePanel from '@/components/FindReplacePanel';

function IDELayout() {
  const { sidePanel, bottomPanel, findReplaceVisible, setFindReplaceVisible } = useEditor();
  const insets = useSafeAreaInsets();

  const renderSidePanel = () => {
    switch (sidePanel) {
      case 'explorer': return <FileExplorer />;
      case 'search': return <SearchPanel />;
      case 'git': return <GitPanel />;
      case 'debug': return <DebugPanel />;
      case 'extensions': return <ExtensionsPanel />;
      case 'test': return <TestExplorer />;
      case 'profiler': return <ProfilerPanel />;
      case 'objectbrowser': return <ObjectBrowser />;
      case 'liveshare': return <LiveSharePanel />;
      default: return null;
    }
  };

  return (
    <View style={[styles.ideContainer, {
      paddingTop: Platform.OS === 'web' ? 67 : insets.top,
      paddingBottom: Platform.OS === 'web' ? 34 : 0,
    }]}>
      {/* Menu bar */}
      <MenuBar />

      {/* Editor tabs */}
      <EditorTabs />

      {/* Main area: activity bar + side panel + editor */}
      <View style={styles.mainArea}>
        {/* Activity bar */}
        <ActivityBar />

        {/* Side panel (conditional) */}
        {sidePanel && (
          <View style={styles.sidePanel}>
            {renderSidePanel()}
          </View>
        )}

        {/* Code editor area */}
        <View style={styles.editorArea}>
          {/* Find/Replace overlay */}
          {findReplaceVisible && <FindReplacePanel visible={findReplaceVisible} onClose={() => setFindReplaceVisible(false)} />}
          <CodeEditorView />
        </View>
      </View>

      {/* Bottom panel */}
      {bottomPanel && <BottomPanel />}

      {/* Status bar */}
      <StatusBarView />

      {/* Command palette overlay */}
      <CommandPalette />
    </View>
  );
}

export default function Index() {
  const { status } = useShizuku();

  if (status === 'checking') return null;

  if (status === 'not_granted') {
    return <ShizukuPermissionScreen />;
  }

  return <IDELayout />;
}

const styles = StyleSheet.create({
  ideContainer: {
    flex: 1,
    backgroundColor: vsColors.editorBg,
  },
  mainArea: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  sidePanel: {
    width: 250,
    borderRightWidth: 1,
    borderRightColor: vsColors.border,
    backgroundColor: vsColors.sidebarBg,
  },
  editorArea: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
});
