'use client';

export type CreateStepProps = {
  index: number;
  label: string;
  active?: boolean;
  completed?: boolean;
};

export function CreateStep({ index, label, active = false, completed = false }: CreateStepProps) {
  return (
    <div aria-current={active ? 'step' : undefined} className={`flex items-center gap-2 text-xs font-semibold ${active || completed ? 'text-[#172033]' : 'text-[#8a9ab4]'}`}>
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
          active
            ? 'border-[#1f5eff] bg-white text-[#1f5eff]'
            : completed
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-transparent bg-[#dbe3ef] text-[#7f91ad]'
        }`}
      >
        {index}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}
