"use client"
import React, { useState, useContext, useEffect } from 'react'
import Header from './_components/Header';
import { useMutation } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import { UserDetailContextType, UserDetailContext } from '@/context/UserDetailContext';
import { TripContextType, TripDetailContext } from '@/context/TripDetailContext';
import { TripInfo } from './_components/ChatBox';

function provider({
   children,
}: Readonly<{
  children: React.ReactNode;
}>
) {
  const [UserDetail, setUserDetail] = useState<any>(null);
  const [TripDetailInfo, setTripDetailInfo] = useState<TripInfo | null>(null)
  const [isInitializing, setIsInitializing] = useState(true);
  
  const CreateUserMutation = useMutation(api.user.CreateNewUser);
  const {user} = useUser();

  // Separate function to create user - no naming conflicts
  const initializeUser = async () => {
    if(!user) {
      setIsInitializing(false);
      return;
    }

    console.log('🔄 Creating user with data:', {
      email: user?.primaryEmailAddress?.emailAddress,
      name: user?.fullName,
      imageUrl: user?.imageUrl
    });
    
    try {
      const result = await CreateUserMutation({
        email: user?.primaryEmailAddress?.emailAddress ?? '',
        imageUrl: user?.imageUrl ?? '',
        name: user?.fullName ?? ''
      });
      
      console.log('✅ User created/found in Convex:', result);
      setUserDetail(result);
      setIsInitializing(false);
    } catch (error) {
      console.error('❌ Error creating user:', error);
      setUserDetail({
        _id: 'guest',
        name: 'Guest User',
        authenticated: false,
      });
      setIsInitializing(false);
    }
  }

  // Initialize user when user object changes
  useEffect(() => {
    if(user) {
      setIsInitializing(true);
      initializeUser();
    }
  }, [user, CreateUserMutation]);

  // Debugging UserDetail updates
  useEffect(() => {
    console.log("UserDetail updated:", UserDetail);
  }, [UserDetail]);

  return (
    <UserDetailContext.Provider value={{UserDetail, setUserDetail}}> 
      <TripDetailContext.Provider value={{TripDetailInfo, setTripDetailInfo}}> 
        <div>
          <Header/>
          {children}
        </div>
      </TripDetailContext.Provider>
    </UserDetailContext.Provider>
  )
}

export default provider

export const useUserDetail = (): UserDetailContextType | null => {
  const context = useContext(UserDetailContext);
  if (!context) {
    console.warn('⚠️ useUserDetail called outside of UserDetailContext provider');
    return {UserDetail: null, setUserDetail: () => {}};
  }
  return context;
}

export const useTripDetail = (): TripContextType | undefined => {
  return useContext(TripDetailContext)
}