"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useConvex } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { TripInfo } from '@/app/_components/ChatBox'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import HotelCardItem from '@/app/_components/HotelCardItem'
import PlaceCardItem from '@/app/_components/PlaceCardItem'

function TripDetails() {
  const params = useParams()
  const tripId = params.id as string
  const convex = useConvex()
  const [tripData, setTripData] = useState<TripInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Clear image cache when entering trip details page
    console.log('🧹 Clearing all image caches for fresh images...');
    sessionStorage.clear();
    
    const fetchTripDetails = async () => {
      try {
        if (!tripId) {
          setError('Trip ID not found')
          setLoading(false)
          return
        }

        console.log(`🔍 Fetching trip details for ID: ${tripId}`)

        const trip = await convex.query(api.tripDetail.GetTripById, {
          tripId: tripId,
        })

        if (!trip) {
          setError('Trip not found')
          setLoading(false)
          return
        }

        console.log('✅ Trip details fetched:', trip)
        setTripData(trip.tripDetail)
      } catch (err) {
        console.error('❌ Error fetching trip:', err)
        setError('Failed to load trip details')
      } finally {
        setLoading(false)
      }
    }

    fetchTripDetails()
  }, [tripId, convex])

  if (loading) {
    return (
      <div className='px-10 py-10 md:px-24 lg:px-48'>
        <p className='text-gray-500'>Loading trip details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='px-10 py-10 md:px-24 lg:px-48'>
        <div className='text-red-500 mb-4'>{error}</div>
        <Link href='/my-trips'>
          <Button variant='outline'>
            <ArrowLeft className='mr-2 w-4 h-4' />
            Back to My Trips
          </Button>
        </Link>
      </div>
    )
  }

  if (!tripData) {
    return (
      <div className='px-10 py-10 md:px-24 lg:px-48'>
        <p className='text-gray-500'>No trip data available</p>
        <Link href='/my-trips'>
          <Button variant='outline'>
            <ArrowLeft className='mr-2 w-4 h-4' />
            Back to My Trips
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className='px-10 py-10 md:px-24 lg:px-48'>
      <Link href='/my-trips'>
        <Button variant='outline' className='mb-6'>
          <ArrowLeft className='mr-2 w-4 h-4' />
          Back to My Trips
        </Button>
      </Link>

      {/* Trip Header */}
      <div className='mb-8'>
        <h1 className='text-4xl font-bold mb-2'>
          {tripData?.destination}
        </h1>
        <p className='text-xl text-gray-600'>
          {tripData?.origin} → {tripData?.destination}
        </p>
        <div className='flex gap-4 mt-4 text-sm flex-wrap'>
          <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full'>
            {tripData?.duration}
          </span>
          <span className='bg-green-100 text-green-800 px-3 py-1 rounded-full'>
            {tripData?.budget} Budget
          </span>
          <span className='bg-purple-100 text-purple-800 px-3 py-1 rounded-full'>
            {tripData?.group_size}
          </span>
        </div>
      </div>

      {/* Hotels Section - Fetch images dynamically */}
      {tripData?.hotels && tripData.hotels.length > 0 && (
        <div className='mb-10'>
          <h2 className='text-3xl font-bold mb-6'>🏨 Hotels</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {tripData.hotels.map((hotel: any, index: number) => (
              <HotelCardItem key={index} hotel={hotel} />
            ))}
          </div>
        </div>
      )}

      {/* Itinerary Section - Fetch images dynamically */}
      {tripData?.itinerary && tripData.itinerary.length > 0 && (
        <div className='mb-10'>
          <h2 className='text-3xl font-bold mb-6'>📅 Itinerary</h2>
          <div className='space-y-8'>
            {tripData.itinerary.map((day: any, dayIndex: number) => (
              <div key={dayIndex} className='border-l-4 border-blue-500 pl-6 pb-6'>
                <h3 className='text-2xl font-bold mb-2'>
                  Day {day.day || dayIndex + 1}
                </h3>
                <p className='text-gray-700 mb-4 italic'>{day.day_plan}</p>

                {day.activities && day.activities.length > 0 && (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {day.activities.map((activity: any, actIndex: number) => (
                      <div key={actIndex} className='rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow'>
                        {/* Image Section - Use PlaceCardItem to fetch image */}
                        <div className='relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden'>
                          <PlaceCardItem activity={activity} />
                        </div>

                        {/* Activity Details */}
                        <div className='p-4'>
                          <h4 className='font-bold text-lg mb-2'>{activity?.place_name}</h4>
                          <p className='text-sm text-gray-600 mb-3'>{activity?.place_details}</p>
                          <p className='text-xs text-gray-500 mb-2'>📍 {activity?.place_address}</p>

                          <div className='space-y-2 text-sm border-t pt-3'>
                            {activity?.ticket_pricing && (
                              <p className='flex justify-between'>
                                <span className='font-semibold'>🎫 Ticket:</span>
                                <span>{activity.ticket_pricing}</span>
                              </p>
                            )}
                            {activity?.time_travel_each_loaction && (
                              <p className='flex justify-between'>
                                <span className='font-semibold'>⏱️ Duration:</span>
                                <span>{activity.time_travel_each_loaction}</span>
                              </p>
                            )}
                            {activity?.best_time_to_visit && (
                              <p className='flex justify-between'>
                                <span className='font-semibold'>🕐 Best Time:</span>
                                <span>{activity.best_time_to_visit}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TripDetails
