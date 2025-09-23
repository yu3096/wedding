// Guestbook.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase.js";
import { getDeviceId, getDeleteToken } from "@/lib/device.js";

const MAX_LEN = 300;
const PAGE = 20;
const deviceId = getDeviceId();          // 같은 기기에서만 삭제 버튼 노출용(클라이언트 가드)
const deleteToken = getDeleteToken();

export default function GuestbookSupabase() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function fetchPage(p = 0) {
    setLoading(true);
    const from = p * PAGE;
    const to = from + PAGE - 1;

    // soft delete 반영: 활성 글만
    const { data, error } = await supabase
      .from("guestbook")
      .select("id,name,message,created_at,device_id,delete_yn")
      .eq("delete_yn", "n")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("[guestbook select error]", error);
    }
    setList(p === 0 ? (data || []) : [...list, ...(data || [])]);
    setLoading(false);
  }

  useEffect(() => {
    fetchPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e) {
    e.preventDefault();
    const nameTrim = name.trim();
    const msgTrim = message.trim();
    if (!nameTrim || !msgTrim) return;
    if (msgTrim.length > MAX_LEN) return;

    setSubmitting(true);
    const now = new Date().toISOString();

    // 낙관적 업데이트 (delete_yn 기본 'n')
    const optimistic = {
      id: `temp-${now}`,
      name: nameTrim.slice(0, 40),
      message: msgTrim,
      created_at: now,
      device_id: deviceId,
      delete_yn: "n",
    };
    setList((prev) => [optimistic, ...prev]);

    const { data, error } = await supabase
      .from("guestbook")
      .insert({
        name: optimistic.name,
        message: optimistic.message,
        device_id: deviceId,
        delete_token: deleteToken, // DB에 기본값이 있다면 생략 가능
      })
      .select("id,name,message,created_at,device_id,delete_yn")
      .single();

    if (error) {
      // 롤백
      setList((prev) => prev.filter((x) => x.id !== optimistic.id));
      console.error("[guestbook insert error]", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      alert(`등록 실패: ${error.message}`);
    } else if (data) {
      // 서버 값으로 교체
      setList((prev) => [data, ...prev.filter((x) => x.id !== optimistic.id)]);
      setName("");
      setMessage("");
    }
    setSubmitting(false);
  }

  // ✅ soft delete: delete_yn='y'로 업데이트하고 목록에서 제거 (반환 없음)
  async function softDelete(row) {
    // 같은 디바이스만 가드
    if (row.device_id !== deviceId) return;

    const { error } = await supabase
      .from("guestbook")
      .update({ delete_yn: "y" }, { returning: "minimal" })
      .eq("id", row.id);

    if (error) {
      console.error("[guestbook soft delete error]", error);
      alert(`삭제 실패: ${error.message}`);
    } else {
      setList((prev) => prev.filter((x) => x.id !== row.id));
    }
  }

  return (
    <section id="guestbook" className="container mx-auto px-4 py-16 max-w-2xl">
      <h2 className="text-2xl sm:text-3xl font-serif text-center">방명록</h2>
      <p className="text-center text-neutral-600 mt-2">축하 메시지를 남겨주세요 ☺️</p>

      {/* 입력 폼: 모바일 가독/터치영역 강화 */}
      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border p-4 sm:p-5 bg-white/70 backdrop-blur space-y-3"
      >
        <div className="flex flex-col gap-3">
          <input
            className="w-full border rounded-lg px-3 py-2.5 text-[15px] sm:text-base outline-none focus:border-black"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            required
          />
          <textarea
            className="w-full border rounded-lg px-3 py-2.5 text-[15px] sm:text-base outline-none focus:border-black"
            placeholder={`메시지(${MAX_LEN}자 이내)`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={MAX_LEN}
            required
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-sm sm:text-[13px] text-neutral-600">
          <span>{message.length}/{MAX_LEN}</span>
          <button
            disabled={submitting}
            className="h-9 sm:h-10 px-4 rounded-full border bg-white hover:bg-neutral-50 disabled:opacity-50 active:scale-[0.98] transition"
            type="submit"
          >
            남기기
          </button>
        </div>
      </form>

      {/* 목록 */}
      <ul className="mt-6 space-y-4">
        {list.map((e) => (
          <li key={e.id} className="rounded-2xl border bg-white/90 p-4 sm:p-5 shadow-sm">
            {/* 상단: 아바타 + 이름 + 타임스탬프 + 삭제 */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* 이니셜 아바타 */}
                <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-semibold">
                  {(e.name || "?").trim().slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[15px] sm:text-base leading-5 truncate">
                    {e.name}
                  </div>
                  <div className="text-[11px] sm:text-xs text-neutral-500">
                    {new Date(e.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* 같은 디바이스만 삭제 버튼 */}
              {e.device_id === deviceId && (
                <button
                  className="shrink-0 h-7 px-3 rounded-full border text-xs text-neutral-600 hover:bg-neutral-50 active:scale-[0.98] transition"
                  onClick={() => softDelete(e)}
                  aria-label="메시지 삭제"
                  type="button"
                >
                  삭제
                </button>
              )}
            </div>

            {/* 본문: 긴 단어/URL/이모지 대응 */}
            <p
              className="mt-3 sm:mt-4 text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap break-words"
              style={{ hyphens: "auto", overflowWrap: "anywhere", wordBreak: "break-word" }}
            >
              {e.message}
            </p>
          </li>
        ))}

        {loading && (
          <li className="text-center text-neutral-500 py-6">로딩 중…</li>
        )}
        {!loading && list.length === 0 && (
          <li className="text-center text-neutral-500 py-8">
            아직 남겨진 메시지가 없어요.
          </li>
        )}
      </ul>

      {/* 페이지네이션(옵션) */}
      {!loading && list.length && list.length % PAGE === 0 ? (
        <div className="mt-3 text-center">
          <button
            className="px-4 py-2 rounded-full border bg-white hover:bg-neutral-50"
            onClick={() => {
              const next = page + 1;
              setPage(next);
              fetchPage(next);
            }}
          >
            더 보기
          </button>
        </div>
      ) : null}
    </section>
  );
}
