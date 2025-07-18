/**
 * Utility functions for handling images across main domain and subdomain
 */

/**
 * Converts any image URL to use the image proxy API
 * This ensures images can be served from both main domain and subdomain locations
 */
export function getImageUrl(imagePath: string): string {
  // Handle null/undefined
  if (!imagePath) {
    return '/placeholder.jpg';
  }

  // If it's a full cloud URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // If it's already using the proxy API, return as is
  if (imagePath.startsWith('/api/images/')) {
    return imagePath;
  }

  // If it's a blob URL, return as is (for preview images)
  if (imagePath.startsWith('blob:')) {
    return imagePath;
  }

  // If it's a data URL, return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }

  // If it's a full URL from subdomain, extract the filename and use proxy
  if (imagePath.startsWith('http')) {
    try {
      const url = new URL(imagePath);
      const pathParts = url.pathname.split('/');
      const filename = pathParts[pathParts.length - 1];
      if (filename && filename.includes('.')) {
        return `/api/images/${filename}`;
      }
    } catch (error) {
      console.error('Error parsing URL:', imagePath, error);
    }
  }

  // If it's a relative path starting with /uploads/, convert to proxy URL
  if (imagePath.startsWith('/uploads/')) {
    const filename = imagePath.split('/').pop();
    if (filename && filename.includes('.')) {
      return `/api/images/${filename}`;
    }
  }

  // If it's just a filename with extension, use proxy URL
  if (!imagePath.includes('/') && imagePath.includes('.')) {
    return `/api/images/${imagePath}`;
  }

  // If it's a relative path that might be an image, try to extract filename
  if (imagePath.includes('.') && !imagePath.startsWith('http')) {
    const parts = imagePath.split('/');
    const filename = parts[parts.length - 1];
    if (filename && filename.includes('.')) {
      return `/api/images/${filename}`;
    }
  }

  // Default: return as is (for external images, etc.)
  return imagePath;
}

/**
 * Converts an array of image URLs to use the image proxy API
 */
export function getImageUrls(imagePaths: string[]): string[] {
  return imagePaths.map(getImageUrl);
}

/**
 * Checks if an image URL is from the uploads folder (needs proxy)
 */
export function isUploadImage(imagePath: string): boolean {
  if (!imagePath) return false;

  return imagePath.startsWith('/uploads/') ||
         imagePath.startsWith('/api/images/') ||
         (imagePath.startsWith('http') && imagePath.includes('/uploads/'));
} 