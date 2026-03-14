import { useState, useMemo, Dispatch, SetStateAction } from 'react';
import { DocumentCustomFieldValue, CustomField } from '@/types';
import { getDefaultCustomFieldValue } from '@/utils';

export interface UseCustomFieldsFormReturn {
  customFields: DocumentCustomFieldValue[];
  setCustomFields: Dispatch<SetStateAction<DocumentCustomFieldValue[]>>;
  fieldToAdd: number | null;
  setFieldToAdd: Dispatch<SetStateAction<number | null>>;
  availableFields: CustomField[];
  updateFieldValue: (fieldId: number, value: DocumentCustomFieldValue['value']) => void;
  removeField: (fieldId: number) => void;
  addField: () => void;
}

export const useCustomFieldsForm = (
  allCustomFields: CustomField[] | undefined,
  initialFields?: DocumentCustomFieldValue[],
): UseCustomFieldsFormReturn => {
  const [customFields, setCustomFields] = useState<DocumentCustomFieldValue[]>(initialFields || []);
  const [fieldToAdd, setFieldToAdd] = useState<number | null>(null);

  const customFieldsMap = useMemo(() => {
    const map = new Map<number, CustomField>();
    (allCustomFields || []).forEach((field) => {
      map.set(field.id, field);
    });
    return map;
  }, [allCustomFields]);

  const availableFields = useMemo(
    () =>
      (allCustomFields || []).filter(
        (field) => !customFields.some((entry) => entry.field === field.id),
      ),
    [allCustomFields, customFields],
  );

  const updateFieldValue = (fieldId: number, value: DocumentCustomFieldValue['value']) => {
    setCustomFields((prev) =>
      prev.map((entry) => (entry.field === fieldId ? { ...entry, value } : entry)),
    );
  };

  const removeField = (fieldId: number) => {
    setCustomFields((prev) => prev.filter((entry) => entry.field !== fieldId));
  };

  const addField = () => {
    if (!fieldToAdd) return;
    const fieldDefinition = customFieldsMap.get(fieldToAdd);
    setCustomFields((prev) => {
      if (prev.some((entry) => entry.field === fieldToAdd)) return prev;
      return [...prev, { field: fieldToAdd, value: getDefaultCustomFieldValue(fieldDefinition) }];
    });
    setFieldToAdd(null);
  };

  return {
    customFields,
    setCustomFields,
    fieldToAdd,
    setFieldToAdd,
    availableFields,
    updateFieldValue,
    removeField,
    addField,
  };
};
