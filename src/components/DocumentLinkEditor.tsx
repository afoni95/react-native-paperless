import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Chip, Searchbar, List, Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useDocuments, useLinkedDocuments } from '@/reactQuery';
import { Document } from '@/types';
import { useDebounce } from '@/hooks';

const truncate = (title: string) => (title.length > 10 ? title.slice(0, 10) + '…' : title);

interface DocumentChipProps {
  doc: Document;
  onRemove?: () => void;
}

const DocumentChip: React.FC<DocumentChipProps> = ({ doc, onRemove }) => {
  const label = doc.title ? truncate(doc.title) : `#${doc.id}`;
  return (
    <Chip style={styles.chip} onClose={onRemove} closeIcon={onRemove ? 'close' : undefined}>
      {label}
    </Chip>
  );
};

interface DocumentLinkDisplayProps {
  ids: number[];
}

export const DocumentLinkDisplay: React.FC<DocumentLinkDisplayProps> = ({ ids }) => {
  const { data: linkedDocs } = useLinkedDocuments(ids);

  const docsById = useMemo(() => {
    const map = new Map<number, Document>();
    linkedDocs?.results.forEach((doc) => {
      map.set(doc.id, doc);
    });
    return map;
  }, [linkedDocs?.results]);

  if (ids.length === 0) return null;

  return (
    <View style={styles.chipsRow}>
      {ids.map((id) => {
        const doc = docsById.get(id);
        if (!doc) return null;
        return <DocumentChip key={id} doc={doc} />;
      })}
    </View>
  );
};

interface DocumentLinkEditorProps {
  value: number[];
  onChange: (ids: number[]) => void;
}

export const DocumentLinkEditor: React.FC<DocumentLinkEditorProps> = ({ value, onChange }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: searchResults, isFetching } = useDocuments(
    { query: debouncedSearch, page_size: 10, truncate_content: true },
    debouncedSearch.trim().length > 0,
  );

  const { data: linkedDocs } = useLinkedDocuments(value);

  const handleAdd = (docId: number) => {
    if (!value.includes(docId)) {
      onChange([...value, docId]);
    }
    setSearch('');
  };

  const handleRemove = (docId: number) => {
    onChange(value.filter((id) => id !== docId));
  };

  const filteredResults = (searchResults?.results ?? []).filter((doc) => !value.includes(doc.id));

  const docsById = useMemo(() => {
    const map = new Map<number, Document>();
    linkedDocs?.results.forEach((doc) => {
      map.set(doc.id, doc);
    });
    return map;
  }, [linkedDocs?.results]);

  return (
    <View>
      {value.length > 0 && (
        <View style={styles.chipsRow}>
          {value
            .map((id) => docsById.get(id))
            .filter((doc): doc is Document => doc !== undefined)
            .map((doc) => (
              <DocumentChip key={doc.id} doc={doc} onRemove={() => handleRemove(doc.id)} />
            ))}
        </View>
      )}

      <Searchbar
        placeholder={t('documents.search')}
        value={search}
        onChangeText={setSearch}
        style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
        inputStyle={styles.searchInput}
        elevation={0}
      />

      {debouncedSearch.trim().length > 0 && (
        <View
          style={[
            styles.results,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
          ]}
        >
          {isFetching ? (
            <ActivityIndicator style={styles.spinner} size="small" />
          ) : filteredResults.length === 0 ? (
            <Text
              variant="bodySmall"
              style={[styles.noResults, { color: theme.colors.onSurfaceVariant }]}
            >
              {t('common.noResults')}
            </Text>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              {filteredResults.map((doc) => (
                <List.Item
                  key={doc.id}
                  title={doc.title}
                  onPress={() => handleAdd(doc.id)}
                  left={(props) => <List.Icon {...props} icon="file-document-outline" />}
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    marginBottom: 2,
  },
  searchBar: {
    elevation: 0,
    borderRadius: 8,
  },
  searchInput: {
    fontSize: 14,
  },
  results: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
    overflow: 'hidden',
  },
  spinner: {
    padding: 12,
  },
  noResults: {
    padding: 12,
    textAlign: 'center',
  },
});
