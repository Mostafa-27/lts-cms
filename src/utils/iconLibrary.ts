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
  
  return uniqueIcons;
};

export const iconCategories = {
  all: [
    // Extracted from Lucide icon list (shortened for readability)
    'AArrowDown', 'AArrowUp', 'ALargeSmall', 'Accessibility', 'Activity', 'ActivitySquare',
    'AirVent', 'Airplay', 'AlarmClock', 'AlarmClockCheck', 'AlarmClockMinus', 'AlarmClockOff',
    'Album', 'AlignCenter', 'AlignCenterHorizontal', 'AlignCenterVertical', 'AlignEndHorizontal',
    'AlignEndVertical', 'AlignStartHorizontal', 'AlignStartVertical', 'AlignLeft', 'AlignRight',
    'AlignJustify', 'AlignSpaceAround', 'AlignSpaceBetween', 'AlignTop', 'AlignBottom',
    'AlignHorizontalDistributeCenter', 'AlignHorizontalDistributeEnd', 'AlignHorizontalDistributeStart',
    'AlignVerticalDistributeCenter', 'AlignVerticalDistributeEnd', 'AlignVerticalDistributeStart',
    'Anchor', 'Angry', 'Annoyed', 'Antenna', 'Aperture', 'AppWindow', 'Apple', 'Archive',
    'ArchiveRestore', 'AreaChart', 'Armchair', 'ArrowBigDown', 'ArrowBigDownDash', 'ArrowBigLeft',
    'ArrowBigLeftDash', 'ArrowBigRight', 'ArrowBigRightDash', 'ArrowBigUp', 'ArrowBigUpDash',
    'ArrowDown', 'ArrowDown01', 'ArrowDown10', 'ArrowDownAZ', 'ArrowDownCircle', 'ArrowDownFromLine',
    'ArrowDownLeft', 'ArrowDownLeftFromCircle', 'ArrowDownNarrowWide', 'ArrowDownRight',
    'ArrowDownSquare', 'ArrowDownToCaret', 'ArrowDownToDottedLine', 'ArrowDownToLine',
    'ArrowDownWideNarrow', 'ArrowDownZA', 'ArrowLeft', 'ArrowLeftCircle', 'ArrowLeftFromLine',
    'ArrowLeftSquare', 'ArrowLeftToLine', 'ArrowRight', 'ArrowRightCircle', 'ArrowRightFromLine',
    'ArrowRightSquare', 'ArrowRightToLine', 'ArrowUp', 'ArrowUp01', 'ArrowUp10', 'ArrowUpAZ',
    'ArrowUpCircle', 'ArrowUpFromCaret', 'ArrowUpFromDottedLine', 'ArrowUpFromLine',
    'ArrowUpLeft', 'ArrowUpLeftFromCircle', 'ArrowUpNarrowWide', 'ArrowUpRight',
    'ArrowUpRightFromCircle', 'ArrowUpSquare', 'ArrowUpToLine', 'ArrowUpWideNarrow',
    'ArrowUpZA', 'ArrowsUpDown', 'Asterisk', 'AtSign', 'Atom', 'Award', 'Axe', 'Axis3D',
    'Baby', 'Backpack', 'Badge', 'BaggageClaim', 'Ban', 'Banana', 'Banknote', 'BarChart',
    'BarChart3', 'BarChart4', 'BarChartHorizontal', 'Baseline', 'Bath', 'Battery', 'BatteryCharging',
    'BatteryFull', 'BatteryLow', 'BatteryMedium', 'BatteryWarning', 'Beaker', 'Bean', 'BeanOff',
    'Bed', 'BedDouble', 'BedSingle', 'Beef', 'Beer', 'Bell', 'BellDot', 'BellMinus', 'BellOff',
    'BellPlus', 'BellRing', 'Bells', 'Biohazard', 'Bird', 'Bitcoin', 'Blackboard', 'Blinds',
    'BlindsOpen', 'Bluetooth', 'BluetoothConnected', 'BluetoothOff', 'BluetoothSearching',
    'Bold', 'Bomb', 'Bone', 'Book', 'BookCopy', 'BookDown', 'BookHeadphones', 'BookImage',
    'BookKey', 'BookLock', 'BookMarked', 'BookMinus', 'BookOpen', 'BookOpenCheck', 'BookOpenDot',
    'BookOpenText', 'BookPlus', 'BookTemplate', 'BookText', 'BookType', 'BookUp', 'BookUp2',
    'BookUser', 'BookX', 'Bookmark', 'BookmarkCheck', 'BookmarkMinus', 'BookmarkPlus', 'BookmarkX',
    'BoomBox', 'Bot', 'BotMessageSquare', 'BotOff', 'Box', 'BoxSelect', 'Boxes', 'Braces',
    'Brackets', 'Brain', 'BrainCog', 'BrazilianReal', 'Bread', 'Briefcase', 'Bug', 'BugOff',
    'Building', 'Building2', 'Bus', 'BusFront', 'Cable', 'CableCar', 'Cake', 'CakeSlice',
    'Calculator', 'Calendar', 'CalendarCheck', 'CalendarClock', 'CalendarDays', 'CalendarFold',
    'CalendarHeart', 'CalendarMinus', 'CalendarMinus2', 'CalendarOff', 'CalendarPlus',
    'CalendarPlus2', 'CalendarRange', 'CalendarSearch', 'CalendarSync', 'CalendarX',
    'CalendarX2', 'Camera', 'CameraOff', 'CandlestickChart', 'Candy', 'CandyCane', 'CandyOff',
    'Cannabis', 'Captions', 'CaptionsOff', 'Car', 'CarFront', 'CarTaxiFront', 'Caravan',
    'CaretDown', 'CaretLeft', 'CaretRight', 'CaretSort', 'CaretUp', 'Carrot', 'CaseLower',
    'CaseSensitive', 'CaseUpper', 'CassetteTape', 'Cast', 'Castle', 'Cat', 'Cctv', 'ChartArea',
    'ChartBar', 'ChartBarBig', 'ChartCandlestick', 'ChartColumn', 'ChartColumnDecreasing',
    'ChartColumnIncreasing', 'ChartGantt', 'ChartHistogram', 'ChartLine', 'ChartNetwork',
    'ChartNoAxesColumn', 'ChartNoAxesCombined', 'ChartPie', 'ChartScatter', 'ChartSpline',
    'ChartSquaring', 'ChartTrending', 'ChartTrendingDown', 'ChartTrendingUp', 'ChartWireframe',
    'Check', 'CheckCheck', 'CheckCircle', 'CheckCircle2', 'CheckSquare', 'ChefHat', 'Cherry',
    'ChevronDown', 'ChevronDownCircle', 'ChevronDownSquare', 'ChevronFirst', 'ChevronLast',
    'ChevronLeft', 'ChevronLeftCircle', 'ChevronLeftSquare', 'ChevronRight', 'ChevronRightCircle',
    'ChevronRightSquare', 'ChevronUp', 'ChevronUpCircle', 'ChevronUpSquare', 'ChevronsDown',
    'ChevronsDownCircle', 'ChevronsLeft', 'ChevronsLeftCircle', 'ChevronsRight',
    'ChevronsRightCircle', 'ChevronsUp', 'ChevronsUpCircle', 'ChevronsUpDown',
    'ChevronsLeftRight', 'Church', 'Cigarette', 'CigaretteOff', 'Circle', 'CircleEllipsis',
    'CircleEqual', 'CircleFadingArrowDown', 'CircleFadingArrowLeft', 'CircleFadingArrowRight',
    'CircleFadingArrowUp', 'CircleGauge', 'CircleHelp', 'CircleMinus', 'CircleOff',
    'CircleParking', 'CircleParkingOff', 'CirclePause', 'CirclePercent', 'CirclePlay',
    'CirclePlus', 'CirclePower', 'CircleSlash', 'CircleSlash2', 'CircleStop', 'CircleUser',
    'CircleUserRound', 'CircleX', 'Clapperboard', 'Clipboard', 'ClipboardCheck',
    'ClipboardCopy', 'ClipboardEdit', 'ClipboardList', 'ClipboardMinus', 'ClipboardPaste',
    'ClipboardPen', 'ClipboardPenLine', 'ClipboardPlus', 'ClipboardSignature',
    'ClipboardType', 'ClipboardX', 'Clock', 'Clock1', 'Clock10', 'Clock11', 'Clock12',
    'Clock2', 'Clock3', 'Clock4', 'Clock5', 'Clock6', 'Clock7', 'Clock8', 'Clock9',
    'ClockArrowDown', 'ClockArrowUp', 'ClockOff', 'Cloud', 'CloudCog', 'CloudDrizzle',
    'CloudFog', 'CloudHail', 'CloudLightning', 'CloudMoon', 'CloudOff', 'CloudRain',
    'CloudSnow', 'CloudSun', 'CloudSunRain', 'CloudWind', 'CloudWindy', 'Clover',
    'Code', 'Code2', 'CodeXml', 'Coffee', 'Cog', 'Coins', 'Collapse', 'ColorBucket',
    'ColorLens', 'ColorSwatch', 'Columns', 'Columns2', 'Columns3', 'Columns3Cog',
    'Columns4', 'Command', 'Compass', 'Component', 'ConciergeBell', 'Confetti',
    'Construction', 'Contact', 'Contact2', 'ContactRound', 'Contrast', 'Cookie',
    'CookingPot', 'Copy', 'CopyCheck', 'CopyMinus', 'CopyPlus', 'CopySlash', 'CopyX',
    'Copyleft', 'Copyright', 'CornerDownLeft', 'CornerDownRight', 'CornerLeftDown',
    'CornerLeftUp', 'CornerRightDown', 'CornerRightUp', 'CornerUpLeft', 'CornerUpRight',
    'Cpu', 'CreativeCommons', 'CreditCard', 'Croissant', 'Crop', 'Cross', 'Crosshair',
    'Crown', 'Cube', 'Cuboid', 'CupSoda', 'CurlyBraces', 'Currency', 'Cylinder',
    'Dam', 'Dashboard', 'Database', 'DatabaseBackup', 'DatabaseZap', 'Delete',
    'Dessert', 'Diameter', 'Diamond', 'Dice1', 'Dice2', 'Dice3', 'Dice4', 'Dice5',
    'Dice6', 'Difference', 'Disc', 'Disc2', 'Disc3', 'DiscAlbum', 'Dismiss',
    'Divide', 'Dna', 'DnaOff', 'Dock', 'Dog', 'DollarSign', 'Dolphin', 'Donut',
    'DoorClosed', 'DoorOpen', 'Dot', 'Download', 'DownloadCloud', 'DraftingCompass',
    'Drama', 'Dribbble', 'Drink', 'Droplet', 'DropletOff', 'Dumbbell', 'Ear',
    'EarOff', 'EarPlugged', 'Edit', 'Egg', 'EggFried', 'Eject', 'Elephant',
    'Ellipsis', 'EllipsisVertical', 'Emoji', 'EmojiFrown', 'EmojiHappy',
    'EmojiMeh', 'EmojiSad', 'EmojiSmile', 'EmojiSurprise', 'Envelope',
    'Equal', 'EqualNot', 'Eraser', 'Euro', 'Expand', 'ExternalLink',
    'Eye', 'EyeOff', 'Eyedropper', 'EyeShadow', 'Facebook', 'Factory',
    'Fan', 'FastForward', 'Feather', 'Fence', 'FerrisWheel', 'Figma',
    'File', 'FileArchive', 'FileAudio', 'FileAudio2', 'FileAxis3d',
    'FileBarChart', 'FileBarChart2', 'FileBox', 'FileCheck', 'FileCheck2',
    'FileClock', 'FileCode', 'FileCode2', 'FileContract', 'FileDiff',
    'FileDigit', 'FileDown', 'FileEdit', 'FileExcel', 'FileFind',
    'FileFind2', 'FileHeart', 'FileImage', 'FileInput', 'FileJson',
    'FileJson2', 'FileKey', 'FileKey2', 'FileLibrary', 'FileLineChart',
    'FileLock', 'FileMinus', 'FileMinus2', 'FileMusic', 'FileOutput',
    'FilePen', 'FilePenLine', 'FilePieChart', 'FilePlus', 'FilePlus2',
    'FileQuestion', 'FileScan', 'FileSearch', 'FileSearch2', 'FileSliders',
    'FileSpreadsheet', 'FileStack', 'FileSymlink', 'FileTerminal',
    'FileText', 'FileText2', 'FileTime', 'FileTree', 'FileType2',
    'FileType', 'FileUp', 'FileVideo', 'FileVideo2', 'FileVolume',
    'FileWarning', 'FileX', 'FileX2', 'Files', 'Film', 'Filter',
    'FilterX', 'Fingerprint', 'Fire', 'FirstAidKit', 'Fish', 'FishOff',
    'FishSymbol', 'Flag', 'FlagOff', 'FlagTriangleLeft', 'FlagTriangleRight',
    'Flame', 'Flashlight', 'Flask', 'FlipHorizontal', 'FlipHorizontal2',
    'FlipVertical', 'FlipVertical2', 'Flower', 'Flower2', 'Focus',
    'FoldDown', 'FoldUp', 'Folder', 'FolderArchive', 'FolderCheck',
    'FolderClock', 'FolderClosed', 'FolderCode', 'FolderCog', 'FolderCopy',
    'FolderCorrupted', 'FolderCreateNew', 'FolderDot', 'FolderDown',
    'FolderEdit', 'FolderGit', 'FolderGit2', 'FolderHeart', 'FolderInput',
    'FolderKanban', 'FolderKey', 'FolderLock', 'FolderMinus', 'FolderOpen',
    'FolderOpenDot', 'FolderOutput', 'FolderPen', 'FolderPlus', 'FolderRoot',
    'FolderSearch', 'FolderSearch2', 'FolderSymlink', 'FolderTree',
    'FolderUp', 'FolderX', 'Fonts', 'Footprints', 'Forklift', 'FormInput',
    'Forward', 'Frame', 'Framer', 'Frown', 'Fuel', 'FunctionSquare',
    'GalleryHorizontal', 'GalleryHorizontalEnd', 'GalleryThumbnails',
    'GalleryVertical', 'GalleryVerticalEnd', 'Gamepad', 'Gamepad2',
    'GanttChart', 'Garage', 'Gauge', 'Gavel', 'Gem', 'Ghost', 'Gift',
    'GitBranch', 'GitBranchPlus', 'GitCompare', 'GitCommit', 'GitDiff',
    'GitMerge', 'GitPullRequest', 'GitPullRequestClosed',
    'GitPullRequestDraft', 'Github', 'Gitlab', 'GlassWater',
    'Glasses', 'GlassesOff', 'Globe', 'Globe2', 'Goal', 'Grab',
    'GraduationCap', 'Grain', 'Graph', 'Grid', 'Grip', 'GripHorizontal',
    'GripVertical', 'Group', 'Hammer', 'Hand', 'HandCoins', 'HandHeart',
    'HandMetal', 'HandMinus', 'HandPlatter', 'HandPlus', 'Handshake',
    'HardDrive', 'HardDriveDownload', 'HardDriveUpload', 'Hash',
    'Haze', 'Hdr', 'Heading', 'Heading1', 'Heading2', 'Heading3',
    'Heading4', 'Heading5', 'Heading6', 'Headphones', 'Headset',
    'Heart', 'HeartCrack', 'HeartHandshake', 'HeartMinus', 'HeartOff',
    'HeartPlus', 'HeartPulse', 'HelpCircle', 'Hexagon', 'Highlighter',
    'History', 'Home', 'Hop', 'HopOff', 'Hotel', 'Hourglass',
    'House', 'HousePlug', 'HousePlus', 'HouseSignal', 'HouseSiding',
    'HouseWifi', 'Html', 'IceCream', 'IceCream2', 'IceCreamBowl',
    'IceCreamCone', 'IdCard', 'Image', 'ImageDown', 'ImageMinus',
    'ImageOff', 'ImagePlay', 'ImagePlus', 'ImageUp', 'ImageUpscale',
    'Images', 'Import', 'Indent', 'IndianRupee', 'Infinity',
    'Info', 'Inspect', 'Instagram', 'Italic', 'IterationCcw',
    'IterationCw', 'JapaneseYen', 'Joystick', 'Kanban',
    'KanbanSquare', 'Kbd', 'Key', 'Keyboard', 'Lamp',
    'LampCeiling', 'LampDesk', 'Landmark', 'Languages',
    'Laptop', 'Lasso', 'Laugh', 'Layers', 'Layout',
    'LayoutPanelLeft', 'LayoutPanelRight', 'LayoutPanelTop',
    'LayoutPanelBottom', 'LayoutGrid', 'LayoutList',
    'LayoutTemplate', 'Leaf', 'LeafyGreen', 'Leak',
    'LeakOff', 'Library', 'LifeBuoy', 'Lightbulb',
    'LightbulbOff', 'LineChart', 'Link', 'Link2',
    'Link2Off', 'Linux', 'List', 'ListChecks',
    'ListCollapse', 'ListEnd', 'ListFilter',
    'ListFilterPlus', 'ListMinus', 'ListMusic',
    'ListOrdered', 'ListPlus', 'ListRestart',
    'ListStart', 'ListTodo', 'ListTree',
    'Loader', 'Loader2', 'Locate', 'LocateFixed',
    'LocateOff', 'Lock', 'LogIn', 'LogOut',
    'Lollipop', 'Luggage', 'MSquare', 'Magnet',
    'Mail', 'MailCheck', 'MailMinus', 'MailOpen',
    'MailPlus', 'MailQuestion', 'MailSearch',
    'MailWarning', 'MailX', 'Mails', 'Map',
    'MapPin', 'MapPinCheck', 'MapPinCheckInside',
    'MapPinHouse', 'MapPinMinus', 'MapPinMinusInside',
    'MapPinOff', 'MapPinPlus', 'MapPinPlusInside',
    'MapPinX', 'MapPinXInside', 'MapPinned',
    'Martini', 'Maximize', 'Maximize2', 'Meh',
    'Menu', 'Merge', 'Merge2', 'MessageCircle',
    'MessageCircleMore', 'MessageCircleOff',
    'MessageCircleQuestion', 'MessageCircleReply',
    'MessageCircleWarning', 'MessageSquare',
    'MessageSquareCode', 'MessageSquareDiff',
    'MessageSquareDots', 'MessageSquareEdit',
    'MessageSquareHeart', 'MessageSquareMore',
    'MessageSquareOff', 'MessageSquarePlus',
    'MessageSquareQuote', 'MessageSquareReply',
    'MessageSquareWarning', 'MessagesSquare',
    'Mic', 'Mic2', 'MicOff', 'Microscope',
    'Microwave', 'Milestone', 'Milk', 'MilkOff',
    'Minimize', 'Minimize2', 'Minus', 'MinusCircle',
    'MinusSquare', 'Monitor', 'MonitorCheck',
    'MonitorDot', 'MonitorDown', 'MonitorOff',
    'MonitorPause', 'MonitorPlay', 'MonitorPlus',
    'MonitorSmartphone', 'MonitorSpeaker',
    'MonitorStop', 'MonitorUp', 'Moon',
    'MoonStar', 'MoreHorizontal', 'MoreVertical',
    'Mountain', 'MountainSnow', 'Mouse',
    'MousePointer', 'Move', 'MoveDiagonal',
    'MoveDiagonal2', 'MoveDown', 'MoveDownLeft',
    'MoveDownRight', 'MoveHorizontal',
    'MoveLeft', 'MoveRight', 'MoveUp',
    'MoveUpLeft', 'MoveUpRight', 'MoveVertical',
    'Music', 'Navigation', 'Navigation2',
    'Network', 'Newspaper', 'Nfc',
    'Nutrition', 'Octagon', 'Option',
    'Orbit', 'Outdent', 'Oven', 'Package',
    'Package2', 'PackageCheck', 'PackageMinus',
    'PackageOpen', 'PackagePlus', 'PackageSearch',
    'PackageX', 'PaintBucket', 'Paintbrush',
    'Paintbrush2', 'PaintbrushVertical',
    'Palette', 'Palmtree', 'PanelBottom',
    'PanelBottomClose', 'PanelBottomOpen',
    'PanelLeft', 'PanelLeftClose', 'PanelLeftOpen',
    'PanelRight', 'PanelRightClose', 'PanelRightOpen',
    'PanelTop', 'PanelTopClose', 'PanelTopOpen',
    'Pantone', 'Paragraph', 'Parentheses',
    'ParkingMeter', 'ParkingCircle',
    'ParkingCircleOff', 'ParkingSquare',
    'ParkingSquareOff', 'Passcode',
    'PasscodeCheck', 'PasscodeMinus',
    'PasscodePlus', 'PasscodeX', 'Password',
    'PawPrint', 'Paypal', 'Pc4', 'Pen',
    'PenTool', 'PenTool2', 'Pencil',
    'PencilLine', 'PencilOff', 'Pentagon',
    'Percent', 'PersonStanding', 'Phone',
    'PhoneCall', 'PhoneForwarded', 'PhoneIncoming',
    'PhoneMissed', 'PhoneOff', 'PhoneOutgoing',
    'Pi', 'Piano', 'Pickaxe', 'PictureInPicture',
    'PieChart', 'PiggyBank', 'Pin', 'Pipette',
    'Pizza', 'Plane', 'PlaneLanding', 'PlaneTakeoff',
    'Play', 'PlayCircle', 'Plug', 'Plug2',
    'PlugZap', 'PlugZap2', 'Plus', 'PlusCircle',
    'PlusSquare', 'Pocket', 'Podcast', 'Pointer',
    'Popcorn', 'Popsicle', 'PoundSterling',
    'Power', 'PowerOff', 'Presentation',
    'Printer', 'Proportions', 'Puzzle',
    'QrCode', 'Quote', 'Radiation',
    'Radio', 'RadioReceiver', 'RadioTower',
    'RailSymbol', 'Rainbow', 'Receipt',
    'RectangleHorizontal', 'RectangleVertical',
    'Recycle', 'Redo', 'Redo2', 'RefreshCcw',
    'RefreshCcwDot', 'RefreshCw', 'Regex',
    'RemoveFormatting', 'Repeat', 'Repeat1',
    'Replace', 'ReplaceAll', 'Reply', 'ReplyAll',
    'Rewind', 'Rocket', 'RockingChair', 'RollerCoaster',
    'Rotate3d', 'RotateCcw', 'RotateCw', 'Router',
    'Rows', 'Rss', 'Ruble', 'Ruler', 'RussianRuble',
    'Sailboat', 'Salad', 'Sandwich', 'Satellite',
    'SatelliteDish', 'Save', 'SaveAll', 'Scale',
    'Scale3D', 'Scaling', 'Scan', 'ScanBarcode',
    'ScanEye', 'ScanFace', 'ScanHeart', 'ScanLine',
    'ScanQrCode', 'ScanSearch', 'ScanText', 'School',
    'Scissors', 'ScissorsLineDashed', 'ScreenShare',
    'Scroll', 'Search', 'SearchCode', 'SearchSlash',
    'Section', 'Seed', 'Seedling', 'Send', 'SeparatorHorizontal',
    'SeparatorVertical', 'Server', 'ServerCog',
    'ServerCrash', 'ServerOff', 'Settings', 'Settings2',
    'Shapes', 'Share', 'Share2', 'Sheet', 'Shell',
    'Shield', 'ShieldAlert', 'ShieldBan', 'ShieldCheck',
    'ShieldClose', 'ShieldEllipsis', 'ShieldExclamation',
    'ShieldMinus', 'ShieldOff', 'ShieldPlus', 'ShieldQuestion',
    'ShieldX', 'Ship', 'Shirt', 'ShoePrint', 'ShoppingBag',
    'ShoppingCart', 'Shovel', 'Shrink', 'Shrub', 'Shuffle',
    'Sigma', 'Signal', 'SignalHigh', 'SignalLow',
    'SignalMedium', 'SignalZero', 'Siren', 'SkipBack',
    'SkipForward', 'Skull', 'Slack', 'Slash', 'Sliders',
    'SlidersHorizontal', 'Smartphone', 'SmartphoneCharging',
    'SmartphoneNfc', 'Smile', 'Snail', 'Snowflake', 'Sofa',
    'SortAsc', 'SortDesc', 'Soup', 'Space', 'Spade',
    'Sparkles', 'Speaker', 'Speech', 'SpellCheck',
    'SpellCheck2', 'Sperm', 'Spline', 'Split', 'SprayCan',
    'Sprout', 'Square', 'SquareAsterisk', 'SquareCode',
    'SquareDashed', 'SquareDashedBottom', 'SquareDashedBottomCode',
    'SquareDot', 'SquareEllipsis', 'SquareEqual', 'SquareFigma',
    'SquareKanban', 'SquareLibrary', 'SquareM', 'SquareMenu',
    'SquareMinus', 'SquareOff', 'SquarePen', 'SquarePercent',
    'SquarePieChart', 'SquarePlay', 'SquarePlus', 'SquarePower',
    'SquareRadical', 'SquareRatio', 'SquareRoot',
    'SquareScissors', 'SquareSigma', 'SquareSlash',
    'SquareSplitHorizontal', 'SquareSplitVertical',
    'SquareStack', 'SquareTerminal', 'SquareUser',
    'SquareUserRound', 'SquareX', 'Squares', 'Stack',
    'Star', 'StarHalf', 'StarOff', 'StepBack',
    'StepForward', 'Stethoscope', 'Sticker', 'StickyNote',
    'Stop', 'StopCircle', 'Store', 'StretchHorizontal',
    'StretchVertical', 'Strikethrough', 'Subscript',
    'Subtract', 'SubtractIcon', 'Sun', 'SunDim',
    'SunMedium', 'SunMoon', 'SunSnow', 'Sunrise',
    'Sunset', 'Superscript', 'SwatchBook', 'SwissFranc',
    'SwitchCamera', 'Synagogue', 'Syringe', 'Table',
    'Table2', 'TableProperties', 'Tablet', 'TabletSmartphone',
    'Tag', 'Tags', 'Tally1', 'Tally2', 'Tally3', 'Tally4', 'Tally5',
    'Tangent', 'Target', 'Tent', 'Terminal', 'TestTube',
    'TestTube2', 'TextCursor', 'TextCursorInput',
    'TextQuote', 'TextSelect', 'Thermometer',
    'ThermometerSnowflake', 'ThermometerSun',
    'ThumbsDown', 'ThumbsUp', 'Ticket', 'Timer',
    'ToggleLeft', 'ToggleRight', 'Tornado', 'Torus',
    'Tournament', 'ToyBrick', 'Tractor', 'TrafficCone',
    'Train', 'Trash', 'Trash2', 'Tree', 'TreeDeciduous',
    'TreePalm', 'Trees', 'Trello', 'TrendingDown',
    'TrendingUp', 'Triangle', 'Trophy', 'Truck', 'Tv',
    'Twitch', 'Twitter', 'Type', 'Umbrella', 'Underline',
    'Undo', 'Undo2', 'UnfoldHorizontal', 'UnfoldVertical',
    'Ungroup', 'University', 'Unlink', 'Unlink2',
    'Unlock', 'Unplug', 'Upload', 'UploadCloud', 'Usb',
    'User', 'User2', 'UserCheck', 'UserCheck2',
    'UserCog', 'UserCog2', 'UserMinus', 'UserMinus2',
    'UserPen', 'UserPen2', 'UserPlus', 'UserPlus2',
    'UserRound', 'UserRoundCheck', 'UserRoundCog',
    'UserRoundMinus', 'UserRoundPen', 'UserRoundPlus',
    'UserRoundX', 'UserSquare', 'UserSquare2',
    'UserX', 'UserX2', 'Users', 'Users2', 'Utensils',
    'UtensilsCrossed', 'UtilityPole', 'Variable',
    'Vault', 'Vegan', 'VenetianMask', 'Venus',
    'VenusAndMars', 'Version', 'Vibrate', 'VibrateOff',
    'Video', 'VideoOff', 'Vimeo', 'View', 'Voicemail',
    'Volume', 'Volume1', 'Volume2', 'VolumeX', 'Vote',
    'Wallet', 'Wallpaper', 'Wand', 'Warehouse', 'Waves',
    'Waypoints', 'Webhook', 'Websocket', 'Wheat',
    'WheatOff', 'WholeWord', 'Wifi', 'WifiOff',
    'Wind', 'Wine', 'WineOff', 'Workflow', 'WrapText',
    'Wrench', 'X', 'XCircle', 'XOctagon', 'XSquare',
    'Youtube', 'Zap', 'ZapOff', 'ZoomIn', 'ZoomOut',
    'Zzz'
  ],
  general: [
    'Star', 'Heart', 'Home', 'User', 'Settings', 'Search', 'Plus', 'Minus',
    'X', 'Check', 'Info', 'AlertCircle', 'HelpCircle', 'Bell', 'Mail',
    'BookOpen', 'Award', 'Crown', 'Key', 'Lock', 'Unlock',
    'Shield', 'ShieldCheck', 'Flag', 'Bookmark', 'Pin', 'Lightbulb', 'Fingerprint',
    'Building', 'UserCircle', 'UserCheck', 'UserX', 'UserPlus', 'UserMinus', 'Users',
    'Cog', 'Wrench', 'Hammer', 'Construction', 'HardHat'
  ],
  food: [
    'Coffee', 'Cookie', 'Pizza', 'Apple', 'Grape', 'Cherry', 'Banana', 'Carrot',
    'Fish', 'Egg', 'Milk', 'IceCream', 'Cake', 'Sandwich', 'Soup', 'Utensils',
    'Wine', 'Beer', 'GlassWater', 'CookingPot', 'Salad', 'Croissant'
  ],
  office: [
    'FileText', 'File', 'Files', 'Folder', 'FolderOpen', 'FolderPlus', 'Archive',
    'Briefcase', 'Calculator', 'Calendar', 'Clock', 'Printer', 'Phone', 'Paperclip',
    'Pin', 'Bookmark', 'Clipboard', 'Pen', 'Edit', 'Scissors', 'Ruler', 'Book',
    'StickyNote', 'Send', 'Inbox', 'Building', 'Users', 'Presentation'
  ],
  arrows: [
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ChevronsUpDown',
    'ChevronUp', 'ChevronDown', 'ChevronLeft', 'ChevronRight'
  ],
  education: [
    'GraduationCap', 'Book', 'BookOpen', 'School', 'Search', 'HelpCircle',
    'Check', 'Calendar', 'Clock', 'Presentation'
  ],
  home: [
    'Home', 'Bed', 'Lamp', 'Lightbulb', 'Candle', 'DoorOpen',
    'Key', 'Lock', 'ShoppingCart', 'Package', 'Gift', 'Heart', 'Star',
    'Bath', 'ShowerHead', 'WashingMachine', 'Refrigerator', 'Microwave',
    'CookingPot', 'Coffee', 'Utensils', 'Wine', 'Beer', 'Thermometer', 'Trash'
  ],
  fashion: [
    'Shirt', 'Glasses', 'Watch', 'Crown', 'Gem', 'Hat', 'Backpack',
    'Briefcase', 'Wallet', 'Scarf', 'TShirt', 'Pants', 'Boots'
  ],
  technology: [
    'Smartphone', 'Tablet', 'Laptop', 'Computer', 'Monitor', 'Tv', 'Watch',
    'Headphones', 'Speaker', 'Camera', 'Webcam', 'Microphone', 'Keyboard',
    'Mouse', 'Printer', 'Router', 'Server', 'HardDrive', 'Usb', 'Battery'
  ],
  media: [
    'Play', 'Pause', 'Stop', 'Volume2', 'VolumeX', 'Image', 'Video', 'Camera',
    'Headphones', 'Speaker', 'Film', 'PlayCircle', 'PauseCircle', 'StopCircle',
    'FastForward', 'Rewind', 'SkipForward', 'SkipBack', 'Volume1', 'VolumeOff',
    'Mic', 'Radio', 'Tv', 'Monitor', 'Projector', 'Podcast', 'CameraOff', 'VideoOff',
    'Shuffle', 'Repeat', 'Repeat1', 'RotateCcw', 'RotateCw', 'Forward', 'PlaySquare',
    'PauseSquare', 'Youtube'
  ],
  files: [
    'File', 'FileText', 'Folder', 'FolderOpen', 'Download', 'Upload', 'Save',
    'Copy', 'Trash2', 'Edit', 'Eye', 'Delete', 'Files', 'FolderPlus', 'FolderMinus',
    'Archive', 'FileImage', 'FileVideo', 'FileAudio', 'HardDrive', 'Clipboard'
  ],
  social: [
    'Facebook', 'Instagram', 'Twitter', 'Linkedin', 'Github', 'Youtube', 'Twitch',
    'ThumbsUp', 'ThumbsDown', 'Heart', 'Smile', 'Users', 'Share', 'MessageSquare', 'Slack'
  ],
  health: [
    'Heart', 'HeartPulse', 'Activity', 'Pill', 'Stethoscope', 'Thermometer',
    'Syringe', 'Bandage', 'Hospital', 'Ambulance', 'Brain', 'Eye', 'Ear',
    'Scissors', 'Bone', 'FirstAid'
  ],
  sports: [
    'Trophy', 'Medal', 'Award', 'Target', 'Timer', 'Flag', 'Gamepad',
    'Dumbbell', 'Bike', 'Soccer', 'Tennis', 'Swimming', 'Running'
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

// Get total count of all icons
export const getTotalIconCount = (): number => {
  return getAllIconNames().length;
};

// Get icon count by category
export const getIconCountByCategory = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  Object.entries(iconCategories).forEach(([category, icons]) => {
    counts[category] = icons.length;
  });
  return counts;
};

// Log icon statistics (useful for development)
export const logIconStatistics = (): void => {
  const totalCount = getTotalIconCount();
  const categoryCounts = getIconCountByCategory();
  
  console.log(`Total icons: ${totalCount}`);
  console.log('Icons by category:', categoryCounts);
  
  const totalFromCategories = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
  console.log(`Total from categories: ${totalFromCategories}`);
  console.log(`Unique icons (after deduplication): ${totalCount}`);
};
