'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Assuming lib is at root
import type { User } from '@supabase/supabase-js';

type PostType = 'text' | 'song' | 'image' | 'location' | 'refuel';

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
  const [postType, setPostType] = useState<PostType>('text');
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [locationName, setLocationName] = useState('');
  const [isFindLocation, setIsFindLocation] = useState(false);
  const [isCreation, setIsCreation] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error: rpcError } = await supabase.rpc('create_new_post', {
        p_lighter_id: lighterId,
        p_post_type: postType,
        p_title: title || null,
        p_content_text: postType === 'text' ? contentText : null,
        p_content_url: (postType === 'song' || postType === 'image') ? contentUrl : null,
        p_location_name: postType === 'location' ? locationName : null,
        p_location_lat: null,
        p_location_lng: null,
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
      case 'song': return <input type="url" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} className={inputClass} placeholder="YouTube Song URL" required />;
      case 'image': return <input type="url" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} className={inputClass} placeholder="Image URL (e.g., Imgur)" required />;
      case 'location': return <input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)} className={inputClass} placeholder="Name of a place (e.g., 'Cafe Central')" required />;
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

      {error && <p className="my-4 text-center text-sm text-error">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary mt-6 w-full text-lg" // Applied btn-primary
      >
        {loading ? 'Posting...' : 'Add to Story'}
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