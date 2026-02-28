export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabsParamList = {
  DashboardTab: undefined;
  DocumentsTab: undefined;
  UploadTab: undefined;
  ManageTab: undefined;
};

export type DocumentsStackParamList = {
  DocumentList: undefined;
  DocumentDetail: { documentId: number };
  PdfViewer: { documentId: number };
};

export type ManageStackParamList = {
  ManageHome: undefined;
  TagsList: undefined;
  TagEdit: { tagId?: number };
  CorrespondentsList: undefined;
  CorrespondentEdit: { correspondentId?: number };
  DocumentTypesList: undefined;
  DocumentTypeEdit: { documentTypeId?: number };
  Settings: undefined;
};
