import React from "react";
import ResponsivePicture from "@/components/media/ResponsivePicture.jsx"
import pic from '@/assets/images/Appreciation.jpg?w=480;768;1024;1440;1920&format=avif;webp;jpg&quality=70&as=picture';
import { useWeddingInfo } from "@/context/WeddingInfoProvider.jsx";

export default function Appreciation() {
  const { names } = useWeddingInfo();

  return (
    <section id="appreciation" className="relative overflow-hidden">
      {/* 은은한 배경 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
      />
      <div className="container mx-auto max-w-2xl px-5 py-16 sm:py-20">
        {/* 서브 타이틀 */}
        <p className="text-xs tracking-[0.25em] uppercase text-neutral-500 text-center">
          With Gratitude
        </p>

        {/* 메인 타이틀 */}
        <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-center">
          <span className="inline-block align-baseline">감사의 글</span>
        </h2>

        {/* 본문 (태그로 직접 스타일링) */}
        <div className="mt-6 sm:mt-8 text-center">
          <p
            className="mx-auto max-w-[42ch] text-[15px] sm:text-base leading-relaxed text-neutral-700"
            style={{ hyphens: "auto", overflowWrap: "anywhere", wordBreak: "break-word" }}
          >
            바쁘신 와중에도 함께 해주신 모든 분들께{" "}
            <br />
            <strong className="font-semibold">진심으로 감사</strong>드립니다.
            <br />
            보내주신 축복과 따뜻한 마음을 오래도록 간직하며,
            <br />
            더 좋은 인연으로 보답하겠습니다.
          </p>

          {/* 포인트 라인 */}
          <p className="mt-4 text-[15px] sm:text-base leading-relaxed">
            오늘의 소중한 순간이 여러분의 마음 속에도 아름답게 남기를 바랍니다.
          </p>

        </div>

        {/* 구분선 */}
        <div className="mt-8 sm:mt-10 flex items-center justify-center">
          <span className="h-px w-16 bg-neutral-200" />
        </div>

        {/* 시그니처 (태그로 직접) */}
        <div className="mt-6 text-center">
          <p className="font-serif text-lg sm:text-xl">
            <span className="tracking-tight">{names.groomName}</span>{" "}
            <span className="mx-1 text-neutral-400">·</span>
            <span className="tracking-tight">{names.brideName}</span>{" "}

            <span className="tracking-tight">올림</span>
          </p>
        </div>
      </div>
      <div className="mt-10 text-center relative">
        <ResponsivePicture
          picture={pic}
          alt="감사의 마음을 담은 사진"
          sizes="100vw"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="mx-auto rounded-2xl shadow-md max-w-xs sm:max-w-sm"                       // <picture> 위치
          imgClassName="w-full h-full object-cover block"                      // <img> 추가 클래스(중앙 정렬 등)
          fit="cover"                                 // ✅ 긴 축 기준
        />
         {/* 위쪽 그라데이션 */}
          <div className="pointer-events-none absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-white to-transparent" />

          {/* 아래쪽 그라데이션 */}
          <div className="pointer-events-none absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-white to-transparent" />
      </div>
    </section>
  );
}
