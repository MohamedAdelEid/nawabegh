"use client";

interface QuestionBankPreviewStatCardProps {
  value: string;
  label: string;
}

export function QuestionBankPreviewStatCard({ value, label }: QuestionBankPreviewStatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-[0px_6px_0px_0px_#0000000A]">
      <p className="text-4xl font-black leading-none text-[#233A5C]">{value}</p>
      <p className="mt-2 text-sm font-semibold text-slate-500">{label}</p>
    </div>
  );
}
