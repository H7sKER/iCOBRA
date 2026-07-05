import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import vsColors from '@/constants/vsColors';
import { extensions as ALL_EXTENSIONS, extensionCategories, searchExtensions, Extension } from '@/data/extensionsData';

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Feather
          key={i}
          name={i < full ? 'star' : (i === full && half ? 'star' : 'star')}
          size={9}
          color={i < full || (i === full && half) ? '#CCA700' : vsColors.border}
        />
      ))}
    </View>
  );
}

function ExtensionCard({ ext, installed, onToggle }: { ext: Extension; installed: boolean; onToggle: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable style={styles.card} onPress={() => setExpanded(v => !v)}>
      {/* Icon */}
      <View style={styles.iconWrap}>
        <Text style={styles.iconText}>{ext.icon}</Text>
        {ext.verified && (
          <View style={styles.verifiedBadge}>
            <Feather name="check" size={8} color="#fff" />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <View style={styles.cardNameRow}>
          <Text style={styles.cardName} numberOfLines={1}>{ext.name}</Text>
          {installed && <View style={styles.installedBadge}><Text style={styles.installedBadgeText}>✓</Text></View>}
          {ext.enabled === false && <View style={styles.disabledBadge}><Text style={styles.disabledBadgeText}>disabled</Text></View>}
        </View>

        <Text style={styles.cardPublisher}>
          {ext.publisher} · v{ext.version}
        </Text>

        <Text style={styles.cardDesc} numberOfLines={expanded ? undefined : 2}>{ext.description}</Text>

        {expanded && (
          <View style={styles.cardTags}>
            {ext.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Feather name="download" size={10} color={vsColors.textDim} />
            <Text style={styles.metaText}>{ext.downloads}</Text>
          </View>
          <StarRating rating={ext.rating} />
          <Text style={styles.ratingText}>{ext.rating}</Text>
          <View style={styles.metaFlex} />

          {installed ? (
            <View style={styles.actionRow}>
              <Pressable style={styles.manageBtn} onPress={onToggle}>
                <Text style={styles.manageBtnText}>Uninstall</Text>
              </Pressable>
              {ext.enabled !== false && (
                <Pressable style={[styles.manageBtn, styles.disableBtn]}>
                  <Text style={styles.disableBtnText}>Disable</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <Pressable style={styles.installBtn} onPress={onToggle}>
              <Text style={styles.installBtnText}>Install</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function ExtensionsPanel() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [tab, setTab] = useState<'marketplace' | 'installed' | 'recommended'>('marketplace');
  const [installedIds, setInstalledIds] = useState<Set<string>>(
    new Set(ALL_EXTENSIONS.filter(e => e.installed).map(e => e.id))
  );

  const toggleInstall = (id: string) => {
    setInstalledIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getDisplayedExtensions = () => {
    let exts = ALL_EXTENSIONS;
    if (tab === 'installed') exts = exts.filter(e => installedIds.has(e.id));
    if (tab === 'recommended') exts = exts.filter(e => !installedIds.has(e.id)).slice(0, 8);
    return searchExtensions(exts, query, category);
  };

  const displayed = getDisplayedExtensions();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>EXTENSIONS</Text>
        <Pressable style={styles.headerBtn}>
          <Feather name="more-horizontal" size={15} color={vsColors.textDim} />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Feather name="search" size={13} color={vsColors.textDim} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Extensions in Marketplace"
          placeholderTextColor={vsColors.textDisabled}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')}>
            <Feather name="x" size={13} color={vsColors.textDim} />
          </Pressable>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['marketplace', 'installed', 'recommended'] as const).map(t => (
          <Pressable
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
              {t === 'installed' ? `Installed (${installedIds.size})` :
               t === 'marketplace' ? 'Marketplace' : 'Recommended'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
        {extensionCategories.slice(0, 8).map(cat => (
          <Pressable
            key={cat}
            style={[styles.catPill, category === cat && styles.catPillActive]}
            onPress={() => setCategory(c => c === cat ? 'All' : cat)}
          >
            <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Results count */}
      <View style={styles.resultCount}>
        <Text style={styles.resultCountText}>
          {displayed.length} extension{displayed.length !== 1 ? 's' : ''}
          {query ? ` for "${query}"` : ''}
        </Text>
      </View>

      {/* Extension list */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
        {displayed.map(ext => (
          <ExtensionCard
            key={ext.id}
            ext={ext}
            installed={installedIds.has(ext.id)}
            onToggle={() => toggleInstall(ext.id)}
          />
        ))}
        {displayed.length === 0 && (
          <View style={styles.empty}>
            <Feather name="search" size={28} color={vsColors.textDisabled} />
            <Text style={styles.emptyText}>No extensions found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vsColors.sidebarBg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 6 },
  headerTitle: { fontSize: 11, fontWeight: '700', color: vsColors.textDim, letterSpacing: 1 },
  headerBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 8,
    marginBottom: 6,
    backgroundColor: vsColors.inputBg,
    borderRadius: 4,
    paddingHorizontal: 8,
    height: 30,
    borderWidth: 1,
    borderColor: vsColors.border,
  },
  searchInput: { flex: 1, fontSize: 12, color: vsColors.text },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: vsColors.border },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: vsColors.accent },
  tabBtnText: { fontSize: 11, color: vsColors.textDim },
  tabBtnTextActive: { color: vsColors.text, fontWeight: '600' },
  categoryBar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  catPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: vsColors.border,
    marginRight: 5,
  },
  catPillActive: { backgroundColor: vsColors.accent + '33', borderColor: vsColors.accent },
  catText: { fontSize: 10, color: vsColors.textDim },
  catTextActive: { color: vsColors.accent },
  resultCount: { paddingHorizontal: 10, paddingVertical: 3 },
  resultCountText: { fontSize: 11, color: vsColors.textDisabled },
  list: { flex: 1 },
  card: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: vsColors.border,
  },
  iconWrap: { position: 'relative', width: 44, height: 44 },
  iconText: {
    width: 44,
    height: 44,
    textAlign: 'center',
    lineHeight: 44,
    fontSize: 18,
    fontWeight: '700',
    color: vsColors.textBright,
    backgroundColor: vsColors.panelHeaderBg,
    borderRadius: 8,
    overflow: 'hidden',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: vsColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 2 },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardName: { fontSize: 13, color: vsColors.textBright, fontWeight: '600', flex: 1 },
  installedBadge: {
    backgroundColor: vsColors.success + '33',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  installedBadgeText: { fontSize: 10, color: vsColors.success, fontWeight: '700' },
  disabledBadge: {
    backgroundColor: vsColors.border,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  disabledBadgeText: { fontSize: 10, color: vsColors.textDim },
  cardPublisher: { fontSize: 11, color: vsColors.accent },
  cardDesc: { fontSize: 12, color: vsColors.textDim, lineHeight: 17, marginTop: 1 },
  cardTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  tag: {
    backgroundColor: vsColors.selection,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  tagText: { fontSize: 10, color: vsColors.textDim },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 10, color: vsColors.textDim },
  ratingText: { fontSize: 10, color: '#CCA700' },
  metaFlex: { flex: 1 },
  actionRow: { flexDirection: 'row', gap: 6 },
  manageBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: vsColors.border,
  },
  manageBtnText: { fontSize: 11, color: vsColors.textDim },
  disableBtn: { borderColor: vsColors.border },
  disableBtnText: { fontSize: 11, color: vsColors.textDim },
  installBtn: {
    backgroundColor: vsColors.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 3,
  },
  installBtnText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  empty: { alignItems: 'center', padding: 30, gap: 8 },
  emptyText: { fontSize: 13, color: vsColors.textDisabled },
});
