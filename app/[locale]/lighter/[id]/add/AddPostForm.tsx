'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Assuming lib is at root
import type { User } from '@supabase/supabase-js';
import Image from 'next/image';
import LocationSearch from '@/app/components/LocationSearch';
import { useI18n } from '@/locales/client';

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
  const t = useI18n();
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
    console.log('YouTube API Key:', process.env.NEXT_PUBLIC_YOUTUBE_API_KEY);
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

  const handleLocationSelect = (lat: number, lng: number, name: string) => {
    setLocationLat(lat);
    setLocationLng(lng);
    setLocationName(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let finalContentUrl = contentUrl;

    if (postType === 'image' && imageUploadMode === 'upload') {
      if (!file) {
        setError(t('add_post.error.no_file_selected'));
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
        setError(t('add_post.error.upload_failed'));
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
        setError(t('add_post.error.no_song_selected'));
        return;
      }
    } else if ((postType === 'song' || (postType === 'image' && imageUploadMode === 'url')) && !isValidUrl(finalContentUrl)) {
      setError(t('add_post.error.invalid_url'));
      return;
    }

    if (postType === 'location' && (locationLat === '' || locationLng === '')) {
      setError(t('add_post.error.no_location_selected'));
      return;
    }

    setLoading(true);
    
    const { data, error: rpcError } = await supabase.rpc('create_new_post', {
        p_lighter_id: lighterId,
        p_post_type: postType,
        p_title: title || null,
        p_content_text: postType === 'text' ? contentText : null,
        p_content_url: (postType === 'song' || postType === 'image') ? finalContentUrl : null,
        p_location_name: postType === 'location' ? locationName : null,
        p_location_lat: postType === 'location' && locationLat !== '' ? locationLat : null, // Pass lat
        p_location_lng: postType === 'location' && locationLng !== '' ? locationLng : null, // Pass lng
        p_is_find_location: isFindLocation,
        p_is_creation: isCreation,
        p_is_anonymous: isAnonymous,
        p_is_public: isPublic,
      });

    if (rpcError) { setError(t('add_post.error.rpc_error', { message: rpcError.message })); setLoading(false); }
    else if (data && !data.success) { setError(data.message); setLoading(false); }
    else if (data && data.success) { router.push(`/lighter/${lighterId}`); router.refresh(); }
    else { setError(t('add_post.error.unexpected')); setLoading(false); }
  };

  const renderFormInputs = () => {
    const inputClass = "w-full rounded-lg border border-input p-3 text-foreground bg-background focus:border-primary focus:ring-primary";
    const textareaClass = `${inputClass} h-32`;

    switch (postType) {
      case 'text': return <textarea value={contentText} onChange={(e) => setContentText(e.target.value)} className={textareaClass} placeholder={t('add_post.placeholder.text')} required />;
      case 'song':
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button type="button" onClick={() => setSongInputMode('url')} className={`px-3 py-1 text-sm rounded-md ${songInputMode === 'url' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{t('add_post.song_input_mode.url')}</button>
              <button type="button" onClick={() => setSongInputMode('search')} className={`px-3 py-1 text-sm rounded-md ${songInputMode === 'search' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{t('add_post.song_input_mode.search')}</button>
            </div>
            {songInputMode === 'url' ? (
              <input type="url" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} className={inputClass} placeholder={t('add_post.placeholder.youtube_url')} required />
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={youtubeSearchQuery}
                  onChange={(e) => setYoutubeSearchQuery(e.target.value)}
                  className={inputClass}
                  placeholder={t('add_post.placeholder.youtube_search')}
                />
                {youtubeSearchLoading && <p className="text-sm text-muted-foreground">{t('add_post.youtube_search.searching')}</p>}
                <div className="max-h-60 overflow-y-auto border border-border rounded-md">
                  {youtubeSearchResults.length > 0 ? (
                    youtubeSearchResults.map((video) => (
                      <div
                        key={video.id.videoId}
                        className="flex items-center p-2 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted"
                        onClick={() => {
                          setContentUrl(`https://www.youtube.com/watch?v=${video.id.videoId}`);
                          setYoutubeSearchResults([]); // Clear results after selection
                          setYoutubeSearchQuery(video.snippet.title); // Set query to title for display
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
                    !youtubeSearchLoading && youtubeSearchQuery && <p className="p-2 text-sm text-muted-foreground">{t('add_post.youtube_search.no_results')}</p>
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
              <button type="button" onClick={() => setImageUploadMode('url')} className={`px-3 py-1 text-sm rounded-md ${imageUploadMode === 'url' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{t('add_post.image_upload_mode.url')}</button>
              <button type="button" onClick={() => setImageUploadMode('upload')} className={`px-3 py-1 text-sm rounded-md ${imageUploadMode === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{t('add_post.image_upload_mode.upload')}</button>
            </div>
            {imageUploadMode === 'url' ? (
              <input type="url" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} className={inputClass} placeholder={t('add_post.placeholder.image_url')} required={imageUploadMode === 'url'} />
            ) : (
              <input type="file" onChange={handleFileChange} className={`${inputClass} p-0 file:p-3 file:mr-4 file:border-0 file:bg-muted file:text-foreground hover:file:bg-muted/80`} accept="image/png, image/jpeg, image:gif" required={imageUploadMode === 'upload'} />
            )}
          </div>
        );
      case 'location':
        return <LocationSearch onLocationSelect={handleLocationSelect} />;
      case 'refuel': return <p className="text-center text-lg text-foreground">{t('add_post.refuel_message')}</p>;
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
        {t('add_post.title')}
      </h1>
      <p className="mb-6 text-center text-lg text-muted-foreground">
        {t('add_post.subtitle', { lighterName: lighterName })}
      </p>

      {/* Post Type Selector Tabs */}
      <div className="mb-6 rounded-lg bg-muted p-1">
        <div className="flex justify-center space-x-1 overflow-x-auto">
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
                {t(`add_post.post_type.${type}`)}
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
            placeholder={t('add_post.placeholder.title')}
          />
        )}
        {renderFormInputs()}
        {/* Checkboxes */}
        <div className="space-y-3 pt-2">
          {postType === 'location' && (<Checkbox id="isFindLocation" label={t('add_post.checkbox.is_find_location')} checked={isFindLocation} onChange={setIsFindLocation} />)}
          {postType !== 'location' && postType !== 'refuel' && (<Checkbox id="isCreation" label={t('add_post.checkbox.is_creation')} checked={isCreation} onChange={setIsCreation} />)}
          <Checkbox id="isAnonymous" label={t('add_post.checkbox.is_anonymous')} checked={isAnonymous} onChange={setIsAnonymous} />
          <Checkbox id="isPublic" label={t('add_post.checkbox.is_public')} checked={isPublic} onChange={setIsPublic} />
        </div>
      </div>

      {error && <p className="my-4 text-center text-sm text-error">{error}</p>}

      <button
        type="submit"
        disabled={loading || uploading}
        className="btn-primary mt-6 w-full text-lg flex justify-center items-center" // Applied btn-primary
      >
        {loading || uploading ? (
          <>
            <Image src="/loading.gif" alt="Loading..." width={24} height={24} unoptimized={true} className="mr-2" />
            {uploading ? t('add_post.button.uploading') : t('add_post.button.posting')}
          </>
        ) : (
          t('add_post.button.add_to_story')
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