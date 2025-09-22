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

export default function App() {
  return (
    <div className="min-h-screen antialiased text-neutral-900 bg-white">
      <ScrollProgress />
      
      <HeroFullBleed />
      <Hero />
      <Invitation />
      <SaveTheDate year={2026} month={6} day={21} />
      <Accounts />
      <Gallery />
      <Maps />
      <Transport />
      <Footer />
    </div>
  )
}

/*
<nav className="fixed top-2 left-1/2 -translate-x-1/2 z-40 backdrop-blur bg-white/70 border rounded-full px-3 py-1 hidden sm:flex gap-2 text-sm">
<a href="#save-the-date" className="px-3 py-1 rounded-full hover:bg-neutral-100">Save the date</a>
<a href="#invitation" className="px-3 py-1 rounded-full hover:bg-neutral-100">Invitation</a>
<a href="#accounts" className="px-3 py-1 rounded-full hover:bg-neutral-100">마음 전하실 곳</a>
<a href="#gallery" className="px-3 py-1 rounded-full hover:bg-neutral-100">사진</a>
<a href="#map" className="px-3 py-1 rounded-full hover:bg-neutral-100">오시는길</a>
</nav>
*/