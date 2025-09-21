import React, { useMemo } from 'react'
import useReveal from './useReveal'

const weekdays = ['일','월','화','수','목','금','토']

export default function SaveTheDate({ year, month, day }) {
  const first = useMemo(() => new Date(year, month - 1, 1), [year, month])
  const last = useMemo(() => new Date(year, month, 0), [year, month])
  const leading = first.getDay()
  const total = last.getDate()
  const cells = Array(leading).fill(null).concat(Array.from({ length: total }, (_, i) => i + 1))
  while (cells.length % 7 !== 0) cells.push(null)
  const { ref, visible } = useReveal()

  return (
    <section ref={ref} id="save-the-date" className="py-16 sm:py-24 container mx-auto px-4">
      <div className={`max-w-3xl mx-auto text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <p className="uppercase tracking-[0.3em] text-sm text-neutral-500">Save the date</p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-serif">{year}. {String(month).padStart(2,'0')}. {String(day).padStart(2,'0')}</h2>
        <p className="mt-2 text-neutral-600">오전 11시 00분 · 더컨벤션 반포</p>
        <div className="mt-8 border rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 text-center bg-neutral-50/60 text-sm">
            {weekdays.map(w => (
              <div key={w} className={`py-3 ${w==='일' ? 'text-rose-600' : w==='토' ? 'text-sky-600' : 'text-neutral-700'}`}>{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-y">
            {cells.map((d, idx) => {
              const isTarget = d === day
              const weekday = d ? new Date(year, month - 1, d).getDay() : null
              return (
                <div
                  key={idx}
                  className="aspect-[1/0.8] flex items-center justify-center text-sm"
                >
                  {d && (
                    <div
                      className={`w-9 h-9 flex items-center justify-center rounded-full ${
                        isTarget
                          ? 'bg-black text-white font-semibold'
                          : weekday === 0
                          ? 'text-rose-600'
                          : weekday === 6
                          ? 'text-sky-600'
                          : 'text-neutral-800'
                      }`}
                    >
                      {d}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
