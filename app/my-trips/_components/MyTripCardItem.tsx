"use client"
import React, { useEffect, useState } from 'react'
import { Trip } from '../page'
import { ArrowRight } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

type Props = {
    trip: Trip
}

function MyTripCardItem({ trip }: Props) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      if (!trip?.tripDetail?.destination) {
        console.warn('No destination found for trip');
        setImageUrl('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop');
        setLoading(false);
        return;
      }

      const destination = trip.tripDetail.destination;
      console.log(`🖼️ Fetching image for: ${destination}`);
      
      try {
        const response = await axios.get('/api/fetch-image', {
          params: {
            location: destination,
            type: 'place',
          },
          timeout: 10000,
        });

        if (response.data?.imageUrl) {
          setImageUrl(response.data.imageUrl);
          console.log(`✅ Trip card image fetched for ${destination}`);
        } else {
          // Use fallback if API returns no image
          setImageUrl('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop');
        }
      } catch (error) {
        console.error('Error fetching trip image:', error);
        // Use fallback on error
        setImageUrl('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop');
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [trip?.tripDetail?.destination]);

  return (
    <Link href={`/trip/${trip._id}`}>
      <div className='p-5 shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform duration-200'>
        {loading ? (
          <div className='w-full h-48 bg-gray-200 rounded-lg animate-pulse' />
        ) : (
          <div className='w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4'>
            <img 
              src={imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop'} 
              alt={trip.tripDetail?.destination || 'Trip'}
              className='w-full h-full object-cover'
              onError={(e: any) => {
                console.warn('Image failed to load, using fallback');
                e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop';
              }}
            />
          </div>
        )}

        <h2 className='flex gap-2 font-semibold text-xl items-center'>
          <span>{trip?.tripDetail?.destination}</span>
          <ArrowRight className='w-5 h-5 shrink-0' />
          <span>{trip?.tripDetail?.origin}</span>
        </h2>

        <h3 className='text-sm text-gray-600 mt-2'>
          {trip?.tripDetail?.duration} • {trip?.tripDetail?.budget} Budget
        </h3>

        <p className='text-xs text-gray-500 mt-2'>
          {trip?.tripDetail?.group_size && `${trip.tripDetail.group_size} traveler(s)`}
        </p>
      </div>
    </Link>
  )
}

export default MyTripCardItem