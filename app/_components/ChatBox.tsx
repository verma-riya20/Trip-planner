"use client"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { Loader, Send } from 'lucide-react'
import React, { useEffect, useCallback, useRef } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EmptyBoxState from './EmptyBoxState'
import GroupSizeUi from './GroupSizeUi'
import BudgetUi from './BudgetUi'
import TripDurationUi from './TripDurationUi'
import FinalUi from './FinalUi'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useTripDetail, useUserDetail } from '../provider'
import { v4 as uuidv4 } from 'uuid';

type Message={
  role:string,
  content:string,
  ui?:string
}
export type TripInfo={
  budget:string,
  destination:string,
  duration:string,
  group_size:string,
  origin:string,
  hotels:Hotel[],
  itinerary:Itinerary[]
}
export type Hotel={
  hotel_name:string;
  hotel_address:string;
  price_per_night:string;
  hotel_image_url:string;
  geo_coordinates:{
    latitude:number;
    longitude:number;
  };
  rating:number;
  description:string;
  
}
export type Activity={
  place_name: string;
place_details: string;
place_image_url: string;
geo_coordinates: {
    latitude: number;
    longitude: number;
};
place_address: string;
ticket_pricing: string;
time_travel_each_loaction:string;
best_time_to_visit:string;

}
type Itinerary={
  day:number;
  day_plan:string;
  best_time_to_visit_day:string;
  activities:Activity[];
}
function ChatBox() {
  const [messages, setmessages] = useState<Message[]>([])
  const [userInput, setuserInput] = useState<string>()
  const [loading, setloading] = useState(false)
  const [isFinal, setisFinal] = useState(false)
  const [tripDetail, settripDetail] = useState<TripInfo>()
  const [tripId, setTripId] = useState<string | null>(null)
  const [pendingSave, setPendingSave] = useState(false)
  const router = useRouter()
  const {TripDetailInfo, setTripDetailInfo} = useTripDetail() || {TripDetailInfo: null, setTripDetailInfo: () => {}}
  const SaveTripDetail = useMutation(api.tripDetail.CreateTripDetail)
  const {UserDetail} = useUserDetail()
  const isFinalRef = useRef(false)

  const onSend = useCallback(async() => {
    if(!userInput?.trim()) return;
    setloading(true)
    setuserInput('');
    const newMsg: Message = {
      role:'user',
      content:userInput ?? ''
    }

    setmessages((prev:Message[]) => [...prev, newMsg])

    try {
      const result = await axios.post("/api/aimodel", {
        messages: [...messages, newMsg],
        isFinal: isFinalRef.current
      });

      console.log("trip", result.data)

      if (!isFinalRef.current && result?.data?.resp) {
        setmessages((prev:Message[]) => [...prev, {
          role:'assistant',
          content: result?.data?.resp,
          ui: result?.data?.ui || "groupSize"
        }])
      }

      if (isFinalRef.current) {
        console.log('🔍 Final AI Response Debug:', {
          fullResponse: result?.data,
          hasTrip_plan: !!result?.data?.trip_plan,
          hasItinerary: !!result?.data?.itinerary,
          hasError: !!result?.data?.error,
          responseKeys: Object.keys(result?.data || {})
        });

        if (result?.data?.error === "AI_PARSE_ERROR" || result?.data?.error === "Invalid JSON response from AI") {
          console.warn('❌ AI returned non-JSON response:', result.data.raw_content || result.data.rawContent);
          setmessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: 'The AI model is having trouble generating the trip plan in the correct format. Please try again.'
            }
          ]);
          setloading(false)
          return;
        }

        let plan = result?.data?.trip_plan ?? 
                   result?.data?.parsed?.trip_plan ?? 
                   result?.data ?? null;
                   
        if (!plan?.hotels && result?.data?.hotels) {
          plan = result.data;
        }

        if (!plan && result?.data?.raw) {
          try {
            const parsedRaw = JSON.parse(result.data.raw);
            plan = parsedRaw?.trip_plan ?? null;
          } catch (e) {
            console.warn('Could not parse raw model output as JSON', e);
          }
        }

        if (!plan || (!plan.hotels && !plan.trip_plan && !plan.destination)) {
          console.warn('❌ No usable trip data found in response:', {
            plan: plan,
            originalResponse: result?.data
          });
          setmessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: 'I attempted to generate the trip plan but the model returned an unexpected response. Please try again or check the console for details.'
            }
          ]);
          setloading(false)
          return;
        }

        console.log('✅ Plan extracted:', {
          planStructure: plan,
          hasHotels: !!plan?.hotels,
          hotelsCount: plan?.hotels?.length || 0,
          hasItinerary: !!plan?.itinerary,
          itineraryCount: plan?.itinerary?.length || 0
        });

        if (result?.data?.itinerary && !plan.itinerary) {
          plan.itinerary = result.data.itinerary;
        }

        // DO NOT fetch or save images - let them be fetched dynamically
        
        settripDetail(plan);
        setTripDetailInfo(plan);
        
        const newTripId = uuidv4();
        setTripId(newTripId)

        console.log('🔍 Debug UserDetail:', UserDetail);
        console.log('🔍 Debug UserDetail._id:', UserDetail?._id);

        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(`trip-${newTripId}`, JSON.stringify(plan));
            localStorage.setItem('lastTripId', newTripId);
          }
        } catch (e) {
          console.warn('Failed to save trip to localStorage', e);
        }

        setPendingSave(true);
        console.log("🟡 pendingSave set to true");
      }
    } catch (error) {
      console.error('Error in onSend:', error);
      setmessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'An error occurred while processing your request. Please try again.'
        }
      ]);
    } finally {
      setloading(false)
    }
  }, [userInput, messages, setTripDetailInfo])

  const RenderGenerativeUi = (ui: string) => {
    if(ui=='budget'){
      return <BudgetUi onSelectedOption={(v:string)=>{setuserInput(v); onSend()}}></BudgetUi>
    }else if(ui=='groupSize'){
      return <GroupSizeUi onSelectedOption={(v:string)=>{setuserInput(v); onSend()}}/>
    }else if(ui=='tripDuration'){
      return <TripDurationUi onSelectedOption={(v: string) => { setuserInput(v); onSend(); }} />
    }else if(ui=='final'){
      return (
        <FinalUi
          onViewTrip={() => {
            if (tripId) {
              router.push(`/create-new-trip?tripId=${tripId}`)
            } else {
              alert('Trip not saved yet. Please wait a moment and try again.')
            }
          }}
          disable={!tripDetail}
        />
      )
    }
    return null;
  }

  useEffect(() => {
    const lastMsg = messages[messages.length-1];
    if(lastMsg?.ui=='final'){
      isFinalRef.current = true;
      setisFinal(true);
      setuserInput('Ok, Great!!')
    }
  }, [messages])

  useEffect(()=>{
    if(isFinal && userInput){
      onSend()
    }
  },[isFinal, userInput, onSend])

  // Trip saving effect
  useEffect(() => {
    if (!pendingSave) {
      console.log("⏸️ pendingSave is false, skipping save");
      return;
    }

    // Wait for UserDetail to be available
    if (!UserDetail) {
      console.log("⏳ Waiting for UserDetail to load...");
      return;
    }

    if (!UserDetail._id) {
      console.log("⏳ Waiting for UserDetail._id...", UserDetail);
      return;
    }

    if (!TripDetailInfo) {
      console.log("⏳ Waiting for TripDetailInfo...");
      return;
    }

    if (!tripId) {
      console.log("⏳ Waiting for tripId...");
      return;
    }

    console.log("✅ All conditions met, proceeding with save...", {
      tripId,
      uid: UserDetail._id,
      hasTrip: !!TripDetailInfo,
      userDetailName: UserDetail.name
    });

    (async () => {
      try {
        console.log("💾 Saving trip to Convex NOW", {
          tripId,
          uid: UserDetail._id,
          tripDetailKeys: Object.keys(TripDetailInfo || {}),
          userName: UserDetail.name
        });

        const saveResult = await SaveTripDetail({
          tripId,
          uid: UserDetail._id,
          tripDetail: TripDetailInfo,
        });

        console.log("✅ Trip saved successfully in Convex:", saveResult);
        setPendingSave(false);
      } catch (error) {
        console.error("❌ Convex save failed:", error);
        // Don't set pendingSave to false - allow retry
      }
    })();
  }, [pendingSave, UserDetail, TripDetailInfo, tripId, SaveTripDetail]);

  return (
    <div className='min-h-[87vh] flex flex-col border shadow rounded-2xl p-2'>
      {messages?.length==0 &&
      <EmptyBoxState onSelectionOption={(v:string)=>{setuserInput(v); onSend()}}></EmptyBoxState> 
      }
      <section className='flex-1 overflow-y-auto p-4'>
        {messages.map((msg:Message,index)=>(
          msg.role=='user'?
          <div className='flex justify-end mt-2' key={index}>
            <div className='max-w-lg bg-primary text-white px-4 py-2 rounded-xl'>
              {msg.content}
            </div>
          </div>:
          <div className='flex justify-start mt-2'  key={index}>
            <div className='max-w-lg bg-gray-100 text-black px-4 py-2 rounded-xl'>
              {msg.ui !== 'final' && msg.content}
              {RenderGenerativeUi(msg.ui?? '')}
            </div>
          </div>
        ))}

        {loading && <div className='flex justify-start mt-2'>
          <div className='max-w-lg bg-gray-100 text-black px-4 py-2 rounded-xl'>
            <Loader className='animate-spin'/>
          </div>
        </div>}
      </section>
      <section className='shrink-0'>
        <div className='border rounded-2xl p-4 relative'>
          <Textarea  className='w-full border-none h-28 focus-visible:ring-0 shadow-none resize-none'
            onChange={(event)=>setuserInput(event.target.value)} value={userInput} placeholder='Start Typing Here....' >
          </Textarea> 
          <Button onClick={()=>onSend()} className='absolute bottom-6 right-6' size={'icon'}> 
            <Send className='h-4 w-4'/>
          </Button>
        </div>
      </section>
    </div>
  )
}

export default ChatBox