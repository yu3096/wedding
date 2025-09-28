import React, { useEffect, useState, useRef } from "react";
import { useWeddingInfo } from "@/context/WeddingInfoProvider.jsx";

function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }

export default function FloatingKakaoShareButton() {
    const { wedding } = useWeddingInfo();
    const [phase, setPhase] = useState("hidden"); // 'hidden' | 'peek' | 'show'
    const ticking = useRef(false);
    const kakaoIcon = `${import.meta.env.BASE_URL}icons/kakao.svg`;

    // Kakao SDK init (VITE_KAKAO_JS_KEY 사용)
    useEffect(() => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
        }
    }, []);

    // Hero 보일 땐 숨김 / 지나가면 등장 (peek → show)
    useEffect(() => {
        const hero = document.getElementById("hero");
        if (!hero) return;

        const calc = () => {
            const heroBottom = hero.getBoundingClientRect().bottom; // viewport 기준
            const vh = window.innerHeight;
            const progress = clamp(1 - heroBottom / vh, 0, 1); // 0=맨 위, 1=완전 지나감

            if (progress < 0.15) setPhase("hidden");   // 거의 상단: 안 보임
            else if (progress < 0.55) setPhase("peek"); // 살짝 보이기
            else setPhase("show");                      // 완전 노출

            ticking.current = false;
        };

        const onScroll = () => {
            if (!ticking.current) {
                ticking.current = true;
                requestAnimationFrame(calc);
            }
        };

        calc();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    const shareToKakao = () => {
        if (!window.Kakao) {
            fallbackToSMS();
            return;
        }
        try {
            window.Kakao.Share.sendDefault({
                objectType: "feed",
                content: {
                    title: "저희 결혼식에 초대합니다 💍",
                    description: "청첩장을 확인해보세요!",
                    imageUrl:
                        wedding.weddingThumbnail,
                    link: {
                        mobileWebUrl: window.location.href,
                        webUrl: window.location.href,
                    },
                },
                buttons: [
                    {
                        title: "청첩장 보기",
                        link: {
                            mobileWebUrl: window.location.href,
                            webUrl: window.location.href,
                        },
                    },
                ],
            });
        } catch (e) {
            console.warn("카카오 공유 실패 → SMS fallback", e);
            fallbackToSMS();
        }
    };

    const fallbackToSMS = () => {
        const text = `저희 결혼식에 초대합니다 💍\n청첩장을 확인해보세요!\n${window.location.href}`;
        window.location.href = `sms:?body=${encodeURIComponent(text)}`;
    };

    // 단계별 스타일
    const base =
        "fixed right-6 z-50 transition-all duration-500 ease-out will-change-transform";
    const byPhase = {
        hidden: "pointer-events-none opacity-0 translate-y-6 bottom-4",
        peek:   "opacity-70 translate-y-1 bottom-6",
        show:   "opacity-100 translate-y-0 bottom-6",
    };

    return (
        <div className={`${base} ${byPhase[phase]}`}>
            <button
                onClick={shareToKakao}
                className="w-12 h-12 flex items-center justify-center rounded-full border bg-white/90
                   shadow-md hover:bg-neutral-100 transition"
                aria-label="카카오톡 공유하기"
            >
                <img src={kakaoIcon} alt="" className="w-6 h-6" />
            </button>
        </div>
    );
}
