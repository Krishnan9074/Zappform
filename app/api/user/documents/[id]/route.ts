import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/prisma';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get document from database
    const document = await prisma.userDocument.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Read file from disk
    const filePath = path.join(process.cwd(), 'uploads', session.user.id, document.filename);
    const fileContent = await readFile(filePath);
    
    // Return file data with metadata
    return NextResponse.json({
      id: document.id,
      filename: document.originalName,
      mimeType: document.mimeType,
      size: document.size,
      content: fileContent.toString('base64'),
      metadata: document.extractedData || {},
      processingStatus: document.processingStatus
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 