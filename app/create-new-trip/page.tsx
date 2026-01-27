import React, { Suspense } from 'react'
import ChatBox from '../_components/ChatBox'
import { CreateTripDetail } from '@/convex/tripDetail'
import Itinerary from '../_components/Itinerary'

function CreateNewTrip() {
   return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 min-h-screen p-5 overflow-y-auto">
      {/* Chat Section */}
      <div className="border rounded-xl p-4 overflow-auto bg-white shadow-sm">
        <Suspense fallback={<div>Loading...</div>}>
          <ChatBox />
        </Suspense>
      </div>

      {/* Map Section */}
      <div className="col-span-2">
        <Suspense fallback={<div>Loading...</div>}>
          <Itinerary/>
        </Suspense>
      </div>
    </div>
  )
}

export default CreateNewTrip