import React, { useState } from 'react'

export default function CopyButton({ text, label = '복사하기' }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        } catch {}
      }}
      className="text-sm px-3 py-1.5 rounded-full border bg-white hover:bg-neutral-50 active:scale-[0.98] transition"
    >
      {copied ? '복사됨!' : label}
    </button>
  )
}
