import React from 'react'
import useReveal from './useReveal'
import CopyButton from './CopyButton.jsx'

export default function Accounts() {
  const groom = { bank: '하나은행', name: '유승민', num: '123-1234566-1233' }
  const bride = { bank: '신한은행', name: '정지수', num: '110-000-000000' }
  const { ref, visible } = useReveal()
  return (
    <section ref={ref} id="accounts" className="py-16 sm:py-24 bg-neutral-50">
      <div className={`container mx-auto px-4 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <h3 className="text-center text-xl tracking-tight text-neutral-700">참석이 어려우신 분들을 위해 계좌번호를 기재하였습니다.</h3>
        <p className="text-center text-neutral-500 mt-1 mb-8">너그러운 마음으로 양해 부탁드립니다.</p>
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {[groom, bride].map((a, i) => (
            <div key={i} className="rounded-2xl border bg-white p-5 flex items-center justify-between">
              <div>
                <div className="text-sm text-neutral-500">{i === 0 ? '신랑측' : '신부측'} 계좌번호</div>
                <div className="mt-1 font-medium text-neutral-800">{a.bank} · {a.name}</div>
                <div className="font-mono mt-0.5">{a.num}</div>
              </div>
              <CopyButton text={`${a.bank} ${a.num} ${a.name}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
