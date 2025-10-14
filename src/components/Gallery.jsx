import React, { useCallback, useEffect, useRef, useState } from "react";
import useReveal from "./useReveal";
import { trackEvent } from "@/lib/ga.js";
import { getSignedUrlsInDir } from "@/lib/supabase-storage.js";

/**
 * Gallery (Supabase Signed URL 기반)
 * - props.bucket: Supabase 스토리지 버킷명 (필수)
 * - props.dir:     버킷 내 디렉토리 경로 (예: "gallery/wedding") (필수)
 * - props.expiresIn: URL 만료(초). 기본 300초(5분) 권장
 */
export default function Gallery({ bucket, dir, expiresIn = 300 }) {
    const { ref, visible } = useReveal();

    // 서명 URL 이미지 목록 [{ path, signedUrl }]
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

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

        const html = document.documentElement;
        const body = document.body;
        const sbw = window.innerWidth - html.clientWidth;
        if (sbw > 0) {
            html.style.paddingRight = `${sbw}px`;
            body.style.paddingRight = `${sbw}px`;
        }
        html.style.overflow = "hidden";
        body.style.overflow = "hidden";

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

        _unlockersRef.current = () => {
            html.style.overflow = "";
            body.style.overflow = "";
            html.style.paddingRight = "";
            body.style.paddingRight = "";
            document.removeEventListener("wheel", preventScroll);
            document.removeEventListener("touchmove", preventScroll);
            document.removeEventListener("keydown", preventScroll);
            _unlockersRef.current = null;
        };
    }, []);
    const unlockBodyScroll = useCallback(() => {
        if (_unlockersRef.current) _unlockersRef.current();
    }, []);

    // 이미지 불러오기 + 만료 전에 자동 갱신
    useEffect(() => {
        let mounted = true;
        let refreshTimer = null;

        async function fetchImages() {
            try {
                setLoading(true);
                setLoadError(null);
                const signed = await getSignedUrlsInDir(bucket, dir, expiresIn);
                if (!mounted) return;
                setImages(signed || []);
            } catch (err) {
                if (!mounted) return;
                setLoadError(err?.message || "이미지를 불러오는 중 오류가 발생했습니다.");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchImages();

        // 만료 전 재발급 (90% 지점에 갱신)
        const refreshMs = Math.max(5, Math.floor(expiresIn * 0.9)) * 1000;
        refreshTimer = setInterval(fetchImages, refreshMs);

        return () => {
            mounted = false;
            if (refreshTimer) clearInterval(refreshTimer);
        };
    }, [bucket, dir, expiresIn]);

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
        } catch {}
    }, []);
    const closeModal = useCallback(() => setActiveIndex(null), []);

    // UI --------------------------------------------------------------------------------
    return (
        <section ref={ref} id="gallery" className="py-16 sm:py-24 container mx-auto px-4">
            {/* 타이틀 */}
            <div
                className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
            >
                <p className="uppercase tracking-[0.3em] text-sm text-neutral-500">우리의 순간</p>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
                    사진을 터치하시면 더 큰 이미지로 감상하실 수 있어요.
                </h2>
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
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {images.map(({ path, signedUrl }, idx) => (
                        <button
                            type="button"
                            key={path}
                            className="group relative overflow-hidden rounded-2xl border"
                            onClick={() => openModal(idx)}
                            aria-label={`이미지 ${idx + 1} 확대 보기`}
                        >
                            <img
                                src={signedUrl}
                                alt={`gallery-${idx + 1}`}
                                className="w-full h-40 md:h-44 object-cover group-hover:scale-[1.03] transition"
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
            )}

            {/* 모달 */}
            {isOpen && images[activeIndex] && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    {/* 닫기 버튼 (항상 보임, 노치 대응) */}
                    <button
                        type="button"
                        aria-label="닫기"
                        onClick={closeModal}
                        className="fixed z-[60] h-10 w-10 rounded-full bg-black/55 hover:bg-black/65 text-white backdrop-blur ring-1 ring-white/30 focus:outline-none focus:ring-2 focus:ring-white/70 flex items-center justify-center"
                        style={{
                            top: "max(1rem, env(safe-area-inset-top))",
                            right: "max(1rem, env(safe-area-inset-right))",
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,.6))",
                        }}
                    >
                        <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
                            <path
                                fill="currentColor"
                                d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                            />
                        </svg>
                    </button>

                    <div
                        className="relative select-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 확대 이미지 (뷰포트 기준 최대 80%) */}
                        <img
                            src={images[activeIndex].signedUrl}
                            alt={`gallery-large-${activeIndex + 1}`}
                            className="rounded-xl shadow-2xl object-contain"
                            style={{ maxWidth: "80vw", maxHeight: "80vh" }}
                            draggable={false}
                            onTouchStart={onTouchStart}
                            onTouchEnd={onTouchEnd}
                        />

                        {/* ◀ 이전 / ▶ 다음 버튼 (화이트 이미지 대비 강화) */}
                        <button
                            type="button"
                            aria-label="이전 이미지"
                            onClick={prev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/15 hover:bg-black/25 text-white backdrop-blur ring-1 ring-white/30 focus:outline-none focus:ring-2 focus:ring-white/70 flex items-center justify-center"
                            style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,.7))" }}
                        >
                            <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
                                <path fill="currentColor" d="M15.41 7.41 14 6 8 12l6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            aria-label="다음 이미지"
                            onClick={next}
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/15 hover:bg-black/25 text-white backdrop-blur ring-1 ring-white/30 focus:outline-none focus:ring-2 focus:ring-white/70 flex items-center justify-center"
                            style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,.7))" }}
                        >
                            <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
                                <path fill="currentColor" d="m10 6-1.41 1.41L13.17 12l-4.58 4.59L10 18l6-6z" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}