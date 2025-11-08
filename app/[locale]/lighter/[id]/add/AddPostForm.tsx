'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import Image from 'next/image';
import { useContentModeration } from '@/app/hooks/useContentModeration';
import { useI18n } from '@/locales/client';
import LocationPicker from './LocationPicker';

type PostType = 'text' | 'song' | 'image' | 'location' | 'refuel';

interface YouTubeVideo {
  id: { videoId: string };
  snippet: { title: string; thumbnails: { default: { url: string } } };
}

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
  const t = useI18n() as any;
  // SECURITY: Hook no longer needs userId - API gets it from session
  const { moderateText, moderateImage, isLoading: isModerating } = useContentModeration();

  const [postType, setPostType] = useState<PostType>('text');
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationLat, setLocationLat] = useState<number | ''>(''); 
  const [locationLng, setLocationLng] = useState<number | ''>(''); 
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

  
  const [songInputMode, setSongInputMode] = useState<'url' | 'search'>('search');
  const [youtubeSearchQuery, setYoutubeSearchQuery] = useState('');
  const [youtubeSearchResults, setYoutubeSearchResults] = useState<YouTubeVideo[]>([]);
  const [youtubeSearchLoading, setYoutubeSearchLoading] = useState(false);
  const [showYoutubeResults, setShowYoutubeResults] = useState(false);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const searchYouTube = useCallback(async (query: string) => {
    if (!query) {
      setYoutubeSearchResults([]);
      setShowYoutubeResults(false);
      return;
    }
    setYoutubeSearchLoading(true);
    setError('');
    try {
      const response = await fetch('/api/youtube-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (data.error) {
        setError(t('add_post.error.youtube_api_error', { message: data.error }));
        setYoutubeSearchResults([]);
        setShowYoutubeResults(false);
      } else {
        setYoutubeSearchResults(data.items || []);
        setShowYoutubeResults(true);
      }
    } catch (err) {
      console.error('YouTube Search Error:', err);
      setError(t('add_post.error.youtube_search_failed'));
      setYoutubeSearchResults([]);
      setShowYoutubeResults(false);
    }
    setYoutubeSearchLoading(false);
  }, [t]);


  useEffect(() => {
    const handler = setTimeout(() => {
      if (songInputMode === 'search' && contentUrl === '') {
        searchYouTube(youtubeSearchQuery);
      }
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [youtubeSearchQuery, songInputMode, contentUrl, searchYouTube]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.size > 2 * 1024 * 1024) {
        setError(t('add_post.error.file_too_large'));
        setFile(null);
        e.target.value = '';
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

    
    
    
    try {
      
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
      
      console.error('Moderation error:', modError);
      
    }

    
    
    

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
              <button type="button" onClick={() => setSongInputMode('search')} className={`px-3 py-1 text-sm rounded-md ${songInputMode === 'search' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{t('add_post.song_input_mode.search')}</button>
              <button type="button" onClick={() => setSongInputMode('url')} className={`px-3 py-1 text-sm rounded-md ${songInputMode === 'url' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{t('add_post.song_input_mode.url')}</button>
            </div>
            {songInputMode === 'url' ? (
              <div className="space-y-2">
                <input type="url" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} className={inputClass} placeholder={t('add_post.placeholder.youtube_url')} required />
                {contentUrl && contentUrl.includes('youtube.com') && (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground mb-2">{t('add_post.youtube_search.video_preview')}</p>
                    <div className="rounded-lg overflow-hidden border border-border">
                      <iframe
                        width="100%"
                        height="200"
                        src={`https://www.youtube.com/embed/${contentUrl.split('v=')[1]?.split('&')[0]}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={youtubeSearchQuery}
                  onChange={(e) => {
                    setYoutubeSearchQuery(e.target.value);
                    setContentUrl(''); // Clear selection to allow new search
                    setShowYoutubeResults(true);
                  }}
                  className={inputClass}
                  placeholder={t('add_post.placeholder.youtube_search')}
                />
                {youtubeSearchLoading && <p className="text-sm text-muted-foreground">{t('add_post.youtube_search.searching')}</p>}
                {contentUrl && !showYoutubeResults && (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground mb-2">{t('add_post.youtube_search.selected_video')}</p>
                    <div className="rounded-lg overflow-hidden border border-border">
                      <iframe
                        width="100%"
                        height="200"
                        src={`https://www.youtube.com/embed/${contentUrl.split('v=')[1]?.split('&')[0]}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
                {showYoutubeResults && (
                  <div className="max-h-60 overflow-y-auto border border-border rounded-md">
                    {youtubeSearchResults.length > 0 ? (
                      youtubeSearchResults.map((video) => (
                        <div
                          key={video.id.videoId}
                          className="flex items-center p-2 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted"
                          onClick={() => {
                            setContentUrl(`https://www.youtube.com/watch?v=${video.id.videoId}`);
                            setYoutubeSearchQuery(video.snippet.title);
                            setYoutubeSearchResults([]);
                            setShowYoutubeResults(false);
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
                )}
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
      case 'refuel': return <p className="text-center text-lg text-foreground pt-8">{t('add_post.refuel_message')}</p>;
      default: return null;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl rounded-xl bg-background p-6 sm:p-8 shadow-lg"
    >
      <h1 className="mb-2 text-center text-3xl font-bold text-foreground">
        {t('add_post.title')}
      </h1>
      <p className="mb-6 text-center text-lg text-muted-foreground">
        {t('add_post.subtitle', { lighterName })}
      </p>

      {}
      <div className="mb-8">
        <p className="text-center text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">{t('add_post.select_post_type')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-2 relative">
            <PostTypeButton
              selected={postType === 'text'}
              onClick={() => setPostType('text')}
              icon="📝"
              label={t('add_post.post_type.text')}
              subtitle={t('add_post.subtitle.text')}
              colorClass="border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30"
            />
            <PostTypeButton
              selected={postType === 'song'}
              onClick={() => setPostType('song')}
              icon="🎵"
              label={t('add_post.post_type.song')}
              subtitle={t('add_post.subtitle.song')}
              colorClass="border-green-500 text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
            />
            <PostTypeButton
              selected={postType === 'image'}
              onClick={() => setPostType('image')}
              icon="📸"
              label={t('add_post.post_type.image')}
              subtitle={t('add_post.subtitle.image')}
              colorClass="border-red-500 text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
            />
            <PostTypeButton
              selected={postType === 'location'}
              onClick={() => setPostType('location')}
              icon="📍"
              label={t('add_post.post_type.location')}
              subtitle={t('add_post.subtitle.location')}
              colorClass="border-purple-500 text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30"
            />
            <PostTypeButton
              selected={postType === 'refuel'}
              onClick={() => setPostType('refuel')}
              icon="🔥"
              label={t('add_post.post_type.refuel')}
              subtitle={t('add_post.subtitle.refuel')}
              colorClass="border-orange-500 text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30"
            />
          </div>
        </div>

      {}
      <div className="space-y-4 min-h-[300px]">
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
        {}
        <div className="space-y-3 pt-2">
          {postType === 'location' && (<Checkbox id="isFindLocation" label={t('add_post.checkbox.is_find_location')} checked={isFindLocation} onChange={setIsFindLocation} />)}
          {postType !== 'location' && postType !== 'refuel' && (<Checkbox id="isCreation" label={t('add_post.checkbox.is_creation')} checked={isCreation} onChange={setIsCreation} />)}
          <Checkbox id="isAnonymous" label={t('add_post.checkbox.is_anonymous')} checked={isAnonymous} onChange={setIsAnonymous} />
          <Checkbox id="isPublic" label={t('add_post.checkbox.is_public')} checked={isPublic} onChange={setIsPublic} />
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
            {t('add_post.moderation.content_review')}
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
              {t('add_post.moderation.tip')}
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
            <Image src="/loading.gif" alt={t('add_post.button.loading_alt')} width={24} height={24} unoptimized={true} className="mr-2" />
            {uploading ? t('add_post.button.uploading') : t('add_post.button.posting')}
          </>
        ) : isModerating ? (
          <>
            <Image src="/loading.gif" alt={t('add_post.button.checking_alt')} width={24} height={24} unoptimized={true} className="mr-2" />
            {t('add_post.button.checking_content')}
          </>
        ) : (
          t('add_post.button.add_to_story')
        )}
      </button>
    </form>
  );
}

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