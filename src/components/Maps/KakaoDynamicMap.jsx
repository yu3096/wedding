import { useEffect, useRef } from "react";
import { loadKakaoSdk } from "@/lib/loadKakaoSdk";

export default function KakaoDynamicMap({
  lat = 37.49887,
  lng = 126.99656,
  level = 4,                 // 숫자 작을수록 확대
  draggable = true,          // 드래그 허용
  scrollwheel = true,        // 스크롤 확대/축소
  doubleClickZoom = true,
  disableDoubleClick = false,
  keyboardShortcuts = false,
  className = "",
  style,
  title = "더컨벤션 반포",
}) {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);
  const kakaoRef = useRef(null);

  useEffect(() => {
    const key = import.meta.env.VITE_KAKAO_JS_KEY;
    let cleanup = () => {};

    (async () => {
      const kakao = await loadKakaoSdk(key);
      kakaoRef.current = kakao;

      kakao.maps.load(() => {
        const box = boxRef.current;
        if (!box) return;

        // 1) Map 생성
        const center = new kakao.maps.LatLng(lat, lng);
        const map = new kakao.maps.Map(box, {
          center,
          level,
          draggable,
          scrollwheel,
          disableDoubleClick,
          doubleClickZoom,
          keyboardShortcuts,
        });
        mapRef.current = map;

        // 2) 하트 SVG 커스텀 오버레이 (정중앙에 찍힘)
        const content = document.createElement("div");
        content.setAttribute("aria-label", title);
        content.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
            <defs>
              <filter id="s" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-color="#000" flood-opacity="0.25"/>
              </filter>
            </defs>
            <path d="M14 0C6.82 0 1 5.74 1 12.82c0 7.88 9.56 14.91 12.14 16.69a2 2 0 0 0 2.3 0C17.96 27.73 27 20.7 27 12.82 27 5.74 21.18 0 14 0Z" fill="#E11D48" filter="url(#s)"/>
            <path d="M18.8 7.6a3.8 3.8 0 0 0-2.7 1.12L14 10.82l-2.1-2.1a3.8 3.8 0 1 0-5.38 5.37l7.48 7.48 7.48-7.48a3.8 3.8 0 0 0-2.68-6.5Z" fill="#fff"/>
          </svg>
        `;

        const overlay = new kakao.maps.CustomOverlay({
          position: center,
          content,
          xAnchor: 0.5,  // 가운데 정렬
          yAnchor: 1.0,  // 아래 꼭지점이 좌표를 가리키도록
          zIndex: 2,
        });
        overlay.setMap(map);
        overlayRef.current = overlay;

        // 지도 생성 직후
        const zoomCtrl = new kakao.maps.ZoomControl();
        map.addControl(zoomCtrl, kakao.maps.ControlPosition.RIGHT);

        const mapTypeCtrl = new kakao.maps.MapTypeControl();
        map.addControl(mapTypeCtrl, kakao.maps.ControlPosition.TOPRIGHT);

        // 3) 반응형: 컨테이너 크기/창 크기 변경 시 중심 유지
        const keepCenter = () => {
          const c = map.getCenter();
          setTimeout(() => {
            kakao.maps.event.trigger(map, "resize");
            map.setCenter(c);
          }, 0);
        };

        const ro = "ResizeObserver" in window ? new ResizeObserver(keepCenter) : null;
        ro?.observe(box);
        window.addEventListener("resize", keepCenter, { passive: true });

        cleanup = () => {
          ro?.disconnect();
          window.removeEventListener("resize", keepCenter);
          overlay.setMap(null);
          mapRef.current = null;
          overlayRef.current = null;
        };
      });
    })();

    return () => cleanup();
  }, [lat, lng, level, draggable, scrollwheel, doubleClickZoom, disableDoubleClick, keyboardShortcuts, title]);

  return (
    <div
      ref={boxRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%", // 부모가 높이를 결정
        ...style,
      }}
      aria-label={`${title} 지도`}
    />
  );
}
