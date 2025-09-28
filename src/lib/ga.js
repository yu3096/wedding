// GA 초기화
export function initGA() {
    const GA_ID = import.meta.env.VITE_GA_ID;

    if (!GA_ID) {
        console.warn("GA Measurement ID가 설정되지 않았습니다. (.env 확인 필요)");
        return;
    }

    // 이미 gtag 스크립트가 있으면 중복 삽입 방지
    if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_ID}"]`)) {
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);
    }

    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", GA_ID, {
        send_page_view: true,
    });
}

// 이벤트 트래킹 헬퍼
export function trackEvent(action, params = {}) {
    if (!window.gtag) return;
    window.gtag("event", action, params);
}
