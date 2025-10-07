import React, { useState, useEffect } from "react";
import SvgStaggerText from "@/components/SvgStaggerText";
import ResponsivePicture from "@/components/Media/ResponsivePicture";
import { useWeddingInfo } from "@/context/WeddingInfoProvider";
import { format, DATE_PRESETS, toDash, toKorean, getWeekdayName } from "@/lib/dateFormat.js";
import { getSignedUrl } from "@/lib/supabase-storage.js";

export default function HeroFullBleed() {
  const { names, wedding } = useWeddingInfo();
  const [url, setUrl] = useState(null);

  useEffect(() => {
      getSignedUrl('wedding-bucket', 'mobile-img/Hero.jpg', 60)
          .then(setUrl)
          .catch(console.error);
  }, []);

  return (
    <section id="heroFullBleed" className="hero-fullbleed relative bg-black overflow-hidden">
      <ResponsivePicture
        picture={url}
        alt="Hero background"
        sizes="100vw"
        fetchPriority="high"
        loading="eager"
        decoding="async"
        className="absolute inset-0"                       // <picture> 위치
        imgClassName="w-full h-full object-cover block"                      // <img> 추가 클래스(중앙 정렬 등)
        fit="cover"                                 // ✅ 긴 축 기준
      />

      <div className="absolute inset-0 bg-black/30" />

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* 소제목 - 글자당 25ms */}
        <SvgStaggerText
          x="50%" y="35%"
          text="WE ARE GETTING MARRIED"
          step={25}
          className="fill-white/90 uppercase tracking-[0.4em] calligraphy"
          style={{ filter: "url(#shadow)", fontSize: "clamp(20px, 7vw, 22px)" }}
        />

        {/* 메인 타이틀 - 글자당 45ms */}
        <SvgStaggerText
          x="50%" y="45%"
          text={`${names.groomName} & ${names.brideName}`}
          step={45}
          className="fill-white font-serif"
          style={{ filter: "url(#shadow)", fontSize: "clamp(36px, 15vw, 88px)" }}
        />

        {/* 날짜/장소 - 글자당 30ms (직선 중앙 정렬) */}
        <SvgStaggerText
          x="50%" y="58%"
          text={`${format(wedding.weddingDate, DATE_PRESETS.KOREAN, { includeWeekday: true })} ${wedding.weddingTime}`}
          step={30}
          className="fill-white/95"
          style={{ filter: "url(#shadow)", fontSize: "clamp(14px, 8vw, 24px)" }}
        />
      </svg>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/90 scroll-indicator">
        <span className="text-sm">Scroll</span>
        <span className="block w-[1px] h-10 bg-white/80 animate-pulse" />
      </div>
    </section>
  );
}
