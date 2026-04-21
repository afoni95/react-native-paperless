import { StyleSheet } from 'react-native';

/** Reusable layout styles for full-screen scrollable form screens. */
export const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  contentWithBottom: {
    padding: 16,
    paddingBottom: 32,
  },
});

/** Reusable form element styles shared across edit screens. */
export const formStyles = StyleSheet.create({
  input: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  algoRow: {
    marginBottom: 16,
  },
  algoButton: {
    marginRight: 4,
  },
});

/** Reusable action button styles for form save/delete operations. */
export const buttonStyles = StyleSheet.create({
  saveButton: {
    marginTop: 24,
    borderRadius: 8,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
  deleteButton: {
    marginTop: 12,
    borderRadius: 8,
  },
});
