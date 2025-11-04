import { useState, useCallback } from 'react';

interface ModerationResult {
  flagged: boolean;
  reason?: string;
  severityLevel?: 'low' | 'medium' | 'high';
}

interface UseModerationHook {
  moderateText: (text: string) => Promise<ModerationResult>;
  moderateImage: (imageUrl: string | string) => Promise<ModerationResult>;
  isLoading: boolean;
  error: string | null;
}

export function useContentModeration(userId: string): UseModerationHook {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moderateText = useCallback(
    async (text: string): Promise<ModerationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!text || text.trim().length === 0) {
          return { flagged: false };
        }

        const response = await fetch('/api/moderate-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text.trim(),
            userId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to moderate text');
        }

        const result = await response.json();
        return {
          flagged: result.flagged,
          reason: result.reason,
          severityLevel: result.severityLevel,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return { flagged: false }; 
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const moderateImage = useCallback(
    async (imageSource: string): Promise<ModerationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!imageSource) {
          return { flagged: false };
        }

        
        const isBase64 = imageSource.startsWith('data:');
        const isUrl = imageSource.startsWith('http');

        if (!isBase64 && !isUrl) {
          console.warn('Image source is neither valid URL nor base64');
          return { flagged: false };
        }

        const payload: Record<string, string> = { userId };

        if (isBase64) {
          
          const base64Data = imageSource.split(',')[1] || imageSource;
          payload.imageBase64 = base64Data;
        } else {
          payload.imageUrl = imageSource;
        }

        const response = await fetch('/api/moderate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to moderate image');
        }

        const result = await response.json();
        return {
          flagged: result.flagged,
          reason: result.reason,
          severityLevel: result.severityLevel,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return { flagged: false }; 
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  return {
    moderateText,
    moderateImage,
    isLoading,
    error,
  };
}
