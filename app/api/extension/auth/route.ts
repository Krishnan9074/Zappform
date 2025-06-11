import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get user profile data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        userData: true,
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Parse custom fields
    const customFields = typeof user.customFields === 'string'
      ? JSON.parse(user.customFields)
      : user.customFields || {};
    
    // Create a comprehensive user data object for form filling
    const userData = {
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
      
      // Custom fields
      customFields,
    };
    
    // Add any custom user data fields
    if (user.userData && user.userData.length > 0) {
      user.userData.forEach((item: any) => {
        userData[item.key] = item.value;
      });
    }
    
    return NextResponse.json({
      success: true,
      user: userData,
      session: {
        user: session.user,
        expires: session.expires
      }
    });
  } catch (error) {
    console.error("Extension auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 