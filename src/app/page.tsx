// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 as Loader2Icon, Heart as HeartIcon, HeartCrack as HeartCrackIcon } from 'lucide-react';
import { api, setAuthToken } from './lib/api';
import { Celebrity, UserProfile } from './lib/types';

export default function HomePage() {
  const router = useRouter();
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [followedCelebrityIds, setFollowedCelebrityIds] = useState<Set<string>>(new Set());
  const [followActionLoading, setFollowActionLoading] = useState<Set<string>>(new Set());
  const [unfollowActionLoading, setUnfollowActionLoading] = useState<Set<string>>(new Set());


  // Effect to load user data and set auth token
  useEffect(() => {
    const loadUserSession = () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser: UserProfile = JSON.parse(storedUser);
          if (parsedUser && parsedUser.id && parsedUser.username && (parsedUser.role === 'fan' || parsedUser.role === 'celebrity')) {
            setAuthToken(storedToken); // Set the token globally for API calls
            setCurrentUser(parsedUser);
            console.log("HomePage: Current User set:", parsedUser);
            console.log("HomePage: Auth token set for API calls.");
          } else {
            console.warn("HomePage: Invalid user data in localStorage, clearing session.");
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setAuthToken(null);
            setCurrentUser(null);
          }
        } catch (e) {
          console.error("HomePage: Failed to parse user from localStorage:", e);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setAuthToken(null);
          setCurrentUser(null);
        }
      } else {
        console.log("HomePage: No user session found. Running as guest.");
        setAuthToken(null); // Ensure token is cleared if no session
        setCurrentUser(null);
      }
    };
    loadUserSession();
  }, []); // Run once on mount to establish user session and token


  // Effect to fetch all celebrities and followed celebrities (depends on currentUser)
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      console.log("HomePage: Initial data fetching useEffect started.");

      try {
        // Fetch all celebrities first
        const allCelebrities = await api.getCelebrities();
        setCelebrities(allCelebrities);
        console.log("HomePage: All celebrities fetched.");

        // Only fetch followed celebrities if currentUser is a fan
        if (currentUser && currentUser.role === 'fan') {
          console.log("HomePage: User is a fan, attempting to fetch followed celebrities.");
          try {
            const followed = await api.getFollowedCelebrities();
            console.log("HomePage: Raw followed data from API (after api.ts filter):", followed); // CRITICAL LOG
            const validFollowedIds = new Set(followed.filter(celeb => celeb && typeof celeb.id === 'string').map(celeb => celeb.id));
            setFollowedCelebrityIds(validFollowedIds);
            console.log("HomePage: Followed celebrity IDs set to:", validFollowedIds); // CRITICAL LOG
          } catch (followedErr: any) {
            console.error("HomePage: Error fetching followed celebrities for homepage:", followedErr);
            setFollowedCelebrityIds(new Set());
          }
        } else {
          setFollowedCelebrityIds(new Set()); // Ensure empty set if not a fan or not logged in
        }

      } catch (err: any) {
        setError(err.message);
        console.error("HomePage: General error fetching data:", err);
      } finally {
        setLoading(false);
        console.log("HomePage: Loading finished.");
      }
    };

    // Only run this effect once currentUser is determined
    if (currentUser !== undefined) {
      fetchInitialData();
    }
  }, [currentUser]);


  const handleToggleFollow = async (celebrityId: string) => {
    if (!currentUser || currentUser.role !== 'fan') {
      alert("Please log in as a fan to follow celebrities.");
      router.push('/login');
      return;
    }

    const isCurrentlyFollowing = followedCelebrityIds.has(celebrityId);
    console.log(`HomePage: Toggling follow for ${celebrityId}. Currently following: ${isCurrentlyFollowing}`);
    console.log("HomePage: Current followedCelebrityIds before toggle:", followedCelebrityIds);

    if (isCurrentlyFollowing && unfollowActionLoading.has(celebrityId)) {
      return;
    }
    if (!isCurrentlyFollowing && followActionLoading.has(celebrityId)) {
      return;
    }

    if (isCurrentlyFollowing) {
      setUnfollowActionLoading(prev => new Set(prev).add(celebrityId));
    } else {
      setFollowActionLoading(prev => new Set(prev).add(celebrityId));
    }

    try {
      if (isCurrentlyFollowing) {
        await api.unfollowCelebrity(celebrityId);
        setFollowedCelebrityIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(celebrityId);
          console.log("HomePage: followedCelebrityIds after unfollow:", newSet);
          return newSet;
        });
        console.log(`Unfollowed celebrity ${celebrityId}`);
      } else {
        await api.followCelebrity(celebrityId);
        setFollowedCelebrityIds(prev => {
          const newSet = new Set(prev);
          newSet.add(celebrityId);
          console.log("HomePage: followedCelebrityIds after follow:", newSet);
          return newSet;
        });
        console.log(`Followed celebrity ${celebrityId}`);
      }
    } catch (err: any) {
      console.error("Failed to toggle follow status:", err);
      alert(`Failed to update follow status: ${err.message || "Please try again."}`);
    } finally {
      if (isCurrentlyFollowing) {
        setUnfollowActionLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(celebrityId);
          return newSet;
        });
      } else {
        setFollowActionLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(celebrityId);
          return newSet;
        });
      }
    }
  };

  // Filter handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountryFilter(e.target.value);
  };

  const filteredCelebrities = celebrities.filter(celeb => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const matchesSearch = celeb.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      
      (Array.isArray(celeb.category) && celeb.category.some(cat => String(cat).toLowerCase().includes(lowerCaseSearchTerm))) ||
      celeb.country.toLowerCase().includes(lowerCaseSearchTerm);

    const matchesCategory = categoryFilter === '' ||
      (Array.isArray(celeb.category) && celeb.category.includes(categoryFilter)) ||
      (typeof celeb.category === 'string' && celeb.category === categoryFilter);

    const matchesCountry = countryFilter === '' || celeb.country.toLowerCase() === countryFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesCountry;
  });

  const allCategories = Array.from(new Set(celebrities.flatMap(celeb => Array.isArray(celeb.category) ? celeb.category : [celeb.category]).filter(Boolean)));
  const allCountries = Array.from(new Set(celebrities.map(celeb => celeb.country).filter(Boolean)));

  console.log("HomePage: followedCelebrityIds state before rendering:", followedCelebrityIds);


  if (loading) return <div className="text-center p-8 text-gray-700">Loading celebrities...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Discover Celebrities</h2>
      <div className="mb-8 flex flex-col sm:flex-row justify-center gap-4">
        <input
          type="text"
          placeholder="Search by name, category, or country..."
          className="w-full text-black max-w-md p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={handleCategoryChange}
          className="p-3 border text-black border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all"
        >
          <option value="">All Categories</option>
          {allCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={countryFilter}
          onChange={handleCountryChange}
          className="p-3 border text-black border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all"
        >
          <option value="">All Countries</option>
          {allCountries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>
      {filteredCelebrities.length === 0 && (
        <p className="text-center text-gray-600 text-lg">No celebrities found matching your search.</p>
      )}
      <div className="grid text-black grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredCelebrities.map((celeb) => {
          const isFollowing = currentUser && currentUser.role === 'fan' && followedCelebrityIds.has(celeb.id);
          const isActionLoading = followActionLoading.has(celeb.id) || unfollowActionLoading.has(celeb.id);

          // Re-enable proxy logic, now that we know the proxy route exists
          const imageUrl = celeb.profileImageUrl;
          const finalImageUrl = imageUrl && !imageUrl.startsWith('data:image/')
            ? `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
            : imageUrl;

          console.log(`HomePage Image: Attempting to load image for ${celeb.name}. Original URL: ${celeb.profileImageUrl}. Final URL: ${finalImageUrl}`);

          return (
            <div
              key={celeb.id}
              className="bg-white text-black rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative"
            >
              <img
                src={finalImageUrl || `https://placehold.co/400x300/e2e8f0/64748b?text=${encodeURIComponent(celeb.name)}`}
                alt={celeb.name}
                className="w-full h-48 object-contain"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/400x300/e2e8f0/64748b?text=${encodeURIComponent(celeb.name)}`;
                }}
              />
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{celeb.name}</h3>
                <p className="text-gray-600 text-sm mb-1">
                  <span className="font-medium">Category:</span> {
                    Array.isArray(celeb.category) ? celeb.category.join(', ') : celeb.category
                  }
                </p>
                <p className="text-gray-600 text-sm mb-1">
                  <span className="font-medium">Country:</span> {celeb.country}
                </p>
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">Fanbase:</span>{' '}
                  {celeb.fanbaseCount !== undefined && celeb.fanbaseCount !== null
                    ? celeb.fanbaseCount.toLocaleString()
                    : 'N/A'}
                </p>
                {/* Conditional Follow/Unfollow Button */}
                {currentUser && currentUser.role === 'fan' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFollow(celeb.id);
                    }}
                    className={`mt-4 w-full py-2 px-4 rounded-lg text-white font-semibold transition-colors duration-200 flex items-center justify-center
                      ${isFollowing
                        ? 'bg-red-500 hover:bg-red-600' // Unfollow style
                        : 'bg-blue-600 hover:bg-blue-700' // Follow style
                      }
                      ${isActionLoading ? 'opacity-70 cursor-not-allowed' : ''}
                    `}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <Loader2Icon className="animate-spin mr-2" size={20} />
                    ) : isFollowing ? (
                      <>
                        <HeartCrackIcon className="mr-2" size={20} /> Unfollow
                      </>
                    ) : (
                      <>
                        <HeartIcon className="mr-2" size={20} /> Follow
                      </>
                    )}
                  </button>
                ) : (
                  // Button for non-fan users or not logged in
                  <button
                    className="mt-4 w-full py-2 px-4 rounded-lg bg-gray-300 text-gray-700 font-semibold cursor-not-allowed flex items-center justify-center"
                    disabled
                  >
                    {currentUser ? "Not Available" : "Log in to Follow"}
                  </button>
                )}
                <button
                  onClick={() => {
                    router.push(`/celebrities/${celeb.id}`);
                  }}
                  className="absolute top-2 right-2 p-2 bg-gray-800 bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition-all"
                  title="View Details"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}