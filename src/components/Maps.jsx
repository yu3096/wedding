import React from 'react'
import useReveal from './useReveal'
import CopyButton from './CopyButton.jsx'

export default function Maps() {
  const address = '서울 서초구 사평대로 108, 더컨벤션 반포'
  const { ref, visible } = useReveal()
  return (
    <section ref={ref} id="map" className="py-16 sm:py-24 bg-neutral-50">
      <div className={`container mx-auto px-4 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <h2 className="text-center font-serif text-3xl sm:text-4xl">오시는길</h2>
        <div className="max-w-3xl mx-auto mt-6 rounded-2xl overflow-hidden border bg-white">
          <div className="aspect-[16/9] w-full bg-[url('https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-neutral-800 font-medium">더컨벤션 반포</div>
                <div className="text-neutral-600 text-sm">{address}</div>
              </div>
              <div className="flex gap-2">
                <CopyButton text={`${address}`} />
                <a href="#" className="px-3 py-1.5 text-sm rounded-full border hover:bg-neutral-50">네이버 지도</a>
                <a href="#" className="px-3 py-1.5 text-sm rounded-full border hover:bg-neutral-50">카카오맵</a>
                <a href="#" className="px-3 py-1.5 text-sm rounded-full border hover:bg-neutral-50">티맵</a>
              </div>
            </div>
            <p className="text-neutral-600 text-sm mt-4">웨딩홀 전용 주차장이 있습니다. (2시간 무료)</p>
          </div>
        </div>
      </div>
    </section>
  )
}
