import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // No need for complex token validation - if session exists, user is authenticated
    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image
      }
    });
  } catch (error) {
    console.error("Extension validation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 