'use client';

import { X } from 'lucide-react';

export type SafetyConfirmationTone = 'default' | 'danger' | 'success' | 'info';

export type SafetyConfirmation = {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: SafetyConfirmationTone;
  details?: string[];
  reasonLabel?: string;
  reasonRequired?: boolean;
  initialReason?: string;
  onConfirm: (reason: string) => void;
};

export type SafetyConfirmationDialogProps = {
  confirmation: SafetyConfirmation;
  reason: string;
  onReasonChange: (reason: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function SafetyConfirmationDialog({
  confirmation,
  reason,
  onReasonChange,
  onCancel,
  onConfirm,
}: SafetyConfirmationDialogProps) {
  const tone = confirmation.tone ?? 'default';
  const toneStyles: Record<SafetyConfirmationTone, { panel: string; badge: string; button: string }> = {
    default: {
      panel: 'border-[#deded8] bg-white',
      badge: 'border-[#deded8] bg-[#f6f6f2] text-[#4f4f49]',
      button: 'bg-[#171717] text-white hover:bg-[#2f2f2b]',
    },
    danger: {
      panel: 'border-rose-200 bg-white',
      badge: 'border-rose-200 bg-rose-50 text-rose-800',
      button: 'bg-rose-700 text-white hover:bg-rose-800',
    },
    success: {
      panel: 'border-emerald-200 bg-white',
      badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      button: 'bg-emerald-700 text-white hover:bg-emerald-800',
    },
    info: {
      panel: 'border-[#cfd8ea] bg-white',
      badge: 'border-[#cfd8ea] bg-[#f4f7fd] text-[#2f4f7f]',
      button: 'bg-[#2f4f7f] text-white hover:bg-[#263f65]',
    },
  };
  const confirmDisabled = Boolean(confirmation.reasonRequired && !reason.trim());

  return (
    <div data-testid="safety-confirmation-dialog" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 p-3 backdrop-blur-[2px]">
      <section className={`max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-hidden overflow-y-auto rounded-2xl border shadow-2xl ${toneStyles[tone].panel}`}>
        <div className="flex items-start justify-between gap-3 border-b border-[#e8e8e4] bg-[#fbfbfa] p-4">
          <div>
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${toneStyles[tone].badge}`}>
              Safety confirmation
            </span>
            <h2 className="mt-2 text-base font-semibold tracking-[-0.02em] text-[#171717]">{confirmation.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#6e6e68]">{confirmation.description}</p>
          </div>
          <button
            onClick={onCancel}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#deded8] bg-white text-[#6e6e68] hover:bg-[#f6f6f2]"
            type="button"
          >
            <span className="sr-only">Close confirmation</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          {confirmation.details?.length ? (
            <div className="rounded-xl border border-[#deded8] bg-[#f6f6f2] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8a82]">Action details</p>
              <div className="mt-2 space-y-1.5">
                {confirmation.details.map((detail) => (
                  <p key={detail} className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-[#4f4f49]">
                    {detail}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          <label className="block">
            <span className="text-xs font-semibold text-[#4f4f49]">
              {confirmation.reasonLabel ?? 'Confirmation note'}
              {confirmation.reasonRequired ? ' *' : ''}
            </span>
            <textarea
              data-testid="safety-confirmation-reason"
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              className="mt-2 min-h-24 w-full resize-none rounded-xl border border-[#deded8] bg-white px-3 py-2 text-sm leading-relaxed text-[#171717] outline-none transition focus:border-[#2f4f7f] focus:ring-2 focus:ring-[#d9e0ef]"
              placeholder={confirmation.reasonRequired ? 'กรอกเหตุผลก่อนยืนยัน action นี้' : 'Optional note for audit log...'}
            />
          </label>

          {confirmation.reasonRequired && !reason.trim() ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              Required for Reject: ต้องใส่เหตุผลเพื่อให้ทีมตรวจสอบย้อนหลังได้
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[#e8e8e4] bg-[#fbfbfa] p-4 sm:flex-row sm:justify-end">
          <button
            data-testid="safety-confirmation-cancel"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#deded8] bg-white px-4 text-sm font-semibold text-[#4f4f49] hover:bg-[#f6f6f2]"
            type="button"
          >
            Cancel
          </button>
          <button
            data-testid="safety-confirmation-confirm"
            disabled={confirmDisabled}
            onClick={onConfirm}
            className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${toneStyles[tone].button}`}
            type="button"
          >
            {confirmation.confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
