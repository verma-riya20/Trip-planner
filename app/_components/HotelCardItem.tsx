"use client"
import React, { useState, useEffect } from 'react'
import { Hotel } from './ChatBox'
import { Button } from '@/components/ui/button'
import { Star, Wallet, Loader } from 'lucide-react'
import axios from 'axios'
import dynamic from 'next/dynamic'
import { v4 as uuidv4 } from 'uuid';

const MapView = dynamic(() => import('./MapView'), { ssr: false })
type Props={
    hotel:Hotel
}

// Simple in-memory cache for lookups during this session
const placeCache = new Map<string, any>();

function HotelCardItem({hotel}:Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(hotel?.hotel_image_url ?? null);

  const [coords, setCoords] = useState<{lat:number,lng:number} | null>(null);
  const [instanceId] = useState(() => uuidv4()); // Unique ID for this component instance

  const openMapFor = (lat:number, lng:number) => {
    // Open in OpenStreetMap so we stay within free/open ecosystem
    const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // Auto-fetch real image on mount
  useEffect(() => {
    const fetchRealImage = async () => {
      const query = ((hotel?.hotel_name ?? "") + " " + (hotel?.hotel_address ?? "")).trim();
      if (!query) return;

      // Check cache first
      if (placeCache.has(query)) {
        const cached = placeCache.get(query);
        if (cached.image) setImageSrc(cached.image);
        if (cached.lat && cached.lng) setCoords({lat: cached.lat, lng: cached.lng});
        return;
      }

      
      // Add small delay to prevent too many simultaneous requests
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

      setLoading(true);
      try {
        console.log('🏨 Fetching real hotel image for:', query);
        const res = await axios.post('/api/place-lookup', 
          { placeName: query },
          { 
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
          }
        );
        const data = res?.data;
        
        if (data?.error) {
          console.warn('⚠️ API error:', data.error);
          // Use AI-generated image if available
          if (hotel?.hotel_image_url) {
            setImageSrc(hotel.hotel_image_url);
          } else {
            setImageSrc('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop&crop=center');
          }
          return;
        }

        const lat = data?.lat;
        const lng = data?.lng;

        if (data?.image?.dataUri) {
          console.log('✅ Got hotel dataUri image');
          setImageSrc(data.image.dataUri);
          placeCache.set(query, { lat, lng, image: data.image.dataUri });
        } else if (data?.imageUrl) {
          console.log('✅ Got hotel imageUrl');
          setImageSrc(data.imageUrl);
          placeCache.set(query, { lat, lng, image: data.imageUrl });
        } else {
          // Use AI-generated image if available
          if (hotel?.hotel_image_url) {
            setImageSrc(hotel.hotel_image_url);
          } else {
            setImageSrc('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop&crop=center');
          }
          placeCache.set(query, { lat, lng });
        }
        
        if (lat && lng) {
          setCoords({lat, lng});
        }
      } catch (err: any) {
        console.warn('❌ Hotel image fetch failed:', err.message);
        // Use AI-generated image if available
        if (hotel?.hotel_image_url) {
          setImageSrc(hotel.hotel_image_url);
        } else {
          setImageSrc('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop&crop=center');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRealImage();
  }, [hotel?.hotel_name, hotel?.hotel_address]);

  const handleViewClick = () => {
    // If we already have coordinates, open the map
    if (coords) {
      openMapFor(coords.lat, coords.lng);
    } else {
      setError('Location not available yet');
    }
  }

  return (
    <div  className='flex flex-col gap-1 w-full max-w-full overflow-hidden'>
                 <img 
                   src={imageSrc ?? 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop&crop=center'} 
                   alt={hotel?.hotel_name || 'hotel-image'} 
                   width={400} 
                   height={200} 
                   className='rounded-xl shadow object-cover mb-2'
                   onError={(e) => {
                     const target = e.target as HTMLImageElement;
                     target.src = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop&crop=center';
                   }}
                 />
                 {coords && (
                   <div className='mb-2'>
                     <MapView lat={coords.lat} lng={coords.lng} zoom={15} height={'140px'} markerLabel={hotel?.hotel_name} />
                     <p className='text-xs text-gray-400 mt-1'>Map: © OpenStreetMap contributors</p>
                   </div>
                 )}
                 <h2 className='font-semibold text-lg'>{hotel?.hotel_name}</h2>
                 <h2 className='text-gray-500'>{hotel.hotel_address}</h2>
                 <div><p className='flex gap-2 text-green-600'><Wallet/>{hotel.price_per_night}</p>
                 <p className='text-yellow-500 flex gap-2'><Star/>{hotel.rating}</p></div>
               <p className='line-clamp-2 text-gray-500'></p>
               <div className='mt-1'>
                 <Button onClick={handleViewClick} disabled={loading} variant={'outline'}>
                   {loading ? <Loader className='animate-spin h-4 w-4' /> : 'View'}
                 </Button>
               </div>
               {error && <p className='text-sm text-red-500 mt-1'>{error}</p>}
               </div>
  )
}

export default HotelCardItem