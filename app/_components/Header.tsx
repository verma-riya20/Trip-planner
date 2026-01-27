"use client"
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SignInButton } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
 
const menuOptions=[
    {
        name:'Home',
        path:'/'
    },
     {
        name:'Pricing',
        path:'/pricing'
    },
     {
        name:'Contact Us',
        path:'/contact'
    },
]

function Header() {

    const {user}=useUser();
    const path=usePathname();
    console.log("Current path:", path);
    

  return (
    <div className='flex justify-between items-center p-4'>
        {/*Logo */}
        <div className='flex gap-2 items-center'>
        <Image src='/logo.svg' alt="logo" width={30} height={40}></Image>
        <h2 className='font-bold text-3xl'>Trip Planner</h2>
        </div>

        {/**menu options */}
        <div className='flex gap-8 items-center'>
            {menuOptions.map((menu)=>
            
            <Link key={menu.path} href={menu.path}>
            <h2 className=' text-xl hover:scale-105 transition-all hover:text-primary'>{menu.name}</h2>
            </Link>
            )}
        </div>
        {/**Getting started button */}
        {!user ? <SignInButton mode='modal'>
        <Button>Getting started</Button>
        </SignInButton> :
        path== '/create-new-trip' ? 
         <Link href={'/my-trips'}>
            <Button>
                My Trips
            </Button> 
            </Link>:
        <Link href={'/create-new-trip'}>
            <Button>
                Create New trip
            </Button> 
            </Link>}
        
        
    </div>
  )
}

export default Header