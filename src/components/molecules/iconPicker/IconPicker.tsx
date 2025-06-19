import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getIconByName, 
  getAllIconNames, 
  iconCategories, 
  getIconsByCategory,
  isValidIconName 
} from "@/utils/iconLibrary";

interface IconPickerProps {
  value?: string;
  onValueChange: (iconName: string) => void;
  placeholder?: string;
  className?: string;
  showCategories?: boolean;
}

const IconPicker = ({ 
  value = "Star", 
  onValueChange, 
  placeholder = "Select an icon",
  className,
  showCategories = true
}: IconPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const allIconNames = useMemo(() => {
    const icons = getAllIconNames();
    // console.log("getAllIconNames returned:", icons.length, "icons");
    return icons;
  }, []); 
   const filteredIcons = useMemo(() => {
    let icons: string[] = [];
    
    // Start with all icons or filter by category
     if (activeCategory in iconCategories) {
      icons = getIconsByCategory(activeCategory as keyof typeof iconCategories);
      // console.log(`Category ${activeCategory} icons count:`, icons.length);
    } else {
      icons = [...allIconNames]; // Fallback to all icons
    }
    
    // Then filter by search term if provided
    if (searchTerm) {
      icons = icons.filter((iconName) =>
        iconName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // console.log("Final filtered icons count:", icons.length);
    return icons;
  }, [allIconNames, searchTerm, activeCategory]);

  const handleIconSelect = (iconName: string) => {
    onValueChange(iconName);
    setIsOpen(false);
    setSearchTerm("");
    setActiveCategory("all");
  };

  const renderIcon = (iconName: string, size: "sm" | "lg" = "sm") => {
    const IconComponent = getIconByName(iconName);
    
    if (!IconComponent) return null;
    
    return (
      <IconComponent 
        className={cn(
          size === "sm" ? "w-4 h-4" : "w-6 h-6"
        )} 
      />
    );
  };

  const categoryEntries = Object.entries(iconCategories);

  // Calculate grid rows for categories
  const categoryCount = categoryEntries.length  ; // +1 for 'All'
  const isTwoRows = categoryCount > 12; // threshold for 2 rows, adjust as needed
  const categoryGridClass = isTwoRows
    ? 'grid grid-cols-3 md:grid-cols-12 grid-rows-2'
    : 'grid grid-cols-6';

  // Debug logging
  // console.log("Rendering IconPicker, activeCategory:", activeCategory, "filteredIcons count:", filteredIcons.length);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 h-10",
            className
          )}
        >
          {value && isValidIconName(value) ? renderIcon(value) : null}
          <span className="truncate">
            {value || placeholder}
          </span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Select an Icon
            {value && isValidIconName(value) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {renderIcon(value)}
                {value}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setActiveCategory("all");
              }}
              disabled={!searchTerm && activeCategory === "all"}
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          </div>            {showCategories && (
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 flex flex-col min-h-0">
              <ScrollArea className="w-full">
                <TabsList className={cn(categoryGridClass, 'w-full h-auto p-1 gap-1 mb-2')}>
                  {/* <TabsTrigger value="all" className="text-xs py-2 px-3 whitespace-nowrap">All</TabsTrigger> */}
                  {categoryEntries.map(([key]) => (
                    <TabsTrigger key={key} value={key} className="text-xs py-2 px-2 capitalize whitespace-nowrap">
                      {key === 'communication' ? 'Comm' : 
                       key === 'technology' ? 'Tech' : 
                       key === 'transport' ? 'Trans' : 
                       key === 'shopping' ? 'Shop' : 
                       key}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>
              
              <TabsContent value={activeCategory} className="flex-1 mt-2 min-h-0">
                <ScrollArea className="h-full border rounded-md">
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 p-4">
                    {filteredIcons.map((iconName) => (
                      <button
                        key={iconName}
                        onClick={() => handleIconSelect(iconName)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 hover:bg-accent hover:border-primary",
                          "min-h-[80px] group",
                          value === iconName && "border-primary bg-accent"
                        )}
                        title={iconName}
                      >
                        <div className="mb-2">
                          {renderIcon(iconName, "lg")}
                        </div>
                        <span className="text-xs text-center truncate w-full leading-tight">
                          {iconName}
                        </span>
                      </button>
                    ))}
                    
                    {filteredIcons.length === 0 && (
                      <div className="col-span-full flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Search className="w-8 h-8 mb-2" />
                        <p>No icons found</p>
                        {searchTerm && <p className="text-sm">for "{searchTerm}"</p>}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
          
          {!showCategories && (
            <ScrollArea className="flex-1 border rounded-md">
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 p-4">
                {filteredIcons.map((iconName) => (
                  <button
                    key={iconName}
                    onClick={() => handleIconSelect(iconName)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 hover:bg-accent hover:border-primary",
                      "min-h-[80px] group",
                      value === iconName && "border-primary bg-accent"
                    )}
                    title={iconName}
                  >
                    <div className="mb-2">
                      {renderIcon(iconName, "lg")}
                    </div>
                    <span className="text-xs text-center truncate w-full leading-tight">
                      {iconName}
                    </span>
                  </button>
                ))}
                
                {filteredIcons.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Search className="w-8 h-8 mb-2" />
                    <p>No icons found</p>
                    {searchTerm && <p className="text-sm">for "{searchTerm}"</p>}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Showing {filteredIcons.length} icons
              {activeCategory !== "all" && ` in ${activeCategory}`}
            </span>
            {value && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleIconSelect("")}
              >
                Clear Selection
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IconPicker;
