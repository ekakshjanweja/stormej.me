"use client";

import { Navbar } from "@/components/navbar";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className="flex justify-center w-full">
      <div className="md:max-w-screen-lg w-full px-4 lg:px-0">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
