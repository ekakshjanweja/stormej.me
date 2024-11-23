"use client";

import { Navbar } from "@/components/navbar";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className="flex justify-center w-full">
      <div className="md:max-w-4xl w-full px-4 py-8 mx-auto">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
