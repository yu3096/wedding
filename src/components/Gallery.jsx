import React, { useState } from 'react'
import useReveal from './useReveal'

const sampleImages = [
  "https://images.unsplash.com/photo-1520962918287-7448c2878f65?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1528712306091-ed0763094c98?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522000279350-0a93d6b54f05?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop"
]

export default function Gallery() {
  const { ref, visible } = useReveal()
  const [active, setActive] = useState(null)
  return (
    <section ref={ref} id="gallery" className="py-16 sm:py-24 container mx-auto px-4">
      <div className={`max-w-3xl mx-auto text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <p className="uppercase tracking-[0.3em] text-sm text-neutral-500">Our moment</p>
        <h2 className="mt-2 font-serif text-3xl sm:text-4xl">사진을 터치하시면 더 많은 사진을 볼 수 있어요.</h2>
      </div>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {sampleImages.map(src => (
          <button key={src} className="group relative overflow-hidden rounded-2xl border" onClick={() => setActive(src)}>
            <img src={src} alt="sample" className="w-full h-40 md:h-44 object-cover group-hover:scale-[1.03] transition" />
          </button>
        ))}
      </div>
      {active && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <img src={active} alt="active" className="max-h-[85vh] max-w-[92vw] rounded-xl shadow-2xl" />
        </div>
      )}
    </section>
  )
}
