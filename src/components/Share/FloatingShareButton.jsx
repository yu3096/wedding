import React, { useEffect, useState, useRef } from "react";
import { useWeddingInfo } from "@/context/WeddingInfoProvider.jsx";

function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }

export default function FloatingShareButton() {
    const { wedding } = useWeddingInfo();

    // 스크롤에 따른 버튼 노출 상태 ('hidden' | 'peek' | 'show')
    const [phase, setPhase] = useState("hidden");
    // 공유 메뉴가 열렸는지 여부
    const [isOpen, setIsOpen] = useState(false);

    const ticking = useRef(false);

    // 아이콘 경로 (public/icons 폴더에 있다고 가정, 없으면 텍스트나 SVG로 대체 가능)
    const kakaoIcon = `${import.meta.env.BASE_URL}/icons/kakao.svg`;
    // 라인 아이콘이 없다면 아래 SVG 코드를 사용하거나 경로를 수정하세요.
    const lineIcon = `${import.meta.env.BASE_URL}/icons/line.png`; // 혹은 svg

    // 1. Kakao SDK init
    useEffect(() => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
        }
    }, []);

    // 2. 스크롤 감지 로직 (기존 유지)
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

    // 메뉴 닫기 헬퍼 (스크롤 등으로 phase가 hidden이 되면 메뉴도 닫기)
    useEffect(() => {
        if (phase === 'hidden') {
            setIsOpen(false);
        }
    }, [phase]);

    // 3. 카카오 공유 함수
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
        setIsOpen(false); // 공유 후 메뉴 닫기
    };

    // 4. 라인 공유 함수 (새로 추가됨)
    const shareToLine = () => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent("저희 결혼식에 초대합니다 💍\n청첩장을 확인해보세요!");
        // 라인 공유 URL 스킴
        window.open(`https://line.me/R/msg/text/?${text}%0A${url}`, '_blank');

        setIsOpen(false); // 공유 후 메뉴 닫기
    };

    const fallbackToSMS = () => {
        const text = `저희 결혼식에 초대합니다 💍\n청첩장을 확인해보세요!\n${window.location.href}`;
        window.location.href = `sms:?body=${encodeURIComponent(text)}`;
    };

    // 스타일 정의
    const baseWrapper = "fixed right-6 z-50 transition-all duration-500 ease-out will-change-transform flex flex-col items-center gap-3";
    const phaseStyle = {
        hidden: "pointer-events-none opacity-0 translate-y-6 bottom-4",
        peek:   "opacity-70 translate-y-1 bottom-6",
        show:   "opacity-100 translate-y-0 bottom-6",
    };

    // 작은 버튼들 스타일
    const subButtonStyle = `w-10 h-10 flex items-center justify-center rounded-full shadow-md bg-white border transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-8 pointer-events-none'}`;

    return (
        <div className={`${baseWrapper} ${phaseStyle[phase]}`}>

            {/* 옵션 버튼 그룹 (라인 & 카카오) */}
            <div className={`flex flex-col gap-3 ${isOpen ? 'mb-2' : 'mb-0'}`}>

                {/* 라인 버튼 */}
                <button
                    onClick={shareToLine}
                    className={subButtonStyle}
                    aria-label="라인으로 공유하기"
                    style={{ transitionDelay: isOpen ? '100ms' : '0ms' }} // 순차 등장 효과
                >
                    {/* 라인 아이콘: 이미지가 있다면 img 태그 사용, 없다면 아래 텍스트나 SVG 사용 */}
                    <span className="text-[10px] font-bold text-[#06C755]">LINE</span>
                    {/* <img src={lineIcon} alt="Line" className="w-6 h-6" /> */}
                </button>

                {/* 카카오 버튼 */}
                <button
                    onClick={shareToKakao}
                    className={subButtonStyle}
                    aria-label="카카오톡으로 공유하기"
                    style={{ transitionDelay: isOpen ? '0ms' : '50ms' }}
                >
                    <img src={kakaoIcon} alt="Kakao" className="w-5 h-5" />
                </button>
            </div>

            {/* 메인 토글 버튼 (공유 아이콘) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-12 h-12 flex items-center justify-center rounded-full border bg-white/90 shadow-md hover:bg-neutral-100 transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
                aria-label="공유 메뉴 열기"
            >
                {isOpen ? (
                    // 닫기(X) 아이콘 효과를 위해 + 아이콘을 45도 회전시킴 (위 클래스에서 rotate-45 처리)
                    <PlusIcon />
                ) : (
                    // 평소에는 공유 아이콘
                    <ShareIcon />
                )}
            </button>
        </div>
    );
}

// 간단한 SVG 아이콘 컴포넌트들
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