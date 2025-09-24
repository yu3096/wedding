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
import WeddingInfoProvider from '@/context/WeddingInfoProvider.jsx'

export default function App() {
  return (
    <div className="min-h-screen antialiased text-neutral-900 bg-white app-root">
      <WeddingInfoProvider>
        <ScrollProgress />

        <HeroFullBleed />
        <Hero />
        <Invitation />
        <SaveTheDate year={2026} month={6} day={21} />
        <Accounts />
        <Gallery />
        <Maps />
        <Transport />
        <Guestbook />
        <Appreciation />
        <Footer />
      </WeddingInfoProvider>
    </div>
  )
}