import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { cn } from "@/shared/application/lib/cn";
import type { UserDetailInfoSection } from "./buildUserDetailInfoSections";

export type UserDetailsInfoSectionProps = {
  sections: UserDetailInfoSection[];
};

export function UserDetailsInfoSection({ sections }: UserDetailsInfoSectionProps) {
  if (sections.length === 0) return null;

  return (
    <Card
      className="rounded-[2rem] border-white/80 bg-white"
      style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
    >
      <CardContent className="space-y-6 p-6 sm:p-8">
        {sections.map((section, index) => (
          <div
            key={section.title}
            className={cn(index > 0 && "border-t border-[#EEF4FD] pt-6")}
          >
            <h2 className="mb-4 text-right text-lg font-bold text-[#2B415E]">{section.title}</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {section.fields.map((item) => (
                <div
                  key={`${section.title}-${item.label}`}
                  className="rounded-2xl border border-[#EEF4FD] bg-[#F8FAFC] p-4 text-right transition-colors hover:bg-[#F3F6FA]"
                >
                  <p className="text-xs font-medium text-slate-400">{item.label}</p>
                  <p
                    dir={item.dir}
                    className="mt-1.5 break-words text-sm font-semibold leading-relaxed text-slate-800"
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
