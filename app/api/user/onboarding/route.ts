import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingCompleted: true }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ onboardingCompleted: user.onboardingCompleted });
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    console.log('Onboarding request data:', data); // Debug log

    const { personalInfo, documents, aiPersonaEnabled, customFields } = data;

    if (!personalInfo) {
      return NextResponse.json({ error: 'Personal info is required' }, { status: 400 });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        profile: {
          upsert: {
            create: {
              firstName: personalInfo.firstName || null,
              lastName: personalInfo.lastName || null,
              phoneNumber: personalInfo.phoneNumber || null,
              dateOfBirth: personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth).toISOString() : null,
              occupation: personalInfo.occupation || null,
              addressLine1: personalInfo.addressLine1 || null,
              city: personalInfo.city || null,
              state: personalInfo.state || null,
              postalCode: personalInfo.postalCode || null,
              country: personalInfo.country || null,
            },
            update: {
              firstName: personalInfo.firstName || null,
              lastName: personalInfo.lastName || null,
              phoneNumber: personalInfo.phoneNumber || null,
              dateOfBirth: personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth).toISOString() : null,
              occupation: personalInfo.occupation || null,
              addressLine1: personalInfo.addressLine1 || null,
              city: personalInfo.city || null,
              state: personalInfo.state || null,
              postalCode: personalInfo.postalCode || null,
              country: personalInfo.country || null,
            },
          },
        },
        onboardingCompleted: true,
      },
      include: {
        profile: true,
      },
    });

    // Update custom fields if they exist
    if (customFields && Object.keys(customFields).length > 0) {
      try {
        await prisma.$executeRaw`
          UPDATE "User"
          SET "customFields" = ${JSON.stringify(customFields)}::jsonb
          WHERE email = ${session.user.email}
        `;
      } catch (error) {
        console.error('Error updating custom fields:', error);
        // Continue with the response even if custom fields update fails
      }
    }

    // Handle document uploads
    if (documents && documents.length > 0) {
      // ... existing document handling code ...
    }

    // Create AI persona if enabled
    if (aiPersonaEnabled) {
      // ... existing AI persona creation code ...
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error in onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
} 