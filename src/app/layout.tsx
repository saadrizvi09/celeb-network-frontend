"use client"; 

import './globals.css'; 
import Link from 'next/link'; 
import {
  Home as HomeIcon,
  UserPlus as UserPlusIcon,
  Users as UsersIcon,
  Menu as MenuIcon, 
  X as XIcon, 
} from 'lucide-react';
import { useState } from 'react'; 

export const metadata = {
  title: 'CelebNetwork.com',
  description: 'Discover and follow your favorite celebrities.',
};

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  return (
    <nav className="bg-gray-800 p-4 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">CelebNetwork.com</h1>

        <div className="md:hidden">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white focus:outline-none">
            {isSidebarOpen ? <XIcon size={28} /> : <MenuIcon size={28} />}
          </button>
        </div>

        <ul className="hidden md:flex space-x-6">
          <li>
            <Link href="/" className="flex items-center space-x-2 hover:text-blue-300 transition-colors">
              <HomeIcon size={20} />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="flex items-center space-x-2 hover:text-blue-300 transition-colors">
              <UsersIcon size={20} />
              <span> Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/signup" className="flex items-center space-x-2 hover:text-blue-300 transition-colors">
              <UserPlusIcon size={20} />
              <span>Celebrity Signup</span>
            </Link>
          </li>
        </ul>
      </div>

      <div
        className={`fixed inset-y-0 right-0 w-64 bg-gray-800 text-white shadow-lg p-4 z-50 transform ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform ease-in-out duration-300 md:hidden`}
      >
        <div className="flex justify-end mb-4">
          <button onClick={() => setIsSidebarOpen(false)} className="text-white focus:outline-none">
            <XIcon size={28} />
          </button>
        </div>
        <ul className="flex flex-col space-y-4">
          <li>
            <Link href="/" className="flex items-center space-x-2 hover:text-blue-300 transition-colors" onClick={() => setIsSidebarOpen(false)}>
              <HomeIcon size={24} />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="flex items-center space-x-2 hover:text-blue-300 transition-colors" onClick={() => setIsSidebarOpen(false)}>
              <UsersIcon size={24} />
              <span> Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/signup" className="flex items-center space-x-2 hover:text-blue-300 transition-colors" onClick={() => setIsSidebarOpen(false)}>
              <UserPlusIcon size={24} />
              <span>Celebrity Signup</span>
            </Link>
          </li>
        </ul>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)} 
        ></div>
      )}
    </nav>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`
          body {
            font-family: 'Inter', sans-serif;
            background-color: #f3f4f6; /* Light gray background */
          }
        `}</style>
      </head>
      <body>
        <Navbar />
        <main className="py-8">
          {children} 
        </main>
      </body>
    </html>
  );
}