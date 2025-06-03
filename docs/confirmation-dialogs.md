# Confirmation Dialogs in CMS

This document outlines the two recommended approaches for implementing confirmation dialogs in the CMS application.

## 1. Modal Dialog Confirmations

The modal dialog approach uses Shadcn UI's Dialog component to create a blocking confirmation dialog.

### Usage

```tsx
import { useConfirmDialog } from '../../../hooks/use-confirm-dialog';

const Component = () => {
  const [ConfirmDialog, confirmDialog] = useConfirmDialog();
  
  const handleDelete = async () => {
    const confirmed = await confirmDialog({
      title: "Confirm Deletion",
      description: "Are you sure you want to delete this item? This action cannot be undone.",
      confirmButtonText: "Delete",
      confirmButtonVariant: "destructive"
    });
    
    if (confirmed) {
      // Perform the delete operation
    }
  };
  
  return (
    <div>
      <ConfirmDialog /> {/* Don't forget to include this */}
      <button onClick={handleDelete}>Delete Item</button>
    </div>
  );
}
```

### When to Use

- For critical destructive operations
- When you need to provide detailed context about the confirmation
- When multiple confirmation options are needed
- When you want to ensure user attention (blocking UI)

## 2. Toast Notification Confirmations

The toast notification approach uses Sonner toast library to create a non-blocking confirmation.

### Usage 

```tsx
import { showToast } from '../../utils/toast';

const Component = () => {
  const handleDelete = () => {
    showToast.confirm(
      "Are you sure you want to delete this item?",
      () => {
        // Handle confirmation
      },
      () => {
        // Optional: Handle cancellation
      }
    );
  };
  
  return (
    <button onClick={handleDelete}>Delete Item</button>
  );
}
```

### When to Use

- For non-critical confirmations
- When maintaining workflow context is important
- For a less intrusive user experience
- For simple yes/no confirmations without additional details

## Demo

Visit the [Confirmation Demo](/demo/confirmations) page to see both approaches in action.

## Best Practices

1. **Be Clear**: Always use clear language about what will happen when the action is confirmed
2. **Destruction Warning**: Use red/destructive button styling for dangerous actions
3. **Default Buttons**: The safer option should be the default (usually cancel)
4. **Consistency**: Be consistent with your confirmation pattern choice across similar features
