"use client"
import React,{ReactNode} from 'react'
import { ConvexProvider } from 'convex/react';
import { ConvexReactClient } from 'convex/react';
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
function ConvexClientProvider({ children }: { children: ReactNode }) {
 return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

export default ConvexClientProvider