// app/dashboard/components/FanDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 as Loader2Icon, HeartOff as HeartOffIcon, LogOutIcon } from 'lucide-react';
import { api } from '../../lib/api';
import { UserProfile, Celebrity } from '../../lib/types';

interface FanDashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

const FanDashboard: React.FC<FanDashboardProps> = ({ user, onLogout }) => {
  const [followedCelebrities, setFollowedCelebrities] = useState<Celebrity[]>([]);
  const [loadingFollowed, setLoadingFollowed] = useState(true);
  const [followedError, setFollowedError] = useState<string | null>(null);
  const [unfollowActionLoading, setUnfollowActionLoading] = useState<Set<string>>(new Set());

  const fetchFollowedCelebrities = async () => {
    setLoadingFollowed(true);
    setFollowedError(null);
    try {
      console.log("FanDashboard: Attempting to fetch followed celebrities.");
      const data = await api.getFollowedCelebrities();
      
     
      console.log("FanDashboard: Raw data from API (stringified):", JSON.stringify(data));
      
     
      const processedData: Celebrity[] = JSON.parse(JSON.stringify(data));
      
      console.log("FanDashboard: Processed data before setting state:", processedData);

      setFollowedCelebrities(processedData);
      console.log("FanDashboard: Followed celebrities fetched and state set to:", processedData);
      
    } catch (err: any) {
      console.error("Error fetching followed celebrities:", err);
      setFollowedError(err.message || "Failed to load followed celebrities.");
      setFollowedCelebrities([]); 
    } finally {
      setLoadingFollowed(false);
    }
  };

  useEffect(() => {
    if (user.role === 'fan') {
      fetchFollowedCelebrities();
    }
  }, [user.role]);

  const handleUnfollowFromDashboard = async (celebrityId: string) => {
    if (unfollowActionLoading.has(celebrityId)) {
      return;
    }

    setUnfollowActionLoading(prev => new Set(prev).add(celebrityId));

    try {
      await api.unfollowCelebrity(celebrityId);
      // Re-fetch the list to update the UI
      await fetchFollowedCelebrities();
    } catch (err: any) {
      console.error("Failed to unfollow celebrity from dashboard:", err);
      alert(`Failed to unfollow: ${err.message}`);
    } finally {
      setUnfollowActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(celebrityId);
        return newSet;
      });
    }
  };

  console.log("FanDashboard: Current followedCelebrities state for rendering:", followedCelebrities);

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">Welcome, {user.username}!</h1>
        <p className="text-gray-700 text-lg mb-6">Explore your favorite celebrities and connect with their communities.</p>

        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Celebrities You Follow</h2>
        {loadingFollowed ? (
          <div className="flex justify-center items-center py-8">
            <Loader2Icon className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-lg text-gray-600">Loading followed celebrities...</span>
          </div>
        ) : followedError ? (
          <p className="text-red-500 text-lg">{followedError}</p>
        ) : followedCelebrities.length === 0 ? (
          <p className="text-gray-600">You are not following any celebrities yet. Go to the <a href="/" className="text-blue-600 hover:underline">homepage</a> to discover some!</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 mt-6">
            {followedCelebrities.map((celeb, index) => {
              if (!celeb || typeof celeb.id === 'undefined' || typeof celeb.name === 'undefined') {
                console.warn(`FanDashboard: Skipping invalid celebrity object at index ${index}:`, celeb);
                return null;
              }

              const isUnfollowLoading = unfollowActionLoading.has(celeb.id);
              return (
                <div key={celeb.id} className="bg-blue-100 p-4 rounded-lg shadow-sm flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={
                        celeb.profileImageUrl
                          ? celeb.profileImageUrl.startsWith('data:image/')
                            ? celeb.profileImageUrl
                            : `/api/image-proxy?url=${encodeURIComponent(celeb.profileImageUrl)}`
                          : `https://placehold.co/50x50/e2e8f0/64748b?text=${encodeURIComponent(celeb.name.charAt(0))}`
                      }
                      alt={celeb.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/50x50/e2e8f0/64748b?text=${encodeURIComponent(celeb.name.charAt(0))}`;
                      }}
                    />
                    <div>
                      <h4 className="font-semibold text-blue-900">{celeb.name}</h4>
                      <p className="text-gray-700 text-sm">Fanbase: {celeb.fanbaseCount?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnfollowFromDashboard(celeb.id)}
                    className={`ml-4 py-2 px-4 rounded-lg text-white font-semibold flex items-center
                      ${isUnfollowLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}
                    `}
                    disabled={isUnfollowLoading}
                  >
                    {isUnfollowLoading ? (
                      <Loader2Icon className="animate-spin mr-2" size={20} />
                    ) : (
                      <>
                        <HeartOffIcon className="mr-2" size={20} /> Unfollow
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
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

export default FanDashboard;
