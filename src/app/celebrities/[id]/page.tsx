
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; 
import {
  ArrowLeft as ArrowLeftIcon,
  Loader2 as Loader2Icon,
  CheckCircle2 as CheckCircle2Icon,
  XCircle as XCircleIcon,
  FileText as FileTextIcon 
} from 'lucide-react';

import { api } from '../../lib/api'; 
import { Celebrity } from '../../lib/types'; 

export default function CelebrityProfilePage() {
  const params = useParams();
  const router = useRouter();
  const celebrityId = params.id as string; 

  const [celebrity, setCelebrity] = useState<Celebrity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfStatus, setPdfStatus] = useState<'loading' | 'success' | 'error' | null>(null);
  const [pdfMessage, setPdfMessage] = useState('');

  useEffect(() => {
    if (!celebrityId) {
      setError('No celebrity ID provided.');
      setLoading(false);
      return;
    }
    const fetchCelebrity = async () => {
      try {
        const data = await api.getCelebrityById(celebrityId);
        setCelebrity(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching celebrity profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCelebrity();
  }, [celebrityId]);

  const handleGeneratePdf = async () => {
    setPdfStatus('loading');
    setPdfMessage('');
    try {
      if (!celebrity || !celebrity.id) {
        throw new Error("Celebrity data not available for PDF generation.");
      }
      await api.generatePdf(celebrity.id);
      setPdfStatus('success');
      setPdfMessage('PDF generated and downloaded successfully!');
    } catch (err: any) {
      setPdfStatus('error');
      setPdfMessage(`Error generating PDF: ${err.message}`);
      console.error("PDF generation error:", err);
    }
  };

  if (loading) return <div className="text-center p-8 text-gray-700">Loading celebrity profile...</div>;
  if (error) return (
    <div className="text-center p-8 text-red-500">
      <p>Error: {error}</p>
      <button onClick={() => router.push('/')} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
        Go to Home
      </button>
    </div>
  );
  if (!celebrity) return <div className="text-center p-8 text-gray-600">Celebrity not found.</div>;

  return (
    <div className="container mx-auto p-8">
      <button
        onClick={() => router.back()} 
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium"
      >
        <ArrowLeftIcon size={20} className="mr-2" /> Back
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden md:flex">
        <div className="md:w-1/3 p-6 flex flex-col items-center justify-center bg-gray-50">
          <img
            src={celebrity.profileImageUrl || `https://placehold.co/400x400/e2e8f0/64748b?text=${celebrity.name.split(' ')[0]}`}
            alt={celebrity.name}
            className="w-48 h-48 rounded-full object-cover border-4 border-blue-300 shadow-md"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x400/e2e8f0/64748b?text=${celebrity.name.split(' ')[0]}`; }}
          />
          <h2 className="text-3xl font-bold text-gray-900 mt-4">{celebrity.name}</h2>
          <p className="text-blue-600 text-lg">
            {
              (() => {
                try {
                  const parsedCategory = celebrity.category;
                  return Array.isArray(parsedCategory) ? parsedCategory.join(', ') : celebrity.category;
                } catch {
                  return celebrity.category; 
                }
              })()
            }
          </p>
          <p className="text-gray-600 text-md mt-2">{celebrity.country}</p>
          <p className="text-gray-700 text-sm mt-1">Fanbase: {celebrity.fanbaseCount ? celebrity.fanbaseCount.toLocaleString() : 'N/A'}</p>

          <button
            onClick={handleGeneratePdf}
            disabled={pdfStatus === 'loading'}
            className="mt-6 bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
          >
            {pdfStatus === 'loading' ? <Loader2Icon className="animate-spin mr-2" size={20} /> : <FileTextIcon size={20} className="mr-2" />}
            Generate PDF Profile
          </button>
          {pdfStatus === 'success' && <p className="text-green-600 text-sm mt-2 flex items-center"><CheckCircle2Icon size={16} className="mr-1" /> {pdfMessage}</p>}
          {pdfStatus === 'error' && <p className="text-red-600 text-sm mt-2 flex items-center"><XCircleIcon size={16} className="mr-1" /> {pdfMessage}</p>}
        </div>

        <div className="md:w-2/3 p-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">About</h3>
          <p className="text-gray-700 leading-relaxed mb-6">{celebrity.description || 'No description available.'}</p>

          <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Social & Media</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {celebrity.instagramHandle && (
              <p className="text-gray-700">
                <span className="font-medium">Instagram:</span>{' '}
                <a href={`https://instagram.com/${celebrity.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  @{celebrity.instagramHandle}
                </a>
              </p>
            )}
            {celebrity.youtubeChannel && (
              <p className="text-gray-700">
                <span className="font-medium">YouTube:</span>{' '}
                <a href={celebrity.youtubeChannel.startsWith('http') ? celebrity.youtubeChannel : `https://youtube.com/${celebrity.youtubeChannel}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {celebrity.youtubeChannel}
                </a>
              </p>
            )}
            {celebrity.spotifyId && (
              <p className="text-gray-700">
                <span className="font-medium">Spotify:</span>{' '}
                <a href={`https://open.spotify.com/artist/${celebrity.spotifyId}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {celebrity.spotifyId}
                </a>
              </p>
            )}
            {celebrity.imdbId && (
              <p className="text-gray-700">
                <span className="font-medium">IMDb:</span>{' '}
                <a href={`https://www.imdb.com/name/${celebrity.imdbId}/`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {celebrity.imdbId}
                </a>
              </p>
            )}
          </div>

          {celebrity.sampleSetlistOrKeynoteTopics && Array.isArray(celebrity.sampleSetlistOrKeynoteTopics) && celebrity.sampleSetlistOrKeynoteTopics.length > 0 && (
            <>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Setlist / Topics</h3>
              <ul className="list-disc list-inside text-gray-700">
                {celebrity.sampleSetlistOrKeynoteTopics.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
