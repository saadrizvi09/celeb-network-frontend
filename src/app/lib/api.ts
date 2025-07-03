
import { z } from 'zod';
import { Celebrity, aiCelebrityDataSchema, createCelebritySchema } from './types'; 
import { signinSchema, signupSchema } from './auth'; 

const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

let authToken: string | null = null;


export const setAuthToken = (token: string | null) => {
  authToken = token;
  console.log("API: Auth token set to:", authToken ? "Exists" : "None"); 
};

const getAuthHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};


export const api = {
  signUp: async (credentials: z.infer<typeof signupSchema>): Promise<{ accessToken: string }> => {
    const response = await fetch(`${BACKEND_API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }
    return response.json();
  },

  signIn: async (credentials: z.infer<typeof signinSchema>): Promise<{ accessToken: string }> => {
    const response = await fetch(`${BACKEND_API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signin failed');
    }
    return response.json();
  },

  getCelebrities: async (): Promise<Celebrity[]> => {
    const response = await fetch(`${BACKEND_API_BASE_URL}/celebrities`, {
      headers: getAuthHeaders(), 
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch celebrities');
    }
    return response.json();
  },
  getCelebrityById: async (id: string): Promise<Celebrity> => {
    const response = await fetch(`${BACKEND_API_BASE_URL}/celebrities/${id}`, {
      headers: getAuthHeaders(), 
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch celebrity details by ID');
    }
    return response.json();
  },
  getCelebrityByName: async (name: string): Promise<Celebrity | null> => {
    try {
      const allCelebrities = await api.getCelebrities(); 
      const foundCelebrity = allCelebrities.find(
        (celeb) => celeb.name.toLowerCase() === name.toLowerCase()
      );
      return foundCelebrity || null;
    } 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
      console.error(`Error in getCelebrityByName for ${name}:`, error);
      throw new Error(error.message || `Failed to fetch celebrity details for ${name}`);
    }
  },
  createCelebrity: async (data: z.infer<typeof createCelebritySchema>): Promise<Celebrity> => {
    const response = await fetch(`${BACKEND_API_BASE_URL}/celebrities`, {
      method: 'POST',
      headers: getAuthHeaders(), 
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create celebrity');
    }
    return response.json();
  },
  suggestCelebrities: async (query: string): Promise<string[]> => {
    const response = await fetch(`${BACKEND_API_BASE_URL}/ai/suggest-celebrities?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(), 
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch AI suggestions');
    }
    return response.json();
  },
  autofillCelebrityData: async (name: string): Promise<z.infer<typeof aiCelebrityDataSchema>> => {
    const response = await fetch(`${BACKEND_API_BASE_URL}/ai/autofill-celebrity/${encodeURIComponent(name)}`, {
      method: 'GET', 
      headers: getAuthHeaders(), 
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to autofill celebrity data');
    }
    const rawData = await response.json();
    return aiCelebrityDataSchema.parse(rawData); 
  },
  generatePdf: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_API_BASE_URL}/celebrities/${id}/pdf`, {
        method: 'GET',
        headers: getAuthHeaders(), 
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to generate PDF: ${response.statusText}`);
        } else {
          throw new Error(`Failed to generate PDF: ${response.statusText}`);
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `celebrity-profile-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
      console.error("Error in generatePdf API call:", error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  },

  
  followCelebrity: async (celebrityId: string):
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
 Promise<any> => {
    const response = await fetch(`${BACKEND_API_BASE_URL}/follows/${celebrityId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to follow celebrity');
    }
    return response.json();
  },

  unfollowCelebrity: async (celebrityId: string): Promise<void> => {
    const response = await fetch(`${BACKEND_API_BASE_URL}/follows/${celebrityId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to unfollow celebrity');
    }
    
  },

  getFollowedCelebrities: async (): Promise<Celebrity[]> => {
    console.log(`API: getFollowedCelebrities called. Current authToken in api.ts: ${authToken ? 'Exists' : 'None'}`);
    try {
      const response = await fetch(`${BACKEND_API_BASE_URL}/follows`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API: getFollowedCelebrities failed response:", errorData);
        throw new Error(errorData.message || 'Failed to fetch followed celebrities');
      }

      const followedCelebrities = await response.json();
    
      console.log("API: getFollowedCelebrities directly returning:", followedCelebrities);
      return followedCelebrities;

    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
      console.error("API: Error in getFollowedCelebrities:", error);
      throw error;
    }
  },

  isFollowing: async (celebrityId: string): Promise<boolean> => {
    const response = await fetch(`${BACKEND_API_BASE_URL}/follows/status/${celebrityId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 404) return false;
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to check following status');
    }
    const data = await response.json();
    return data.isFollowing;
  },
};