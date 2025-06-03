import React from 'react';
import { Input } from '../../ui/input'; // Corrected path
import { Textarea } from '../../ui/textarea'; // Corrected path

// Define props based on what ShadCN Input and Textarea might need,
// plus any custom props like 'multiline'.
interface TextInputProps {
  id?: string;
  name?: string;
  value: string | number | readonly string[] | undefined; // Align with Input/Textarea value prop
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  placeholder?: string;
  className?: string;
  type?: string; // For Input component
  multiline?: boolean;
  rows?: number; // For Textarea component
  disabled?: boolean;
  label?: string; // Add label prop
  // Allow any other props that Input or Textarea might accept
  [key: string]: any;
}

const TextInput = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, TextInputProps>(({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  type = 'text',
  multiline = false,
  rows,
  disabled,
  label,
  ...rest // Capture any other props to pass to Input or Textarea
}, ref) => {
  const commonProps = {
    id,
    name,
    value,
    onChange,
    onBlur,
    placeholder,
    className, // ShadCN components handle their own base styling + merging with provided className
    disabled,
    ...rest,
  };

  const inputElement = multiline ? (
    <Textarea
      {...commonProps}
      rows={rows} // Pass rows specifically to Textarea
      ref={ref as React.Ref<HTMLTextAreaElement>} // Forward ref
    />
  ) : (
    <Input
      {...commonProps}
      type={type} // Pass type specifically to Input
      ref={ref as React.Ref<HTMLInputElement>} // Forward ref
    />
  );

  if (label) {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
        {inputElement}
      </div>
    );
  }

  return inputElement;
});

TextInput.displayName = "TextInput"; // Adding displayName for better debugging

export default TextInput;
