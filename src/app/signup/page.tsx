'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sparkles as SparklesIcon,
  Loader2 as Loader2Icon,
  CheckCircle2 as CheckCircle2Icon,
  XCircle as XCircleIcon,
} from 'lucide-react';

import { z } from 'zod'; 
import { aiCelebrityDataSchema, createCelebritySchema } from '../lib/types';
import { api } from '../lib/api';

export default function CelebritySignupPage() {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<z.infer<typeof createCelebritySchema>>({
    resolver: zodResolver(createCelebritySchema),
    defaultValues: {
      name: '',
      category: '',
      country: '',
      description: '',
      profileImageUrl: '',
      instagramHandle: '',
      youtubeChannel: '',
      spotifyId: '',
      imdbId: '',
      fanbaseCount: 0,
      sampleSetlistOrKeynoteTopics: '',
    }
  });

  const [aiQuery, setAiQuery] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [loadingAutofill, setLoadingAutofill] = useState(false);
  const [autofillError, setAutofillError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSuggest = async () => {
    setLoadingSuggestions(true);
    setSuggestionError(null);
    setAiSuggestions([]);
    try {
      const suggestions = await api.suggestCelebrities(aiQuery);
      setAiSuggestions(suggestions);
    } catch (err: any) {
      setSuggestionError(err.message);
      console.error("Error suggesting celebrities:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAutofill = async (celebrityName: string) => {
    setAutofillError(null);
    try {
      const data = await api.autofillCelebrityData(celebrityName);

      (Object.keys(data) as Array<keyof z.infer<typeof aiCelebrityDataSchema>>).forEach(key => {
        const value = data[key];
        if (key === 'fanbaseCount') {
          setValue('fanbaseCount', value as number);
        } else if (key === 'sampleSetlistOrKeynoteTopics') {
          setValue('sampleSetlistOrKeynoteTopics', Array.isArray(value) ? value.join(', ') : '');
        } else if (key === 'category') {
          setValue('category', Array.isArray(value) ? (value[0] || '') : (value as string));
        } else if (key in createCelebritySchema.shape) {
            setValue(key as keyof z.infer<typeof createCelebritySchema>, value as any);
        }
      });
      setAutofillError(null);
    } catch (err: any) {
      setAutofillError(`Autofill failed: ${err.message}. Check console for details.`);
      console.error("Autofill data parsing/fetch error:", err);
      reset({ name: celebrityName });
    } 
  };

  const onSubmit = async (data: z.infer<typeof createCelebritySchema>) => {
    setSubmitStatus(null);
    setSubmitMessage('');
    try {
      const submitData: any = { ...data };

      if (typeof submitData.sampleSetlistOrKeynoteTopics === 'string') {
        submitData.sampleSetlistOrKeynoteTopics = submitData.sampleSetlistOrKeynoteTopics.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      } else if (!submitData.sampleSetlistOrKeynoteTopics) {
        submitData.sampleSetlistOrKeynoteTopics = [];
      }

      if (typeof submitData.category === 'string' && submitData.category.length > 0) {
        submitData.category = JSON.stringify([submitData.category]);
      } else {
        submitData.category = JSON.stringify([]);
      }

      submitData.fanbaseCount = Number(submitData.fanbaseCount);

      await api.createCelebrity(submitData);
      setSubmitStatus('success');
      setSubmitMessage('Celebrity profile created successfully!');
      reset();
    } catch (err: any) {
      setSubmitStatus('error');
      setSubmitMessage(`Error creating profile: ${err.message}`);
      console.error("Form submission error:", err);
    }
  };

  return (
    <div className="container mx-auto p-8 bg-white rounded-xl shadow-lg my-8">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Celebrity Onboarding Form</h2>

      <div className="mb-10 p-6 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
        <h3 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center">
          <SparklesIcon className="mr-2" /> AI Celebrity Suggestion
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="e.g., Punjabi Singer from India who performed at Coachella"
            className="flex-grow text-black p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
          />
          <button
            onClick={handleSuggest}
            disabled={loadingSuggestions || !aiQuery.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loadingSuggestions ? <Loader2Icon className="animate-spin mr-2" /> : <SparklesIcon className="mr-2" />}
            Suggest Celebrities
          </button>
        </div>
        {suggestionError && <p className="text-red-500 text-sm mt-2">{suggestionError}</p>}
        {aiSuggestions.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-blue-700 mb-2">Suggestions:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                  <span className="text-gray-800 font-medium">{suggestion}</span>
                  <button
                    onClick={() => handleAutofill(suggestion)}
                    disabled={loadingAutofill}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loadingAutofill ? <Loader2Icon className="animate-spin mr-2" size={16} /> : null}
                    Autofill
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {autofillError && <p className="text-red-500 text-sm mt-2">{autofillError}</p>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Celebrity Details</h3>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-black mb-1">Name</label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className="w-full p-3 border border-gray-300 text-black  rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-black mb-1">Category</label>
          <select
            id="category"
            {...register('category')}
            className="w-full p-3 border border-gray-300 text-black  rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a category</option>
            <option value="Singer">Singer</option>
            <option value="Speaker">Speaker</option>
            <option value="Actor">Actor</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-black mb-1">Country</label>
          <input
            type="text"
            id="country"
            {...register('country')}
            className="w-full p-3 border border-gray-300 text-black  rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-black mb-1">Description</label>
          <textarea
            id="description"
            {...register('description')}
            rows={4}
            className="w-full p-3 border border-gray-300  text-black rounded-lg focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label htmlFor="profileImageUrl" className="block text-sm font-medium  text-black mb-1">Profile Image URL</label>
          <input
            type="url"
            id="profileImageUrl"
            {...register('profileImageUrl')}
            className="w-full p-3 border border-gray-300  text-black rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.profileImageUrl && <p className="text-red-500 text-xs mt-1">{errors.profileImageUrl.message}</p>}
        </div>

        <div>
          <label htmlFor="instagramHandle" className="block text-sm font-medium text-black mb-1">Instagram Handle</label>
          <input
            type="text"
            id="instagramHandle"
            {...register('instagramHandle')}
            className="w-full p-3 border border-gray-300  text-black rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.instagramHandle && <p className="text-red-500 text-xs mt-1">{errors.instagramHandle.message}</p>}
        </div>

        <div>
          <label htmlFor="youtubeChannel" className="block text-sm font-medium text-black mb-1">YouTube Channel</label>
          <input
            type="text"
            id="youtubeChannel"
            {...register('youtubeChannel')}
            className="w-full p-3 border border-gray-300  text-black rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.youtubeChannel && <p className="text-red-500 text-xs mt-1">{errors.youtubeChannel.message}</p>}
        </div>

        <div>
          <label htmlFor="spotifyId" className="block text-sm font-medium text-black mb-1">Spotify ID</label>
          <input
            type="text"
            id="spotifyId"
            {...register('spotifyId')}
            className="w-full p-3 border border-gray-300 text-black  rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.spotifyId && <p className="text-red-500 text-xs mt-1">{errors.spotifyId.message}</p>}
        </div>

        <div>
          <label htmlFor="imdbId" className="block text-sm font-medium text-black mb-1">IMDb ID</label>
          <input
            type="text"
            id="imdbId"
            {...register('imdbId')}
            className="w-full p-3 border border-gray-300 rounded-lg text-black  focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.imdbId && <p className="text-red-500 text-xs mt-1">{errors.imdbId.message}</p>}
        </div>

        <div>
          <label htmlFor="fanbaseCount" className="block text-sm font-medium text-black mb-1">Fanbase Count</label>
          <input
            type="number"
            id="fanbaseCount"
            {...register('fanbaseCount', { valueAsNumber: true })}
            className="w-full p-3 border border-gray-300 rounded-lg text-black  focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.fanbaseCount && <p className="text-red-500 text-xs mt-1">{errors.fanbaseCount.message}</p>}
        </div>

        <div>
          <label htmlFor="sampleSetlistOrKeynoteTopics" className="block text-sm font-medium text-black mb-1">
            Sample Setlist / Keynote Topics (comma-separated)
          </label>
          <input
            type="text"
            id="sampleSetlistOrKeynoteTopics"
            {...register('sampleSetlistOrKeynoteTopics')}
            placeholder="e.g., Love Story, Shake It Off, Blank Space"
            className="w-full p-3 border border-gray-300 rounded-lg  text-black  focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.sampleSetlistOrKeynoteTopics && <p className="text-red-500 text-xs mt-1">{errors.sampleSetlistOrKeynoteTopics.message}</p>}
        </div>

        {submitStatus === 'success' && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative flex items-center space-x-2" role="alert">
            <CheckCircle2Icon size={20} className="text-green-500" />
            <span className="block sm:inline">{submitMessage}</span>
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative flex items-center space-x-2" role="alert">
            <XCircleIcon size={20} className="text-red-500" />
            <span className="block sm:inline">{submitMessage}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md"
        >
          Create Celebrity Profile
        </button>
      </form>
    </div>
  );
}
