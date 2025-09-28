import React, { useState } from "react";
import { trackEvent } from "@/lib/ga.js";

async function copyModern(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

function copyLegacy(text) {
    try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
    } catch {
        return false;
    }
}

export default function ShareLink({
                                      className = "px-4 py-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600",
                                      label = "공유하기",
                                      copyLabel = "링크 복사",
                                      successLabel = "복사 완료!",
                                      // 공유할 정보 (기본값은 현재 페이지)
                                      title = "우리 결혼식에 초대합니다 💍",
                                      text = "청첩장을 확인해 주세요!",
                                      url, // 미지정 시 window.location.href
                                      // 콜백 & GA 옵션
                                      onShared, // Web Share 성공 시
                                      onCopied, // 복사 성공 시
                                      ga = { enable: false, action: "share_click", params: { event_category: "share", event_label: "auto" } },
                                  }) {
    const [copied, setCopied] = useState(false);

    const fireGA = (when = "share") => {
        if (!ga?.enable) return;
          if (typeof trackEvent === "function") {
            trackEvent(ga.action || "share_click", {...(ga.params || {}), when});
          }
    };

    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

    const handleClick = async () => {
        // 1) 모바일 Web Share API 우선
        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share({ title, text, url: shareUrl });
                fireGA("share"); // Web Share 성공
                onShared?.();
                return;
            } catch (e) {
                // 사용자가 취소했거나 실패 → 복사 fallback 시도
                // console.warn("Web Share canceled/failed", e);
            }
        }

        // 2) 복사 fallback
        let ok = false;
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            ok = await copyModern(shareUrl);
        }
        if (!ok) ok = copyLegacy(shareUrl);
        if (!ok) {
            // 최후의 수단
            window.prompt("아래 링크를 길게 눌러 복사하세요", shareUrl);
            return;
        }

        setCopied(true);
        fireGA("copy");
        onCopied?.();
        setTimeout(() => setCopied(false), 1500);
    };

    // 지원 여부에 따라 버튼 라벨을 다르게 (선택)
    const isWebShareSupported = typeof navigator !== "undefined" && !!navigator.share;
    const buttonText = copied ? successLabel : (isWebShareSupported ? label : copyLabel);

    return (
        <button type="button" onClick={handleClick} className={className} aria-live="polite">
            {buttonText}
        </button>
    );
}
