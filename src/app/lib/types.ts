import { z } from 'zod';
export interface UserProfile {
  id: string;
  username: string;
  role: 'fan' | 'celebrity';
}
export const aiCelebrityDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.union([z.string().min(1, 'Category is required'), z.array(z.string()).min(1, 'Category is required')]),
  country: z.string().min(1, 'Country is required'),
  description: z.string().optional().nullable(),
  profileImageUrl: z.string().url('Invalid URL').optional().or(z.literal('')), 
  instagramHandle: z.string().optional().nullable(),
  youtubeChannel: z.string().optional().nullable(),
  spotifyId: z.string().optional().nullable(),
  imdbId: z.string().optional().nullable(),
  fanbaseCount: z.number().int().min(1000, 'Fanbase must be at least 1000').or(z.string().transform(Number).refine(n => !isNaN(n) && n >= 1000, 'Fanbase must be a number and at least 1000')),
  sampleSetlistOrKeynoteTopics: z.array(z.string()).optional().nullable(),
});

export const createCelebritySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  country: z.string().min(1, 'Country is required'),
  description: z.string().optional().nullable(),
  profileImageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  instagramHandle: z.string().optional().nullable(),
  youtubeChannel: z.string().optional().nullable(),
  spotifyId: z.string().optional().nullable(),
  imdbId: z.string().optional().nullable(),
  fanbaseCount: z.number().int().min(1000, 'Fanbase must be at least 1000'),
  sampleSetlistOrKeynoteTopics: z.string().optional().nullable(),
});

export interface Celebrity {
  id: string;
  name: string;
  category: string[]; 
  country: string;
  profileImageUrl?: string | null; 
  youtubeChannel?: string | null;
  spotifyId?: string | null;
  imdbId?: string | null;
  fanbaseCount?: number;
  sampleSetlistOrKeynoteTopics?: string[] | null; 
  createdAt: string;
  updatedAt: string;
  description?: string | null;
  instagramHandle?: string | null;
  userId?: string | null; 
}