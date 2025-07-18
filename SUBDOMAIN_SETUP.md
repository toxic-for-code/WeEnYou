# Subdomain Image Setup Guide

This guide explains how to configure your WeEnYou application to handle images uploaded from subdomains.

## Problem
Images uploaded from subdomains (e.g., owner.weenyou.com) are stored in the subdomain's public folder, but they're not visible on the main domain because they're in different locations.

## Solution
We've implemented an image proxy system that can serve images from both the main domain and subdomain locations.

## Configuration

### 1. Environment Variables
Add these to your `.env.local` file:

```env
# Path to the subdomain's public/uploads folder
SUBDOMAIN_UPLOAD_PATH=/path/to/your/subdomain/public/uploads

# Main domain base URL (optional)
NEXT_PUBLIC_BASE_URL=https://your-main-domain.com
```

### 2. Update SUBDOMAIN_UPLOAD_PATH
Replace `/path/to/your/subdomain/public/uploads` with the actual path to your subdomain's uploads folder.

**Examples:**
- If your subdomain is in a separate folder: `/home/user/subdomain/public/uploads`
- If it's relative to the main project: `../subdomain/public/uploads`
- If it's on a different server: `/mnt/subdomain/public/uploads`

### 3. How It Works

1. **Upload Process:**
   - Images uploaded from main domain → saved to `public/uploads/`
   - Images uploaded from subdomain → saved to `SUBDOMAIN_UPLOAD_PATH`

2. **Image Serving:**
   - All image URLs are converted to use `/api/images/[filename]`
   - The API checks both locations and serves the image from wherever it exists

3. **URL Conversion:**
   - `/uploads/image.jpg` → `/api/images/image.jpg`
   - `https://owner.weenyou.com/uploads/image.jpg` → `/api/images/image.jpg`

## Testing

1. Upload an image from the main domain
2. Upload an image from the subdomain
3. Both should be visible on both domains

## Troubleshooting

### Images still not showing?
1. Check that `SUBDOMAIN_UPLOAD_PATH` points to the correct folder
2. Ensure the folder has proper read permissions
3. Check the browser console for any errors

### Permission errors?
Make sure your application has read access to the subdomain's uploads folder:

```bash
chmod 755 /path/to/subdomain/public/uploads
```

### Still having issues?
Check the server logs for any errors related to the image proxy API (`/api/images/[...path]`). 