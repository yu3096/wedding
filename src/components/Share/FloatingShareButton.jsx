import React, { useEffect, useState } from "react";
import ShareLink from "@/components/Share/ShareLink.jsx";

export default function FloatingShareButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const hero = document.getElementById("hero");
        if (!hero) return;

        const handleScroll = () => {
            const rect = hero.getBoundingClientRect();
            // hero 섹션이 화면에 걸쳐 있으면 버튼 숨김
            if (rect.bottom > 80) {
                setVisible(false);
            } else {
                setVisible(true);
            }
        };

        handleScroll(); // 초기 체크
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 transition-opacity duration-500 ${
                visible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
            <ShareLink
                className="px-4 py-2 rounded-xl border border-neutral-300 bg-white/90 backdrop-blur-sm
                   shadow-sm hover:bg-white text-sm font-sans text-neutral-700 transition"
                label="공유하기"
                copyLabel="링크 복사"
                successLabel="복사됨!"
                ga={{ enable: true, action: "share_click", params: { event_category: "share", event_label: "floating" } }}
            />
        </div>
    );
}
