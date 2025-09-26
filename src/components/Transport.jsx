import React from 'react'
import useReveal from './useReveal'
import { useWeddingInfo } from "@/context/WeddingInfoProvider.jsx";

export default function Transport() {
  const { ref, visible } = useReveal()
  const { wedding } = useWeddingInfo();
  return (
    <section ref={ref} id="transport" className="py-16 sm:py-24 container mx-auto px-4">
      <div className={`max-w-8xl mx-auto transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <h3 className="font-serif text-2xl sm:text-3xl text-center">교통 안내</h3>
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border p-5 bg-white">
            <div className="font-medium">버스 안내</div>
            <p className="text-sm text-neutral-600 mt-1">
              {wedding.weddingBus.split("<br>").map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>
          </div>
          <div className="rounded-2xl border p-5 bg-white">
            <div className="font-medium">지하철 안내</div>
            <p className="text-sm text-neutral-600 mt-1">
              {wedding.weddingSubway.split("<br>").map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>
          </div>
          <div className="rounded-2xl border p-5 bg-white">
            <div className="font-medium">자가용 안내</div>
            <p className="text-sm text-neutral-600 mt-1">
              {wedding.weddingCar.split("<br>").map((line, idx) => (
                <React.Fragment key={idx}>
                    {idx === 0 && <>네비게이션 주소검색 {line}</>}
                    {idx !== 0 && <><span style={{color:"transparent"}}>네비게이션 주소검색</span> {line}</>}
                    <br />
                  </React.Fragment>
             ))}
            </p>
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
