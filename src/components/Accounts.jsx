// src/components/Accounts.jsx
import React, { useEffect, useState, useCallback } from "react";
import useReveal from "./useReveal";
import CopyButton from "./CopyButton.jsx";
import ModalPortal from "@/components/Modal/ModalPortal.jsx";
import Backdrop from "@/components/Modal/Backdrop.jsx";
import { useWeddingInfo } from "@/context/WeddingInfoProvider.jsx";

// 측별 테마(아이덴티티 컬러)
const THEMES = [
  // 0: 신랑측
  {
    grad: "from-indigo-400 to-indigo-500",
    chip: "bg-indigo-50 text-indigo-700",
    ring: "ring-indigo-200",
    focus: "focus-visible:ring-indigo-300",
    border: "border-indigo-200",
  },
  // 1: 신부측
  {
    grad: "from-rose-400 to-rose-500",
    chip: "bg-rose-50 text-rose-700",
    ring: "ring-rose-200",
    focus: "focus-visible:ring-rose-300",
    border: "border-rose-200",
  },
];

export default function Accounts() {
  const { ref, visible } = useReveal();
  const { accounts } = useWeddingInfo();

  // 컨텍스트에서 그룹 구성
  const groups = [
    { side: accounts.groomSide, accounts: accounts.groomAccounts || [] },
    { side: accounts.brideSide, accounts: accounts.brideAccounts || [] },
  ];

  // 모달 상태
  const [modal, setModal] = useState({ open: false, index: null });
  const [animVisible, setAnimVisible] = useState(false);

  const openModal = useCallback((idx) => {
    setModal({ open: true, index: idx });
    requestAnimationFrame(() => setAnimVisible(true));
  }, []);

  const beginClose = useCallback(() => {
    setAnimVisible(false);
    setTimeout(() => setModal({ open: false, index: null }), 180);
  }, []);

  // ESC 닫기 + 스크롤 잠금
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && beginClose();
    if (modal.open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [modal.open, beginClose]);

  const currentIdx = modal.index ?? 0;
  const current = modal.index != null ? groups[currentIdx] : null;
  const theme = THEMES[currentIdx % THEMES.length];

  return (
    <section ref={ref} id="accounts" className="py-16 sm:py-24 bg-neutral-50">
      <div
        className={`container mx-auto px-4 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* 헤더 */}
        <div className="text-center">
          <h3 className="text-2xl sm:text-3xl font-serif tracking-tight text-neutral-900">
            감사의 마음 전하실 곳
          </h3>
          <p className="text-neutral-600 mt-2">
            참석이 어려우신 분들을 위해 계좌 정보를 안내드립니다.
          </p>
        </div>

        {/* 카드 리스트 */}
        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto mt-8">
          {groups.map((g, i) => {
            const t = THEMES[i % THEMES.length];
            const count = g.accounts?.length ?? 0;
            const repName = g.accounts?.[0]?.name || "-";
            const summary =
              count > 1 ? `${repName} 외 ${count - 1}명` : repName;

            return (
              <article
                key={g.side}
                className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden ring-1 ring-black/5"
              >
                {/* 아이덴티티 배너(높이 축소) + 버튼 */}
                <div
                  className={`h-14 sm:h-16 flex items-center justify-between px-4 sm:px-5
                              text-white font-medium bg-gradient-to-r ${t.grad}`}
                >
                  <span className="text-lg sm:text-xl">{g.side}</span>
                  <button
                    onClick={() => openModal(i)}
                    className={`h-8 sm:h-9 px-3 rounded-full bg-white/20 hover:bg-white/30
                               text-white text-sm transition outline-none ${t.focus}`}
                    aria-haspopup="dialog"
                    aria-controls="account-layer"
                  >
                    자세히 보기
                  </button>
                </div>

                {/* 본문 요약: 칩(함께하는 마음) + '유승민 외 N명' 텍스트 */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                      <span aria-hidden>💝</span>
                      <span>함께하는 마음</span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-800">
                      {summary}
                    </span>
                  </div>

                  <p className="text-neutral-500 text-sm mt-2">
                    자세히 보기를 눌러 전체 계좌를 확인하세요.
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* 레이어 팝업(테마 적용) */}
        {modal.open && current && (
          <ModalPortal>
            {/* 완전 불투명 배경 원하면 opaque={true} */}
            <Backdrop visible={animVisible} onClick={beginClose} opaque={false} />

            <div
              id="account-layer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="account-layer-title"
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) beginClose();
              }}
            >
              <div
                className={`w-full sm:w-[560px] max-w-[92vw] bg-white rounded-2xl border shadow-xl
                            transition-all duration-200
                            ${animVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"} ${theme.ring}`}
              >
                {/* 모달 헤더: 카드와 동일 그라데이션 */}
                <div className={`px-5 py-4 border-b text-white rounded-t-2xl bg-gradient-to-r ${theme.grad}`}>
                  <div className="flex items-start justify-between gap-4">
                    <h4 id="account-layer-title" className="text-lg font-semibold">
                      {current.side} 계좌 안내
                    </h4>
                    <button
                      onClick={beginClose}
                      className="shrink-0 h-8 w-8 rounded-full border border-white/60 bg-white/10 hover:bg-white/20 text-white"
                      aria-label="닫기"
                      title="닫기"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* 내용 */}
                <div className="p-5 sm:p-6">
                  <ul className="space-y-3">
                    {current.accounts?.length ? (
                      current.accounts.map((acc, idx) => (
                        <li
                          key={`${acc.role}-${idx}`}
                          className={`flex items-start justify-between gap-3 rounded-xl border p-3 ${theme.border}`}
                        >
                          <div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] ${theme.chip}`}>
                              {acc.role}
                            </span>
                            <div className="text-neutral-900 font-medium mt-1">
                              {acc.bank} · {acc.name}
                            </div>
                            <div className="font-mono text-[15px] sm:text-base break-all text-neutral-800 mt-0.5">
                              {acc.num}
                            </div>
                          </div>
                          <div className="shrink-0">
                            <CopyButton text={`${acc.bank} ${acc.num} ${acc.name}`} />
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-center text-neutral-500 py-6">
                        등록된 계좌가 없습니다.
                      </li>
                    )}
                  </ul>

                  <div className="mt-5 text-right">
                    <button
                      onClick={beginClose}
                      className={`h-9 px-4 rounded-full border bg-white hover:bg-neutral-50 text-sm outline-none ${theme.focus}`}
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ModalPortal>
        )}
      </div>
    </section>
  );
}
