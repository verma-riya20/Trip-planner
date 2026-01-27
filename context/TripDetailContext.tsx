import { TripInfo } from "@/app/_components/ChatBox";
import { createContext } from "react";
export type TripContextType={
    TripDetailInfo:TripInfo | null,
    setTripDetailInfo:React.Dispatch<React.SetStateAction<TripInfo | null>>
}
export const TripDetailContext = createContext<TripContextType | undefined>(undefined);