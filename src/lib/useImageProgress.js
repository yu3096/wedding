import { useEffect, useRef, useState } from "react";

/**
 * 이미지 URL을 스트리밍으로 받아서 로컬 Blob URL을 생성하고,
 * 진행률(%)을 반환합니다. (Content-Length가 없으면 퍼센트 대신 'indeterminate' 모드)
 */
export default function useImageProgress(src, options = {}) {
    const { withCredentials = false } = options;

    const [status, setStatus] = useState("idle"); // idle | loading | loaded | error
    const [percent, setPercent] = useState(0);    // 0~100
    const [mode, setMode] = useState("determinate"); // determinate | indeterminate
    const [objectUrl, setObjectUrl] = useState(null);
    const objectUrlRef = useRef(null);

    useEffect(() => {
        if (!src) return;

        let isCancelled = false;
        const controller = new AbortController();

        // 초기화
        setStatus("loading");
        setPercent(0);
        setMode("determinate");

        const fetchImage = async () => {
            try {
                const response = await fetch(src, {
                    signal: controller.signal,
                    credentials: withCredentials ? "include" : "same-origin",
                });
                if (!response.ok || !response.body) {
                    throw new Error(`Image fetch failed: ${response.status}`);
                }

                const contentLengthHeader = response.headers.get("Content-Length");
                const total = contentLengthHeader ? parseInt(contentLengthHeader, 10) : NaN;
                if (!Number.isFinite(total) || total <= 0) {
                    // 퍼센트 계산 불가 → indeterminate 모드로 전환
                    setMode("indeterminate");
                }

                const reader = response.body.getReader();
                let received = 0;
                const chunks = [];

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                    received += value.length;

                    if (Number.isFinite(total) && total > 0) {
                        const p = Math.max(0, Math.min(100, Math.round((received / total) * 100)));
                        setPercent(p);
                    }
                }

                const blob = new Blob(chunks);
                const nextUrl = URL.createObjectURL(blob);

                // 기존 objectUrl 정리
                if (objectUrlRef.current) {
                    URL.revokeObjectURL(objectUrlRef.current);
                }
                objectUrlRef.current = nextUrl;

                if (!isCancelled) {
                    setObjectUrl(nextUrl);
                    setPercent(100);
                    setStatus("loaded");
                }
            } catch (err) {
                if (!isCancelled) {
                    setStatus("error");
                    // indeterminate로 둬도 되고, 필요시 에러 핸들링 UI에서 처리
                }
            }
        };

        fetchImage();

        return () => {
            isCancelled = true;
            controller.abort();
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
        };
    }, [src, withCredentials]);

    return { status, percent, mode, objectUrl };
}
