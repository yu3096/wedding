// src/sections/HeroFullBleed.jsx (업로드하신 파일 기준 예시)
import React, { useState, useEffect } from "react";
import SvgStaggerText from "@/components/SvgStaggerText";
import ResponsivePicture from "@/components/Media/ResponsivePicture";
import { useWeddingInfo } from "@/context/WeddingInfoProvider";
import { format, DATE_PRESETS } from "@/lib/dateFormat.js";
import { getSignedUrl } from "@/lib/supabase-storage.js";

// ⬇️ 새로 추가
import useImageProgress from "@/lib/useImageProgress";
import { ProgressOverlay }  from "@/components/Media/ProgressBar.jsx"

export default function HeroFullBleed() {
    const { names, wedding } = useWeddingInfo();
    const [signedUrl, setSignedUrl] = useState(null);

    useEffect(() => {
        getSignedUrl("wedding-bucket", "mobile-img/Hero.jpg", 60)
            .then(setSignedUrl)
            .catch(console.error);
    }, []);

    // ⬇️ 새로 추가: 서명 URL을 스트리밍 로딩해 Blob Object URL 생성 + 진행률 추적
    const { objectUrl, status, percent, mode } = useImageProgress(signedUrl);

    const isLoaded = status === "loaded";

    return (
        <section id="heroFullBleed" className="hero-fullbleed relative bg-black overflow-hidden">
            {/* 배경 이미지 (로딩 완료 시 페이드인) */}
            <ResponsivePicture
                picture={objectUrl || ""}                  // Blob URL 전달
                alt="Hero background"
                sizes="100vw"
                fetchPriority="high"
                loading="eager"
                decoding="async"
                className="absolute inset-0"
                imgClassName={
                    "w-full h-full object-cover block transition-opacity duration-700 " +
                    (isLoaded ? "opacity-100" : "opacity-0")
                }
                fit="cover"
            />

            {/* 진행 바 오버레이 */}
            {!isLoaded && (signedUrl ? <ProgressOverlay percent={percent} mode={mode} /> : null)}

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

                <SvgStaggerText
                    x="50%" y="35%"
                    text="WE ARE GETTING MARRIED"
                    step={80}
                    className="fill-white/90 uppercase tracking-[0.4em] calligraphy"
                    style={{ filter: "url(#shadow)", fontSize: "clamp(20px, 7vw, 22px)" }}
                />

                <SvgStaggerText
                    x="50%" y="45%"
                    text={`${names.groomName} & ${names.brideName}`}
                    step={200}
                    className="fill-white calligraphy"
                    style={{ filter: "url(#shadow)", fontSize: "clamp(36px, 15vw, 88px)" }}
                />

                <SvgStaggerText
                    x="50%" y="58%"
                    text={`${format(wedding.weddingDate, DATE_PRESETS.KOREAN, { includeWeekday: true })} ${wedding.weddingTime}`}
                    step={80}
                    className="fill-white/95 calligraphy"
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
