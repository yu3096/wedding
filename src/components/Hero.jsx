import React from 'react'
import useReveal from './useReveal'
import { useWeddingInfo } from "@/context/WeddingInfoProvider.jsx";
import { format, DATE_PRESETS, toDash, toKorean, getWeekdayName } from "@/lib/dateFormat.js";

const sampleImages = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop"
]

export default function Hero() {
  const { ref, visible } = useReveal()
  const { names, wedding } = useWeddingInfo();
  return (
    <section id="hero" ref={ref} className="pt-16 sm:pt-24">
      <div className="container mx-auto px-4">
        <div className={`max-w-4xl mx-auto text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="uppercase tracking-[0.3em] text-sm text-neutral-500">우리 결혼합니다</p>
          <h1 className="mt-4 text-4xl sm:text-6xl font-serif">{names.groomName} & {names.brideName}</h1>
          <p className="mt-3 text-neutral-700 font-sans">{format(wedding.weddingDate, DATE_PRESETS.KOREAN, {includeWeekday: true})} {wedding.weddingTime} <br />{wedding.weddingHall}</p>
        </div>
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <img src={sampleImages[0]} alt="hero-1" className="rounded-3xl h-64 sm:h-[420px] w-full object-cover" />
          <div className="grid grid-rows-2 gap-4">
            <img src={sampleImages[1]} alt="hero-2" className="rounded-3xl h-32 sm:h-[200px] w-full object-cover" />
            <img src={sampleImages[2]} alt="hero-3" className="rounded-3xl h-32 sm:h-[200px] w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}
