"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";

interface QuestionBankPreviewChoiceCardProps {
  text: string;
  isCorrect: boolean;
  type: number;
}

export function QuestionBankPreviewChoiceCard({ text, isCorrect, type }: QuestionBankPreviewChoiceCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 p-6 text-center transition-colors min-w-[18rem] min-h-[8rem] flex flex-col justify-center",
        isCorrect ? "border-[#63C41A] bg-[#E9F8DF]" : "border-slate-200 bg-slate-50",
      )}
    >
      {type === 1 ?
      <div className={cn("mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full", isCorrect ? "bg-[#63C41A] text-white" : "bg-slate-200 text-slate-500")}>
        {isCorrect ? <Check className="h-7 w-7" /> : <X className="h-7 w-7" />}
      </div>
      : null}
      <p className={cn("text-2xl font-extrabold", isCorrect ? "text-[#3E8C0E]" : "text-slate-500")}>
        {text}
      </p>
    </div>
  );
}
