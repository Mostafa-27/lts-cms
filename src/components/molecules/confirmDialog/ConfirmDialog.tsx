import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonVariant = 'default',
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onCancel}>
            {cancelButtonText}
          </Button>
          <Button variant={confirmButtonVariant} onClick={onConfirm}>
            {confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
