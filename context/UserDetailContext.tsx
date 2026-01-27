import { createContext } from "react";

export type UserDetailContextType = {
  UserDetail: any;
  setUserDetail: React.Dispatch<React.SetStateAction<any>>;
};

export const UserDetailContext = createContext<UserDetailContextType | null>(null);