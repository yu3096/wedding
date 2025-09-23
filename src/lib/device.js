function fallbackUUID() {
  // crypto.getRandomValues를 이용한 UUID v4
  if (window.crypto && window.crypto.getRandomValues) {
    const buf = new Uint8Array(16);
    window.crypto.getRandomValues(buf);
    buf[6] = (buf[6] & 0x0f) | 0x40; // version 4
    buf[8] = (buf[8] & 0x3f) | 0x80; // variant
    return [...buf]
      .map((b, i) =>
        (i === 4 || i === 6 || i === 8 || i === 10 ? "-" : "") +
        b.toString(16).padStart(2, "0")
      )
      .join("");
  }
  // 마지막 폴백: timestamp + random
  return (
    "xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }) + Date.now().toString(16)
  );
}

export function getDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      id = window.crypto.randomUUID();
    } else {
      id = fallbackUUID();
    }
    localStorage.setItem("device_id", id);
  }
  return id;
}

export function getDeleteToken() {
  let token = localStorage.getItem("delete_token");
  if (!token) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      token = window.crypto.randomUUID();
    } else {
      token = fallbackUUID();
    }
    localStorage.setItem("delete_token", token);
  }
  return token;
}
