// src/components/CopyButton.jsx
import React, { useState } from "react";

async function copyModern(text) {
  // 일부 브라우저에서 permissions 쿼리는 에러가 날 수 있으므로 try/catch
  try {
    if (navigator.permissions && navigator.permissions.query) {
      try { await navigator.permissions.query({ name: "clipboard-write" }); } catch {}
    }
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function copyLegacy(text) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";   // 키보드 스크롤 방지
    ta.style.opacity = "0";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);

    // iOS 대응: select() + range
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function CopyButton({
  text,
  className = "px-3 py-1.5 text-sm rounded-full border hover:bg-neutral-50",
  successLabel = "복사완료",
  label = "복사하기",
  onCopied, //성공 시 콜백
}) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    // 반드시 '클릭' 같은 사용자 제스처에서 호출되어야 함
    let ok = await copyModern(text);
    if (!ok) ok = copyLegacy(text);

    if (!ok) {
      // 인앱브라우저/특정 iOS에서 모두 실패할 때 최후의 수단
      window.prompt("아래 내용을 길게 눌러 복사하세요", text);
      return;
    }
    setCopied(true);
    onCopied?.();
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-live="polite"
      aria-label={copied ? successLabel : label}
    >
      {copied ? successLabel : label}
    </button>
  );
}
