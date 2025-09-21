import React from 'react'
import useReveal from './useReveal'

export default function Transport() {
  const { ref, visible } = useReveal()
  return (
    <section ref={ref} id="transport" className="py-16 sm:py-24 container mx-auto px-4">
      <div className={`max-w-3xl mx-auto transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <h3 className="font-serif text-2xl sm:text-3xl text-center">교통 안내</h3>
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border p-5 bg-white">
            <div className="font-medium">버스 안내</div>
            <p className="text-sm text-neutral-600 mt-1">하상주차장 오전 8시 출발</p>
            <a href="#" className="inline-block mt-3 px-3 py-1.5 text-sm rounded-full border hover:bg-neutral-50">버스기사님에게 문의하기</a>
          </div>
          <div className="rounded-2xl border p-5 bg-white">
            <div className="font-medium">주차 안내</div>
            <p className="text-sm text-neutral-600 mt-1">웨딩홀 전용 주차장 2시간 무료 이용 가능합니다.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
