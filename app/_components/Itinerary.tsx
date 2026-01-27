"use client";
import { Timeline } from '@/components/ui/timeline';
import React, { useEffect } from 'react'
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Clock, ExternalLink, Star, Ticket, Timer, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { title } from 'process';
import { small } from 'motion/react-client';
import HotelCardItem from './HotelCardItem';
import { TripInfo } from '@/app/_components/ChatBox';
import PlaceCardItem from './PlaceCardItem';
import { useTripDetail } from '../provider';

const TRIP_DATA: TripInfo = {
  destination: "Goa, India",
  duration: "2 Days",
  origin: "Mumbai, India",
  budget: "Low",
  group_size: "Solo",
  hotels: [
    {
      hotel_name: "The Bucket List Hostel, Goa",
      hotel_address: "House No. 1290/1, Soranto, Anjuna, Goa 403509",
      price_per_night: "INR 500 - 800",
      hotel_image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&crop=center",
      geo_coordinates: {
        latitude: 15.5898,
        longitude: 73.7431
      },
      rating: 4.5,
      description: "A popular and highly-rated hostel in Anjuna, offering dormitory and private rooms with a vibrant social atmosphere."
    },
    {
      hotel_name: "Goa Happy Homes Hostel",
      hotel_address: "House No. 70/1, Porbavaddo, Calangute, Goa 403516",
      price_per_night: "INR 600 - 900",
      hotel_image_url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop&crop=center",
      geo_coordinates: {
        latitude: 15.5445,
        longitude: 73.7622
      },
      rating: 4.3,
      description: "A cozy and affordable stay located near Calangute Beach, perfect for solo travelers and backpackers."
    },
    {
      hotel_name: "Pappi Chulo Hostel",
      hotel_address: "486, Vagator Beach Road, Vagator, Goa 403509",
      price_per_night: "INR 400 - 700",
      hotel_image_url: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&crop=center",
      geo_coordinates: {
        latitude: 15.5891,
        longitude: 73.7362
      },
      rating: 4.6,
      description: "A funky and artistic hostel near Vagator Beach with vibrant interiors and social vibes."
    },
    {
      hotel_name: "The Nest Hostel",
      hotel_address: "Opp. Arambol Beach Parking, Arambol, Goa 403524",
      price_per_night: "INR 350 - 650",
      hotel_image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop&crop=center",
      geo_coordinates: {
        latitude: 15.6851,
        longitude: 73.7045
      },
      rating: 4.4,
      description: "A beachfront hostel known for its peaceful atmosphere and proximity to Arambol Beach."
    },
    {
      hotel_name: "The Funky Monkey Hostel",
      hotel_address: "Pequeno Peddem, Anjuna, Goa 403509",
      price_per_night: "INR 500 - 850",
      hotel_image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&crop=center",
      geo_coordinates: {
        latitude: 15.5812,
        longitude: 73.7478
      },
      rating: 4.5,
      description: "Fun-filled hostel offering yoga sessions, bar nights, and a laid-back community environment."
    },
    {
      hotel_name: "Moustache Goa Luxuria",
      hotel_address: "Ashwem Beach Road, Mandrem, Goa 403527",
      price_per_night: "INR 800 - 1200",
      hotel_image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop&crop=center",
      geo_coordinates: {
        latitude: 15.6598,
        longitude: 73.7162
      },
      rating: 4.7,
      description: "Luxurious beachside hostel with a pool, co-working space, and beautiful sunset views."
    },
    {
      hotel_name: "Zostel Goa, Calangute",
      hotel_address: "House No. 1785, Calangute, Goa 403516",
      price_per_night: "INR 600 - 1000",
      hotel_image_url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop&crop=center",
      geo_coordinates: {
        latitude: 15.5456,
        longitude: 73.7544
      },
      rating: 4.6,
      description: "One of the most popular hostels for young travelers, with fun activities and events."
    },
    {
      hotel_name: "Dreams Hostel",
      hotel_address: "Near Vagator Beach, Vagator, Goa 403509",
      price_per_night: "INR 550 - 900",
      hotel_image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
      geo_coordinates: {
        latitude: 15.5882,
        longitude: 73.7387
      },
      rating: 4.8,
      description: "Eco-friendly hostel known for its relaxing vibe and bohemian charm near the beach."
    },
    {
      hotel_name: "The Lost Hostel, Goa",
      hotel_address: "Ozran Beach Road, Vagator, Goa 403509",
      price_per_night: "INR 450 - 800",
      hotel_image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
      geo_coordinates: {
        latitude: 15.5923,
        longitude: 73.7395
      },
      rating: 4.5,
      description: "A friendly and creative hostel offering cultural exchange and fun group activities."
    },
    {
      hotel_name: "Happy Panda Hostel",
      hotel_address: "Arambol Main Road, Arambol, Goa 403524",
      price_per_night: "INR 400 - 750",
      hotel_image_url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop&crop=center",
      geo_coordinates: {
        latitude: 15.6812,
        longitude: 73.7031
      },
      rating: 4.4,
      description: "A cheerful hostel close to Arambol Beach with a great mix of comfort, art, and travel community."
    }
  ],
  itinerary: [
    {
      day: 1,
      day_plan: "Explore North Goa beaches and nightlife",
      best_time_to_visit_day: "Early morning to late night",
      activities: [
        {
          place_name: "Anjuna Beach",
          place_details: "Famous beach known for its vibrant flea market and stunning sunsets",
          place_image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
          geo_coordinates: {
            latitude: 15.5749,
            longitude: 73.7442
          },
          place_address: "Anjuna Beach, Goa 403509",
          ticket_pricing: "Free",
          time_travel_each_location: "3-4 hours",
          best_time_to_visit: "4:00 PM - 7:00 PM"
        },
        {
          place_name: "Chapora Fort",
          place_details: "Historic Portuguese fort with panoramic views of the coastline",
          place_image_url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop",
          geo_coordinates: {
            latitude: 15.6024,
            longitude: 73.7364
          },
          place_address: "Chapora Fort, Goa 403509",
          ticket_pricing: "Free",
          time_travel_each_location: "1-2 hours",
          best_time_to_visit: "8:00 AM - 10:00 AM"
        }
      ]
    },
    {
      day: 2,
      day_plan: "South Goa beaches and cultural sites",
      best_time_to_visit_day: "Morning to evening", 
      activities: [
        {
          place_name: "Colva Beach",
          place_details: "Peaceful white sand beach perfect for relaxation",
          place_image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
          geo_coordinates: {
            latitude: 15.2799,
            longitude: 73.9069
          },
          place_address: "Colva Beach, Goa 403708",
          ticket_pricing: "Free",
          time_travel_each_location: "2-3 hours",
          best_time_to_visit: "9:00 AM - 12:00 PM"
        }
      ]
    }
  ],
};

