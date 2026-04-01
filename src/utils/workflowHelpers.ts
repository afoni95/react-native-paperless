import { TriggerType, ActionType } from '@/types/workflows';

export const getTriggerTypeName = (type: TriggerType | number): string => {
  switch (type) {
    case TriggerType.ConsumptionStarted:
    case 1:
      return 'Consumption Started';
    case TriggerType.DocumentAdded:
    case 2:
      return 'Document Added';
    case TriggerType.DocumentUpdated:
    case 3:
      return 'Document Updated';
    case TriggerType.Scheduled:
    case 4:
      return 'Scheduled';
    default:
      return 'Unknown';
  }
};

export const getActionTypeName = (type: ActionType | number): string => {
  switch (type) {
    case ActionType.Assignment:
    case 1:
      return 'Assignment';
    case ActionType.Removal:
    case 2:
      return 'Removal';
    default:
      return 'Unknown';
  }
};

export const triggerTypeOptions = [
  { label: 'workflows.triggerConsumptionStarted', value: TriggerType.ConsumptionStarted },
  { label: 'workflows.triggerDocumentAdded', value: TriggerType.DocumentAdded },
  { label: 'workflows.triggerDocumentUpdated', value: TriggerType.DocumentUpdated },
  { label: 'workflows.triggerScheduled', value: TriggerType.Scheduled },
];

export const actionTypeOptions = [
  { label: 'workflows.actionAssignment', value: ActionType.Assignment },
  { label: 'workflows.actionRemoval', value: ActionType.Removal },
];
