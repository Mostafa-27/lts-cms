import React from 'react';
import { getIconByName, isValidIconName } from '@/utils/iconLibrary';
import { cn } from '@/lib/utils';

interface IconRendererProps {
  iconName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: React.ReactNode;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
};

const IconRenderer: React.FC<IconRendererProps> = ({ 
  iconName, 
  className, 
  size = 'md',
  fallback = null 
}) => {
  if (!iconName || !isValidIconName(iconName)) {
    return <>{fallback}</>;
  }
  
  const IconComponent = getIconByName(iconName);
  
  if (!IconComponent) {
    return <>{fallback}</>;
  }
  
  return (
    <IconComponent 
      className={cn(sizeClasses[size], className)} 
    />
  );
};

export default IconRenderer;
