
'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 as Loader2Icon, LogOut as LogOutIcon } from 'lucide-react';
import { api, setAuthToken } from '../lib/api'; 
import { UserProfile } from '../lib/types'; 

import FanDashboard from './components/FanDashboard';
import CelebrityDashboard from './components/CelebrityDashboard';


export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("DashboardPage: useEffect mounted.");
    const loadUser = () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      console.log("DashboardPage: Stored Token:", storedToken ? "Exists" : "None");
      console.log("DashboardPage: Stored User:", storedUser ? "Exists" : "None");

      if (!storedToken || !storedUser) {
        console.log("DashboardPage: No token or user data found, redirecting to login.");
        window.location.href = '/login';
        return;
      }

      try {
        const parsedUser: UserProfile = JSON.parse(storedUser);
        console.log("DashboardPage: Parsed User from localStorage:", parsedUser);

        
        if (parsedUser && typeof parsedUser.id === 'string' && typeof parsedUser.username === 'string' && (parsedUser.role === 'fan' || parsedUser.role === 'celebrity')) {
          setAuthToken(storedToken); 
          setUser(parsedUser);
          setLoading(false);
          console.log("DashboardPage: User session loaded successfully.", parsedUser);
        } else {
          console.error("DashboardPage: Invalid user data structure in localStorage, clearing session.");
          throw new Error("Invalid user data in localStorage.");
        }
      } catch (e: any) {
        console.error("DashboardPage: Failed to parse user data from localStorage:", e);
        setError("Failed to load user session. Please log in again.");
        localStorage.removeItem('authToken'); 
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    };

    loadUser();
  }, []);

  const handleLogout = () => {
    setLoading(true);
    setError(null);
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setAuthToken(null); 
      console.log("DashboardPage: User signed out, redirecting to login.");
      window.location.href = '/login';
    } catch (err: any) {
      console.error("DashboardPage: Logout failed:", err);
      setError("Failed to log out. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loader2Icon className="h-10 w-10 animate-spin text-blue-500" />
        <span className="ml-3 text-lg text-gray-700">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {user.role === 'fan' && <FanDashboard user={user} onLogout={handleLogout} />}
      {user.role === 'celebrity' && <CelebrityDashboard user={user} onLogout={handleLogout} />}
    </>
  );
}