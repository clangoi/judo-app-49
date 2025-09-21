import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Dialog, Portal, Button } from 'react-native-paper';

interface EntryFormModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: () => void;
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  submitText?: string;
  cancelText?: string;
  submitDisabled?: boolean;
}

const EntryFormModal: React.FC<EntryFormModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  title,
  children,
  isLoading = false,
  submitText = "Guardar",
  cancelText = "Cancelar",
  submitDisabled = false
}) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Dialog.Content style={styles.content}>
              {children}
            </Dialog.Content>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button 
            mode="contained"
            onPress={onSubmit}
            loading={isLoading}
            disabled={submitDisabled || isLoading}
            buttonColor="#283750"
          >
            {submitText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '90%',
  },
  scrollArea: {
    maxHeight: 400,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingBottom: 0,
  },
});

export default EntryFormModal;