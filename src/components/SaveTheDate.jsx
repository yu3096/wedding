import React, { useMemo } from 'react'
import useReveal from './useReveal'
import { useWeddingInfo } from "@/context/WeddingInfoProvider";

const weekdays = ['일', '월', '화', '수', '목', '금', '토']

function getDday({ year, month, day }) {
  // month: 1~12
  const now = new Date()
  // 오늘 00:00 기준(로컬)으로 계산해 시간 오차 최소화
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(year, month - 1, day) // 00:00
  const diffMs = target.getTime() - today.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return { label: '오늘입니다! 🎉', kind: 'today', n: 0 }
  if (diffDays > 0) return { label: `D-${diffDays}`, kind: 'future', n: diffDays }
  const n = Math.abs(diffDays)
  return { label: `D+${n}`, kind: 'past', n }
}

export default function SaveTheDate({ year, month, day }) {
  const { wedding, names } = useWeddingInfo();
  const first = useMemo(() => new Date(year, month - 1, 1), [year, month])
  const last = useMemo(() => new Date(year, month, 0), [year, month])
  const leading = first.getDay()
  const total = last.getDate()
  const cells = Array(leading).fill(null).concat(Array.from({ length: total }, (_, i) => i + 1))
  while (cells.length % 7 !== 0) cells.push(null)

  const { ref, visible } = useReveal()
  const dday = getDday({ year, month, day })

  // 표기 문자열 (요청 포맷)
  const dText =
    dday.kind === 'future'
      ? `예식까지 ${dday.n}일`
      : dday.kind === 'today'
        ? '예식 당일💕'
        : `예식 이후 ${dday.n}일`;

  return (
    <section ref={ref} id="save-the-date" className="py-16 sm:py-24 container mx-auto px-4">
      <div className={`max-w-3xl mx-auto text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <p className="uppercase tracking-[0.3em] text-sm text-neutral-500">우리의 순간</p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-serif">
          {year}. {String(month).padStart(2, '0')}. {String(day).padStart(2, '0')}
        </h2>
        <p className="mt-2 text-neutral-600">{wedding.weddingTime} · {wedding.weddingHall}</p>

        {/* ✅ 달력 + D-뱃지 래퍼 (relative) */}
        <div className="mt-8 relative">
          {/* 달력 박스 */}
          <div className="border rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-7 text-center bg-neutral-50/60 text-sm">
              {['일', '월', '화', '수', '목', '금', '토'].map((w) => (
                <div key={w} className={`py-3 ${w === '일' ? 'text-rose-600' : w === '토' ? 'text-sky-600' : 'text-neutral-700'}`}>{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 divide-x divide-y">
              {cells.map((d, idx) => {
                const isTarget = d === day;
                const weekday = d ? new Date(year, month - 1, d).getDay() : null;
                return (
                  <div key={idx} className="aspect-[1/0.8] flex items-center justify-center text-sm">
                    {d && (
                      <div
                        className={`w-9 h-9 flex items-center justify-center rounded-full transition-transform ${isTarget ? 'bg-black text-white font-semibold'
                          : weekday === 0 ? 'text-rose-600'
                            : weekday === 6 ? 'text-sky-600'
                              : 'text-neutral-800'
                          }`}>
                        {d}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ✅ 달력 “밖” 우측 하단 뱃지 (absolute) */}
          <div className="absolute right-0 -bottom-3 md:-bottom-4 select-none" aria-live="polite">
            <span
              className={[
                "inline-flex items-center px-3 py-1.5 rounded-full text-xs",
                "bg-white/85 backdrop-blur border border-neutral-200 shadow-sm",
                "text-neutral-700"
              ].join(' ')}
              title={dText}
            >
              {dText}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}