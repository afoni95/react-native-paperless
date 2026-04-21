import { NavigatorScreenParams } from '@react-navigation/native';
import { WorkflowTrigger, WorkflowAction } from '@/types/workflows';

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
  ManageTab: NavigatorScreenParams<ManageStackParamList>;
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
  TrashBin: undefined;
  TasksList: undefined;
  LogsView: undefined;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
  GlobalSearchResults: { query: string };
};
