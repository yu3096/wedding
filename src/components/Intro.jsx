import React from "react";
import SvgStaggerText from "@/components/SvgStaggerText";
import { getJosa } from "@/lib/hangul";

export default function Intro() {
    // ⬇️ Lock scroll while Intro is visible
    React.useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    // ⬇️ Get target from URL
    const queryParams = new URLSearchParams(window.location.search);
    const targetText = queryParams.get("target") || "소중한 분들";
    // const particle = getJosa(targetText, "과/와"); // Intro doesn't strictly need particle if it's just "Dear."

    return (
        <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center pointer-events-none">
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
                    text={`DEAR. ${targetText}`}
                    step={80}
                    className="fill-white/90 uppercase tracking-[0.2em] font-sans font-medium"
                    style={{ filter: "url(#shadow-intro)", fontSize: "clamp(20px, 7vw, 24px)" }}
                />

                <SvgStaggerText
                    x="50%" y="54%"
                    text="소중한 당신을 초대합니다."
                    step={50}
                    className="fill-white/80 font-sans font-light tracking-widest"
                    style={{ filter: "url(#shadow-intro)", fontSize: "clamp(14px, 4vw, 16px)" }}
                />

                <SvgStaggerText
                    x="50%" y="90%"
                    text="보다 더 나은 모바일청첩장을 위하여 로딩 완료 후, 페이지가 넘어갑니다."
                    step={30}
                    className="fill-white/40 font-sans font-light tracking-wider"
                    style={{ fontSize: "10px" }}
                />
            </svg>
        </div>
    );
}
