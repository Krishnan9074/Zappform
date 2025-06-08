import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./components/Providers";
import ThemeProvider from "./components/providers/ThemeProvider";
import Navbar from "./components/layout/Navbar";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Synergetics ZappForm - Intelligent Form Assistant",
  description: "Synergetics ZappForm helps you automatically fill out forms using AI based on your personal data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        <Providers>
          <ThemeProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <footer className="bg-gray-800 text-white">
                <div className="container mx-auto px-6 py-4">
                  <div className="text-center text-sm">
                    © {new Date().getFullYear()} Synergetics ZappForm. All rights reserved.
                  </div>
                </div>
              </footer>
            </div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
