import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Get the host from request headers to determine subdomain
    const host = request.headers.get('host') || '';
    const isSubdomain = host.includes('owner.') || host.includes('partner.') || host.includes('admin.');
    
    // Determine upload directory based on subdomain
    let uploadDir;
    
    if (isSubdomain) {
      // For subdomain, use environment variable or default path
      const subdomainUploadPath = process.env.SUBDOMAIN_UPLOAD_PATH || join(process.cwd(), '..', 'subdomain-public', 'uploads');
      uploadDir = subdomainUploadPath;
    } else {
      // For main domain
      uploadDir = join(process.cwd(), 'public', 'uploads');
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const uniqueId = uuidv4();
      const extension = file.name.split('.').pop();
      const filename = `${uniqueId}.${extension}`;
      const filepath = join(uploadDir, filename);

      // Save file
      await writeFile(filepath, buffer);

      // Always return URLs that use the image proxy API
      // This ensures images can be served from both main domain and subdomain
      urls.push(`/api/images/${filename}`);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
} 
 