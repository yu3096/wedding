import React, { createContext, useContext, useMemo } from "react";

// 안전 파싱
function safeParse(json, fallback) {
  try {
    const v = json ? JSON.parse(json) : undefined;
    return Array.isArray(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

const WeddingInfoContext = createContext(null);

export function WeddingInfoProvider({ children }) {
  // 이름(여러 곳에서 재사용)
  const groomName = import.meta.env.VITE_GROOM_NAME || "";
  const brideName = import.meta.env.VITE_BRIDE_NAME || "";
  const groomFather = import.meta.env.VITE_GROOM_FATHER || "";
  const groomMother = import.meta.env.VITE_GROOM_MOTHER || "";
  const brideFather = import.meta.env.VITE_BRIDE_FATHER || "";
  const brideMother = import.meta.env.VITE_BRIDE_MOTHER || "";

  const weddingDate = import.meta.env.VITE_WEDDING_DATE || "";
  const weddingTime = import.meta.env.VITE_WEDDING_TIME || "";

  const weddingAddr = import.meta.env.VITE_WEDDING_ADDR || "";
  const weddingHall = import.meta.env.VITE_WEDDING_HALL || "";
  const weddingBus = import.meta.env.VITE_WEDDING_BUS || "";
  const weddingSubway = import.meta.env.VITE_WEDDING_SUBWAY || "";
  const weddingCar = import.meta.env.VITE_WEDDING_CAR || "";

  // 계좌(JSON)
  const groomAccounts = safeParse(import.meta.env.VITE_GROOM_ACCOUNTS, []);
  const brideAccounts = safeParse(import.meta.env.VITE_BRIDE_ACCOUNTS, []);

  // 측 라벨(원하면 ENV로 뺄 수 있음)
  const groomSide = import.meta.env.VITE_GROOM_SIDE || "신랑측";
  const brideSide = import.meta.env.VITE_BRIDE_SIDE || "신부측";

  const value = useMemo(() => ({
    // 이름/가족
    names: {
      groomName, brideName,
      groomFather, groomMother,
      brideFather, brideMother,
    },
    //웨딩홀 및 웨딩날짜
    wedding: {
        weddingDate, weddingHall, weddingTime, weddingAddr, weddingBus, weddingCar, weddingSubway
    },
    // 계좌
    accounts: {
      groomSide, brideSide,
      groomAccounts, brideAccounts,
    },
  }), [
    groomName, brideName, groomFather, groomMother, brideFather, brideMother,
    weddingDate, weddingHall, weddingTime, weddingAddr, weddingBus, weddingSubway, weddingCar,
    groomSide, brideSide, groomAccounts, brideAccounts
  ]);

  return (
    <WeddingInfoContext.Provider value={value}>
      {children}
    </WeddingInfoContext.Provider>
  );
}

export function useWeddingInfo() {
  const ctx = useContext(WeddingInfoContext);
  if (!ctx) throw new Error("useWeddingInfo must be used within WeddingInfoProvider");
  return ctx;
}
