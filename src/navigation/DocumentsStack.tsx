import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { DocumentListScreen } from '@/features/documents/DocumentListScreen';
import { DocumentDetailScreen } from '@/features/documents/DocumentDetailScreen';
import { PdfViewerScreen } from '@/features/documents/PdfViewerScreen';
import { GlobalSearchResultsScreen } from '@/features/documents/GlobalSearchResultsScreen';
import { DocumentsStackParamList } from './types';

const Stack = createNativeStackNavigator<DocumentsStackParamList>();

export const DocumentsStack: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DocumentList"
        component={DocumentListScreen}
        options={{ title: t('documents.title') }}
      />
      <Stack.Screen
        name="DocumentDetail"
        component={DocumentDetailScreen}
        options={{ title: t('documents.detail') }}
      />
      <Stack.Screen name="PdfViewer" component={PdfViewerScreen} options={{ title: 'PDF' }} />
      <Stack.Screen
        name="GlobalSearchResults"
        component={GlobalSearchResultsScreen}
        options={{ title: t('search.results') }}
      />
    </Stack.Navigator>
  );
};
