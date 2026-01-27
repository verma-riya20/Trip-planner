"use client"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useUserDetail } from '../provider'
import { useConvex } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { TripInfo } from '../_components/ChatBox'
import MyTripCardItem from './_components/MyTripCardItem'

export type Trip = {
   tripId: any,
   tripDetail: TripInfo,
   _id: string
}

function MyTrips() {
    const [mytrips, setmytrips] = useState<Trip[]>([])
    const [loading, setLoading] = useState(true)
    const {UserDetail} = useUserDetail() || {UserDetail: null};
    const convex = useConvex();

    useEffect(() => {
      if (UserDetail?._id) {
        GetUserTrip();
      } else {
        console.log("⏳ Waiting for UserDetail...");
        setLoading(false);
      }
    }, [UserDetail?._id])
    
    const GetUserTrip = async () => {
      if (!UserDetail?._id) {
        console.log("⏳ User not ready, skipping GetUserTrips");
        setLoading(false);
        return;
      }
 
      try {
        console.log("🔍 Fetching trips for user:", UserDetail._id);
        const result = await convex.query(
          api.tripDetail.GetUserTrips,
          { uid: UserDetail._id }
        );

        console.log("📋 User Trips fetched:", result);
        setmytrips(result);
      } catch (error) {
        console.error("❌ Error fetching trips:", error);
        setmytrips([]);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className='px-10 p-10 md:px-24 lg:px-48'>
        <h2 className='text-3xl font-bold'>My Trips</h2>
        
        {loading ? (
          <div className='mt-10'>
            <p className='text-gray-500'>Loading your trips...</p>
          </div>
        ) : mytrips?.length === 0 ? (
          <div className='flex flex-col items-center justify-center mt-20'>
            <h2 className='text-2xl font-semibold mb-4'>You have no trips yet</h2>
            <Link href={'/'}>
              <Button>Create New Trip</Button>
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6'>
            {mytrips.map((trip: any, index) => (
              <MyTripCardItem trip={trip} key={trip._id || index} />
            ))}
          </div>
        )}
      </div>
    )
}

export default MyTrips