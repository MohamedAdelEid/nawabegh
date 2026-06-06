import { cn } from "@/shared/application/lib/cn";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import type { UserManagementActivityRow } from "./types";

export type ActivitiesCardProps = {
  title: string;
  rows: UserManagementActivityRow[];
};

export function ActivitiesCard({ title, rows }: ActivitiesCardProps) {
  return (
    <Card
      className="rounded-[2rem] border-white/80 bg-white"
      style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
    >
      <CardContent className="space-y-6 p-6">
        <h2 className="text-right text-2xl font-bold text-slate-800">{title}</h2>

        <div className="space-y-5">
          {rows.map((row, index) => {
            const Icon = row.icon;

            return (
              <div key={row.id} className="flex items-start gap-4">
                <div className="relative flex flex-col items-center">
                  <div className={cn("rounded-full p-2.5", row.toneClassName)}>
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  {index < rows.length - 1 ? (
                    <div className="mt-2 h-12 w-px bg-slate-200" />
                  ) : null}
                </div>
                <div className="mt-1 flex min-w-0 flex-1 flex-row text-right">
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-xl font-semibold text-slate-800">{row.title}</p>
                    <p className="text-sm text-slate-500">{row.description}</p>
                  </div>
                  <p className="text-xs text-slate-400">{row.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
