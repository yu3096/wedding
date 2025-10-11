import React, { useCallback, useEffect, useRef, useState } from "react";
import useReveal from "./useReveal";
import { trackEvent } from "@/lib/ga.js";

/** ----------------------------------------------------------------
 * 샘플 이미지 목록 (원하시는 이미지 경로/URL로 교체하세요)
 * ---------------------------------------------------------------- */
const sampleImages = [
    "https://images.unsplash.com/photo-1520962918287-7448c2878f65?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1528712306091-ed0763094c98?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522000279350-0a93d6b54f05?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
];

/** ----------------------------------------------------------------
 * GA 이벤트 헬퍼 (선택)
 * ---------------------------------------------------------------- */
function trackGalleryOpen(identifier) {
    try {
        trackEvent?.("gallery_view_image", {
            event_category: "gallery",
            event_label: identifier,
        });
    } catch {}
}

/** ----------------------------------------------------------------
 * 스크롤 잠금/해제 (overflow + 이벤트 차단 방식 → 맨 위 점프 없음)
 * ---------------------------------------------------------------- */
let _unlockers = null;

function lockBodyScroll() {
    if (_unlockers) return; // 이미 잠겨있다면 무시

    const html = document.documentElement;
    const body = document.body;

    // 스크롤바 사라지는 폭 보정
    const sbw = window.innerWidth - html.clientWidth;
    if (sbw > 0) {
        html.style.paddingRight = `${sbw}px`;
        body.style.paddingRight = `${sbw}px`;
    }

    // overflow만 막음 (position 고정 X → 점프 없음)
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    // 이벤트 차단 (휠/터치/키보드)
    const preventScroll = (e) => {
        if (e.type === "keydown") {
            const blockedKeys = new Set([
                "ArrowUp","ArrowDown","ArrowLeft","ArrowRight",
                "PageUp","PageDown","Home","End"," ",
            ]);
            if (blockedKeys.has(e.key)) e.preventDefault();
        } else {
            e.preventDefault();
        }
    };
    document.addEventListener("wheel", preventScroll, { passive: false });
    document.addEventListener("touchmove", preventScroll, { passive: false });
    document.addEventListener("keydown", preventScroll);

    _unlockers = () => {
        html.style.overflow = "";
        body.style.overflow = "";
        html.style.paddingRight = "";
        body.style.paddingRight = "";
        document.removeEventListener("wheel", preventScroll);
        document.removeEventListener("touchmove", preventScroll);
        document.removeEventListener("keydown", preventScroll);
        _unlockers = null;
    };
}

function unlockBodyScroll() {
    if (_unlockers) _unlockers();
}

/** ----------------------------------------------------------------
 * 메인 컴포넌트
 * ---------------------------------------------------------------- */
export default function Gallery() {
    const { ref, visible } = useReveal();

    const [activeIndex, setActiveIndex] = useState(null);
    const isOpen = activeIndex !== null;

    // 스와이프 제스처용
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    /** 모달 열기 */
    const openModal = useCallback((idx) => {
        setActiveIndex(idx);
        trackGalleryOpen(`idx-${idx}`);
    }, []);

    /** 모달 닫기 */
    const closeModal = useCallback(() => {
        setActiveIndex(null);
    }, []);

    /** 이전 / 다음 */
    const prev = useCallback(() => {
        if (!isOpen) return;
        setActiveIndex((i) => (i - 1 + sampleImages.length) % sampleImages.length);
    }, [isOpen]);

    const next = useCallback(() => {
        if (!isOpen) return;
        setActiveIndex((i) => (i + 1) % sampleImages.length);
    }, [isOpen]);

    /** 키보드 이벤트 */
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") closeModal();
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, closeModal, prev, next]);

    /** 열릴 때 잠그고 닫힐 때 해제 */
    useEffect(() => {
        if (isOpen) lockBodyScroll();
        else unlockBodyScroll();
    }, [isOpen]);

    /** 스와이프 핸들링 */
    const onTouchStart = (e) => {
        touchStartX.current = e.changedTouches[0].clientX;
    };
    const onTouchEnd = (e) => {
        touchEndX.current = e.changedTouches[0].clientX;
        const dx = touchEndX.current - touchStartX.current;
        const threshold = 40;
        if (Math.abs(dx) > threshold) {
            if (dx > 0) prev();
            else next();
        }
    };

    return (
        <section
            ref={ref}
            id="gallery"
            className="py-16 sm:py-24 container mx-auto px-4"
        >
            {/* 타이틀 */}
            <div
                className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
            >
                <p className="uppercase tracking-[0.3em] text-sm text-neutral-500">
                    우리의 순간
                </p>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
                    사진을 터치하시면 더 큰 이미지로 감상하실 수 있어요.
                </h2>
            </div>

            {/* 썸네일 그리드 */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                {sampleImages.map((src, idx) => (
                    <button
                        type="button"
                        key={src}
                        className="group relative overflow-hidden rounded-2xl border"
                        onClick={() => openModal(idx)}
                        aria-label={`이미지 ${idx + 1} 확대 보기`}
                    >
                        <img
                            src={src}
                            alt={`gallery-${idx + 1}`}
                            className="w-full h-40 md:h-44 object-cover group-hover:scale-[1.03] transition"
                            draggable={false}
                            loading="lazy"
                            decoding="async"
                        />
                    </button>
                ))}
            </div>

            {/* 모달 */}
            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div
                        className="relative max-h-[90vh] max-w-[94vw] select-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 좌우 버튼 */}
                        <button
                            type="button"
                            aria-label="이전 이미지"
                            onClick={prev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur flex items-center justify-center"
                        >
                            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white">
                                <path fill="currentColor" d="M15.41 7.41 14 6 8 12l6 6 1.41-1.41L10.83 12z"/>
                            </svg>
                        </button>
                        <button
                            type="button"
                            aria-label="다음 이미지"
                            onClick={next}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur flex items-center justify-center"
                        >
                            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white">
                                <path fill="currentColor" d="m10 6-1.41 1.41L13.17 12l-4.58 4.59L10 18l6-6z"/>
                            </svg>
                        </button>

                        {/* 닫기 */}
                        <button
                            type="button"
                            aria-label="닫기"
                            onClick={closeModal}
                            className="absolute -right-2 -top-2 translate-x-full -translate-y-1/2 h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur flex items-center justify-center"
                        >
                            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white">
                                <path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>

                        {/* 확대 이미지 */}
                        <img
                            src={sampleImages[activeIndex]}
                            alt={`gallery-large-${activeIndex + 1}`}
                            className="max-h-[90vh] max-w-[94vw] rounded-xl shadow-2xl object-contain"
                            draggable={false}
                            onTouchStart={onTouchStart}
                            onTouchEnd={onTouchEnd}
                        />
                    </div>
                </div>
            )}
        </section>
    );
}
