export function loadKakaoSdk(appKey) {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) return resolve(window.kakao);
    const s = document.createElement("script");
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    s.async = true; s.defer = true;
    s.onload = () => resolve(window.kakao);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
