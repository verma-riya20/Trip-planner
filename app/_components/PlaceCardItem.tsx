"use client"
import { Button } from '@/components/ui/button'
import { Clock, ExternalLink, Ticket, Loader } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Activity } from './ChatBox'
type Props={
    activity:Activity
}
function PlaceCardItem({activity}:Props) {
  const fallbackImage = 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop&crop=center';
  const [imageSrc, setImageSrc] = useState<string>(fallbackImage);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchRealImage = async () => {
      if (!activity?.place_name) {
        return;
      }
      
      setLoading(true);
      try {
        // Get previously used images for this place from sessionStorage
        const usedImagesKey = `used_images_place_${activity.place_name}`;
        const storedUsedImages = sessionStorage.getItem(usedImagesKey);
        const usedImages = storedUsedImages ? storedUsedImages.split('|').filter(u => u) : [];

        console.log(`🖼️ Fetching image for: ${activity.place_name}, used: ${usedImages.length}`);

        const response = await axios.get('/api/fetch-image', {
          params: {
            location: activity.place_name,
            type: 'place',
            usedImages: usedImages.join('|'), // Pass used images for uniqueness
          },
        });

        if (response.data?.imageUrl) {
          const newImageUrl = response.data.imageUrl;
          setImageSrc(newImageUrl);
          
          // Store this image as used
          const updatedUsedImages = [...usedImages, newImageUrl];
          sessionStorage.setItem(usedImagesKey, updatedUsedImages.join('|'));

          console.log(`✅ Got unique image: ${newImageUrl}`);
        } else {
          console.warn('No image in response');
          setImageSrc(fallbackImage);
        }
      } catch (error) {
        console.error('Error fetching image:', error);
        setImageSrc(fallbackImage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRealImage();
  }, [activity?.place_name]);
  
  return (
     <div>
           <div className="relative w-full aspect-4/3 overflow-hidden rounded-xl shadow mb-2 bg-gray-100">
             {loading && (
               <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                 <Loader className="animate-spin h-6 w-6 text-gray-400" />
               </div>
             )}
             <img
               src={imageSrc}
               alt={activity?.place_name || 'place-image'}
               width={400}
               height={300}
               className="w-full h-full object-cover"
               onError={(e) => {
                 const target = e.target as HTMLImageElement;
                 if (target.src !== fallbackImage) {
                   target.src = fallbackImage;
                 }
               }}
             />
           </div>

            <h2 className='font font-semibold text-lg'>{activity?.place_name}</h2>
            <p className='text-gray-500 line-clamp-2'>{activity?.place_details}</p>

            <h2 className='flex gap-2 text-blue-500 line-clamp-1'>
              <Ticket /> {activity?.ticket_pricing}
            </h2>

            <p className='text-orange-300 flex gap-2 line-clamp-1'>
              <Clock /> {activity?.best_time_to_visit}
            </p>
            <Button
              asChild
              size="sm"
              variant="outline"
              disabled={false}
              className="pointer-events-auto"
            >
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity?.place_name ?? '')}`}
              >
                View <ExternalLink className="w-4 h-4" />
              </Link>
            </Button>
          </div>
  )
}

export default PlaceCardItem