import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY // (= anon / publishable key)
);

/**
 * 단일 파일에 대해 Signed URL 발급
 * @param {string} bucket
 * @param {string} path  - 예: "mobile-img/cover.jpg"
 * @param {number} expiresIn - 초 단위
 */
export async function getSignedUrl(bucket, path, expiresIn = 60) {
    const { data, error } = await supabase
        .storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
}

/**
 * 특정 디렉토리 목록을 Signed URL 배열로 변환
 * @returns {Promise<Array<{ path: string, signedUrl: string }>>}
 */
export async function getSignedUrlsInDir(bucket, dir, expiresIn = 60) {
    // 1) dir 정규화 (앞/뒤 슬래시 정리)
    const normalizedDir = String(dir || "")
        .replace(/^\/+/, "")   // 앞 슬래시 제거
        .replace(/\/+$/, "");  // 뒤 슬래시 제거

    const { data: files, error } = await supabase
        .storage
        .from(bucket)
        .list(normalizedDir, { limit: 100, offset: 0 });

    if (error) throw error;

    const IMG_EXT = /\.(jpe?g|png|webp|gif|svg|bmp|avif)$/i;

    // 2) 파일만 추리고, 숨김/보조파일 제외 + 이미지 확장자만 허용
    const fileNames = (files || [])
        .filter((f) => {
            // 폴더는 보통 metadata가 없거나 size가 없음
            if (!f?.metadata || typeof f.metadata.size !== "number") return false;

            const name = f.name || "";
            if (!name) return false;

            // 숨김/보조 파일 제외 (.DS_Store, ._xxx 등)
            if (name.startsWith(".") || name.startsWith("._")) return false;

            // 이미지 확장자만 허용
            if (!IMG_EXT.test(name)) return false;

            return true;
        })
        .map((f) => `${normalizedDir}/${f.name}`);

    if (fileNames.length === 0) return [];

    // 3) 중복 경로 제거
    const uniquePaths = Array.from(new Set(fileNames));

    // 4) 서명 URL 발급
    const { data: signed, error: signErr } = await supabase
        .storage
        .from(bucket)
        .createSignedUrls(uniquePaths, expiresIn);

    if (signErr) throw signErr;

    return (signed || []).filter(Boolean);
}

/* ------------------------ 여기서부터 '헬퍼' 이식본 ------------------------ */

/**
 * transform 옵션을 적용해 단일 사이즈의 signed URL 생성
 */
export async function signImageUrl(bucket, path, {
    ttl = 60,
    width,             // number | undefined
    quality = 80,      // 1 ~ 100
    resize = 'cover',  // 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
} = {}) {
    const transform = width ? { width, quality, resize } : undefined;

    const { data, error } = await supabase
        .storage
        .from(bucket)
        .createSignedUrl(path, ttl, transform ? { transform } : undefined);

    if (error) throw error;
    return data.signedUrl;
}

/**
 * 여러 width로 signed URL을 만들어 srcSet 문자열을 생성
 * 반환: { src, srcSet, map }
 */
export async function buildSrcSet(bucket, path, {
    widths = [480, 768, 1024, 1440],
    ttl = 60,
    quality = 80,
    resize = 'cover',
    fallbackWidth = 768, // <img src>로 쓸 기본 너비
} = {}) {
    const uniq = Array.from(new Set(widths.concat([fallbackWidth]))).sort((a, b) => a - b);

    const results = await Promise.all(
        uniq.map(async (w) => [w, await signImageUrl(bucket, path, { ttl, width: w, quality, resize })])
    );

    const map = Object.fromEntries(results);
    const srcSet = results.map(([w, url]) => `${url} ${w}w`).join(', ');
    const src = map[fallbackWidth];

    return { src, srcSet, map };
}

/**
 * <img>에 바로 스프레드 가능한 속성 생성
 * 사용: const attrs = await getResponsiveImgAttrs(...); <img {...attrs} />
 */
export async function getResponsiveImgAttrs(bucket, path, {
    widths = [480, 768, 1024, 1440],
    sizes = '100vw',
    ttl = 60,
    quality = 80,
    resize = 'cover',
    fallbackWidth = 768,
    alt = '',
    loading = 'lazy',
    decoding = 'async',
    className,
    style,
    fetchPriority = 'auto', // setAttribute로 붙일 것을 권장(경고 방지)
} = {}) {
    const { src, srcSet } = await buildSrcSet(bucket, path, {
        widths, ttl, quality, resize, fallbackWidth
    });

    return {
        src,
        srcSet,
        sizes,
        alt,
        loading,
        decoding,
        className,
        style,
        fetchPriority, // 참고용(컴포넌트에서 setAttribute로 세팅)
    };
}
