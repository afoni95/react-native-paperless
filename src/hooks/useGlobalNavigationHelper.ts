import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { MainTabsParamList } from '@/navigation/types';

type GlobalDestinationParams = {
  documentList: undefined;
  documentDetail: { documentId: number };
  pdfViewer: { documentId: number };
  manageHome: undefined;
  tagsList: undefined;
  tagEdit: { tagId?: number };
  correspondentsList: undefined;
  correspondentEdit: { correspondentId?: number };
  documentTypesList: undefined;
  documentTypeEdit: { documentTypeId?: number };
  settings: undefined;
  trashBin: undefined;
  tasksList: undefined;
  logsView: undefined;
};

type DestinationArgs<TDestination extends keyof GlobalDestinationParams> =
  undefined extends GlobalDestinationParams[TDestination]
    ? [destination: TDestination, params?: GlobalDestinationParams[TDestination]]
    : [destination: TDestination, params: GlobalDestinationParams[TDestination]];

export const useGlobalNavigationHelper = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();

  const navigateTo = useCallback(
    <TDestination extends keyof GlobalDestinationParams>(
      ...args: DestinationArgs<TDestination>
    ) => {
      const [destination, params] = args;

      switch (destination) {
        case 'documentList':
          navigation.navigate('DocumentsTab', { screen: 'DocumentList' });
          return;
        case 'documentDetail':
          navigation.navigate('DocumentsTab', {
            screen: 'DocumentDetail',
            params: params as GlobalDestinationParams['documentDetail'],
          });
          return;
        case 'pdfViewer':
          navigation.navigate('DocumentsTab', {
            screen: 'PdfViewer',
            params: params as GlobalDestinationParams['pdfViewer'],
          });
          return;
        case 'manageHome':
          navigation.navigate('ManageTab', { screen: 'ManageHome' });
          return;
        case 'tagsList':
          navigation.navigate('ManageTab', { screen: 'TagsList' });
          return;
        case 'tagEdit':
          navigation.navigate('ManageTab', {
            screen: 'TagEdit',
            params: params as GlobalDestinationParams['tagEdit'],
          });
          return;
        case 'correspondentsList':
          navigation.navigate('ManageTab', { screen: 'CorrespondentsList' });
          return;
        case 'correspondentEdit':
          navigation.navigate('ManageTab', {
            screen: 'CorrespondentEdit',
            params: params as GlobalDestinationParams['correspondentEdit'],
          });
          return;
        case 'documentTypesList':
          navigation.navigate('ManageTab', { screen: 'DocumentTypesList' });
          return;
        case 'documentTypeEdit':
          navigation.navigate('ManageTab', {
            screen: 'DocumentTypeEdit',
            params: params as GlobalDestinationParams['documentTypeEdit'],
          });
          return;
        case 'settings':
          navigation.navigate('ManageTab', { screen: 'Settings' });
          return;
        case 'trashBin':
          navigation.navigate('ManageTab', { screen: 'TrashBin' });
          return;
        case 'tasksList':
          navigation.navigate('ManageTab', { screen: 'TasksList' });
          return;
        case 'logsView':
          navigation.navigate('ManageTab', { screen: 'LogsView' });
          return;
      }
    },
    [navigation],
  );

  return { navigateTo };
};
