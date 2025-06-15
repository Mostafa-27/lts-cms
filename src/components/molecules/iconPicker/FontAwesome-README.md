# FontAwesome IconPicker Component

A modern, searchable FontAwesome icon picker component built with React, TypeScript, and shadcn/ui components.

## Features

- 🔍 **Searchable**: Quickly find icons by typing keywords
- 🎨 **Modern UI**: Built with shadcn/ui components for consistent styling
- 📱 **Responsive**: Works well on all screen sizes
- ♿ **Accessible**: Proper ARIA labels and keyboard navigation
- 🎯 **TypeScript**: Full type safety with TypeScript support
- 🎪 **FontAwesome Icons**: Access to all FontAwesome solid icons
- 🎮 **Interactive**: Hover effects and visual feedback

## Installation

Make sure you have the required dependencies installed:

```bash
npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome
```

## Usage

```tsx
import React, { useState } from "react";
import { FontAwesomeIconPicker } from "@/components/molecules/iconPicker";

const MyComponent = () => {
  const [selectedIcon, setSelectedIcon] = useState("faBus");

  return (
    <FontAwesomeIconPicker
      value={selectedIcon}
      onValueChange={setSelectedIcon}
      code="Transport Icon"
      placeholder="Select a transport icon"
    />
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `"faBus"` | Currently selected icon name |
| `onValueChange` | `(iconName: string) => void` | - | Callback when icon is selected |
| `code` | `string` | `"Icon Picker"` | Title displayed in the dialog header |
| `placeholder` | `string` | `"Select an icon"` | Placeholder text for the trigger button |
| `className` | `string` | - | Additional CSS classes for the trigger button |

## Examples

### Basic Usage

```tsx
<FontAwesomeIconPicker
  value="faHeart"
  onValueChange={(icon) => console.log('Selected:', icon)}
/>
```

### Custom Styling

```tsx
<FontAwesomeIconPicker
  value="faStar"
  onValueChange={setIcon}
  className="w-16 h-16 border-2 border-blue-500"
  code="Rating Icon"
  placeholder="Choose rating icon"
/>
```

### Form Integration

```tsx
import { useForm } from "react-hook-form";

const FormExample = () => {
  const { register, watch, setValue } = useForm({
    defaultValues: { icon: "faUser" }
  });
  
  const iconValue = watch("icon");

  return (
    <form>
      <FontAwesomeIconPicker
        value={iconValue}
        onValueChange={(icon) => setValue("icon", icon)}
        code="Profile Icon"
      />
    </form>
  );
};
```

## Available Icons

The component provides access to all FontAwesome solid icons (fa*). Some popular categories include:

- **Navigation**: faArrowUp, faArrowDown, faChevronLeft, faChevronRight, faBars
- **Media**: faPlay, faPause, faStop, faVolumeUp, faImage, faVideo
- **Communication**: faEnvelope, faPhone, faComment, faShare, faUsers
- **Business**: faBriefcase, faBuilding, faCalendar, faDollarSign, faChartBar
- **Technology**: faLaptop, faMobile, faWifi, faCloud, faDatabase
- **Transport**: faCar, faPlane, faTrain, faBus, faBicycle, faShip

## Utility Functions

The component comes with several utility functions in `fontAwesomeIconLibrary.ts`:

```tsx
import {
  getFontAwesomeIconByName,
  getAllFontAwesomeIconNames,
  isValidFontAwesomeIconName,
  fontAwesomeIconCategories
} from "@/utils/fontAwesomeIconLibrary";

// Get icon definition
const iconDef = getFontAwesomeIconByName("faHeart");

// Get all available icon names
const allIcons = getAllFontAwesomeIconNames();

// Check if icon name is valid
const isValid = isValidFontAwesomeIconName("faInvalidIcon");

// Get icons by category
const transportIcons = fontAwesomeIconCategories.transport;
```

## Styling

The component uses Tailwind CSS classes and can be customized through:

1. **CSS Classes**: Pass custom classes via the `className` prop
2. **shadcn/ui Theme**: Customize colors through your shadcn/ui theme configuration
3. **CSS Variables**: Override specific design tokens

## Demo

To see the component in action, check out the demo component:

```tsx
import { FontAwesomeIconPickerDemo } from "@/components/molecules/iconPicker";

// Use in your app
<FontAwesomeIconPickerDemo />
```

## File Structure

```
src/components/molecules/iconPicker/
├── FontAwesomeIconPicker.tsx          # Main component
├── FontAwesomeIconPickerDemo.tsx      # Demo component
├── IconPicker.tsx                     # Lucide version (existing)
├── IconRenderer.tsx                   # Icon renderer utility
└── index.ts                           # Exports

src/utils/
└── fontAwesomeIconLibrary.ts          # FontAwesome utilities
```

## Dependencies

- React 18+
- TypeScript 4.5+
- @fortawesome/fontawesome-svg-core
- @fortawesome/free-solid-svg-icons  
- @fortawesome/react-fontawesome
- shadcn/ui components (Dialog, Button, Input, ScrollArea, Badge)
- Tailwind CSS
- Lucide React (for UI icons)

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## License

This component follows the same license as your project.
