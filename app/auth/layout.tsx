import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - ZappForm",
  description: "Sign in or create an account for ZappForm - AI-powered form autofill",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-center">
          <div className="text-3xl font-bold text-blue-600">ZappForm</div>
        </div>
      </div>
      
      {children}
      
      <div className="w-full max-w-md mt-8 text-center text-sm text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} ZappForm. All rights reserved.
        </p>
      </div>
    </div>
  );
} 