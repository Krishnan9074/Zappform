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
    
    // Get user data and profile
    const user: any = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        documents: {
          orderBy: { createdAt: 'desc' }
        },
        aiPersona: {
          orderBy: { updatedAt: 'desc' },
          take: 1
        }
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Convert customFields to object if it's a string
    const customFields = typeof user.customFields === 'string' 
      ? JSON.parse(user.customFields) 
      : user.customFields || {};
    
    // Create a safe response object
    const response = {
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      documents: user.documents,
      aiPersona: user.aiPersona,
      customFields
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Check if profile exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });
    
    let profile;
    
    if (existingProfile) {
      // Update existing profile
      profile = await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          gender: data.gender,
          phoneNumber: data.phoneNumber,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          occupation: data.occupation,
        },
      });
    } else {
      // Create new profile
      profile = await prisma.userProfile.create({
        data: {
          user: { connect: { id: session.user.id } },
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          gender: data.gender,
          phoneNumber: data.phoneNumber,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          occupation: data.occupation,
        },
      });

      // Also update the user's name in the User table
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: `${data.firstName} ${data.lastName}`.trim(),
        },
      });
    }
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add PATCH method to update user profile and custom fields
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    const { customFields, ...profileData } = data;
    
    // Update customFields if provided
    if (customFields) {
      await prisma.$executeRaw`
        UPDATE "User"
        SET "customFields" = ${JSON.stringify(customFields)}::jsonb
        WHERE id = ${session.user.id}
      `;
    }
    
    // Update profile data if provided
    if (Object.keys(profileData).length > 0) {
      await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        update: profileData,
        create: {
          userId: session.user.id,
          ...profileData
        }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 