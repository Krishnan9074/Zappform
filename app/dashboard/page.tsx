import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import OnboardingFlow from "@/app/components/onboarding/OnboardingFlow";

export const metadata: Metadata = {
  title: "Dashboard - Synergetics ZappForm",
  description: "Your Synergetics ZappForm dashboard",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  // Get user data
  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      aiPersona: true,
      formSubmissions: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { formTemplate: true },
      },
      documents: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  });
  
  if (!user) {
    redirect("/auth/signin");
  }

  // Check if the user has completed onboarding
  if (!user.onboardingCompleted) {
    return <OnboardingFlow />;
  }
  
  const persona = user.aiPersona;
  const recentSubmissions = user.formSubmissions;
  const recentDocuments = user.documents;
  
  return (
    <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* AI Persona Status */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">AI Persona Status</h2>
            <p className="mt-1 text-sm text-gray-500">Your personal AI assistant for form filling</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
                persona?.status === "TRAINED" 
                  ? "bg-green-100" 
                  : persona?.status === "FAILED" 
                  ? "bg-red-100" 
                  : "bg-yellow-100"
              }`}>
                <svg 
                  className={`h-6 w-6 ${
                    persona?.status === "TRAINED" 
                      ? "text-green-600" 
                      : persona?.status === "FAILED" 
                      ? "text-red-600" 
                      : "text-yellow-600"
                  }`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  {persona?.status === "TRAINED" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : persona?.status === "FAILED" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {persona?.status === "TRAINED" 
                    ? "Ready to use" 
                    : persona?.status === "FAILED" 
                    ? "Training failed" 
                    : persona?.status === "PROCESSING"
                    ? "Training in progress"
                    : "Not trained yet"}
                </h3>
                <p className="text-sm text-gray-500">
                  {persona?.status === "TRAINED" 
                    ? "Your AI persona is trained and ready to fill forms" 
                    : persona?.status === "FAILED" 
                    ? "There was an issue training your AI persona" 
                    : persona?.status === "PROCESSING"
                    ? "We're training your AI persona, this might take a few minutes"
                    : "Add more personal data or documents to train your AI persona"}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <a
                href="/dashboard/persona"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {persona?.status === "TRAINED" 
                  ? "View Details" 
                  : persona?.status === "FAILED" 
                  ? "Retry Training"
                  : persona?.status === "PROCESSING"
                  ? "View Progress"
                  : "Start Training"}
              </a>
            </div>
          </div>
        </div>
        
        {/* Installation Status */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Browser Extension</h2>
            <p className="mt-1 text-sm text-gray-500">Install our extension to fill forms automatically</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="flex flex-col justify-center items-center p-6 bg-gray-50 rounded-lg">
              <svg 
                className="w-12 h-12 text-blue-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Install Synergetics ZappForm Extension</h3>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Get the browser extension to automatically fill forms as you browse the web
              </p>
              <a
                href="/chrome-extension.zip"
                download
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Download for Chrome
              </a>
            </div>
          </div>
        </div>
        
        {/* Recent Form Submissions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Recent Form Submissions</h2>
              <p className="mt-1 text-sm text-gray-500">Forms you've filled with Synergetics ZappForm</p>
            </div>
            <a href="/dashboard/history" className="text-sm text-blue-600 hover:text-blue-500">
              View all
            </a>
          </div>
          <div className="border-t border-gray-200">
            <div className="bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500">
              <div className="grid grid-cols-3 gap-4">
                <div>Website</div>
                <div>Form</div>
                <div>Date</div>
              </div>
            </div>
            <ul role="list" className="divide-y divide-gray-200">
              {recentSubmissions.length > 0 ? (
                recentSubmissions.map((submission: any) => (
                  <li key={submission.id} className="px-4 py-4 text-sm text-gray-900">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="truncate">{submission.domainName}</div>
                      <div className="truncate">
                        {submission.formTemplate?.name || "Unknown form"}
                      </div>
                      <div>
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-sm text-gray-500 text-center">
                  No form submissions yet
                </li>
              )}
            </ul>
          </div>
        </div>
        
        {/* Recent Documents */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Recent Documents</h2>
              <p className="mt-1 text-sm text-gray-500">Documents you've uploaded to Synergetics ZappForm</p>
            </div>
            <a href="/dashboard/documents" className="text-sm text-blue-600 hover:text-blue-500">
              View all
            </a>
          </div>
          <div className="border-t border-gray-200">
            <div className="bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500">
              <div className="grid grid-cols-3 gap-4">
                <div>Name</div>
                <div>Status</div>
                <div>Date</div>
              </div>
            </div>
            <ul role="list" className="divide-y divide-gray-200">
              {recentDocuments.length > 0 ? (
                recentDocuments.map((document: any) => (
                  <li key={document.id} className="px-4 py-4 text-sm text-gray-900">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="truncate">{document.originalName}</div>
                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            document.processingStatus === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : document.processingStatus === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : document.processingStatus === "PROCESSING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {document.processingStatus}
                        </span>
                      </div>
                      <div>
                        {new Date(document.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-sm text-gray-500 text-center">
                  No documents uploaded yet
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 