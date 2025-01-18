'use client'

import { createContext, SetStateAction } from "react";
import { UserType } from "@/types/UserType";

export type UserContextType = [UserType|null,React.Dispatch<SetStateAction<UserType|null>>]

export const UserContext = createContext<UserContextType>([null, () => null])