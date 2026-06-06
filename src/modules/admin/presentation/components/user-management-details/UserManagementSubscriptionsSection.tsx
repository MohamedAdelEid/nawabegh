import { EllipsisVertical } from "lucide-react";
import type { UserDetailSubscriptionRow } from "@/modules/admin/domain/data/userManagementDetailsData";
import { userManagementSubscriptionIcon } from "@/modules/admin/domain/data/userManagementDetailsData";
import {
  DashboardBadge,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { detailsStatusTone } from "./utils";

export type UserManagementSubscriptionsSectionProps = {
  title: string;
  downloadLabel: string;
  columnLabels: {
    plan: string;
    startDate: string;
    endDate: string;
    status: string;
    actions: string;
  };
  subscriptions: UserDetailSubscriptionRow[];
  translate: (key: string) => string;
};

export function UserManagementSubscriptionsSection({
  title,
  downloadLabel,
  columnLabels,
  subscriptions,
  translate,
}: UserManagementSubscriptionsSectionProps) {
  const SubscriptionIcon = userManagementSubscriptionIcon;

  return (
    <DashboardTableCard
      title={title}
      actions={
        <Button type="button" variant="ghost" className="text-slate-500">
          <SubscriptionIcon className="h-4 w-4" aria-hidden />
          {downloadLabel}
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-right">
          <thead className="bg-[#F8FAFC]">
            <tr className="border-b border-slate-100 text-sm text-[#64748B]">
              <th className="px-6 py-5 font-medium">{columnLabels.plan}</th>
              <th className="px-6 py-5 font-medium">{columnLabels.startDate}</th>
              <th className="px-6 py-5 font-medium">{columnLabels.endDate}</th>
              <th className="px-6 py-5 font-medium">{columnLabels.status}</th>
              <th className="px-6 py-5 font-medium">{columnLabels.actions}</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => (
              <tr key={subscription.id} className="border-b border-slate-100 text-sm text-slate-700">
                <td className="px-6 py-5 font-semibold text-slate-800">
                  {translate(subscription.planKey)}
                </td>
                <td className="px-6 py-5 text-slate-500">
                  {translate(subscription.startDateKey)}
                </td>
                <td className="px-6 py-5 text-slate-500">
                  {translate(subscription.endDateKey)}
                </td>
                <td className="px-6 py-5">
                  <DashboardBadge tone={detailsStatusTone(subscription.statusId)}>
                    {translate(
                      `userManagement.details.subscriptions.status.${subscription.statusId}`,
                    )}
                  </DashboardBadge>
                </td>
                <td className="px-6 py-5">
                  <button
                    type="button"
                    className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    aria-label={columnLabels.actions}
                  >
                    <EllipsisVertical className="h-4 w-4" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardTableCard>
  );
}
