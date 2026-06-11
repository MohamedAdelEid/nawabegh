"use client";

import { Button } from "@/shared/presentation/components/ui/button";

export function AddUserFormActions({
  cancelLabel,
  submitLabel,
  submitIcon: SubmitIcon,
  cancelIcon: CancelIcon,
  onCancel,
  onSubmit,
  disabled = false,
}: {
  cancelLabel: string;
  submitLabel: string;
  submitIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  cancelIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onCancel: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-start gap-3 md:justify-end">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className="dashboard-raised-button h-12 rounded-xl border-[var(--dashboard-border-strong)] shadow-[var(--dashboard-shadow-button-muted)] px-6 text-slate-700 disabled:opacity-60"
        onClick={onCancel}
      >
        {CancelIcon ? <CancelIcon className="h-4 w-4" aria-hidden /> : null}
        {cancelLabel}
      </Button>
      <Button
        type="button"
        disabled={disabled}
        className="dashboard-raised-button h-12 rounded-xl bg-[var(--dashboard-primary)] px-6 text-white hover:bg-[var(--dashboard-primary-pressed)] disabled:opacity-60"
        style={{ boxShadow: "var(--dashboard-shadow-button)" }}
        onClick={onSubmit}
      >
        {SubmitIcon ? <SubmitIcon className="h-4 w-4" aria-hidden /> : null}
        {submitLabel}
      </Button>
    </div>
  );
}
