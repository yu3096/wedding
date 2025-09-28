// useSectionTracking.js
import { useEffect } from "react";

export default function useSectionTracking(options = {}) {
    useEffect(() => {
        if (!window.gtag) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.target.id) {
                        window.gtag("event", "view_section", {
                            event_category: "section",
                            event_label: entry.target.id,
                        });
                    }
                });
            },
            { threshold: options.threshold || 0.5 }
        );

        // 페이지 안의 모든 <section id="..."> 자동 추적
        const targets = document.querySelectorAll("section[id], footer[id]");
        targets.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [options]);
}
