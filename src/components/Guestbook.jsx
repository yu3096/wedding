// Guestbook.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase.js";
import { getDeviceId, getDeleteToken } from "@/lib/device.js";

const MAX_LEN = 300;
const PAGE = 20;
const deviceId = getDeviceId();          // 같은 기기 기준 처리
const deleteToken = getDeleteToken();

export default function GuestbookSupabase() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // ❤️ 좋아요 상태
  const [likesCount, setLikesCount] = useState({}); // { [message_id]: number }
  const [likedSet, setLikedSet] = useState(new Set()); // 이 기기에서 좋아요 누른 message_id 집합

  const currentIds = useMemo(() => list.map((x) => x.id), [list]);

  useEffect(() => {
    fetchPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPage(p = 0) {
    setLoading(true);
    const from = p * PAGE;
    const to = from + PAGE - 1;

    // 활성 글만
    const { data, error } = await supabase
      .from("guestbook")
      .select("id,name,message,created_at,device_id,delete_yn")
      .eq("delete_yn", "n")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("[guestbook select error]", error);
    }

    const merged = p === 0 ? (data || []) : [...list, ...(data || [])];
    setList(merged);
    setLoading(false);

    const ids = (data || []).map((x) => x.id);
    if (ids.length > 0) {
      await Promise.all([fetchLikesFor(ids), fetchMyLikesFor(ids)]);
    }
  }

  // 특정 메시지들의 좋아요 개수 로드
  async function fetchLikesFor(ids) {
    const { data, error } = await supabase
      .from("guestbook_likes")
      .select("message_id")
      .in("message_id", ids);

    if (error) {
      console.error("[likes count select error]", error);
      return;
    }
    const map = {};
    for (const row of data) {
      map[row.message_id] = (map[row.message_id] || 0) + 1;
    }
    setLikesCount((prev) => ({ ...prev, ...map }));
  }

  // 이 기기가 누른 좋아요 로드
  async function fetchMyLikesFor(ids) {
    const { data, error } = await supabase
      .from("guestbook_likes")
      .select("message_id")
      .eq("device_id", deviceId)
      .in("message_id", ids);

    if (error) {
      console.error("[my likes select error]", error);
      return;
    }
    if (data?.length) {
      setLikedSet((prev) => {
        const next = new Set(prev);
        data.forEach((r) => next.add(r.message_id));
        return next;
      });
    }
  }

  async function submit(e) {
    e.preventDefault();
    const nameTrim = name.trim();
    const msgTrim = message.trim();
    if (!nameTrim || !msgTrim) return;
    if (msgTrim.length > MAX_LEN) return;

    setSubmitting(true);
    const now = new Date().toISOString();

    // 낙관적 업데이트
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
      // 서버 값으로 교체 + 초기 좋아요 0
      setList((prev) => [data, ...prev.filter((x) => x.id !== optimistic.id)]);
      setLikesCount((prev) => ({ ...prev, [data.id]: 0 }));
      setName("");
      setMessage("");
    }
    setSubmitting(false);
  }

  // ✅ soft delete: delete_yn='y' (반환 없음)
  async function softDelete(row) {
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
      // 좋아요 상태도 정리
      setLikedSet((prev) => {
        const next = new Set(prev);
        next.delete(row.id);
        return next;
      });
      setLikesCount((prev) => {
        const { [row.id]: _, ...rest } = prev;
        return rest;
      });
    }
  }

  // ❤️ 좋아요 토글 (좋아요 누르기/취소)
  async function toggleLike(messageId) {
    const liked = likedSet.has(messageId);

    if (!liked) {
      // 좋아요 추가 (낙관적 반영)
      setLikedSet((prev) => new Set(prev).add(messageId));
      setLikesCount((prev) => ({ ...prev, [messageId]: (prev[messageId] || 0) + 1 }));

      const { error } = await supabase
        .from("guestbook_likes")
        .insert({ message_id: messageId, device_id: deviceId });

      if (error) {
        // 유니크 충돌은 무시, 그 외 롤백
        if (error.code !== "23505") {
          setLikedSet((prev) => {
            const next = new Set(prev);
            next.delete(messageId);
            return next;
          });
          setLikesCount((prev) => ({
            ...prev,
            [messageId]: Math.max(0, (prev[messageId] || 1) - 1),
          }));
          console.error("[like insert error]", error);
          alert(`좋아요 실패: ${error.message}`);
        }
      }
    } else {
      // 좋아요 취소 (낙관적 반영)
      setLikedSet((prev) => {
        const next = new Set(prev);
        next.delete(messageId);
        return next;
      });
      setLikesCount((prev) => ({
        ...prev,
        [messageId]: Math.max(0, (prev[messageId] || 1) - 1),
      }));

      // ✅ 내 기기의 좋아요만 지운다 (RLS는 널널하므로 클라에서 반드시 제한)
      const { error } = await supabase
        .from("guestbook_likes")
        .delete()
        .eq("message_id", messageId)
        .eq("device_id", deviceId);

      if (error) {
        // 실패 시 원복
        setLikedSet((prev) => new Set(prev).add(messageId));
        setLikesCount((prev) => ({ ...prev, [messageId]: (prev[messageId] || 0) + 1 }));
        console.error("[like delete error]", error);
        alert(`좋아요 취소 실패: ${error.message}`);
      }
    }
  }

  return (
    <section id="guestbook" className="container mx-auto px-4 py-16 max-w-8xl">
      <h2 className="text-2xl sm:text-3xl font-serif text-center">방명록</h2>
      <p className="text-center text-neutral-600 mt-2">축하 메시지를 남겨주세요 ☺️</p>

      {/* 입력 폼 */}
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
        {list.map((e) => {
          const liked = likedSet.has(e.id);
          const count = likesCount[e.id] || 0;

          return (
            <li key={e.id} className="rounded-2xl border bg-white/90 p-4 sm:p-5 shadow-sm">
              {/* 상단: 아바타 + 이름 + 타임스탬프 + 좋아요/삭제 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-semibold">
                    {(e.name || "?").trim().slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    {/* ⬇️ 이름 5자까지만 보이고 넘치면 … */}
                    <div className="font-semibold text-[15px] sm:text-base leading-5 truncate max-w-[10ch]">
                      {e.name}
                    </div>
                    <div className="text-[11px] sm:text-xs text-neutral-500">
                      {new Date(e.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* ❤️ 좋아요 토글 */}
                  <button
                    type="button"
                    onClick={() => toggleLike(e.id)}
                    className={`h-7 px-2.5 rounded-full border text-xs active:scale-[0.98] transition
                      ${liked ? "bg-rose-50 border-rose-200 text-rose-500" : "hover:bg-neutral-50 text-neutral-600"}`}
                    aria-pressed={liked}
                    aria-label={liked ? "좋아요 취소" : "좋아요"}
                    title={liked ? "좋아요 취소" : "좋아요"}
                  >
                    <span className="mr-1" aria-hidden>{liked ? "❤️" : "❤️"}</span>
                    <span>{count}</span>
                  </button>

                  {/* 같은 디바이스만 삭제 */}
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
              </div>

              {/* 본문 */}
              <p
                className="mt-3 sm:mt-4 text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap break-words"
                style={{ hyphens: "auto", overflowWrap: "anywhere", wordBreak: "break-word" }}
              >
                {e.message}
              </p>
            </li>
          );
        })}

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
