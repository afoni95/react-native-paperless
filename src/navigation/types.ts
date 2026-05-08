import { NavigatorScreenParams } from '@react-navigation/native';
import { WorkflowTrigger, WorkflowAction } from '@/types/workflows';
import type { AnalyticsWidgetType } from '@/features/analytics/types';

export type TriggerEditResult =
  | {
      token: number;
      mode: 'save';
      trigger: Partial<WorkflowTrigger>;
    }
  | {
      token: number;
      mode: 'delete';
      triggerId: number;
    };

export type ActionEditResult =
  | {
      token: number;
      mode: 'save';
      action: Partial<WorkflowAction>;
    }
  | {
      token: number;
      mode: 'delete';
      actionId: number;
    };

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabsParamList = {
  DashboardTab: undefined;
  DocumentsTab: NavigatorScreenParams<DocumentsStackParamList>;
  UploadTab: undefined;
  AnalyticsTab: NavigatorScreenParams<AnalyticsStackParamList>;
  ManageTab: NavigatorScreenParams<ManageStackParamList>;
};

export type AnalyticsStackParamList = {
  AnalyticsHome: undefined;
  AnalyticsWidgetEditor: {
    widgetId?: string;
    widgetType?: AnalyticsWidgetType;
  };
};

export type DocumentsStackParamList = {
  DocumentList: undefined;
  DocumentDetail: { documentId: number };
  PdfViewer: { documentId: number };
};

export type ManageStackParamList = {
  ManageHome: undefined;
  UsersList: undefined;
  UserEdit: { userId?: number };
  GroupsList: undefined;
  GroupEdit: { groupId?: number };
  MailAccountsList: undefined;
  MailAccountEdit: { mailAccountId?: number };
  MailRulesList: undefined;
  MailRuleEdit: { mailRuleId?: number };
  MailOverview: undefined;
  TagsList: undefined;
  TagEdit: { tagId?: number };
  CorrespondentsList: undefined;
  CorrespondentEdit: { correspondentId?: number };
  DocumentTypesList: undefined;
  DocumentTypeEdit: { documentTypeId?: number };
  StoragePathsList: undefined;
  StoragePathEdit: { storagePathId?: number };
  CustomFieldsList: undefined;
  CustomFieldEdit: { customFieldId?: number };
  WorkflowsList: undefined;
  WorkflowEdit: {
    workflowId?: number;
    triggerResult?: TriggerEditResult;
    actionResult?: ActionEditResult;
  };
  TriggerEdit: {
    workflowId: number;
    triggerId?: number;
    trigger?: WorkflowTrigger;
  };
  ActionEdit: {
    workflowId: number;
    actionId?: number;
    action?: WorkflowAction;
  };
  Settings: undefined;
  Display: undefined;
  SystemOverview: undefined;
  MasterDataOverview: undefined;
  AccessOverview: undefined;
  About: undefined;
  TrashBin: undefined;
  TasksList: undefined;
  LogsView: undefined;
  ProcessedMailList: undefined;
  PendingSync: undefined;
  OfflineTagCreate: undefined;
  OfflineCorrespondentCreate: undefined;
  OfflineDocTypeCreate: undefined;
  ShareLinksList: undefined;
  ShareLinkCreate: { documentId?: number };
};

export type DashboardStackParamList = {
  Dashboard: undefined;
  GlobalSearchResults: { query: string };
  DocumentDetail: { documentId: number };
  PdfViewer: { documentId: number };
};
