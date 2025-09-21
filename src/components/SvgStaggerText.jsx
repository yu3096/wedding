import React from "react";

/**
 * SVG 안에서 글자 단위로 순차 등장시키는 텍스트
 * - props:
 *   x, y: SVG 좌표 (퍼센트/숫자)
 *   text: 문자열
 *   step: 글자당 지연(ms) 기본 40
 *   className: fill/폰트 등 스타일 클래스
 *   style: fontSize 등 인라인 스타일 (예: { fontSize: 'clamp(36px, 7vw, 88px)' })
 *   textAnchor: 'start' | 'middle' | 'end' (기본 middle)
 */
export default function SvgStaggerText({
  x = "50%",
  y = "50%",
  text,
  step = 40,
  className = "",
  style = {},
  textAnchor = "middle",
}) {
  const chars = Array.from(text || "");
  return (
    <text x={x} y={y} textAnchor={textAnchor} className={className} style={style}>
      {chars.map((ch, i) => (
        <tspan
          key={i}
          className="char"
          style={{ animationDelay: `${i * step}ms` }}
        >
          {ch === " " ? "\u00A0" : ch}
        </tspan>
      ))}
    </text>
  );
}
