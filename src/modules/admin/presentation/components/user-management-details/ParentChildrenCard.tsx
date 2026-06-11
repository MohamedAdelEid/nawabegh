import { DashboardBadge } from "@/shared/presentation/components/dashboard";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";
import type { UserManagementParentChildRow } from "./types";

export type ParentChildrenCardProps = {
  title: string;
  roleLabel: string;
  children: UserManagementParentChildRow[];
  emptyLabel: string;
};

export function ParentChildrenCard({
  title,
  roleLabel,
  children,
  emptyLabel,
}: ParentChildrenCardProps) {
  return (
    <Card
      className="rounded-[2rem] border-white/80 bg-white"
      style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
    >
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-right text-2xl font-bold text-slate-800">{title}</h2>
          <DashboardBadge tone="info">{roleLabel}</DashboardBadge>
        </div>

        <div className="space-y-3">
          {children.length > 0 ? (
            children.map((child) => (
              <div
                key={child.id}
                className="flex items-center gap-3 rounded-[1.5rem] border border-slate-100 bg-[#F8FAFC] p-4 text-right"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#DBE3F3] bg-white">
                  {child.profileImageUrl ? (
                    <img
                      src={child.profileImageUrl}
                      alt={child.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserAvatarImageOrInitials
                      trackKey={child.id}
                      name={child.fullName}
                      imageUrl={null}
                      circleClassName="h-full w-full rounded-full bg-[#E8EEF8] text-sm text-[#243B5A]"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">{child.fullName}</p>
                  <p className="mt-1 text-sm text-slate-500">{child.gradeName || emptyLabel}</p>
                  <p dir="ltr" className="mt-1 text-xs text-slate-400">
                    {child.username || emptyLabel}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              {emptyLabel}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
