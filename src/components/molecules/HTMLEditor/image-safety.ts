/**
 * Helper functions for safely working with image elements in rich text editors
 * to prevent DOM-related errors during resize operations
 */

/**
 * Safely check if an image element is still valid in the DOM
 * @param img The image element to check
 * @returns boolean indicating if the element is valid
 */
export function isImageValid(img: HTMLImageElement | null): boolean {
  if (!img) {
    return false;
  }

  try {
    // Check if the element is in DOM
    if (!document.body.contains(img)) {
      return false;
    }
    
    // Check if the element is marked as deleted by Quill
    if (img.classList.contains("ql-image-deleted")) {
      return false;
    }
    
    // Check if the element is an image
    if (img.tagName !== "IMG") {
      return false;
    }
    
    // Check if the element has a valid src
    if (!img.getAttribute("src")) {
      return false;
    }
    
    return true;
  } catch (e) {
    // If any error occurs while checking, consider the image invalid
    console.warn("Error checking image validity:", e);
    return false;
  }
}

/**
 * Safely apply style properties to an image element
 * @param img The image element to style
 * @param styles Object with style properties to apply
 * @param important Whether to apply styles with !important
 */
export function safelyApplyStyles(
  img: HTMLImageElement | null, 
  styles: Record<string, string>, 
  important = true
): void {
  if (!isImageValid(img)) {
    console.warn("Cannot maintain selection: Image is no longer valid in DOM");
    return;
  }
  
  // At this point, img is definitely not null because isImageValid checks for that
  const imgElement = img as HTMLImageElement;
  
  try {
    Object.entries(styles).forEach(([property, value]) => {
      try {
        // Check if the value already includes !important
        if (value.includes("!important")) {
          // Remove the !important from the value and use the priority parameter
          const cleanValue = value.replace(/\s*!important\s*/, "");
          imgElement.style.setProperty(property, cleanValue, "important");
        } else {
          imgElement.style.setProperty(property, value, important ? "important" : "");
        }
        
        // Double-check if the style was applied correctly
        if (important && imgElement.style.getPropertyPriority(property) !== "important") {
          // Force it again if priority was not set
          const currentValue = imgElement.style.getPropertyValue(property);
          imgElement.style.setProperty(property, currentValue, "important");
        }
      } catch (styleError) {
        console.warn(`Error setting style property ${property}:`, styleError);
      }
    });
    
    // Force a reflow to make sure changes are applied
    void imgElement.offsetHeight;
  } catch (e) {
    console.error("Error applying styles to image:", e);
  }
}

/**
 * Safely apply attributes to an image element
 * @param img The image element to modify
 * @param attributes Object with attributes to apply
 */
export function safelyApplyAttributes(
  img: HTMLImageElement | null, 
  attributes: Record<string, string>
): void {
  if (!isImageValid(img)) return;
  
  // At this point, img is definitely not null because isImageValid checks for that
  const imgElement = img as HTMLImageElement;
  
  try {
    Object.entries(attributes).forEach(([attr, value]) => {
      imgElement.setAttribute(attr, value);
    });
  } catch (e) {
    console.error("Error applying attributes to image:", e);
  }
}

/**
 * Safely get dimensions from an image element
 * @param img The image element
 * @returns Object with width and height properties
 */
export function safelyGetImageDimensions(img: HTMLImageElement | null): { width: number; height: number } {
  if (!isImageValid(img)) {
    return { width: 0, height: 0 };
  }
  
  // At this point, img is definitely not null because isImageValid checks for that
  const imgElement = img as HTMLImageElement;
  
  try {
    const rect = imgElement.getBoundingClientRect();
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
  } catch (e) {
    console.error("Error getting image dimensions:", e);
    return { width: 0, height: 0 };
  }
}

/**
 * Persist image size by ensuring HTML attributes and inline styles are consistent
 * @param img The image element
 * @param width Width to set
 * @param height Height to set
 * @returns Success status
 */
export function persistImageSize(
  img: HTMLImageElement | null,
  width: number,
  height: number
): boolean {
  if (!img) {
    console.warn("Cannot persist size: Image is null");
    return false;
  }
  
  // Extra validation to check if the image is still in DOM
  if (!document.body.contains(img)) {
    console.warn("Cannot persist size: Image is no longer in DOM");
    return false;
  }
  
  if (img.classList.contains("ql-image-deleted")) {
    console.warn("Cannot persist size: Image is marked as deleted");
    return false;
  }
  
  try {
    // Set HTML attributes
    img.setAttribute("width", width.toString());
    img.setAttribute("height", height.toString());
    img.setAttribute("data-resized", "true");
    img.setAttribute("data-width", width.toString());
    img.setAttribute("data-height", height.toString());
    
    // Apply inline styles with !important to override any editor styles
    img.style.setProperty("width", `${width}px`, "important");
    img.style.setProperty("height", `${height}px`, "important");
    img.style.setProperty("max-width", "none", "important");
    img.style.setProperty("max-height", "none", "important");
    
    // Add a class to mark as resized
    img.classList.add("resized-image-saved");
    img.classList.remove("has-unsaved-resize");
    
    // Force a reflow to make sure changes are applied
    void img.offsetHeight;
    
    return true;
  } catch (e) {
    console.error("Error persisting image size:", e);
    return false;
  }
}
