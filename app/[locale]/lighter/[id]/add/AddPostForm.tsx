'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Assuming lib is at root
import type { User } from '@supabase/supabase-js';
import Image from 'next/image';
import { useContentModeration } from '@/app/hooks/useContentModeration';

type PostType = 'text' | 'song' | 'image' | 'location' | 'refuel';

interface YouTubeVideo {
  id: { videoId: string };
  snippet: { title: string; thumbnails: { default: { url: string } } };
}

export default function AddPostForm({
  user,
  lighterId,
  lighterName,
}: {
  user: User;
  lighterId: string;
  lighterName: string;
}) {
  const router = useRouter();
  const { moderateText, moderateImage, isLoading: isModerating } = useContentModeration(user.id);

  const [postType, setPostType] = useState<PostType>('text');
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationLat, setLocationLat] = useState<number | ''>(''); // New state
  const [locationLng, setLocationLng] = useState<number | ''>(''); // New state
  const [isFindLocation, setIsFindLocation] = useState(false);
  const [isCreation, setIsCreation] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [imageUploadMode, setImageUploadMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [moderationError, setModerationError] = useState<{ severity: 'low' | 'medium' | 'high'; reason: string } | null>(null);
  const [showModerationWarning, setShowModerationWarning] = useState(false);

  // YouTube Search States
  const [songInputMode, setSongInputMode] = useState<'url' | 'search'>('url');
  const [youtubeSearchQuery, setYoutubeSearchQuery] = useState('');
  const [youtubeSearchResults, setYoutubeSearchResults] = useState<YouTubeVideo[]>([]);
  const [youtubeSearchLoading, setYoutubeSearchLoading] = useState(false);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const searchYouTube = async (query: string) => {
    if (!query) {
      setYoutubeSearchResults([]);
      return;
    }
    setYoutubeSearchLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      if (data.error) {
        setError(`YouTube API Error: ${data.error.message}`);
        setYoutubeSearchResults([]);
      } else {
        setYoutubeSearchResults(data.items || []);
      }
    } catch (err) {
      console.error('YouTube Search Error:', err);
      setError('Failed to search YouTube. Please try again.');
      setYoutubeSearchResults([]);
    }
    setYoutubeSearchLoading(false);
  };

  // Debounce YouTube search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (songInputMode === 'search') {
        searchYouTube(youtubeSearchQuery);
      }
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [youtubeSearchQuery, songInputMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // 2MB size limit
      if (selectedFile.size > 2 * 1024 * 1024) {
        setError('File is too large. Please select a file smaller than 2MB.');
        setFile(null);
        e.target.value = ''; // Reset file input
        return;
      }
      setError('');
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setModerationError(null);
    setShowModerationWarning(false);

    let finalContentUrl = contentUrl;

    if (postType === 'image' && imageUploadMode === 'upload') {
      if (!file) {
        setError('Please select a file to upload.');
        return;
      }

      setLoading(true);
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (uploadError) {
        setError('Failed to upload image. Please try again.');
        setLoading(false);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      finalContentUrl = urlData.publicUrl;
      setUploading(false);
    }

    if (postType === 'song' && songInputMode === 'search') {
      // If song is selected via search, contentUrl should already be set
      if (!finalContentUrl) {
        setError('Please select a song from the search results.');
        return;
      }
    } else if ((postType === 'song' || (postType === 'image' && imageUploadMode === 'url')) && !isValidUrl(finalContentUrl)) {
      setError('Please enter a valid URL.');
      return;
    }

    if (postType === 'location' && (locationLat === '' || locationLng === '')) {
      setError('Please enter valid latitude and longitude.');
      return;
    }

    setLoading(true);

    // ========================================
    // CONTENT MODERATION CHECKS
    // ========================================
    try {
      // Moderate text content based on post type
      if (postType === 'text' && contentText.trim()) {
        const textMod = await moderateText(contentText);
        if (textMod.flagged) {
          setModerationError({
            severity: textMod.severityLevel || 'medium',
            reason: textMod.reason || 'Content violates our community guidelines.',
          });
          setLoading(false);
          return;
        }
      }

      // Moderate title if present
      if (title.trim()) {
        const titleMod = await moderateText(title);
        if (titleMod.flagged) {
          setModerationError({
            severity: titleMod.severityLevel || 'medium',
            reason: `Title ${titleMod.reason?.toLowerCase() || 'violates our community guidelines.'}`,
          });
          setLoading(false);
          return;
        }
      }

      // Moderate location name
      if (postType === 'location' && locationName.trim()) {
        const locMod = await moderateText(locationName);
        if (locMod.flagged) {
          setModerationError({
            severity: locMod.severityLevel || 'medium',
            reason: `Location name ${locMod.reason?.toLowerCase() || 'violates our community guidelines.'}`,
          });
          setLoading(false);
          return;
        }
      }

      // Moderate image content
      if ((postType === 'image' || postType === 'refuel') && finalContentUrl) {
        const imageMod = await moderateImage(finalContentUrl);
        if (imageMod.flagged) {
          setModerationError({
            severity: imageMod.severityLevel || 'medium',
            reason: imageMod.reason || 'Image violates our community guidelines.',
          });
          setLoading(false);
          return;
        }
      }
    } catch (modError) {
      // Log but don't fail on moderation errors
      console.error('Moderation error:', modError);
      // Continue with posting anyway (moderation is best-effort)
    }

    // ========================================
    // All moderation checks passed, proceed with posting
    // ========================================

    const { data, error: rpcError } = await supabase.rpc('create_new_post', {
        p_lighter_id: lighterId,
        p_post_type: postType,
        p_title: title || null,
        p_content_text: postType === 'text' ? contentText : null,
        p_content_url: (postType === 'song' || postType === 'image') ? finalContentUrl : null,
        p_location_name: postType === 'location' ? locationName : null,
        p_location_lat: postType === 'location' && locationLat !== '' ? locationLat : null,
        p_location_lng: postType === 'location' && locationLng !== '' ? locationLng : null,
        p_is_find_location: isFindLocation,
        p_is_creation: isCreation,
        p_is_anonymous: isAnonymous,
        p_is_public: isPublic,
      });

    if (rpcError) { setError(`Error: ${rpcError.message}`); setLoading(false); }
    else if (data && !data.success) { setError(data.message); setLoading(false); }
    else if (data && data.success) { router.push(`/lighter/${lighterId}`); router.refresh(); }
    else { setError('An unexpected error occurred. Please try again.'); setLoading(false); }
  };

  const renderFormInputs = () => {
    const inputClass = "w-full rounded-lg border border-input p-3 text-foreground bg-background focus:border-primary focus:ring-primary";
    const textareaClass = `${inputClass} h-32`;

    switch (postType) {
      case 'text': return <textarea value={contentText} onChange={(e) => setContentText(e.target.value)} className={textareaClass} placeholder="Your poem, your story, your thoughts..." required />;
      case 'song':
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button type="button" onClick={() => setSongInputMode('url')} className={`px-3 py-1 text-sm rounded-md ${songInputMode === 'url' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>URL</button>
              <button type="button" onClick={() => setSongInputMode('search')} className={`px-3 py-1 text-sm rounded-md ${songInputMode === 'search' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>Search</button>
            </div>
            {songInputMode === 'url' ? (
              <input type="url" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} className={inputClass} placeholder="YouTube Song URL" required />
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={youtubeSearchQuery}
                  onChange={(e) => setYoutubeSearchQuery(e.target.value)}
                  className={inputClass}
                  placeholder="Search YouTube for a song..."
                />
                {youtubeSearchLoading && <p className="text-sm text-muted-foreground">Searching...</p>}
                <div className="max-h-60 overflow-y-auto border border-border rounded-md">
                  {youtubeSearchResults.length > 0 ? (
                    youtubeSearchResults.map((video) => (
                      <div
                        key={video.id.videoId}
                        className="flex items-center p-2 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted"
                        onClick={() => {
                          setContentUrl(`https://www.youtube.com/watch?v=${video.id.videoId}`);
                          setYoutubeSearchResults([]);
                          setYoutubeSearchQuery(video.snippet.title); 
                        }}
                      >
                        <Image
                          src={video.snippet.thumbnails.default.url}
                          alt={video.snippet.title}
                          width={48}
                          height={36}
                          className="mr-2 rounded"
                        />
                        <span className="text-sm text-foreground">{video.snippet.title}</span>
                      </div>
                    ))
                  ) : (
                    !youtubeSearchLoading && youtubeSearchQuery && <p className="p-2 text-sm text-muted-foreground">No results found.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      case 'image':
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button type="button" onClick={() => setImageUploadMode('url')} className={`px-3 py-1 text-sm rounded-md ${imageUploadMode === 'url' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>URL</button>
              <button type="button" onClick={() => setImageUploadMode('upload')} className={`px-3 py-1 text-sm rounded-md ${imageUploadMode === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>Upload</button>
            </div>
            {imageUploadMode === 'url' ? (
              <input type="url" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} className={inputClass} placeholder="Image URL (e.g., Imgur)" required={imageUploadMode === 'url'} />
            ) : (
              <input type="file" onChange={handleFileChange} className={`${inputClass} p-0 file:p-3 file:mr-4 file:border-0 file:bg-muted file:text-foreground hover:file:bg-muted/80`} accept="image/png, image/jpeg, image:gif" required={imageUploadMode === 'upload'} />
            )}
          </div>
        );
      case 'location': return (
        <>
          <input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)} className={`${inputClass} mb-2`} placeholder="Name of a place (e.g., 'Cafe Central')" required />
          <input type="number" value={locationLat} onChange={(e) => setLocationLat(parseFloat(e.target.value))} className={`${inputClass} mb-2`} placeholder="Latitude (e.g., 48.8566)" step="any" required />
          <input type="number" value={locationLng} onChange={(e) => setLocationLng(parseFloat(e.target.value))} className={inputClass} placeholder="Longitude (e.g., 2.3522)" step="any" required />
        </>
      );
      case 'refuel': return <p className="text-center text-lg text-foreground">You&apos;re a hero! By clicking &quot;Post,&quot; you&apos;ll add a &quot;Refueled&quot; entry to this lighter&apos;s story.</p>;
      default: return null;
    }
  };

  return (
    // Applied responsive padding
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl rounded-xl bg-background p-6 sm:p-8 shadow-lg"
    >
      <h1 className="mb-2 text-center text-3xl font-bold text-foreground">
        Add to the Story
      </h1>
      <p className="mb-6 text-center text-lg text-muted-foreground">
        You are adding a post to <span className="font-semibold text-foreground">{lighterName}</span>
      </p>

      {/* Post Type Selector Tabs */}
      <div className="mb-6 rounded-lg bg-muted p-1">
        <div className="flex space-x-1 overflow-x-auto">
          {(['text', 'song', 'image', 'location', 'refuel'] as PostType[]).map(
            (type) => (
              <button
                key={type}
                type="button"
                onClick={() => setPostType(type)}
                className={`flex-shrink-0 rounded-md px-3 py-2 text-sm font-medium capitalize transition ${
                  postType === type
                    ? 'bg-background text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                }`}
              >
                {type}
              </button>
            )
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {postType !== 'refuel' && (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-input p-3 text-foreground bg-background focus:border-primary focus:ring-primary"
            placeholder="Title (Optional)"
          />
        )}
        {renderFormInputs()}
        {/* Checkboxes */}
        <div className="space-y-3 pt-2">
          {postType === 'location' && (<Checkbox id="isFindLocation" label="This is where I found this lighter" checked={isFindLocation} onChange={setIsFindLocation} />)}
          {postType !== 'location' && postType !== 'refuel' && (<Checkbox id="isCreation" label="This is something I&apos;ve made" checked={isCreation} onChange={setIsCreation} />)}
          <Checkbox id="isAnonymous" label="Post anonymously" checked={isAnonymous} onChange={setIsAnonymous} />
          <Checkbox id="isPublic" label="Allow this post to appear in public feeds (e.g., homepage)" checked={isPublic} onChange={setIsPublic} />
        </div>
      </div>

      {error && <p className="my-4 text-center text-sm text-red-600 dark:text-red-400">{error}</p>}

      {moderationError && (
        <div className={`my-4 rounded-lg border p-4 ${
          moderationError.severity === 'high'
            ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
            : moderationError.severity === 'medium'
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
            : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
        }`}>
          <p className={`text-sm font-medium ${
            moderationError.severity === 'high'
              ? 'text-red-800 dark:text-red-200'
              : moderationError.severity === 'medium'
              ? 'text-orange-800 dark:text-orange-200'
              : 'text-yellow-800 dark:text-yellow-200'
          }`}>
            ⚠️ Content Review
          </p>
          <p className={`text-sm mt-1 ${
            moderationError.severity === 'high'
              ? 'text-red-700 dark:text-red-300'
              : moderationError.severity === 'medium'
              ? 'text-orange-700 dark:text-orange-300'
              : 'text-yellow-700 dark:text-yellow-300'
          }`}>
            {moderationError.reason}
          </p>
          {moderationError.severity === 'low' && (
            <p className="text-xs mt-2 text-yellow-600 dark:text-yellow-400">
              💡 Tip: Consider revising your content to be more community-friendly.
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || uploading || isModerating}
        className="btn-primary mt-6 w-full text-lg flex justify-center items-center"
      >
        {loading || uploading ? (
          <>
            <Image src="/loading.gif" alt="Loading..." width={24} height={24} unoptimized={true} className="mr-2" />
            {uploading ? 'Uploading...' : 'Posting...'}
          </>
        ) : isModerating ? (
          <>
            <Image src="/loading.gif" alt="Checking..." width={24} height={24} unoptimized={true} className="mr-2" />
            Checking content...
          </>
        ) : (
          'Add to Story'
        )}
      </button>
    </form>
  );
}

// Checkbox helper component remains the same
function Checkbox({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (checked: boolean) => void; }) {
 return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-input text-primary focus:ring-primary focus:ring-offset-background"
      />
      <label htmlFor={id} className="ml-2 block text-sm text-foreground">
        {label}
      </label>
    </div>
  );
}