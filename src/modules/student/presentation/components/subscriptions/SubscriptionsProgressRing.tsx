type SubscriptionsProgressRingProps = {
  percentage: number;
  label: string;
  caption: string;
};

export function SubscriptionsProgressRing({
  percentage,
  label,
  caption,
}: SubscriptionsProgressRingProps) {
  const safePercent = Math.max(0, Math.min(100, Math.round(percentage)));
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-[rgba(226,232,240,0.8)] bg-white p-6 shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)]">
      <div className="relative mb-4 size-28">
        <svg className="size-full -rotate-90" viewBox="0 0 112 112" aria-hidden>
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="10"
          />
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="#c7a55b"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold text-[#2c4260]">{safePercent}%</span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">
            {label}
          </span>
        </div>
      </div>
      <p className="text-center text-sm font-semibold text-[#64748b]">{caption}</p>
    </div>
  );
}
