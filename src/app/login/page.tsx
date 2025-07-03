'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 as Loader2Icon } from 'lucide-react';
import { api, setAuthToken } from '../lib/api';
import { signinSchema, signupSchema } from '../lib/auth';
import { UserProfile } from '../lib/types'; 
import { z } from 'zod';

export default function LoginPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'fan' | 'celebrity'>('fan'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error decoding JWT:", e);
      return null;
    }
  };

  useEffect(() => {
    console.log("LoginPage: useEffect mounted.");
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    console.log("LoginPage: Stored Token:", storedToken ? "Exists" : "None");
    console.log("LoginPage: Stored User:", storedUser ? "Exists" : "None");

    if (storedToken && storedUser) {
      try {
        const user: UserProfile = JSON.parse(storedUser);
        // Ensure user object has expected properties for a valid session
        if (user && user.id && user.username && (user.role === 'fan' || user.role === 'celebrity')) {
          setAuthToken(storedToken); // Set token for API calls
          console.log("LoginPage: Valid session found, redirecting to dashboard.");
          window.location.href = '/dashboard';
        } else {
          console.warn("LoginPage: Invalid user data in localStorage, clearing session.");
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      } catch (e) {
        console.error("LoginPage: Failed to parse stored user data:", e);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    console.log(`LoginPage: Attempting ${isLoginMode ? 'login' : 'signup'} for username: ${username}`);

    try {
      let authResponse: { accessToken: string };

      if (isLoginMode) {
        const credentials: z.infer<typeof signinSchema> = { username, password };
        authResponse = await api.signIn(credentials);
      } else {
        const credentials: z.infer<typeof signupSchema> = { username, password };
        authResponse = await api.signUp(credentials);
      }

      const { accessToken } = authResponse;
      const decodedToken = decodeJwt(accessToken);

      if (!decodedToken || !decodedToken.userId || !decodedToken.username) {
        throw new Error("Invalid token received from backend. Missing userId or username in payload.");
      }

      const userToStore: UserProfile = {
        id: decodedToken.userId,
        username: decodedToken.username,
        role: role, 
      };

      console.log("LoginPage: Authentication successful. Storing token and user data:", userToStore);
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userToStore));
      setAuthToken(accessToken); 

      console.log("LoginPage: Redirecting to dashboard.");
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error("LoginPage: Authentication failed:", err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {isLoginMode ? 'Login' : 'Sign Up'}
        </h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Username:
            </label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">
              {isLoginMode ? 'Login as:' : 'Register as:'}
            </label>
            <select
              id="role"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={role}
              onChange={(e) => setRole(e.target.value as 'fan' | 'celebrity')}
            >
              <option value="fan">Fan</option>
              <option value="celebrity">Celebrity</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <Loader2Icon className="animate-spin mr-2" size={20} /> : (isLoginMode ? 'Login' : 'Sign Up')}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          {isLoginMode ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-blue-600 hover:text-blue-800 font-bold focus:outline-none"
            disabled={loading}
          >
            {isLoginMode ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}