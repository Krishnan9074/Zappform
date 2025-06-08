'use client';

import { Fragment, useState, useEffect } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import ThemeSwitcher from "./ThemeSwitcher";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import UserMenu from "./UserMenu";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Pricing", href: "/pricing" },
  { name: "Contact", href: "/contact" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="sticky top-0 z-50 bg-white bg-opacity-80 backdrop-blur-md dark:bg-gray-900 dark:bg-opacity-80">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Synergetics ZappForm Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                Synergetics ZappForm
              </span>
            </Link>
          </div>
          <div className="hidden items-center space-x-8 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            {session?.user ? (
              <UserMenu session={session} />
            ) : (
              <Link
                href="/auth/signin"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 