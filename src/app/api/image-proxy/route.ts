// app/api/image-proxy/[...path]/route.ts

import { NextRequest, NextResponse } from 'next/server';



export async function GET(request: NextRequest) {

 const { searchParams } = new URL(request.url);
 const imageUrl = searchParams.get('url');


 if (!imageUrl) {

return new NextResponse('Missing image URL', { status: 400 });

 }



try {

const response = await fetch(imageUrl);
 if (!response.ok) {

throw new Error(`Failed to fetch image: ${response.statusText}`);
 }



 const contentType = response.headers.get('Content-Type');



 return new NextResponse(response.body, {
headers: {

'Content-Type': contentType || 'application/octet-stream',
'Cache-Control': 'public, max-age=31536000, immutable', // Cache for a year
 },
 status: 200,
 });

 } 
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 catch (error: any) {

 console.error('Image proxy error:', error);

 return new NextResponse(`Image proxy failed: ${error.message}`, { status: 500 });

 }

}