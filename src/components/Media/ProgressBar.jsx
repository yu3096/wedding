// 진행 바 (determinate / indeterminate 둘 다 지원)
export function ProgressOverlay({ percent, mode = "determinate" }) {
    return (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="w-64 max-w-[70vw]">
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                        className={
                            "h-full bg-white/90 transition-[width] duration-150 " +
                            (mode === "indeterminate" ? "animate-[progress_1.2s_linear_infinite]" : "")
                        }
                        style={mode === "determinate" ? { width: `${percent}%` } : { width: "40%" }}
                    />
                </div>
                {mode === "determinate" && (
                    <div className="mt-2 text-center text-xs text-white/90 tabular-nums">{percent}%</div>
                )}
            </div>

            {/* indeterminate 애니메이션 키프레임 (Tailwind 임베드용) */}
            <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(20%); }
          100% { transform: translateX(100%); }
        }
        .animate-[progress_1.2s_linear_infinite] {
          animation: progress 1.2s linear infinite;
        }
      `}</style>
        </div>
    );
}
