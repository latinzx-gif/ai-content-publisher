'use client';

import { BackendReadinessMap } from '@/features/prd/views/settings/BackendReadinessMap';

export function SettingsProfile({ page }: { page: string }) {
  if (page === 'General') {
    return <BackendReadinessMap />;
  }

  if (page !== 'Profile') {
    return (
      <div>
        <h2 className="text-base font-semibold text-[#171717]">{page}</h2>
        <div className="mt-4 rounded-2xl border border-[#deded8] bg-white p-6">
          <p className="text-sm leading-relaxed text-[#6e6e68]">
            {page} settings will control workspace preferences, notifications, API tokens, daemon runtime, updates, repositories, GitHub, labs, and members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-[#171717]">Profile</h2>
      <div className="mt-4 max-w-3xl rounded-2xl border border-[#deded8] bg-white p-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#deded8] bg-[#dcebff] text-xl font-semibold text-[#2f4f7f]">
            JO
          </div>
          <button className="text-sm text-[#6e6e68] hover:text-[#171717]" type="button">Click to upload avatar</button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-[#6e6e68]">Name</label>
            <input className="h-9 w-full rounded-lg border border-[#deded8] bg-white px-3 text-sm outline-none ring-[#2f4f7f] focus:ring-1" defaultValue="Jakarin Osk" />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-[#6e6e68]">About you</label>
            <textarea
              className="min-h-24 w-full resize-none rounded-lg border border-[#deded8] bg-white p-3 text-sm outline-none ring-[#2f4f7f] placeholder:text-[#8a8a82] focus:ring-1"
              placeholder="e.g. Legal/accounting content operator. Prefer concise, accurate, citation-backed content."
            />
            <div className="mt-1 text-xs text-[#6e6e68]">Shared with agents working on your behalf: role, stack, preferences, and context.</div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button className="w-full rounded-lg border border-[#cfcfc8] bg-[#f6f6f2] px-4 py-2 text-xs font-semibold text-[#171717] hover:bg-white sm:w-auto" type="button">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}

