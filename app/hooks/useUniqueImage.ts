import { useState, useEffect } from 'react';

const globalImageTracker = new Map<string, string>();
const requestMap = new Map<string, Promise<string>>();

export function useUniqueImage(location: string, index: number) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>('');

  useEffect(() => {
    if (!location) {
      setLoading(false);
      return;
    }

    const fetchImage = async () => {
      try {
        // Create unique key with index to prevent duplicates
        const uniqueKey = `${location}_${index}`;
        
        // Check if we already fetched this exact combination
        if (globalImageTracker.has(uniqueKey)) {
          console.log(`✅ Using cached image for ${uniqueKey}`);
          setImageUrl(globalImageTracker.get(uniqueKey)!);
          setLoading(false);
          return;
        }

        // Check if request is already in flight
        if (requestMap.has(uniqueKey)) {
          console.log(`⏳ Waiting for in-flight request: ${uniqueKey}`);
          const url = await requestMap.get(uniqueKey)!;
          setImageUrl(url);
          setLoading(false);
          return;
        }

        // Create the request promise
        const requestPromise = (async () => {
          // Add random query param to force unique results even for same location
          const randomId = Math.random().toString(36).substring(7);
          const randomPage = Math.floor(Math.random() * 10) + 1;
          
          const response = await fetch(
            `/api/fetch-image?location=${encodeURIComponent(location)}&index=${index}&random=${randomId}&page=${randomPage}`
          );
          const data = await response.json();

          if (data.imageUrl) {
            globalImageTracker.set(uniqueKey, data.imageUrl);
            console.log(`🎯 Fetched new image for ${uniqueKey} from ${data.source}`);
            return data.imageUrl;
          }

          throw new Error('No image URL in response');
        })();

        requestMap.set(uniqueKey, requestPromise);
        const url = await requestPromise;
        
        setImageUrl(url);
        setLoading(false);
      } catch (error) {
        console.error(`❌ Failed to fetch image for ${location}:`, error);
        setLoading(false);
      }
    };

    fetchImage();
  }, [location, index]);

  return { imageUrl, loading, source };
}
