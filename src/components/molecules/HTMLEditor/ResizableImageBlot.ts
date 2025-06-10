// Custom Quill formatter for resizable images
import { Quill } from 'react-quill';

// Get the Quill Image Blot
const ImageBlot:any = Quill.import('formats/image');

class ResizableImageBlot extends ImageBlot {
  static blotName = 'resizable-image';
  static tagName = 'IMG';
  
  static create(value:any) {
    const node = super.create(value);
    
    if (typeof value === 'object') {
      if (value.width) {
        node.setAttribute('width', value.width);
        node.style.width = `${value.width}px`;
      }
      if (value.height) {
        node.setAttribute('height', value.height);
        node.style.height = `${value.height}px`;
      }
      if (value.dataResized) {
        node.setAttribute('data-resized', 'true');
      }
      if (value.dataWidth) {
        node.setAttribute('data-width', value.dataWidth);
      }
      if (value.dataHeight) {
        node.setAttribute('data-height', value.dataHeight);
      }
      node.setAttribute('src', value.src);
    }
    
    return node;
  }

  static value(node:any) {
    return {
      src: node.getAttribute('src'),
      width: node.getAttribute('width'),
      height: node.getAttribute('height'),
      dataResized: node.getAttribute('data-resized'),
      dataWidth: node.getAttribute('data-width'),
      dataHeight: node.getAttribute('data-height')
    };
  }
}

export default ResizableImageBlot;
