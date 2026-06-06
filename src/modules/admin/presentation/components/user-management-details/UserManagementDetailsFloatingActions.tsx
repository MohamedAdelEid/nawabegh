import { Phone } from "lucide-react";
import type { UserManagementDetail } from "@/modules/admin/domain/data/userManagementDetailsData";
import { Button } from "@/shared/presentation/components/ui/button";

export type UserManagementDetailsFloatingActionsProps = {
  contactLabel: string;
  floatingActions: UserManagementDetail["floatingActions"];
  translate: (key: string) => string;
};

export function UserManagementDetailsFloatingActions({
  contactLabel,
  floatingActions,
  translate,
}: UserManagementDetailsFloatingActionsProps) {
  const ShareIcon = floatingActions.shareIcon;
  const PrintIcon = floatingActions.printIcon;

  return (
    <div className="sticky bottom-6 z-20 flex justify-center">
      <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white px-3 py-2 shadow-[0_16px_32px_rgba(15,23,42,0.12)]">
        <Button
          type="button"
          className="dashboard-raised-button h-12 rounded-full bg-[#243B5A] px-6 text-base font-semibold text-white hover:bg-[#1D314B]"
          style={{ boxShadow: "0px 4px 0px 0px #2B415E33" }}
        >
          <Phone className="h-4 w-4" aria-hidden />
          {contactLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full text-slate-500"
          aria-label={translate(floatingActions.shareLabelKey)}
        >
          <ShareIcon className="h-5 w-5" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full text-slate-500"
          aria-label={translate(floatingActions.printLabelKey)}
        >
          <PrintIcon className="h-5 w-5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
