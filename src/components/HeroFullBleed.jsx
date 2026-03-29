// src/sections/HeroFullBleed.jsx (업로드하신 파일 기준 예시)
import React, { useState, useEffect } from "react";
import SvgStaggerText from "@/components/SvgStaggerText";
import ResponsivePicture from "@/components/Media/ResponsivePicture";
import { useWeddingInfo } from "@/context/WeddingInfoProvider";
import { format, DATE_PRESETS } from "@/lib/dateFormat.js";
import { getGithubImageUrl } from "@/lib/github-storage.js";
import useImageProgress from "@/lib/useImageProgress";
import { ProgressOverlay } from "@/components/Media/ProgressBar.jsx"

import Intro from "@/components/Intro";

export default function HeroFullBleed(props) {
    const { names, wedding, isOpen } = useWeddingInfo();
    // 동기식으로 대상 URL 바로 가져옴
    const imageUrl = getGithubImageUrl("mobile-img/Hero.jpg");

    // ⬇️ 스트리밍 로딩해 Blob Object URL 생성 + 진행률 추적
    const { objectUrl, status, percent, mode } = useImageProgress(imageUrl);
    const isLoaded = status === "loaded";

    // ⬇️ 최소 유지 시간 보장 (예: 2500ms)
    const [isMinTimePassed, setIsMinTimePassed] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsMinTimePassed(true), 2500);
        return () => clearTimeout(timer);
    }, []);

    // ⬇️ Intro Finish Condition
    // 1. Hero Image Loaded
    // 2. Gallery List Loaded (if provided)
    // 3. Minimum Time Passed
    // 4. 모바일 청첩장이 오픈 상태인지 확인
    const galleryLoaded = props.isGalleryLoaded !== undefined ? props.isGalleryLoaded : true;
    const allConditionsMet = isLoaded && galleryLoaded && isMinTimePassed && isOpen;
    const showMainContent = allConditionsMet;

    // ⬇️ Display Percent Logic
    // 이미지가 다 로딩되었어도(percent === 100), 다른 조건(시간, 갤러리)이 안 맞으면 99%에서 대기
    let displayPercent = percent;
    if (percent >= 100 && !allConditionsMet) {
        displayPercent = 99;
    }

    useEffect(() => {
        if (showMainContent && props.onIntroComplete) {
            props.onIntroComplete();
        }
    }, [showMainContent, props.onIntroComplete]);

    return (
        <section id="heroFullBleed" className="hero-fullbleed relative bg-white overflow-hidden">
            {/* 메인 배경 이미지 (꽉 채움)
                - 사용자가 위치(focus)를 조절하려면 object-cover 뒤에 object-top, object-center 등을 추가/수정하세요.
            */}
            {/* ⬇️ 이미지와 그라데이션이 항상 같은 바닥선(bottom)을 공유하며 한 몸처럼 움직이게 하는 그룹 컨테이너. */}
            {/* 위치나 여백을 변경하시려면 이 div의 'bottom-20' 부분만 수정하시면 둘 다 같이 움직입니다. */}
            <div className="absolute inset-x-0 top-0 bottom-20">

                <ResponsivePicture
                    picture={objectUrl || ""}
                    alt="Hero background"
                    sizes="100vw"
                    fetchPriority="high"
                    loading="eager"
                    decoding="async"
                    className="w-full h-full relative"
                    imgClassName={
                        "w-full h-full object-cover block transition-opacity duration-700 " +
                        (showMainContent ? "opacity-100" : "opacity-0")
                    }
                    fit="cover"
                />

                {/* ⬇️ 이미지 하단부 단절을 감춰주며, 아래로 내려갈수록 100% 완전한 흰색으로 끝나는(to-white) 자연스러운 페이드 덮개 */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-white/0 via-white/40 to-white pointer-events-none z-10" aria-hidden="true" />

            </div>

            {/* ⬇️ Render Intro OR Main Content */}
            {!showMainContent ? (
                <Intro percent={displayPercent} mode={mode} isOpen={isOpen} wedding={wedding} />
            ) : (
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none fadeIn"
                    viewBox="0 0 1440 900"
                    preserveAspectRatio="xMidYMid slice"
                    aria-hidden="true"
                >
                    {/*}
                    <defs>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
                        </filter>
                    </defs>

                    <SvgStaggerText
                        x="50%" y="10%"
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
                    */}
                </svg>
            )}

            <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-black/40 transition-opacity duration-700 delay-1000 ${showMainContent ? 'opacity-100' : 'opacity-0'}`}>
                <span className="text-sm tracking-widest">Scroll</span>
                <span className="block w-[1px] h-3 bg-black/50 animate-pulse" />
            </div>
        </section>
    );
}
