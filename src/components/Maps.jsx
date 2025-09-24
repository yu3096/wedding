import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import useReveal from "./useReveal";
import CopyButton from "./CopyButton.jsx";
import KakaoDynamicMap from "@/components/Maps/KakaoDynamicMap";

export default function Maps() {
  const address = "서울 서초구 사평대로 108, 더컨벤션 반포";
  const { ref, visible } = useReveal();

  const infoRef = useRef(null);
  const [mapH, setMapH] = useState(400);

  // 모바일 주소창 변동 대응: --vh 세팅
  useEffect(() => {
    const setVH = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    setVH();
    window.addEventListener("resize", setVH, { passive: true });
    return () => window.removeEventListener("resize", setVH);
  }, []);

  // 지도 높이 = 뷰포트 - 정보영역(패딩 포함) - 카드 테두리 여유
  const recalc = () => {
    const vh = Math.max(window.innerHeight, document.documentElement.clientHeight || 0);
    const infoH = infoRef.current?.offsetHeight || 0;
    const borderAndGap = 100; // 카드 상하 여유(필요시 조절)
    const next = Math.max(280, vh - infoH - borderAndGap);
    setMapH(next);
  };

  useLayoutEffect(() => {
    recalc();
  }, []);

  useEffect(() => {
    const ro = new ResizeObserver(recalc);
    if (infoRef.current) ro.observe(infoRef.current);
    window.addEventListener("resize", recalc, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, []);

  return (
    <section ref={ref} id="map" className="py-16 sm:py-24 bg-neutral-50">
      <div
        className={`container mx-auto px-4 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <h2 className="text-center font-serif text-3xl sm:text-4xl">오시는길</h2>

        <div className="max-w-8xl w-full mx-auto mt-6 rounded-2xl overflow-hidden border bg-white shadow-sm flex flex-col">
          {/* 지도: grow 로 남는 공간 모두 차지 */}
          <div className="relative w-full grow min-h-[280px]" style={{ height: mapH }}>
            <KakaoDynamicMap
              lat={37.49887}
              lng={126.99656}
              level={4}
              className="inset-0"
              // 필요시 상호작용 제어
              draggable
              scrollwheel
              doubleClickZoom
            />
          </div>

          {/* 정보 영역(높이 변화 감지 대상) */}
          <div ref={infoRef} className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-neutral-800 font-medium">더컨벤션 반포</div>
                <div className="text-neutral-600 text-sm">{address}</div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <CopyButton text={`${address}`} />
                <a
                  href="nmap://search?query=더컨벤션 반포&appname=com.example.myapp"
                  className="px-3 py-1.5 text-sm rounded-full border hover:bg-neutral-50"
                >
                  네이버 지도
                </a>
                <a
                  href="kakaomap://place?id=598171385"
                  className="px-3 py-1.5 text-sm rounded-full border hover:bg-neutral-50"
                >
                  카카오맵
                </a>
                <a
                  href="tmap://search?name=더컨벤션 반포"
                  className="px-3 py-1.5 text-sm rounded-full border hover:bg-neutral-50"
                >
                  티맵
                </a>
              </div>
            </div>
            <p className="text-neutral-600 text-sm mt-4">
              웨딩홀 전용 주차장이 있습니다. (2시간 무료)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
