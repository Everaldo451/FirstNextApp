'use client'

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UserType } from "@/types/UserType";
import { UserContext } from "@/contexts/UserContext";
import { useState } from "react";


export default function App({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<UserType|null>(null)

  return (
    <UserContext.Provider value={[user, setUser]}>
        <Header/>
        <main>{children}</main>
        <Footer/>
    </UserContext.Provider>
  );
}