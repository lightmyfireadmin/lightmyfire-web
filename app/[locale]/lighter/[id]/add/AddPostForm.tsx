'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Assuming lib is at root
import type { User } from '@supabase/supabase-js';
import Image from 'next/image';
import { useContentModeration } from '@/app/hooks/useContentModeration';
import LocationPicker from './LocationPicker';

type PostType = 'text' | 'song' | 'image' | 'location' | 'refuel';

interface YouTubeVideo {
  id: { videoId: string };
  snippet: { title: string; thumbnails: { default: { url: string } } };
}

// Post Type Button Component
function PostTypeButton({
  selected,
  onClick,
  icon,
  label,
  subtitle,
  colorClass,
}: {
  selected: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  subtitle: string;
  colorClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
        selected
          ? `${colorClass} shadow-md scale-105 font-semibold`
          : 'border-border text-muted-foreground hover:text-foreground hover:border-border'
      }`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-xs font-bold ${selected ? '' : 'text-muted-foreground'}`}>{label}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </button>
  );
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
        `/api/youtube-search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (data.error) {
        setError(`YouTube Search Error: ${data.error}`);
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
        <LocationPicker
          value={{ name: locationName, lat: locationLat, lng: locationLng }}
          onChange={({ name, lat, lng }) => {
            setLocationName(name);
            setLocationLat(lat);
            setLocationLng(lng);
          }}
        />
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

      {/* Post Type Selector with Styling */}
      <div className="mb-8">
        <p className="text-center text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Select Post Type</p>
        <div className="relative">
          {/* Sliding indicator background */}
          <div className="absolute inset-0 pointer-events-none">
            {postType === 'text' && <div className="absolute top-0 left-0 w-1/5 h-full bg-blue-100 dark:bg-blue-900/30 rounded-lg transition-all duration-300" />}
            {postType === 'song' && <div className="absolute top-0 left-1/5 w-1/5 h-full bg-green-100 dark:bg-green-900/30 rounded-lg transition-all duration-300" />}
            {postType === 'image' && <div className="absolute top-0 left-2/5 w-1/5 h-full bg-red-100 dark:bg-red-900/30 rounded-lg transition-all duration-300" />}
            {postType === 'location' && <div className="absolute top-0 left-3/5 w-1/5 h-full bg-purple-100 dark:bg-purple-900/30 rounded-lg transition-all duration-300" />}
            {postType === 'refuel' && <div className="absolute top-0 left-4/5 w-1/5 h-full bg-orange-100 dark:bg-orange-900/30 rounded-lg transition-all duration-300" />}
          </div>

          {/* Post Type Buttons */}
          <div className="grid grid-cols-5 gap-2 relative z-10">
            <PostTypeButton
              selected={postType === 'text'}
              onClick={() => setPostType('text')}
              icon="📝"
              label="Poem"
              subtitle="Story, Thought"
              colorClass="border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
            />
            <PostTypeButton
              selected={postType === 'song'}
              onClick={() => setPostType('song')}
              icon="🎵"
              label="Song"
              subtitle="YouTube, Spotify"
              colorClass="border-green-500 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
            />
            <PostTypeButton
              selected={postType === 'image'}
              onClick={() => setPostType('image')}
              icon="📸"
              label="Photo"
              subtitle="Screenshot"
              colorClass="border-red-500 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
            />
            <PostTypeButton
              selected={postType === 'location'}
              onClick={() => setPostType('location')}
              icon="📍"
              label="Place"
              subtitle="Where Found It"
              colorClass="border-purple-500 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
            />
            <PostTypeButton
              selected={postType === 'refuel'}
              onClick={() => setPostType('refuel')}
              icon="🔥"
              label="Refuel"
              subtitle="Lighter Refill"
              colorClass="border-orange-500 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
            />
          </div>
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