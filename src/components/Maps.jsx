import React from "react";
import useReveal from "./useReveal";
import CopyButton from "./CopyButton.jsx";
import KakaoDynamicMap from "@/components/Maps/KakaoDynamicMap";
import { useWeddingInfo } from "@/context/WeddingInfoProvider.jsx";

export default function Maps() {
    const { wedding } = useWeddingInfo();
    const { ref, visible } = useReveal();

    // 주소 문자열
    const address = [wedding.weddingAddr, wedding.weddingHall]
        .filter(Boolean)
        .join(", ");

    // 지도 높이: 너무 작지도(모바일) 크지도 않게
    const mapHeight = "clamp(240px, 50vh, 520px)";

    // 지도 앱 딥링크 (필요시 웹 링크 fallback 로직을 onClick에 붙일 수 있음)
    const hallEncoded = encodeURIComponent(wedding.weddingHall || "");
    const naverLink = `nmap://search?query=${hallEncoded}&appname=com.example.myapp`;
    const kakaoLink = "kakaomap://place?id=598171385"; // 필요 시 id 교체
    const tmapLink = `tmap://search?name=${hallEncoded}`;

    return (
        <section ref={ref} id="maps" className="py-16 sm:py-24 bg-neutral-50">
            <div
                className={`container mx-auto px-4 transition-all duration-700 ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
            >
                <h2 className="text-center font-serif text-3xl sm:text-4xl">오시는길</h2>

                {/* 카드: 고정 높이 제거 → 내용에 따라 자동 확장 */}
                <div className="max-w-5xl w-full mx-auto mt-6 rounded-2xl overflow-hidden border bg-white shadow-sm">
                    {/* 지도: 절반(50vh) 정도로 크게 / 최소 높이 보장 */}
                    <div className="relative w-full" style={{ height: mapHeight }}>
                        <KakaoDynamicMap
                            lat={37.49887}
                            lng={126.99656}
                            level={4}
                            draggable
                            scrollwheel
                            doubleClickZoom
                            className="absolute inset-0"
                        />
                    </div>

                    {/* 정보 영역: 자동으로 아래에 이어짐 (잘리지 않음) */}
                    <div className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="min-w-0">
                                <div className="text-neutral-800 font-medium truncate">
                                    {wedding.weddingHall}
                                </div>
                                <div className="text-neutral-600 text-sm break-words">
                                    {address}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center">
                                {/* 주소 복사 */}
                                <CopyButton text={address} />

                                {/* 지도 앱 딥링크 (간단 버전) */}
                                <a
                                    href={naverLink}
                                    className="px-3 py-1.5 text-sm rounded-full border hover:bg-neutral-50"
                                >
                                    네이버 지도
                                </a>
                                <a
                                    href={kakaoLink}
                                    className="px-3 py-1.5 text-sm rounded-full border hover:bg-neutral-50"
                                >
                                    카카오맵
                                </a>
                                <a
                                    href={tmapLink}
                                    className="px-3 py-1.5 text-sm rounded-full border hover:bg-neutral-50"
                                >
                                    티맵
                                </a>
                            </div>
                        </div>

                        {/* 안내 문구 */}
                        <p className="text-neutral-600 text-sm mt-4">
                            웨딩홀 전용 주차장이 있습니다. (2시간 무료)
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