function Itinerary() {
  //@ts-ignore
  const {TripDetailInfo,setTripDetailInfo}=useTripDetail();
  const [tripData, setTripData] = React.useState<TripInfo | null>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
      console.log('🎯 Itinerary: TripDetailInfo changed', TripDetailInfo)
    
      if (TripDetailInfo) {
        console.log('✅ Setting tripData from context:', TripDetailInfo)
        console.log('🏨 Hotels count:', TripDetailInfo.hotels?.length || 0)
        console.log('📅 Itinerary count:', TripDetailInfo.itinerary?.length || 0)
        console.log('📋 Itinerary data:', TripDetailInfo.itinerary)
        setTripData(TripDetailInfo)
      }
    }, [TripDetailInfo])

  if (!tripData) {
    return (
      <div className='p-3 rounded-2xl overflow-hidden relative'>
       <Image className='rounded-2xl border-0  w-full h-full object-cover'
            src='/newtravel.jpg' 
            alt="travel" 
            width={800}
            height={800}
             />
             <h2 className='flex gap-2 items-center text-3xl text-white absolute left-20 bottom-6 z-10'>
              <ArrowLeft /> Getting to know you to build perfect trip here...
            </h2>
      </div>
    )
  }

  // Debug log for timeline data creation
  console.log('🎯 Creating timeline data with:', {
    tripData: !!tripData,
    hotelsCount: tripData?.hotels?.length || 0,
    itineraryCount: tripData?.itinerary?.length || 0,
    itineraryStructure: tripData?.itinerary
  });

  const data =tripData? [
    {
      title: "Recommended Hotels",
      content: (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
         {(tripData?.hotels || []).map((hotel,index)=>(
           <HotelCardItem key={hotel.hotel_name ?? index} hotel={hotel}/>
         ))}
        </div>
      ),
    },
   ...(tripData?.itinerary ?? []).map((dayData) => ({
  title: `Day ${dayData?.day}`,
  content: (
    <div>
      <p>Best Time: {dayData?.best_time_to_visit_day}</p>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {(dayData?.activities || []).map((activity, index) => (
         <PlaceCardItem key={activity.place_name ?? index} activity={activity}/>
        ))}
      </div>
    </div>
  ),
}))

  ]: [];
  return (
   <div className="relative w-full overflow-x-hidden min-h-[85vh]">
      {tripData ? (
        <Timeline data={data} tripData={tripData}/>
      ) : (
        <div className="relative h-full">
          <h2 className='flex gap-2 items-center text-3xl text-white absolute left-20 bottom-8 z-10'>
            <ArrowLeft /> Getting to know you to build perfect trip here...
          </h2>
          <Image 
            src={'/newtravel.jpg'} 
            alt="travel" 
            width={800} 
            height={800} 
            className='w-full h-full object-cover rounded-3xl'
          />  
        </div>
      )}
    </div>
  )
}

export default Itinerary