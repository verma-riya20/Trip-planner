import React from 'react'
import { suggestions } from './Hero'

function EmptyBoxState( {onSelectionOption} : any) {
  return (
    <div className='mt-7'>
        <h2 className='font-bold text-center text-3xl'>Start Planning new <strong className='text-primary text-xl font-bold'> trip</strong></h2>
        <p className='text-center text-gray-400 mt-2'>Discover personalized travel itineraries ,find the best  destinations, and plan your dream vacation effortlessly with the power of AI.Let our smart assistant do the hard work while you enjoy the journey.</p>
    
    <div className='flex flex-col gap-5 '>
            {suggestions.map((suggestion,index)=>
            <div key={index} 
            onClick={()=>onSelectionOption(suggestion.title)}
            className='flex items-center gap-2 border rounded-full cursor-pointer hover:border-primary hover:text-primary p-5'>
                {suggestion.icon}
                <h2 className='text-lg'>{suggestion.title}</h2>
            </div>
            )}
           </div>
    </div>
  )
}

export default EmptyBoxState