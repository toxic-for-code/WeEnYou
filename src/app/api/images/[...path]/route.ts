import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    // Validate params
    if (!params.path || params.path.length === 0) {
      return NextResponse.json(
        { error: 'No image path provided' },
        { status: 400 }
      );
    }

    const imagePath = params.path.join('/');
    
    // Validate image path
    if (!imagePath || imagePath.includes('..') || imagePath.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid image path' },
        { status: 400 }
      );
    }
    
    // First, try to find the image in the main domain's uploads folder
    let imagePath1 = join(process.cwd(), 'public', 'uploads', imagePath);
    
    // If not found, try the subdomain's uploads folder
    let imagePath2 = process.env.SUBDOMAIN_UPLOAD_PATH 
      ? join(process.env.SUBDOMAIN_UPLOAD_PATH, imagePath)
      : join(process.cwd(), '..', 'subdomain-public', 'uploads', imagePath);
    
    let finalPath = null;
    
    // Check which path exists
    if (existsSync(imagePath1)) {
      finalPath = imagePath1;
    } else if (existsSync(imagePath2)) {
      finalPath = imagePath2;
    }
    
    if (!finalPath) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    
    // Read the image file
    const imageBuffer = await readFile(finalPath);
    
    // Determine content type based on file extension
    const extension = imagePath.split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg'; // default
    
    switch (extension) {
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
      default:
        contentType = 'image/jpeg';
    }
    
    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 }
    );
  }
} 