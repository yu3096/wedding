import React from 'react'
import useReveal from './useReveal'

export default function Invitation() {
  const { ref, visible } = useReveal()
  return (
    <section ref={ref} id="invitation" className="py-16 sm:py-24 container mx-auto px-4">
      <div className={`max-w-2xl mx-auto text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <p className="uppercase tracking-[0.3em] text-sm text-neutral-500">함께해 주세요</p>
        <p className="mt-4 text-neutral-600 leading-7">
          소중한 분들과 함께하고 싶습니다.<br />
          함께하는 기쁨을 알게 해 준 사람을 만나 이제는 저희 둘,<br />
          인생의 모든 날을 함께하고자 합니다.<br />
          <br />
          인연의 소중함을 기억하며 예쁘고 행복하게 잘 살겠습니다.<br />
          <br />
          두 사람의 새로운 시작을 축복해 주시면 감사하겠습니다.<br />
          <br />
          아버지 · 어머니의 장남 <b>신랑 유승민</b><br />
          아버지 · 어머니의 장녀 <b>신부 정지수</b>
        </p>
      </div>
    </section>
  )
}
