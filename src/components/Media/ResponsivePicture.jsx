import React, { useEffect, useMemo, useRef, useState } from "react";

/** vite-imagetools의 sources 입력을 <source> 리스트로 정규화 */
function normalizeSources(sources) {
    if (!sources) return [];
    if (Array.isArray(sources)) return sources;
    if (typeof sources === "object") {
        return Object.entries(sources)
            .filter(([_, srcset]) => !!srcset)
            .map(([key, srcset]) => ({
                type: key.startsWith("image/") ? key : `image/${key}`,
                srcset,
            }));
    }
    return [];
}

/** 어떤 형태(picture URL/얕은 객체/정규 객체)로 오더라도 {sources, img:{src,srcset,w,h}}로 강제 */
function coercePicture(picture) {
    if (typeof picture === "string") {
        return { sources: [], img: { src: picture } };
    }
    if (picture && !picture.img && (picture.src || picture.srcSet || picture.srcset)) {
        const { src, srcSet, srcset, w, h, sources } = picture;
        return { sources: sources || [], img: { src, srcset: srcSet || srcset, w, h } };
    }
    return picture;
}

export default function ResponsivePicture({
                                              picture,
                                              alt,
                                              sizes = "100vw",
                                              className,        // <picture> 용
                                              imgClassName,     // <img> 용
                                              fetchPriority = "auto",
                                              loading = "lazy",
                                              decoding = "async",
                                              fit = "cover",    // "cover" | "longer-side"
                                          }) {
    // ✅ 훅은 항상 최상단에서 호출 (조건부 X)
    const imgRef = useRef(null);
    const [isPortraitViewport, setIsPortraitViewport] = useState(
        typeof window !== "undefined" ? window.innerHeight > window.innerWidth : false
    );

    // 입력 정규화
    const safePicture = useMemo(() => coercePicture(picture), [picture]);
    const sources = useMemo(() => normalizeSources(safePicture?.sources), [safePicture]);
    const img = safePicture?.img;

    // fetchpriority는 DOM 속성으로만 세팅
    useEffect(() => {
        const el = imgRef.current;
        if (!el) return;
        if (fetchPriority && fetchPriority !== "auto") {
            el.setAttribute("fetchpriority", fetchPriority);
        } else {
            el.removeAttribute("fetchpriority");
        }
    }, [fetchPriority]);

    // longer-side 모드만 방향 계산
    useEffect(() => {
        if (fit !== "longer-side") return;
        const onResize = () => setIsPortraitViewport(window.innerHeight > window.innerWidth);
        window.addEventListener("resize", onResize, { passive: true });
        window.addEventListener("orientationchange", onResize, { passive: true });
        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("orientationchange", onResize);
        };
    }, [fit]);

    // 기본은 스타일 비우고(class 우선), longer-side 때만 동적 스타일
    const imgStyle = useMemo(() => {
        if (fit === "longer-side") {
            return isPortraitViewport
                ? { height: "100dvh", width: "auto", objectFit: "cover", objectPosition: "center" }
                : { width: "100vw", height: "auto", objectFit: "cover", objectPosition: "center" };
        }
        return {};
    }, [fit, isPortraitViewport]);

    // ✅ 훅 호출 뒤에 렌더 단계에서만 조건부 반환
    if (!safePicture || !img?.src) return null;

    return (
        <picture className={className}>
            {sources.map((s, i) => (
                <source key={`${s.type}-${i}`} type={s.type} srcSet={s.srcset} sizes={sizes} />
            ))}
            <img
                ref={imgRef}
                src={img.src}
                srcSet={img.srcset}
                sizes={sizes}
                width={img.w}
                height={img.h}
                alt={alt}
                loading={loading}
                decoding={decoding}
                className={imgClassName}
                style={imgStyle}
            />
        </picture>
    );
}
