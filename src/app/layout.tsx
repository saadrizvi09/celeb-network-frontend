// app/layout.tsx
import './globals.css'; // Your global CSS
import Link from 'next/link'; // Import Link from Next.js for navigation
import {
  Home as HomeIcon,
  UserPlus as UserPlusIcon,
  LayoutDashboard as LayoutDashboardIcon,
  Users as UsersIcon,
} from 'lucide-react';

// Define metadata for the application (optional)
export const metadata = {
  title: 'CelebNetwork.com',
  description: 'Discover and follow your favorite celebrities.',
};

// Navbar component (moved here to be part of the layout)
const Navbar = () => (
  <nav className="bg-gray-800 p-4 text-white shadow-lg">
    <div className="container mx-auto flex justify-between items-center">
      <h1 className="text-2xl font-bold">CelebNetwork.com</h1>
      <ul className="flex space-x-6">
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
  </nav>
);

// Root Layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Tailwind CSS setup (usually in globals.css or a layout component) */}
        {/* For this immersive, we'll inject it directly. */}
        <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet" />
        {/* Font setup */}
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
          {children} {/* This is where your page content will be rendered */}
        </main>
      </body>
    </html>
  );
}
