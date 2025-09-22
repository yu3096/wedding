import React from "react";
import SvgStaggerText from "./SvgStaggerText";
import ResponsivePicture from './media/ResponsivePicture';
import heroPic from '@/assets/images/hero.jpg?format=avif;webp;jpg&w=480;768;1024;1440;1920&quality=70&as=picture';

export default function HeroFullBleed() {
  return (
    <header className="relative w-full h-screen overflow-hidden">
{/*       <img src={hero} alt="hero" className="absolute inset-0 h-full w-full object-cover" /> */}
      <ResponsivePicture
        picture={heroPic}
        alt="Hero background"
        sizes="100vw"              // 화면 전체 폭
        fetchPriority="high"       // LCP 최적화
        loading="eager"
        decoding="async"
        className="block"
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
          className="fill-white/90 uppercase tracking-[0.4em]"
          style={{ filter: "url(#shadow)", fontSize: "clamp(12px, 1.6vw, 18px)" }}
        />

        {/* 메인 타이틀 - 글자당 45ms */}
        <SvgStaggerText
          x="50%" y="45%"
          text="유승민 & 정지수"
          step={45}
          className="fill-white font-serif"
          style={{ filter: "url(#shadow)", fontSize: "clamp(36px, 7vw, 88px)" }}
        />

        {/* 날짜/장소 - 글자당 30ms (직선 중앙 정렬) */}
        <SvgStaggerText
          x="50%" y="58%"
          text="2026.06.21 (일) 오전 11:00"
          step={30}
          className="fill-white/95"
          style={{ filter: "url(#shadow)", fontSize: "clamp(14px, 2.6vw, 24px)" }}
        />
      </svg>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/90 scroll-indicator">
        <span className="text-sm">Scroll</span>
        <span className="block w-[1px] h-10 bg-white/80 animate-pulse" />
      </div>
    </header>
  );
}
