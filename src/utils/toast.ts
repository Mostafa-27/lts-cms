import { toast } from 'sonner';

/**
 * Helper utilities for displaying toast notifications
 */
export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },
  error: (message: string) => {
    toast.error(message);
  },
  info: (message: string) => {
    toast.info(message);
  },
  warning: (message: string) => {
    toast.warning(message);
  },
  /**
   * Shows a confirmation dialog using toast
   * @param message The message to display
   * @param onConfirm Callback to execute when confirmed
   * @param onCancel Optional callback to execute when canceled
   */
  confirm: (message: string, onConfirm: () => void) => {
    toast(message, {
      action: {
        label: "Confirm",
        onClick: onConfirm,
      }
     
       // Give more time for user to decide
    });
  }
};
