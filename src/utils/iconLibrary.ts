import * as LucideIcons from "lucide-react";

// Export all lucide icons for easy access
export const iconLibrary = LucideIcons;

// Get icon component by name
export const getIconByName = (iconName: string): React.ComponentType<{ className?: string }> | null => {
  const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<{
    className?: string;
  }>;
  
  return IconComponent || null;
};

// Get all available icon names
export const getAllIconNames = (): string[] => {
  // Collect all icon names from all categories
  const allCategoryIcons = Object.values(iconCategories).flat();
  
  // Remove duplicates using Set
  const uniqueIcons = [...new Set(allCategoryIcons)];
  
  // console.log("Total icons from categories:", uniqueIcons.length);
  // console.log("First 10 icons:", uniqueIcons.slice(0, 10));
  
  return uniqueIcons;
};

// Common icon categories for easier navigation
export const iconCategories = {
  general: [
    'Star', 'Heart', 'Home', 'User', 'Settings', 'Search', 'Plus', 'Minus', 
    'X', 'Check', 'Info', 'AlertCircle', 'HelpCircle', 'Bell', 'Mail',
    'BookOpen', 'Award', 'Crown', 'Diamond', 'Gem', 'Key', 'Lock', 'Unlock',
    'Shield', 'ShieldCheck', 'Flag', 'Bookmark', 'Pin', 'Lightbulb', 'Fingerprint'
  ],
  navigation: [
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ChevronUp', 'ChevronDown', 
    'ChevronLeft', 'ChevronRight', 'Menu', 'MoreHorizontal', 'MoreVertical',
    'ArrowUpRight', 'ArrowDownLeft', 'ArrowBigUp', 'ArrowBigDown', 'Navigation2',
    'Compass', 'Move', 'MoveUp', 'MoveDown', 'CornerUpLeft', 'CornerDownRight',
    'ChevronsUp', 'ChevronsDown', 'ChevronsLeft', 'ChevronsRight', 'ArrowUpCircle'
  ],
  media: [
    'Play', 'Pause', 'Stop', 'Volume2', 'VolumeX', 'Image', 'Video', 'Camera', 
    'Music', 'Headphones', 'Speaker',
    'PlayCircle', 'PauseCircle', 'StopCircle', 'FastForward', 'Rewind', 'SkipForward',
    'SkipBack', 'Volume1', 'VolumeOff', 'Mic', 'MicOff', 'Radio', 'Tv', 'Monitor',
    'Film', 'ImagePlay', 'Clapperboard', 'Youtube', 'Podcast'
  ],
  files: [
    'File', 'FileText', 'Folder', 'FolderOpen', 'Download', 'Upload', 'Save', 
    'Copy', 'Trash2', 'Edit', 'Eye', 'EyeOff',
    'Files', 'FolderPlus', 'FolderMinus', 'Archive', 'FileImage', 'FileVideo',
    'FileAudio', 'FilePdf', 'FileSpreadsheet', 'HardDrive', 'Clipboard', 'ClipboardList',
    'ClipboardCheck', 'ClipboardCopy', 'Paperclip', 'Link', 'ExternalLink', 'Import'
  ],
  communication: [
    'MessageCircle', 'MessageSquare', 'Phone', 'PhoneCall', 'Video', 'Users', 
    'UserPlus', 'Share', 'Send', 'AtSign',
    'MessageSquarePlus', 'MessageSquareMore', 'PhoneIncoming', 'PhoneOutgoing', 'PhoneMissed',
    'UserMinus', 'UserCheck', 'UserX', 'Users2', 'Contact', 'Contacts', 'Share2',
    'Forward', 'Reply', 'ReplyAll', 'Inbox', 'Megaphone', 'Rss', 'Antenna'
  ],
  business: [
    'Briefcase', 'Building', 'Calendar', 'Clock', 'DollarSign', 'TrendingUp', 
    'TrendingDown', 'BarChart3', 'PieChart', 'Target',
    'Building2', 'Factory', 'Landmark', 'CalendarDays', 'CalendarCheck', 'CalendarClock',
    'Timer', 'Banknote', 'CreditCard', 'Coins', 'Euro', 'PoundSterling', 'TrendingUpDown',
    'BarChart', 'BarChart2', 'BarChart4', 'LineChart', 'Activity', 'Zap', 'Calculator'
  ],
  technology: [
    'Smartphone', 'Laptop', 'Monitor', 'Wifi', 'WifiOff', 'Bluetooth', 'Battery', 
    'Zap', 'Code', 'Database', 'Server', 'Cloud',
    'Tablet', 'Watch', 'Tv2', 'Gamepad2', 'Router', 'Signal', 'SignalHigh', 'SignalLow',
    'BatteryLow', 'BatteryFull', 'Cpu', 'HardDrive', 'MemoryStick', 'Usb', 'Ethernet',
    'CodeXml', 'Terminal', 'Binary', 'Bug', 'Workflow', 'GitBranch', 'Globe'
  ],
  weather: [
    'Sun', 'Moon', 'Cloud', 'CloudRain', 'CloudSnow', 'CloudLightning', 
    'Umbrella', 'Wind', 'Thermometer',
    'Sunrise', 'Sunset', 'CloudDrizzle', 'CloudHail', 'CloudFog', 'Snowflake',
    'Tornado', 'Rainbow', 'Waves', 'Droplets', 'Flame', 'Cloudy', 'PartlyCloudy'
  ],
  transport: [
    'Car', 'Plane', 'Train', 'Bus', 'Bike', 'Truck', 'Ship', 'Fuel', 
    'MapPin', 'Map', 'Navigation',
    'CarFront', 'PlaneTakeoff', 'PlaneLanding', 'Taxi', 'Ambulance', 'Rocket',
    'Boat', 'Anchor', 'Sailboat', 'Subway', 'Tram', 'ParkingCircle', 'Construction',
    'Route', 'Milestone', 'Signpost', 'TrafficCone', 'CarTaxiFront', 'Footprints'
  ],
  shopping: [
    'ShoppingCart', 'ShoppingBag', 'CreditCard', 'Gift', 'Package', 'Store', 
    'Tag', 'Percent', 'Receipt',
    'Wallet', 'Banknote', 'HandCoins', 'GiftCard', 'PackageOpen', 'Package2',
    'ShoppingBasket', 'Shirt', 'Gem', 'Watch', 'Glasses', 'ShirtOff', 'Tags',
    'BadgePercent', 'ReceiptText', 'Scan', 'QrCode', 'Barcode'
  ],
  social: [
    'Facebook', 'Instagram', 'Twitter', 'Linkedin', 'Github', 'Youtube', 'Twitch',
    'Discord', 'Slack', 'MessageCircleMore', 'ThumbsUp', 'ThumbsDown', 'Heart',
    'HeartHandshake', 'Smile', 'Laugh', 'Frown', 'Users2', 'UserCircle', 'Crown'
  ],
  health: [
    'Heart', 'HeartPulse', 'Activity', 'Pill', 'Stethoscope', 'Thermometer',
    'Syringe', 'Bandage', 'Cross', 'Plus', 'Hospital', 'Ambulance', 'Brain',
    'Eye', 'Ear', 'Hand', 'Footprints', 'Baby', 'PersonStanding', 'Dumbbell'
  ],
  sports: [
    'Trophy', 'Medal', 'Target', 'Zap', 'Timer', 'Flag', 'Gamepad2', 'Dumbbell',
    'Bike', 'Car', 'Plane', 'Waves', 'Mountain', 'Tent', 'Compass', 'Route',
    'Award', 'Crown', 'Star', 'Goal', 'Football', 'Activity', 'TrendingUp'
  ],
  food: [
    'Coffee', 'Cookie', 'Pizza', 'Apple', 'Grape', 'Cherry', 'Banana', 'Carrot',
    'Fish', 'Beef', 'Egg', 'Milk', 'IceCream', 'Cake', 'Sandwich', 'Soup',
    'UtensilsCrossed', 'ChefHat', 'Wine', 'Beer', 'GlassWater', 'Martini'
  ]
};

// Get icons by category
export const getIconsByCategory = (category: keyof typeof iconCategories): string[] => {
  return iconCategories[category] || [];
};

// Check if an icon name is valid
export const isValidIconName = (iconName: string): boolean => {
  return iconName in LucideIcons && typeof LucideIcons[iconName as keyof typeof LucideIcons] === 'function';
};
