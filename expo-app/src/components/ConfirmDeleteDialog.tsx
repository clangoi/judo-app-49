import React from 'react';
import { Dialog, Portal, Button } from 'react-native-paper';
import { Text } from 'react-native';

interface ConfirmDeleteDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  visible,
  onDismiss,
  onConfirm,
  title = "Confirmar eliminación",
  message = "¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.",
  confirmText = "Eliminar",
  cancelText = "Cancelar"
}) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text>{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{cancelText}</Button>
          <Button 
            onPress={() => {
              onConfirm();
              onDismiss();
            }}
            textColor="#D32F2F"
          >
            {confirmText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ConfirmDeleteDialog;