import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import vsColors from '@/constants/vsColors';
import { CompletionItem } from '@/data/intelliSenseData';

const KIND_COLORS: Record<string, string> = {
  keyword: '#569CD6',
  class: '#4EC9B0',
  function: '#DCDCAA',
  variable: '#9CDCFE',
  property: '#9CDCFE',
  interface: '#B8D7A3',
  module: '#C586C0',
  snippet: '#CE9178',
  constant: '#4FC1FF',
  enum: '#4EC9B0',
};

const KIND_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  keyword: 'key',
  class: 'box',
  function: 'code',
  variable: 'hash',
  property: 'tag',
  interface: 'layers',
  module: 'package',
  snippet: 'scissors',
  constant: 'anchor',
  enum: 'list',
};

const KIND_LABEL: Record<string, string> = {
  keyword: 'kw',
  class: 'cls',
  function: 'fn',
  variable: 'var',
  property: 'prop',
  interface: 'if',
  module: 'mod',
  snippet: 'snp',
  constant: 'const',
  enum: 'enum',
};

interface Props {
  items: CompletionItem[];
  selectedIndex: number;
  onSelect: (item: CompletionItem) => void;
  position: { top: number; left: number };
  prefix: string;
}

export default function IntelliSenseDropdown({ items, selectedIndex, onSelect, position, prefix }: Props) {
  if (items.length === 0) return null;

  return (
    <View style={[styles.container, { top: position.top, left: position.left }]}>
      <ScrollView style={styles.list} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
        {items.map((item, index) => {
          const color = KIND_COLORS[item.kind] ?? vsColors.text;
          const icon = KIND_ICONS[item.kind] ?? 'code';
          const isSelected = index === selectedIndex;
          return (
            <Pressable
              key={item.label + index}
              style={[styles.item, isSelected && styles.itemSelected]}
              onPress={() => onSelect(item)}
            >
              {/* Kind badge */}
              <View style={[styles.kindBadge, { backgroundColor: color + '22', borderColor: color + '44' }]}>
                <Text style={[styles.kindLabel, { color }]}>{KIND_LABEL[item.kind]}</Text>
              </View>

              {/* Label with prefix highlight */}
              <View style={styles.labelContainer}>
                <Text style={styles.labelText} numberOfLines={1}>
                  {prefix.length > 0 ? (
                    <>
                      <Text style={styles.matchHighlight}>{item.label.slice(0, prefix.length)}</Text>
                      <Text>{item.label.slice(prefix.length)}</Text>
                    </>
                  ) : (
                    item.label
                  )}
                </Text>
                {item.detail && (
                  <Text style={styles.detailText} numberOfLines={1}>{item.detail}</Text>
                )}
              </View>

              {/* Feather icon */}
              <Feather name={icon} size={11} color={color} />
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Documentation popup for selected item */}
      {items[selectedIndex]?.documentation && (
        <View style={styles.docPanel}>
          <Text style={styles.docTitle}>{items[selectedIndex].label}</Text>
          {items[selectedIndex].parameters && (
            <Text style={styles.docParams}>
              {'('}
              {items[selectedIndex].parameters!.join(', ')}
              {')'}
            </Text>
          )}
          <Text style={styles.docText}>{items[selectedIndex].documentation}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 500,
    maxWidth: 380,
    minWidth: 250,
    backgroundColor: vsColors.dropdownBg,
    borderWidth: 1,
    borderColor: vsColors.border,
    borderRadius: 4,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  list: {
    maxHeight: 200,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 8,
    minHeight: 26,
  },
  itemSelected: {
    backgroundColor: vsColors.selection,
  },
  kindBadge: {
    borderRadius: 3,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 36,
    alignItems: 'center',
  },
  kindLabel: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  labelContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelText: {
    fontSize: 13,
    color: vsColors.text,
    fontFamily: 'monospace',
  },
  matchHighlight: {
    color: vsColors.textBright,
    fontWeight: '700',
  },
  detailText: {
    fontSize: 11,
    color: vsColors.textDim,
    flex: 1,
  },
  docPanel: {
    borderTopWidth: 1,
    borderTopColor: vsColors.border,
    padding: 10,
    maxHeight: 120,
    backgroundColor: vsColors.panelHeaderBg,
    gap: 4,
  },
  docTitle: {
    fontSize: 13,
    color: vsColors.textBright,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  docParams: {
    fontSize: 12,
    color: vsColors.warning,
    fontFamily: 'monospace',
  },
  docText: {
    fontSize: 12,
    color: vsColors.textDim,
    lineHeight: 18,
  },
});
