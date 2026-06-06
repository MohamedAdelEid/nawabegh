import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/application/lib/cn";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";
import { getUserManagementEditPath } from "@/modules/admin/presentation/lib/userManagementEditForm";

export type UserProfileCardProps = {
  userId: string;
  role: "student" | "teacher" | "parent";
  fullName: string;
  subtitle: string;
  profileImageUrl: string | null;
  schoolLabelTitle: string;
  statusLabelTitle: string;
  subscriptionLabelTitle: string;
  schoolLabel: string;
  statusLabel: string;
  subscriptionLabel: string;
  codeLabel: string;
  codeValue: string;
  profileTag: string;
  editLabel: string;
  isActive: boolean;
};

export function UserProfileCard({
  userId,
  role,
  fullName,
  subtitle,
  profileImageUrl,
  schoolLabelTitle,
  statusLabelTitle,
  subscriptionLabelTitle,
  schoolLabel,
  statusLabel,
  subscriptionLabel,
  codeLabel,
  codeValue,
  profileTag,
  editLabel,
  isActive,
}: UserProfileCardProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(getUserManagementEditPath(role, userId));
  };

  return (
    <Card
      className="rounded-[2rem] border-white/80 bg-white"
      style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
    >
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div
              className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#DBE3F3] bg-[linear-gradient(135deg,#DBEEF6,#F6F8FB)] text-[#243B5A]"
              style={{ boxShadow: "0px 2px 4px 4px #0000000D" }}
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserAvatarImageOrInitials
                  trackKey={userId}
                  name={fullName}
                  imageUrl={null}
                  circleClassName="h-full w-full rounded-full bg-transparent text-3xl"
                />
              )}
            </div>
            <span className="absolute bottom-0 right-[0] w-[max-content] rounded-xl bg-[#67C23A] px-3 py-1 text-sm font-bold text-white">
              {profileTag}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-[#2B415E]">{fullName}</h2>
            <p className="text-lg font-medium text-[#C7AF6D]">{subtitle}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#F8FAFC] p-4 text-right">
            <p className="text-xs text-slate-400">{schoolLabelTitle}</p>
            <p className="mt-1 font-semibold text-slate-800">{schoolLabel}</p>
          </div>
          <div className="rounded-2xl bg-[#F8FAFC] p-4 text-right">
            <p className="text-xs text-slate-400">{statusLabelTitle}</p>
            <p
              className={cn(
                "mt-1 flex items-center gap-2 font-semibold",
                isActive ? "text-[#58CC02]" : "text-slate-500",
              )}
            >
              <span
                className={cn(
                  "block h-2 w-2 rounded-full",
                  isActive ? "bg-[#58CC02]" : "bg-slate-400",
                )}
              />
              {statusLabel}
            </p>
          </div>
          <div className="rounded-2xl bg-[#F8FAFC] p-4 text-right">
            <p className="text-xs text-slate-400">{subscriptionLabelTitle}</p>
            <p className="mt-1 font-semibold text-slate-800">{subscriptionLabel}</p>
          </div>
            <div className="rounded-2xl bg-[#F8FAFC] p-4 text-right">
              <p className="text-xs text-slate-400">{codeLabel}</p>
              <p dir="ltr" className=" mt-1 font-semibold text-slate-800 break-all">
                {codeValue}
              </p>
            </div>
        </div>

        <Button
          type="button"
          onClick={handleEdit}
          className="h-14 w-full rounded-2xl bg-[#243B5A] text-base font-semibold text-white hover:bg-[#1D314B]"
          style={{ boxShadow: "0px 4px 0px 0px #2B415E33" }}
        >
          <Pencil className="h-4 w-4" aria-hidden />
          {editLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
