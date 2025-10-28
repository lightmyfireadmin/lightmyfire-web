'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

// Define the 5 post types
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
  
  // Form state
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [locationName, setLocationName] = useState('');
  
  // Checkboxes
  const [isFindLocation, setIsFindLocation] = useState(false);
  const [isCreation, setIsCreation] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  // System state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Call our new database function
    const { data, error: rpcError } = await supabase.rpc('create_new_post', {
      p_lighter_id: lighterId,
      p_post_type: postType,
      p_title: title || null,
      p_content_text: postType === 'text' ? contentText : null,
      p_content_url: (postType === 'song' || postType === 'image') ? contentUrl : null,
      p_location_name: postType === 'location' ? locationName : null,
      p_location_lat: null, // We're skipping lat/lng for now
      p_location_lng: null,
      p_is_find_location: isFindLocation,
      p_is_creation: isCreation,
      p_is_anonymous: isAnonymous,
      p_is_public: isPublic,
    });

    if (rpcError) {
      setError(`Error: ${rpcError.message}`);
    } else if (!data.success) {
      // This will catch our 24-hour cooldown message
      setError(data.message);
    } else {
      // Success! Go back to the lighter page
      router.push(`/lighter/${lighterId}`);
      router.refresh(); // Tell Next.js to refetch the data
    }

    setLoading(false);
  };

  // Helper to render the correct inputs
  const renderFormInputs = () => {
    switch (postType) {
      case 'text':
        return (
          <textarea
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            className="w-full h-32 rounded-md border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Your poem, your story, your thoughts..."
            required
          />
        );
      case 'song':
        return (
          <input
            type="url"
            value={contentUrl}
            onChange={(e) => setContentUrl(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            placeholder="YouTube Song URL"
            required
          />
        );
      case 'image':
        return (
          <input
            type="url"
            value={contentUrl}
            onChange={(e) => setContentUrl(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Image URL (e.g., Imgur)"
            required
          />
        );
      case 'location':
        return (
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Name of a place (e.g., 'Cafe Central')"
            required
          />
        );
      case 'refuel':
        return (
          <p className="text-center text-lg text-gray-700">
            You're a hero! By clicking "Post," you'll add a "Refueled"
            entry to this lighter's story.
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-md"
    >
      <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
        Add to the Story
      </h1>
      <p className="mb-6 text-center text-lg text-gray-600">
        You are adding a post to <span className="font-bold">{lighterName}</span>
      </p>

      {/* Post Type Selector Tabs */}
      <div className="mb-6 grid grid-cols-5 gap-1 rounded-lg bg-gray-200 p-1">
        {(['text', 'song', 'image', 'location', 'refuel'] as PostType[]).map(
          (type) => (
            <button
              key={type}
              type="button"
              onClick={() => setPostType(type)}
              className={`rounded-md px-3 py-2 text-sm font-medium capitalize transition ${
                postType === type
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-700 hover:bg-white/50'
              }`}
            >
              {type}
            </button>
          )
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {postType !== 'refuel' && (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Title (Optional)"
          />
        )}

        {renderFormInputs()}

        {/* Checkboxes */}
        <div className="space-y-3 pt-2">
          {postType === 'location' && (
            <Checkbox
              id="isFindLocation"
              label="This is where I found this lighter"
              checked={isFindLocation}
              onChange={setIsFindLocation}
            />
          )}
          {postType !== 'location' && postType !== 'refuel' && (
            <Checkbox
              id="isCreation"
              label="This is something I've made"
              checked={isCreation}
              onChange={setIsCreation}
            />
          )}
          <Checkbox
            id="isAnonymous"
            label="Post anonymously"
            checked={isAnonymous}
            onChange={setIsAnonymous}
          />
          <Checkbox
            id="isPublic"
            label="Allow this post to appear in public feeds (e.g., homepage)"
            checked={isPublic}
            onChange={setIsPublic}
          />
        </div>
      </div>

      {error && <p className="my-4 text-center text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-md bg-blue-600 py-3 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Posting...' : 'Add to Story'}
      </button>
    </form>
  );
}

// Helper component for checkboxes
function Checkbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-700">
        {label}
      </label>
    </div>
  );
}