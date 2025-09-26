import React from 'react'
import ScrollProgress from '@/components/ScrollProgress.jsx'
import Hero from '@/components/Hero.jsx'
import HeroFullBleed from '@/components/HeroFullBleed.jsx'
import SaveTheDate from '@/components/SaveTheDate.jsx'
import Invitation from '@/components/Invitation.jsx'
import Accounts from '@/components/Accounts.jsx'
import Gallery from '@/components/Gallery.jsx'
import Maps from '@/components/Maps.jsx'
import Transport from '@/components/Transport.jsx'
import Footer from '@/components/Footer.jsx'
import Guestbook from '@/components/Guestbook.jsx'
import Appreciation from '@/components/Appreciation.jsx'
import { WeddingInfoProvider, useWeddingInfo } from '@/context/WeddingInfoProvider.jsx'
import { parseDateStr } from "@/lib/dateFormat.js";

export default function App() {
  const { wedding } = useWeddingInfo();
  const dateObj = parseDateStr(wedding.weddingDate);

  return (
    <div className="min-h-screen antialiased text-neutral-900 bg-white app-root">
        <ScrollProgress />

        <HeroFullBleed />
        <Hero />
        <Invitation />
        <SaveTheDate year={dateObj.year} month={dateObj.month} day={dateObj.day} />
        <Accounts />
        <Gallery />
        <Maps />
        <Transport />
        <Guestbook />
        <Appreciation />
        <Footer />
    </div>
  )
}