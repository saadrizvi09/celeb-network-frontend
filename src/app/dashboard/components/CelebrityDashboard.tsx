// app/dashboard/components/CelebrityDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 as Loader2Icon, LogOut as LogOutIcon } from 'lucide-react';
import { api } from '../../lib/api'; 
import { UserProfile, Celebrity } from '../../lib/types'; 

interface CelebrityDashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

const CelebrityDashboard: React.FC<CelebrityDashboardProps> = ({ user, onLogout }) => {
  const [celebrityData, setCelebrityData] = useState<Celebrity | null>(null);
  const [loadingCelebrity, setLoadingCelebrity] = useState(true);
  const [celebrityError, setCelebrityError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCelebrityProfile = async () => {
      if (user.username) {
        setLoadingCelebrity(true);
        setCelebrityError(null);
        try {
          const data = await api.getCelebrityByName(user.username);
          if (data) {
            setCelebrityData(data);
          } else {
            setCelebrityError(`No celebrity profile found with the name "${user.username}".`);
          }
        } catch (err: any) {
          console.error("Error fetching celebrity profile by name:", err);
          setCelebrityError(err.message || `Failed to load celebrity profile for ${user.username}.`);
        } finally {
          setLoadingCelebrity(false);
        }
      } else {
        setLoadingCelebrity(false);
        setCelebrityError("No username available to fetch celebrity profile.");
      }
    };

    fetchCelebrityProfile();
  }, [user.username]);

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-purple-800 mb-4">Welcome, {user.username}!</h1>
        <p className="text-sm text-gray-500 mb-8">Your Celebrity User ID: <span className="font-mono bg-gray-100 p-1 rounded">{user.id}</span></p>

        <h2 className="text-2xl font-semibold text-purple-700 mb-4">Your Celebrity Profile</h2>
        {loadingCelebrity ? (
          <div className="flex justify-center items-center py-8">
            <Loader2Icon className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-2 text-lg text-gray-600">Loading your celebrity profile...</span>
          </div>
        ) : celebrityError ? (
          <p className="text-red-500 text-lg">{celebrityError}</p>
        ) : celebrityData ? (
          <div className="bg-purple-100 p-6 rounded-lg shadow-inner text-left mx-auto max-w-md">
            <img
              src={
                celebrityData.profileImageUrl
                  ? celebrityData.profileImageUrl.startsWith('data:image/')
                    ? celebrityData.profileImageUrl
                    : `/api/image-proxy?url=${encodeURIComponent(celebrityData.profileImageUrl)}`
                  : `https://placehold.co/400x300/e2e8f0/64748b?text=${encodeURIComponent(celebrityData.name)}`
              }
              alt={celebrityData.name}
              className="w-full h-48 object-contain rounded-md mb-4"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/400x300/e2e8f0/64748b?text=${encodeURIComponent(celebrityData.name)}`;
              }}
            />
            <h3 className="text-xl font-bold text-purple-900 mb-2">{celebrityData.name}</h3>
            <p className="text-gray-700 text-sm mb-1">
              <span className="font-medium">Country:</span> {celebrityData.country}
            </p>
            <p className="text-gray-700 text-sm mb-1">
              <span className="font-medium">Category:</span>{' '}
              {Array.isArray(celebrityData.category)
                ? celebrityData.category.join(', ')
                : celebrityData.category}
            </p>
            <p className="text-gray-700 text-sm mb-1">
              <span className="font-medium">Fanbase Count:</span>{' '}
              {celebrityData.fanbaseCount !== undefined && celebrityData.fanbaseCount !== null
                ? celebrityData.fanbaseCount.toLocaleString()
                : 'N/A'}
            </p>
            {celebrityData.description && (
              <p className="text-gray-700 text-sm mt-2">
                <span className="font-medium">Description:</span> {celebrityData.description}
              </p>
            )}
            {celebrityData.sampleSetlistOrKeynoteTopics && celebrityData.sampleSetlistOrKeynoteTopics.length > 0 && (
              <p className="text-gray-700 text-sm mt-2">
                <span className="font-medium">Topics:</span>{' '}
                {Array.isArray(celebrityData.sampleSetlistOrKeynoteTopics)
                  ? celebrityData.sampleSetlistOrKeynoteTopics.join(', ')
                  : celebrityData.sampleSetlistOrKeynoteTopics}
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-600">No celebrity profile found for this user's username.</p>
        )}

        <button
          onClick={onLogout}
          className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center mx-auto"
        >
          <LogOutIcon className="mr-2" size={20} /> Logout
        </button>
      </div>
    </div>
  );
};

export default CelebrityDashboard;