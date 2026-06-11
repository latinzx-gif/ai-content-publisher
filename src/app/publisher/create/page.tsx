import Link from "next/link";

import CreateForm from "./CreateForm";

export default function CreatePage() {
  return (
    <div>
      {/* Page suspended from use (boss call, 2026-06-11) — kept reachable for
          tests and future re-enable, but users are pointed to the dashboard. */}
      <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
        หน้านี้งดใช้งานชั่วคราว — เริ่มงานจาก{" "}
        <Link className="font-semibold underline" href="/publisher">
          Dashboard
        </Link>{" "}
        หรือ{" "}
        <Link className="font-semibold underline" href="/publisher/briefs">
          Brief Builder
        </Link>{" "}
        แทน
      </div>
      <CreateForm />
    </div>
  );
}
