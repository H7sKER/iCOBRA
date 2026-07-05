import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import vsColors from '@/constants/vsColors';
import { FileNode } from '@/data/sampleProject';
import { useEditor } from '@/context/EditorContext';

function FileTreeNode({ node, depth }: { node: FileNode; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 3);
  const { openFile, activeFileId } = useEditor();
  const isActive = node.type === 'file' && node.id === activeFileId;

  const handlePress = () => {
    if (node.type === 'folder') {
      setExpanded(e => !e);
    } else {
      openFile(node);
    }
  };

  return (
    <View>
      <Pressable
        style={({ pressed }) => [
          styles.row,
          { paddingLeft: 8 + depth * 14 },
          isActive && styles.activeRow,
          pressed && styles.hoverRow,
        ]}
        onPress={handlePress}
      >
        {/* Expand arrow */}
        <View style={styles.arrowContainer}>
          {node.type === 'folder' ? (
            <Feather
              name={expanded ? 'chevron-down' : 'chevron-right'}
              size={12}
              color={vsColors.textDim}
            />
          ) : null}
        </View>

        {/* Icon */}
        {node.type === 'folder' ? (
          <Feather
            name={expanded ? 'folder' : 'folder'}
            size={15}
            color="#DCBA6B"
            style={styles.icon}
          />
        ) : (
          <View style={[styles.fileBadge, { backgroundColor: getFileBadgeColor(node.name) + '22' }]}>
            <Text style={[styles.fileBadgeText, { color: getFileBadgeColor(node.name) }]}>
              {getFileExt(node.name)}
            </Text>
          </View>
        )}

        <Text
          style={[
            styles.name,
            node.type === 'folder' && styles.folderName,
            isActive && styles.activeName,
          ]}
          numberOfLines={1}
        >
          {node.name}
        </Text>
      </Pressable>

      {node.type === 'folder' && expanded && node.children?.map(child => (
        <FileTreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </View>
  );
}

export default function FileExplorer() {
  const { projectFiles } = useEditor();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>EXPLORER</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerBtn}>
            <Feather name="file-plus" size={14} color={vsColors.textDim} />
          </Pressable>
          <Pressable style={styles.headerBtn}>
            <Feather name="folder-plus" size={14} color={vsColors.textDim} />
          </Pressable>
          <Pressable style={styles.headerBtn}>
            <Feather name="refresh-cw" size={14} color={vsColors.textDim} />
          </Pressable>
        </View>
      </View>

      {/* Project section */}
      <Pressable style={styles.sectionHeader}>
        <Feather name="chevron-down" size={12} color={vsColors.textDim} />
        <Text style={styles.sectionTitle}>ICOBRA-PROJECT</Text>
      </Pressable>

      <ScrollView style={styles.tree} showsVerticalScrollIndicator={false}>
        {projectFiles.map(node => (
          <FileTreeNode key={node.id} node={node} depth={0} />
        ))}
      </ScrollView>

      {/* Outline section */}
      <Pressable style={styles.sectionHeader}>
        <Feather name="chevron-right" size={12} color={vsColors.textDim} />
        <Text style={styles.sectionTitle}>OUTLINE</Text>
      </Pressable>

      {/* Timeline section */}
      <Pressable style={styles.sectionHeader}>
        <Feather name="chevron-right" size={12} color={vsColors.textDim} />
        <Text style={styles.sectionTitle}>TIMELINE</Text>
      </Pressable>
    </View>
  );
}

function getFileExt(name: string): string {
  const ext = name.split('.').pop()?.toUpperCase() ?? '';
  if (ext.length > 3) return ext.slice(0, 2);
  return ext || '•';
}

function getFileBadgeColor(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    kt: '#A97BFF', java: '#B07219', xml: '#E44D26',
    gradle: '#4298B8', md: '#75BEFF', json: '#CBB069',
    ts: '#3178C6', tsx: '#3178C6', js: '#DCDCAA',
    py: '#3572A5', html: '#E44D26', css: '#563D7C',
  };
  return map[ext] ?? '#858585';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: vsColors.sidebarBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: vsColors.textDim,
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerBtn: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: vsColors.panelHeaderBg,
    borderTopWidth: 1,
    borderTopColor: vsColors.border,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: vsColors.textDim,
    letterSpacing: 0.8,
  },
  tree: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    paddingRight: 8,
  },
  activeRow: {
    backgroundColor: vsColors.selection,
  },
  hoverRow: {
    backgroundColor: '#2A2D2E',
  },
  arrowContainer: {
    width: 14,
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
    marginLeft: 2,
  },
  fileBadge: {
    width: 22,
    height: 14,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    marginLeft: 2,
  },
  fileBadgeText: {
    fontSize: 7,
    fontWeight: '700' as const,
  },
  name: {
    flex: 1,
    fontSize: 13,
    color: vsColors.sidebarFg,
  },
  folderName: {
    fontWeight: '500' as const,
  },
  activeName: {
    color: vsColors.textBright,
  },
});
