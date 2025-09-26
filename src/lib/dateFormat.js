/** YYYYMMDD → Date (로컬 TZ, 안전 파싱) */
export function parseYYYYMMDD(yyyymmdd) {
  if (!/^\d{8}$/.test(yyyymmdd)) throw new Error("Invalid YYYYMMDD format");
  const y = +yyyymmdd.slice(0, 4);
  const m = +yyyymmdd.slice(4, 6) - 1; // 0-based
  const d = +yyyymmdd.slice(6, 8);
  const date = new Date(y, m, d);
  if (date.getFullYear() !== y || date.getMonth() !== m || date.getDate() !== d) {
    throw new Error("Invalid calendar date");
  }
  return date;
}

/** 내부: Intl 명칭 헬퍼 */
function intlName(date, locale, opts) {
  return new Intl.DateTimeFormat(locale, opts).format(date);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

/**
 * 메인 포맷터
 * @param {string} yyyymmdd - "YYYYMMDD"
 * @param {string} mask - 예: "YYYY-MM-DD", "YYYY.MM.DD (ddd)"
 *   지원 토큰: YYYY, YY, MMMM, MMM, MM, M, DD, D, dddd, ddd, E
 *   리터럴: [텍스트]  (그대로 출력)
 * @param {{
 *   locale?: string,
 *   includeWeekday?: boolean,      // true면 요일 자동 덧붙임
 *   weekdayStyle?: 'short'|'long', // includeWeekday 사용 시 'short'|'long'
 *   weekdayWrapper?: (w:string)=>string // 요일 감싸는 형식 지정 (기본: w => ` (${w})`)
 * }} opts
 * @returns {string}
 */
export function format(yyyymmdd, mask, opts = {}) {
  const {
    locale = "ko-KR",
    includeWeekday = false,
    weekdayStyle = "short",
    weekdayWrapper = (w) => ` (${w})`,
  } = opts;

  const d = parseYYYYMMDD(yyyymmdd);

  // 리터럴 보호: [ ... ]는 치환에서 제외
  const LITERAL = /\[(.+?)\]/g;
  const literals = [];
  const masked = mask.replace(LITERAL, (_, txt) => {
    literals.push(txt);
    return `\u0000`; // placeholder
  });

  const yyyy = d.getFullYear();
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const dayIdx = d.getDay(); // 0=일 ... 6=토
  const E = dayIdx === 0 ? 7 : dayIdx; // 월(1)~일(7)

  const monthLong = intlName(d, locale, { month: "long" });
  const monthShort = intlName(d, locale, { month: "short" });
  const weekdayLong = intlName(d, locale, { weekday: "long" });
  const weekdayShort = intlName(d, locale, { weekday: "short" });

  // 긴 토큰 우선 매칭
  const tokens = /(YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|E)/g;

  let out = masked.replace(tokens, (t) => {
    switch (t) {
      case "YYYY": return String(yyyy);
      case "YY":   return String(yyyy).slice(-2);
      case "MMMM": return monthLong;
      case "MMM":  return monthShort;
      case "MM":   return pad2(mm);
      case "M":    return String(mm);
      case "DD":   return pad2(dd);
      case "D":    return String(dd);
      case "dddd": return weekdayLong;
      case "ddd":  return weekdayShort;
      case "E":    return String(E);
      default:     return t;
    }
  });

  // 리터럴 복원
  let i = 0;
  out = out.replace(/\u0000/g, () => literals[i++]);

  // 요일 자동 추가 (마스크에 ddd/dddd가 없을 때만)
  if (includeWeekday && !/(ddd|dddd)/.test(mask)) {
    const w = weekdayStyle === "long" ? weekdayLong : weekdayShort;
    out += weekdayWrapper(w);
  }

  return out;
}

/** 자주 쓰는 프리셋 */
export const DATE_PRESETS = {
  DASH: "YYYY-MM-DD",
  SLASH: "YYYY/MM/DD",
  DOT: "YYYY.MM.DD",
  KOREAN: "YYYY년 MM월 DD일",
  WITH_WEEKDAY_SHORT: "YYYY.MM.DD (ddd)",
  WITH_WEEKDAY_LONG: "YYYY년 M월 D일 dddd",
};

/** 편의 함수들 */
export const toDash = (s, opts) => format(s, DATE_PRESETS.DASH, opts);
export const toSlash = (s, opts) => format(s, DATE_PRESETS.SLASH, opts);
export const toDot = (s, opts) => format(s, DATE_PRESETS.DOT, opts);
export const toKorean = (s, opts) => format(s, DATE_PRESETS.KOREAN, opts);

/** 특정 날짜의 요일만 얻기 */
export function getWeekdayName(yyyymmdd, { locale = "ko-KR", style = "short" } = {}) {
  const d = parseYYYYMMDD(yyyymmdd);
  return intlName(d, locale, { weekday: style });
}

export function parseDateStr(yyyymmdd) {
  return {
    year: Number(yyyymmdd.substring(0, 4)),
    month: Number(yyyymmdd.substring(4, 6)),
    day: Number(yyyymmdd.substring(6, 8)),
  };
}