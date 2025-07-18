import { NextRequest, NextResponse } from 'next/server';

const S3_BASE_URL = 'https://my-weenyou-uploads.s3.eu-north-1.amazonaws.com/';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const filePath = params.path.join('/');
  const s3Url = `${S3_BASE_URL}${filePath}`;

  console.log('[AWS Proxy] Fetching file from:', s3Url);

  try {
    const response = await fetch(s3Url);
    console.log('[AWS Proxy] Response status:', response.status);

    if (!response.ok) {
      console.error('[AWS Proxy] File not found or error fetching:', s3Url);
      return new NextResponse('File not found', { status: 404 });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('[AWS Proxy] Error fetching file:', s3Url, error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 