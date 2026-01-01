import React, { useEffect, useState, useRef } from "react";
import { useWeddingInfo } from "@/context/WeddingInfoProvider.jsx";

function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }

export default function FloatingShareButton() {
    const { wedding } = useWeddingInfo();

    // 스크롤 및 메뉴 상태 관리
    const [phase, setPhase] = useState("hidden"); // 'hidden' | 'peek' | 'show'
    const [isOpen, setIsOpen] = useState(false);

    const ticking = useRef(false);

    // 이미지 경로 (필요 시 주석 해제하여 사용)
    // const kakaoIcon = `${import.meta.env.BASE_URL}/icons/kakao.svg`;
    // const lineIcon = `${import.meta.env.BASE_URL}/icons/line.png`;

    // 1. Kakao SDK 초기화
    useEffect(() => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
        }
    }, []);

    // 2. 스크롤 감지 로직
    useEffect(() => {
        const hero = document.getElementById("heroFullBleed");
        if (!hero) return;

        const calc = () => {
            const heroBottom = hero.getBoundingClientRect().bottom;
            const vh = window.innerHeight;
            const progress = clamp(1 - heroBottom / vh, 0, 1);

            if (progress < 0.15) setPhase("hidden");
            else if (progress < 0.55) setPhase("peek");
            else setPhase("show");

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

    // 메뉴가 숨겨질 때 열림 상태도 초기화
    useEffect(() => {
        if (phase === 'hidden') {
            setIsOpen(false);
        }
    }, [phase]);

    // 3. 카카오 공유 로직
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
        setIsOpen(false);
    };

    // 4. 라인 공유 로직
    const shareToLine = () => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent("저희 결혼식에 초대합니다 💍\n청첩장을 확인해보세요!");
        window.open(`https://line.me/R/msg/text/?${text}%0A${url}`, '_blank');
        setIsOpen(false);
    };

    const fallbackToSMS = () => {
        const text = `저희 결혼식에 초대합니다 💍\n청첩장을 확인해보세요!\n${window.location.href}`;
        window.location.href = `sms:?body=${encodeURIComponent(text)}`;
    };

    // 스타일
    const baseWrapper = "fixed right-6 z-50 transition-all duration-500 ease-out will-change-transform flex flex-col items-center gap-3";
    const phaseStyle = {
        hidden: "pointer-events-none opacity-0 translate-y-6 bottom-4",
        peek:   "opacity-70 translate-y-1 bottom-6",
        show:   "opacity-100 translate-y-0 bottom-6",
    };

    // 하위 버튼 공통 스타일
    const subButtonStyle = `w-10 h-10 flex items-center justify-center rounded-full shadow-md bg-white border transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-8 pointer-events-none'}`;

    return (
        <div className={`${baseWrapper} ${phaseStyle[phase]}`}>

            {/* 펼쳐지는 버튼들 */}
            <div className={`flex flex-col gap-3 ${isOpen ? 'mb-2' : 'mb-0'}`}>

                {/* 라인 버튼 */}
                <button
                    onClick={shareToLine}
                    className={subButtonStyle}
                    aria-label="라인으로 공유하기"
                    style={{ transitionDelay: isOpen ? '100ms' : '0ms' }}
                >
                    {/* 라인 브랜드 컬러 (#06C755) 텍스트 */}
                    <span className="text-[10px] font-bold text-[#06C755] tracking-tighter">LINE</span>
                </button>

                {/* 카카오 버튼 */}
                <button
                    onClick={shareToKakao}
                    className={subButtonStyle}
                    aria-label="카카오톡으로 공유하기"
                    style={{ transitionDelay: isOpen ? '0ms' : '50ms' }}
                >
                    {/* 카카오 브랜드 컬러 (#3C1E1E) 텍스트 */}
                    <span className="text-[9px] font-bold text-[#3C1E1E] tracking-tighter">KAKAO</span>
                </button>
            </div>

            {/* 메인 토글 버튼 (공유 아이콘) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-12 h-12 flex items-center justify-center rounded-full border bg-white/90 shadow-md hover:bg-neutral-100 transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
                aria-label="공유 메뉴 열기"
            >
                {isOpen ? <PlusIcon /> : <ShareIcon />}
            </button>
        </div>
    );
}

// 아이콘 컴포넌트
function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );
}

function ShareIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
    );
}