import { cn } from "@/shared/application/lib/cn";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

export type DetailStatCardProps = {
  label: string;
  value: string;
  accentClassName: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconToneClassName: string;
};

export function DetailStatCard({
  label,
  value,
  accentClassName,
  icon: Icon,
  iconToneClassName,
}: DetailStatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border-white/80 bg-white before:absolute before:bottom-0 before:right-0 before:top-auto before:h-1 before:w-full",
        accentClassName,
      )}
    >
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-1.5 text-right">
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            iconToneClassName,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}
