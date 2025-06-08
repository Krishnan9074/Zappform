import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  // Get user data with profile
  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });
  
  if (!user) {
    redirect("/auth/signin");
  }
  
  const profile = user.profile;

  return (
    <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">Your Profile</h1>
      
      <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-20 w-20 rounded-full overflow-hidden bg-gray-200">
              {session.user?.image ? (
                <Image
                  width={80}
                  height={80}
                  className="h-full w-full rounded-full"
                  src={session.user.image}
                  alt={session.user.name || "User profile"}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 font-medium text-lg">
                  {session.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-900">{session.user?.name}</h2>
              <p className="text-sm text-gray-500">{session.user?.email}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          <p className="mt-1 text-sm text-gray-500">This information is used to auto-fill forms on your behalf.</p>
          
          {profile ? (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {profile.phoneNumber || "Not provided"}
                  </dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Date of birth</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "Not provided"}
                  </dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Occupation</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {profile.occupation || "Not provided"}
                  </dd>
                </div>
                
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {profile.addressLine1 ? (
                      <div>
                        <p>{profile.addressLine1}</p>
                        {profile.addressLine2 && <p>{profile.addressLine2}</p>}
                        <p>
                          {profile.city ? `${profile.city}, ` : ""}
                          {profile.state ? `${profile.state} ` : ""}
                          {profile.postalCode || ""}
                        </p>
                        <p>{profile.country}</p>
                      </div>
                    ) : (
                      "Not provided"
                    )}
                  </dd>
                </div>
              </dl>
              
              <div className="mt-6">
                <a
                  href="/dashboard/profile/edit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Profile
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-6 text-center py-6">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No profile information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add your personal information to improve ZappForm's auto-fill capabilities.
              </p>
              <div className="mt-6">
                <a
                  href="/dashboard/profile/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Complete Profile
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Account Activity</h3>
          <p className="mt-1 text-sm text-gray-500">Recent activity and form filling history.</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Last Login</h4>
          <p className="mt-1 text-sm text-gray-900">
            {new Date().toLocaleString()} {/* This would ideally come from the user's session data */}
          </p>
          
          <h4 className="mt-6 text-sm font-medium text-gray-500 uppercase tracking-wide">Recent Form Submissions</h4>
          <div className="mt-1 text-sm text-gray-900">
            <a
              href="/dashboard/history"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Form History
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 