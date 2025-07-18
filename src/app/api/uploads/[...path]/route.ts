import { NextRequest, NextResponse } from 'next/server';

const OWNER_LOCAL_URL = 'http://localhost:3000/uploads/';
const OWNER_PROD_URL = 'https://owner.weenyou.com/uploads/';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const filePath = params.path.join('/');
  // Use local URL in development, production URL otherwise
  const isProd = process.env.NODE_ENV === 'production';
  const remoteUrl = `${isProd ? OWNER_PROD_URL : OWNER_LOCAL_URL}${filePath}`;

  console.log('[Proxy] Fetching file from:', remoteUrl);

  try {
    const response = await fetch(remoteUrl);
    console.log('[Proxy] Response status:', response.status);

    if (!response.ok) {
      console.error('[Proxy] File not found or error fetching:', remoteUrl);
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
    console.error('[Proxy] Error fetching file:', remoteUrl, error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 