import React, { useCallback, useEffect, useRef, useState } from "react";
import useReveal from "./useReveal";
import { trackEvent } from "@/lib/ga.js";
import { getGithubGalleryImages } from "@/lib/github-storage.js";

/**
 * Gallery (정적 URL 기반)
 */
export default function Gallery({ onLoadComplete }) {
    const { ref, visible } = useReveal();

    // 동기식 이미지 로딩
    const [images] = useState(() =>
        getGithubGalleryImages().map(img => ({
            path: img.url,
            signedUrl: img.url,
            originalUrl: img.url.replace('/gallery-sm/', '/gallery/'),
            position: img.position
        }))
    );
    const [visibleCount, setVisibleCount] = useState(12);

    const loading = false;
    const loadError = null;

    // 모달
    const [activeIndex, setActiveIndex] = useState(null);
    const isOpen = activeIndex !== null;

    // 스와이프
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // 스크롤 잠금/해제
    const _unlockersRef = useRef(null);
    const lockBodyScroll = useCallback(() => {
        if (_unlockersRef.current) return;

        // const html = document.documentElement;
        // const body = document.body;
        // const sbw = window.innerWidth - html.clientWidth;
        // if (sbw > 0) {
        //     html.style.paddingRight = `${sbw}px`;
        //     body.style.paddingRight = `${sbw}px`;
        // }
        // html.style.overflow = "hidden";
        // body.style.overflow = "hidden";

        const preventScroll = (e) => {
            if (e.type === "keydown") {
                const blockedKeys = new Set([
                    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
                    "PageUp", "PageDown", "Home", "End", " ",
                ]);
                if (blockedKeys.has(e.key)) e.preventDefault();
            } else {
                e.preventDefault();
            }
        };
        document.addEventListener("wheel", preventScroll, { passive: false });
        document.addEventListener("touchmove", preventScroll, { passive: false });
        document.addEventListener("keydown", preventScroll);

        _unlockersRef.current = () => {
            // html.style.overflow = "";
            // body.style.overflow = "";
            // html.style.paddingRight = "";
            // body.style.paddingRight = "";
            document.removeEventListener("wheel", preventScroll);
            document.removeEventListener("touchmove", preventScroll);
            document.removeEventListener("keydown", preventScroll);
            _unlockersRef.current = null;
        };
    }, []);
    const unlockBodyScroll = useCallback(() => {
        if (_unlockersRef.current) _unlockersRef.current();
    }, []);

    // 컴포넌트 마운트 시 로드 완료됨을 알림
    useEffect(() => {
        onLoadComplete?.();
    }, [onLoadComplete]);

    // 모달 상태 따라 스크롤 잠금
    useEffect(() => {
        if (isOpen) lockBodyScroll();
        else unlockBodyScroll();
    }, [isOpen, lockBodyScroll, unlockBodyScroll]);

    // 키보드 네비게이션
    const prev = useCallback(() => {
        if (!isOpen || images.length === 0) return;
        setActiveIndex((i) => (i - 1 + images.length) % images.length);
    }, [isOpen, images.length]);

    const next = useCallback(() => {
        if (!isOpen || images.length === 0) return;
        setActiveIndex((i) => (i + 1) % images.length);
    }, [isOpen, images.length]);

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") closeModal();
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, prev, next]);

    // 스와이프
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

    // 모달 열기/닫기
    const openModal = useCallback((idx) => {
        setActiveIndex(idx);
        try {
            trackEvent?.("gallery_view_image", {
                event_category: "gallery",
                event_label: `idx-${idx}`,
            });
        } catch { }
    }, []);
    const closeModal = useCallback(() => setActiveIndex(null), []);

    // UI --------------------------------------------------------------------------------
    return (
        <section ref={ref} id="gallery" className="py-8 sm:py-12 container mx-auto px-4">
            {/* 타이틀 */}
            <div
                className={`max-w-3xl mx-auto text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    }`}
            >
                <p className="uppercase tracking-[0.3em] text-sm text-neutral-500">사진을 터치하시면 더 큰 이미지로<br />감상하실 수 있어요.</p>
            </div>

            {/* 상태 표시 */}
            {loading && (
                <div className="mt-8 text-center text-neutral-500">이미지를 불러오는 중…</div>
            )}
            {loadError && (
                <div className="mt-8 text-center text-red-500">에러: {loadError}</div>
            )}

            {/* 썸네일 그리드 */}
            {!loading && !loadError && (
                <>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        {images.slice(0, visibleCount).map(({ path, signedUrl, position }, idx) => (
                            <button
                                type="button"
                                key={path}
                                className="group relative overflow-hidden rounded-2xl border w-[208px] h-[208px] shrink-0"
                                onClick={() => openModal(idx)}
                                aria-label={`이미지 ${idx + 1} 확대 보기`}
                            >
                                <img
                                    src={signedUrl}
                                    alt={`gallery-${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-[1.03] transition"
                                    style={{ objectPosition: position }}
                                    draggable={false}
                                    loading="lazy"
                                    decoding="async"
                                />
                            </button>
                        ))}

                        {images.length === 0 && (
                            <div className="col-span-full text-center text-neutral-500">
                                폴더에 표시할 이미지가 없습니다.
                            </div>
                        )}
                    </div>

                    {/* 더 보기 버튼 */}
                    {visibleCount < images.length && (
                        <div className="mt-10 flex justify-center">
                            <button
                                type="button"
                                onClick={() => setVisibleCount((prev) => prev + 12)}
                                className="group px-8 py-3 rounded-full border border-neutral-200 bg-white text-neutral-600 text-[15px] hover:bg-neutral-50 transition-all shadow-sm flex items-center gap-2"
                            >
                                <span>사진 더 보기</span>
                                <span className="text-neutral-400 text-sm">({images.length - visibleCount}장 남음)</span>
                                <svg className="w-5 h-5 text-neutral-400 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* 모달 */}
            {isOpen && images[activeIndex] && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center select-none"
                    onClick={closeModal}
                >
                    {/* 닫기 버튼 (우측 상단 완전히 고정) */}
                    <button
                        type="button"
                        aria-label="닫기"
                        onClick={closeModal}
                        className="fixed z-[60] h-11 w-11 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur flex items-center justify-center transition"
                        style={{
                            top: "max(1.5rem, env(safe-area-inset-top))",
                            right: "max(1.5rem, env(safe-area-inset-right))",
                        }}
                    >
                        <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
                            <path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>

                    {/* 사진과 버튼을 담는 전체화면 고정 래퍼 */}
                    <div
                        className="relative w-full h-[100dvh] flex items-center justify-center max-w-7xl mx-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ◀ 이전 버튼 (화면 왼쪽 끝에 완전히 고정) */}
                        <button
                            type="button"
                            aria-label="이전 이미지"
                            onClick={prev}
                            className="absolute left-4 sm:left-8 z-[60] h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur flex items-center justify-center transition"
                        >
                            <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden="true">
                                <path fill="currentColor" d="M15.41 7.41 14 6 8 12l6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>

                        {/* 확대 이미지 (비율 유지하며 고정된 영역 안에서 제일 크게) */}
                        <img
                            src={images[activeIndex].originalUrl}
                            alt={`gallery-large-${activeIndex + 1}`}
                            className="w-full h-full object-contain p-2 sm:p-12"
                            draggable={false}
                            onTouchStart={onTouchStart}
                            onTouchEnd={onTouchEnd}
                        />

                        {/* ▶ 다음 버튼 (화면 오른쪽 끝에 완전히 고정) */}
                        <button
                            type="button"
                            aria-label="다음 이미지"
                            onClick={next}
                            className="absolute right-4 sm:right-8 z-[60] h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur flex items-center justify-center transition"
                        >
                            <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden="true">
                                <path fill="currentColor" d="m10 6-1.41 1.41L13.17 12l-4.58 4.59L10 18l6-6z" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}