import React from "react";
import SvgStaggerText from "@/components/SvgStaggerText";
import { parseYYYYMMDD, format, DATE_PRESETS } from "@/lib/dateFormat.js";
import { getJosa } from "@/lib/hangul";

export default function Intro({ percent = 0, isOpen = true, wedding }) {
    // ⬇️ Lock scroll while Intro is visible (특히 iOS 웹뷰 타겟)
    React.useEffect(() => {
        // 기존 스크롤 위치 및 스타일 저장
        const scrollY = window.scrollY;
        const originalStyle = window.getComputedStyle(document.body).cssText;

        // body를 강제 고정하여 스크롤 완전 차단
        document.body.style.cssText = `
            position: fixed;
            top: -${scrollY}px;
            left: 0;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            overscroll-behavior: none;
            touch-action: none;
        `;

        return () => {
            // Intro 언마운트 시(닫힐 때) 스타일 원복 및 스크롤 위치 복구
            document.body.style.cssText = originalStyle;
            window.scrollTo(0, scrollY);
        };
    }, []);

    // ⬇️ Get target from URL
    const queryParams = new URLSearchParams(window.location.search);
    const targetText = queryParams.get("target") || "소중한 분들";
    // const particle = getJosa(targetText, "과/와"); // Intro doesn't strictly need particle if it's just "Dear."

    // ⬇️ D-Day & Wedding Date for Closed State
    let dDayText = "COMING SOON";
    let weddingDateText = "모바일 청첩장을 준비 중입니다.";
    let subText = "소중한 분들을 모시기 위해 준비 중입니다.";

    if (!isOpen && wedding?.weddingDate) {
        try {
            const weddingDateObj = parseYYYYMMDD(wedding.weddingDate);
            weddingDateText = format(wedding.weddingDate, DATE_PRESETS.KOREAN, { includeWeekday: true });

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const target = new Date(weddingDateObj);
            target.setHours(0, 0, 0, 0);

            const diffTime = target.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                dDayText = `D - ${diffDays}`;
            } else if (diffDays === 0) {
                dDayText = "D - DAY";
            } else {
                dDayText = `D + ${Math.abs(diffDays)}`;
            }
        } catch (e) {
            // parsing fallback
        }
    }

    return (
        <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-none bg-black">
            <svg
                className="w-full h-full"
                viewBox="0 0 1440 900"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
            >
                <defs>
                    <filter id="shadow-intro" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
                    </filter>
                </defs>

                <SvgStaggerText
                    x="50%" y="42%"
                    text={isOpen ? `DEAR. ${targetText}` : dDayText}
                    step={80}
                    className="fill-white/90 uppercase tracking-[0.2em] font-sans font-medium"
                    style={{ filter: "url(#shadow-intro)", fontSize: "clamp(20px, 7vw, 24px)" }}
                />

                <SvgStaggerText
                    x="50%" y="54%"
                    text={isOpen ? "소중한 당신을 초대합니다." : weddingDateText}
                    step={50}
                    className="fill-white/80 font-sans font-light tracking-widest"
                    style={{ filter: "url(#shadow-intro)", fontSize: "clamp(14px, 4vw, 16px)" }}
                />

                <SvgStaggerText
                    x="50%" y="90%"
                    text={isOpen ? "보다 더 나은 모바일청첩장을 위하여 로딩 완료 후, 페이지가 넘어갑니다." : subText}
                    step={30}
                    className="fill-white/40 font-sans font-light tracking-wider"
                    style={{ fontSize: "10px" }}
                />

                {/* ⬇️ Loading Bar */}
                {isOpen && (
                    <>
                        <rect
                            x="620"
                            y="750"
                            width="200"
                            height="1"
                            className="fill-white/30"
                        />
                        <rect
                            x="620"
                            y="750"
                            width={200 * (percent / 100)}
                            height="1"
                            className="fill-white/90 transition-[width] duration-300 ease-out"
                        />
                    </>
                )}
            </svg>
        </div>
    );
}
