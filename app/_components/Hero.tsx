"use client"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'
import {Landmark,Plane,Globe2, Send, ArrowDown } from 'lucide-react'
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog"
import { useRouter } from 'next/navigation' 
import { useUser } from '@clerk/nextjs'
 export const suggestions=[
    {
        title:'Create a new trip',
        icon:<Globe2 className='text-blue-400 h-5 w-5'/>
    },
    {
        
        title:'Inspire me where to go',
        icon:<Plane className='text-green-500 h-5 w-5'/>
    },
    
    {
        title:'Discover Hidden gems',
        icon:<Landmark className='text-orange-500 h-5 w-5'/>
    },
    {
        title:'Adventure Destination',
        icon:<Globe2 className='text-yellow-600 h-5 w-5'/>
    }
 ]

function Hero() {
  const {user}=useUser();
  const router=useRouter();
  const onSend=()=>{
    if(!user){
      router.push("/sign-in")
      return;
    }
    // Navigate to create trip
    router.push('create-new-trip')
  }
  return (
    <div className='flex justify-center mt-24 w-full'>
       {/* content  */}
       <div className='max-w-3xl w-full text-center space-y-6'>
        <h1 className='text-xl md:text-5xl font-bold'>Hey,I'm your personal <span className='text-xl md:text-5xl  font-bold text-primary'>Trip Planner</span></h1>
        <p>Tell me what you want, and I'll handle the rest: Flights,Hotels,Trip Plans -all in seconds</p>
       {/* input box */}
        <div>
            <div className='border rounded-2xl p-4 relative'>
              <Textarea  className='w-full border-none h-28 focus-visible:ring-0 shadow-none resize-none' placeholder='Create a trip from Paris to New York' ></Textarea> 
                <Button onClick={()=>onSend()} className='absolute bottom-6 right-6' size={'icon'}> 
                  <Send  className='h-4 w-4'/>
                    </Button>
            </div>
           
        </div>
       {/* suggestion list */}
       <div className='flex gap-5 '>
        {suggestions.map((suggestion,index)=>
        <div key={index} className='flex items-center gap-2 border rounded-full cursor-pointer hover:bg-primary hover:text-white p-2'>
            {suggestion.icon}
            <h2 className='text-xs'>{suggestion.title}</h2>
        </div>
        )}
       </div>
       <h2  className='my-7 mt-14 flex gap-2 text-center'>Not sure where to start? <strong>See how it woorks</strong><ArrowDown></ArrowDown></h2>

       {/* video section  */}
       <HeroVideoDialog
  className="block dark:hidden"
  animationStyle="from-center"
  videoSrc="https://www.example.com/dummy-video"
  thumbnailSrc="//mma.prnewswire.com/media/2401528/1_MindtripProduct.jpg?p=facebook"
  thumbnailAlt="Dummy Video Thumbnail"
/>
        </div>
    </div>
  )
}

export default Hero