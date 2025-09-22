import React, { useEffect, useMemo, useRef, useState } from "react";

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

export default function ResponsivePicture({
  picture,
  alt,
  sizes = "100vw",
  className,         // <picture> 용
  imgClassName,      // <img> 용 (신규)
  fetchPriority = "auto",
  loading = "lazy",
  decoding = "async",
  fit = "cover",     // "cover" | "longer-side"
}) {
  if (!picture) return null;

  const sources = normalizeSources(picture.sources);
  const img = picture.img || {};
  if (!img.src) return null;

  const imgRef = useRef(null);
  const [isPortraitViewport, setIsPortraitViewport] = useState(
    window.innerHeight > window.innerWidth
  );

  // fetchpriority: 경고 없이 DOM 속성으로만 세팅
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    if (fetchPriority && fetchPriority !== "auto") {
      el.setAttribute("fetchpriority", fetchPriority);
    } else {
      el.removeAttribute("fetchpriority");
    }
  }, [fetchPriority]);

  // 뷰포트 긴 축 기준 모드
  useEffect(() => {
    if (fit !== "longer-side") return;
    const onResize = () => {
      setIsPortraitViewport(window.innerHeight > window.innerWidth);
    };
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [fit]);

  const imgStyle = useMemo(() => {
    if (fit === "longer-side") {
      // 긴 축 기준: 포트레이트면 세로 100dvh, 랜드스케이프면 가로 100vw
      return isPortraitViewport
        ? { height: "100dvh", width: "auto", objectFit: "cover", objectPosition: "center" }
        : { width: "100vw", height: "auto", objectFit: "cover", objectPosition: "center" };
    }
    // 기본 cover 모드: 부모가 사이즈를 책임지고, 이미지는 가득 채움
    return { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" };
  }, [fit, isPortraitViewport]);

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
