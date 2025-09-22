import React, { useEffect, useRef } from "react";

/** 배열/객체 모두 지원하도록 sources 정규화 */
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
  className,
  // 'high' | 'low' | 'auto'
  fetchPriority = "auto",
  loading = "lazy",
  decoding = "async",
}) {
  if (!picture) return null;

  const sources = normalizeSources(picture.sources);
  const img = picture.img || {};
  if (!img.src) return null;

  const imgRef = useRef(null);

  // ⚠️ React 경고 없이 DOM 속성으로만 세팅
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    if (fetchPriority && fetchPriority !== "auto") {
      el.setAttribute("fetchpriority", fetchPriority); // 'high' | 'low'
    } else {
      el.removeAttribute("fetchpriority");
    }
  }, [fetchPriority]);

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
        style={{ width: "100%", height: "auto" }}
      />
    </picture>
  );
}