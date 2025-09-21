import React, { useEffect, useState } from 'react'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const height = document.body.scrollHeight - window.innerHeight
      setProgress(Math.min(100, Math.max(0, (scrollTop / height) * 100)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return (
    <div className="fixed left-0 top-0 z-50 w-full h-1 bg-transparent">
      <div className="h-1 bg-black/80 transition-[width] duration-150 ease-out" style={{ width: `${progress}%` }} />
    </div>
  )
}
