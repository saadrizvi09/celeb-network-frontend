import Navbar from '@/components/nav-bar';
import './globals.css'; // Your global CSS

export const metadata = {
  title: 'CelebNetwork.com',
  description: 'Discover and follow your favorite celebrities.',
};

// Root Layout component - This remains a Server Component
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
        <Navbar /> {/* Render the Navbar (now a Client Component) here */}
        <main className="py-8">
          {children} {/* This is where your page content will be rendered */}
        </main>
      </body>
    </html>
  );
}