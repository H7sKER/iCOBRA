import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import vsColors from '@/constants/vsColors';

interface AssemblyNode {
  id: string;
  name: string;
  type: 'assembly' | 'namespace' | 'class' | 'interface' | 'method' | 'property' | 'field' | 'enum';
  children?: AssemblyNode[];
  signature?: string;
  returnType?: string;
  modifiers?: string[];
}

const ASSEMBLIES: AssemblyNode[] = [
  {
    id: 'app', name: 'com.nexbytes.icobra', type: 'assembly',
    children: [
      {
        id: 'ns1', name: 'com.nexbytes.icobra', type: 'namespace',
        children: [
          {
            id: 'cls1', name: 'MainActivity', type: 'class', modifiers: ['public'],
            children: [
              { id: 'm1', name: 'onCreate(Bundle?)', type: 'method', signature: 'override fun onCreate(savedInstanceState: Bundle?)', returnType: 'Unit', modifiers: ['override', 'protected'] },
              { id: 'm2', name: 'checkShizukuPermission()', type: 'method', signature: 'fun checkShizukuPermission()', returnType: 'Unit', modifiers: ['private'] },
              { id: 'm3', name: 'onPermissionGranted()', type: 'method', signature: 'fun onPermissionGranted()', returnType: 'Unit', modifiers: ['private'] },
              { id: 'm4', name: 'initializeApp()', type: 'method', signature: 'fun initializeApp()', returnType: 'Unit', modifiers: ['private'] },
              { id: 'f1', name: 'REQUEST_CODE_SHIZUKU', type: 'field', returnType: 'Int', modifiers: ['private', 'const'] },
            ],
          },
          {
            id: 'cls2', name: 'ShizukuService', type: 'class', modifiers: ['public', 'object'],
            children: [
              { id: 'm5', name: 'initialize()', type: 'method', signature: 'fun initialize()', returnType: 'Unit' },
              { id: 'm6', name: 'executeCommand(String)', type: 'method', signature: 'fun executeCommand(command: String): String', returnType: 'String' },
              { id: 'm7', name: 'isPackageInstalled(String)', type: 'method', signature: 'fun isPackageInstalled(packageName: String): Boolean', returnType: 'Boolean' },
              { id: 'm8', name: 'getDeviceProperties()', type: 'method', signature: 'fun getDeviceProperties(): Map<String, String>', returnType: 'Map<String, String>' },
              { id: 'f2', name: 'isInitialized', type: 'field', returnType: 'Boolean', modifiers: ['private', 'var'] },
            ],
          },
          {
            id: 'cls3', name: 'Utils', type: 'class', modifiers: ['public', 'object'],
            children: [
              { id: 'm9', name: 'isDeviceRooted()', type: 'method', signature: 'fun isDeviceRooted(): Boolean', returnType: 'Boolean' },
              { id: 'm10', name: 'getAndroidVersion()', type: 'method', signature: 'fun getAndroidVersion(): String', returnType: 'String' },
              { id: 'm11', name: 'formatFileSize(Long)', type: 'method', signature: 'fun formatFileSize(bytes: Long): String', returnType: 'String' },
              { id: 'm12', name: 'hasPermission(Context, String)', type: 'method', signature: 'fun hasPermission(context: Context, permission: String): Boolean', returnType: 'Boolean' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'shizuku', name: 'rikka.shizuku', type: 'assembly',
    children: [
      {
        id: 'ns2', name: 'rikka.shizuku', type: 'namespace',
        children: [
          {
            id: 'cls4', name: 'Shizuku', type: 'class', modifiers: ['public'],
            children: [
              { id: 'm13', name: 'checkSelfPermission()', type: 'method', returnType: 'Int', modifiers: ['static'] },
              { id: 'm14', name: 'requestPermission(Int)', type: 'method', returnType: 'Unit', modifiers: ['static'] },
              { id: 'm15', name: 'isPreV11()', type: 'method', returnType: 'Boolean', modifiers: ['static'] },
              { id: 'm16', name: 'newProcess(Array<String>, Array<String>?, String?)', type: 'method', returnType: 'ShizukuRemoteProcess', modifiers: ['static'] },
              { id: 'm17', name: 'addBinderReceivedListenerSticky(OnBinderReceivedListener)', type: 'method', returnType: 'Unit', modifiers: ['static'] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'androidx', name: 'androidx.core', type: 'assembly',
    children: [
      { id: 'ns3', name: 'androidx.core.app', type: 'namespace', children: [] },
      { id: 'ns4', name: 'androidx.lifecycle', type: 'namespace', children: [] },
    ],
  },
];

const TYPE_ICON: Record<string, keyof typeof Feather.glyphMap> = {
  assembly: 'package',
  namespace: 'folder',
  class: 'box',
  interface: 'layers',
  method: 'code',
  property: 'tag',
  field: 'hash',
  enum: 'list',
};

const TYPE_COLOR: Record<string, string> = {
  assembly: '#4EC9B0',
  namespace: '#C586C0',
  class: '#4EC9B0',
  interface: '#B8D7A3',
  method: '#DCDCAA',
  property: '#9CDCFE',
  field: '#9CDCFE',
  enum: '#4EC9B0',
};

function AssemblyNodeRow({ node, depth = 0 }: { node: AssemblyNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const icon = TYPE_ICON[node.type] ?? 'circle';
  const color = TYPE_COLOR[node.type] ?? vsColors.text;

  return (
    <>
      <Pressable
        style={[styles.nodeRow, { paddingLeft: 8 + depth * 14 }]}
        onPress={() => hasChildren && setExpanded(v => !v)}
      >
        {hasChildren ? (
          <Feather name={expanded ? 'chevron-down' : 'chevron-right'} size={12} color={vsColors.textDim} />
        ) : (
          <View style={{ width: 12 }} />
        )}
        <Feather name={icon} size={13} color={color} />
        <Text style={[styles.nodeName, { color }]} numberOfLines={1}>{node.name}</Text>
        {node.modifiers && node.modifiers.length > 0 && (
          <Text style={styles.modifiers}>{node.modifiers.join(' ')}</Text>
        )}
        {node.returnType && (
          <Text style={styles.returnType}>: {node.returnType}</Text>
        )}
      </Pressable>
      {expanded && node.children?.map(child => (
        <AssemblyNodeRow key={child.id} node={child} depth={depth + 1} />
      ))}
    </>
  );
}

export default function ObjectBrowser() {
  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Feather name="search" size={14} color={vsColors.textDim} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search assemblies, types, members..."
          placeholderTextColor={vsColors.textDisabled}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>OBJECT BROWSER</Text>
        <Pressable style={styles.toolBtn}>
          <Feather name="filter" size={13} color={vsColors.textDim} />
        </Pressable>
        <Pressable style={styles.toolBtn}>
          <Feather name="settings" size={13} color={vsColors.textDim} />
        </Pressable>
      </View>

      <ScrollView style={styles.tree} showsVerticalScrollIndicator={false}>
        {ASSEMBLIES.map(a => <AssemblyNodeRow key={a.id} node={a} />)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vsColors.panelBg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: vsColors.sidebarBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  searchInput: { flex: 1, fontSize: 13, color: vsColors.text },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: vsColors.panelHeaderBg,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
    gap: 4,
  },
  toolbarTitle: { flex: 1, fontSize: 10, color: vsColors.textDim, fontWeight: '700', letterSpacing: 1 },
  toolBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  tree: { flex: 1 },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border + '11',
    minHeight: 26,
  },
  nodeName: { flex: 1, fontSize: 12, fontFamily: 'monospace' },
  modifiers: { fontSize: 10, color: '#569CD6', fontFamily: 'monospace' },
  returnType: { fontSize: 11, color: '#4EC9B0', fontFamily: 'monospace' },
});
