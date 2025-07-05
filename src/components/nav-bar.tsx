// components/Navbar.tsx
"use client"; // This makes Navbar a Client Component

import Link from 'next/link';
import {
  Home as HomeIcon,
  UserPlus as UserPlusIcon,
  Users as UsersIcon,
  Menu as MenuIcon,
  X as XIcon,
} from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <nav className="bg-gray-800 p-4 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">CelebNetwork.com</h1>

        {/* Hamburger menu icon - visible on small screens, hidden on medium and larger */}
        <div className="md:hidden">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white focus:outline-none">
            {isSidebarOpen ? <XIcon size={28} /> : <MenuIcon size={28} />}
          </button>
        </div>

        {/* Desktop Navigation - visible on medium and larger screens, hidden on small */}
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

      {/* Mobile Sidebar/Sheet - conditionally rendered based on isSidebarOpen */}
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

      {/* Overlay - appears when sidebar is open to dim the content behind it */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;