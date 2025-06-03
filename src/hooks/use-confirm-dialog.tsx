import { useState, useCallback } from 'react';
import { ConfirmDialog } from '@/components/molecules/confirmDialog/ConfirmDialog';

type ConfirmDialogOptions = {
  title: string;
  description: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
};

/**
 * Custom hook for using a confirmation dialog
 * @returns An array containing the dialog component and a function to show the dialog
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions>({
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed with this action?',
  });
  const [resolveRef, setResolveRef] = useState<(value: boolean) => void>();

  const confirm = useCallback(
    (dialogOptions: ConfirmDialogOptions) => {
      setOptions({ ...dialogOptions });
      setIsOpen(true);
      return new Promise<boolean>((resolve) => {
        setResolveRef(() => resolve);
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (resolveRef) {
      resolveRef(true);
    }
    setIsOpen(false);
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    if (resolveRef) {
      resolveRef(false);
    }
    setIsOpen(false);
  }, [resolveRef]);

  const ConfirmDialogComponent = useCallback(
    () => (
      <ConfirmDialog
        isOpen={isOpen}
        title={options.title}
        description={options.description}
        confirmButtonText={options.confirmButtonText}
        cancelButtonText={options.cancelButtonText}
        confirmButtonVariant={options.confirmButtonVariant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    ),
    [isOpen, options, handleConfirm, handleCancel]
  );

  return [ConfirmDialogComponent, confirm] as const;
}
