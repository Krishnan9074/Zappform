import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/prisma';

// Define interface for user data items
interface UserDataItem {
  key: string;
  value: string;
  category?: string;
}

export async function GET() {
  try {
    // Verify user is authenticated with a valid session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user profile data
    const user: any = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        userData: true, // Include any additional user data stored in the userData table
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Format profile data for autofill
    const profileData = {
      // Basic user info
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      
      // Profile fields
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      middleName: user.profile?.middleName || '',
      phoneNumber: user.profile?.phoneNumber || '',
      gender: user.profile?.gender || '',
      dateOfBirth: user.profile?.dateOfBirth || null,
      
      // Address fields
      addressLine1: user.profile?.addressLine1 || '',
      addressLine2: user.profile?.addressLine2 || '',
      city: user.profile?.city || '',
      state: user.profile?.state || '',
      postalCode: user.profile?.postalCode || '',
      country: user.profile?.country || '',
      
      // Professional info
      occupation: user.profile?.occupation || '',
    };
    
    // Add any custom user data fields
    const customData: Record<string, string> = {};
    if (user.userData && user.userData.length > 0) {
      user.userData.forEach((item: UserDataItem) => {
        customData[item.key] = item.value;
      });
    }
    
    // Include user's custom fields from the User model
    const userCustomFields = typeof user.customFields === 'string'
      ? JSON.parse(user.customFields)
      : user.customFields || {};
    
    return NextResponse.json({
      success: true,
      profile: {
        ...profileData,
        ...customData,
        ...userCustomFields
      }
    });
  } catch (error) {
    console.error('Error fetching profile for extension:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 