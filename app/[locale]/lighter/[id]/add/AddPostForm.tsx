'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Assuming lib is at root
import type { User } from '@supabase/supabase-js';
import Image from 'next/image';
import LocationSearch from '@/app/components/LocationSearch';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import IconButton from '@/app/components/IconButton';
import { useI18n } from '@/locales/client';
import { validateFile, generateSafeFilename } from '@/lib/fileValidation';
import { POST_TYPES, SUPABASE_STORAGE_BUCKETS, RPC_FUNCTIONS } from '@/lib/constants';

type PostType = typeof POST_TYPES[keyof typeof POST_TYPES];

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
  const [postType, setPostType] = useState<PostType>(POST_TYPES.TEXT);
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
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

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
        '/api/youtube-search',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        }
      );
      const data = await response.json();
      if (data.error) {
        setError(t('add_post.error.youtube_search_failed'));
        setYoutubeSearchResults([]);
      } else {
        setYoutubeSearchResults(data.items || []);
      }
    } catch (err) {
      setError(t('add_post.error.youtube_search_failed'));
      setYoutubeSearchResults([]);
    }
    setYoutubeSearchLoading(false);
  };

  // Debounce YouTube search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (songInputMode === 'search') {
        searchYouTube(youtubeSearchQuery);
        setHighlightedIndex(-1); // Reset highlighted index on new search
      }
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [youtubeSearchQuery, songInputMode, searchYouTube]);

  // Handle keyboard navigation for YouTube search results
  const handleYoutubeSearchKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (youtubeSearchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < youtubeSearchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < youtubeSearchResults.length) {
          const video = youtubeSearchResults[highlightedIndex];
          setContentUrl(`https://www.youtube.com/watch?v=${video.id.videoId}`);
          setYoutubeSearchResults([]);
          setYoutubeSearchQuery(video.snippet.title);
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setYoutubeSearchResults([]);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setError('');

      // Validate file (size and magic number)
      const validation = await validateFile(selectedFile);
      if (!validation.valid) {
        setError(validation.error || t('add_post.error.upload_failed'));
        setFile(null);
        e.target.value = ''; // Reset file input
        return;
      }

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

    if (postType === POST_TYPES.IMAGE && imageUploadMode === 'upload') {
      if (!file) {
        setError(t('add_post.error.no_file_selected'));
        return;
      }

      setLoading(true);
      setUploading(true);

      // Generate safe filename
      const safeFileName = generateSafeFilename(user.id, file.name);

      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKETS.POST_IMAGES)
        .upload(safeFileName, file);

      if (uploadError) {
        setError(t('add_post.error.upload_failed'));
        setLoading(false);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from(SUPABASE_STORAGE_BUCKETS.POST_IMAGES)
        .getPublicUrl(safeFileName);

      finalContentUrl = urlData.publicUrl;
      setUploading(false);
    }

    if (postType === POST_TYPES.SONG && songInputMode === 'search') {
      // If song is selected via search, contentUrl should already be set
      if (!finalContentUrl) {
        setError(t('add_post.error.no_song_selected'));
        return;
      }
    } else if ((postType === POST_TYPES.SONG || (postType === POST_TYPES.IMAGE && imageUploadMode === 'url')) && !isValidUrl(finalContentUrl)) {
      setError(t('add_post.error.invalid_url'));
      return;
    }

    if (postType === POST_TYPES.LOCATION && (locationLat === '' || locationLng === '')) {
      setError(t('add_post.error.no_location_selected'));
      return;
    }

    setLoading(true);

    const { data, error: rpcError } = await supabase.rpc(RPC_FUNCTIONS.CREATE_NEW_POST, {
        p_lighter_id: lighterId,
        p_post_type: postType,
        p_title: title || null,
        p_content_text: postType === POST_TYPES.TEXT ? contentText : null,
        p_content_url: (postType === POST_TYPES.SONG || postType === POST_TYPES.IMAGE) ? finalContentUrl : null,
        p_location_name: postType === POST_TYPES.LOCATION ? locationName : null,
        p_location_lat: postType === POST_TYPES.LOCATION && locationLat !== '' ? locationLat : null, // Pass lat
        p_location_lng: postType === POST_TYPES.LOCATION && locationLng !== '' ? locationLng : null, // Pass lng
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
      case POST_TYPES.TEXT: return <textarea value={contentText} onChange={(e) => setContentText(e.target.value)} className={textareaClass} placeholder={t('add_post.placeholder.text')} required />;
      case POST_TYPES.SONG:
        return (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <IconButton
                onClick={() => setSongInputMode('url')}
                isActive={songInputMode === 'url'}
                icon="🔗"
                label={t('add_post.song_input_mode.url')}
                tooltip="Paste a YouTube URL directly"
              />
              <IconButton
                onClick={() => setSongInputMode('search')}
                isActive={songInputMode === 'search'}
                icon="🔍"
                label={t('add_post.song_input_mode.search')}
                tooltip="Search for a song on YouTube"
              />
            </div>
            {songInputMode === 'url' ? (
              <input type="url" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} className={inputClass} placeholder={t('add_post.placeholder.youtube_url')} required />
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={youtubeSearchQuery}
                  onChange={(e) => setYoutubeSearchQuery(e.target.value)}
                  onKeyDown={handleYoutubeSearchKeydown}
                  className={inputClass}
                  placeholder={t('add_post.placeholder.youtube_search')}
                  aria-label="Search YouTube videos"
                  aria-describedby="youtube-search-help"
                />
                <p id="youtube-search-help" className="text-xs text-muted-foreground">
                  Use ↑↓ to navigate, Enter to select, Esc to close
                </p>
                {youtubeSearchLoading && <p className="text-sm text-muted-foreground">{t('add_post.youtube_search.searching')}</p>}
                <div className="max-h-60 overflow-y-auto border border-border rounded-md">
                  {youtubeSearchResults.length > 0 ? (
                    youtubeSearchResults.map((video, index) => (
                      <div
                        key={video.id.videoId}
                        className={`flex items-center p-2 border-b border-border last:border-b-0 cursor-pointer transition-colors ${
                          index === highlightedIndex
                            ? 'bg-primary/20 border-l-2 border-l-primary'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => {
                          setContentUrl(`https://www.youtube.com/watch?v=${video.id.videoId}`);
                          setYoutubeSearchResults([]); // Clear results after selection
                          setYoutubeSearchQuery(video.snippet.title); // Set query to title for display
                          setHighlightedIndex(-1);
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
      case POST_TYPES.IMAGE:
        return (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <IconButton
                onClick={() => setImageUploadMode('url')}
                isActive={imageUploadMode === 'url'}
                icon="🔗"
                label={t('add_post.image_upload_mode.url')}
                tooltip="Link an image from the web"
              />
              <IconButton
                onClick={() => setImageUploadMode('upload')}
                isActive={imageUploadMode === 'upload'}
                icon="📤"
                label={t('add_post.image_upload_mode.upload')}
                tooltip="Upload an image from your device"
              />
            </div>
            {imageUploadMode === 'url' ? (
              <input type="url" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} className={inputClass} placeholder={t('add_post.placeholder.image_url')} required={imageUploadMode === 'url'} />
            ) : (
              <input type="file" onChange={handleFileChange} className={`${inputClass} p-0 file:p-3 file:mr-4 file:border-0 file:bg-muted file:text-foreground hover:file:bg-muted/80`} accept="image/png, image/jpeg, image:gif" required={imageUploadMode === 'upload'} />
            )}
          </div>
        );
      case POST_TYPES.LOCATION:
        return <LocationSearch onLocationSelect={handleLocationSelect} />;
      case POST_TYPES.REFUEL: return <p className="text-center text-lg text-foreground">{t('add_post.refuel_message')}</p>;
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
          {([POST_TYPES.TEXT, POST_TYPES.SONG, POST_TYPES.IMAGE, POST_TYPES.LOCATION, POST_TYPES.REFUEL] as PostType[]).map(
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
        {postType !== POST_TYPES.REFUEL && (
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
          {postType === POST_TYPES.LOCATION && (<Checkbox id="isFindLocation" label={t('add_post.checkbox.is_find_location')} checked={isFindLocation} onChange={setIsFindLocation} />)}
          {postType !== POST_TYPES.LOCATION && postType !== POST_TYPES.REFUEL && (<Checkbox id="isCreation" label={t('add_post.checkbox.is_creation')} checked={isCreation} onChange={setIsCreation} />)}
          <Checkbox id="isAnonymous" label={t('add_post.checkbox.is_anonymous')} checked={isAnonymous} onChange={setIsAnonymous} />
          <Checkbox id="isPublic" label={t('add_post.checkbox.is_public')} checked={isPublic} onChange={setIsPublic} />
        </div>
      </div>

      {error && <p className="my-4 text-center text-sm text-error">{error}</p>}

      <button
        type="submit"
        disabled={loading || uploading}
        className="btn-primary mt-6 w-full text-lg py-3 flex justify-center items-center gap-2 hover:shadow-lg transition-shadow duration-200"
      >
        {loading || uploading ? (
          <LoadingSpinner
            size="sm"
            color="foreground"
            label={uploading ? t('add_post.button.uploading') : t('add_post.button.posting')}
          />
        ) : (
          <>
            <span>✨</span>
            <span>{t('add_post.button.add_to_story')}</span>
          </>
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