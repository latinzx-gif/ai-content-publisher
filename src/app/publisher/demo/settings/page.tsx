"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemoStore } from "@/lib/publisher/demo/store";
import {
  Settings, FileText, Users, CheckSquare,
  LayoutTemplate, Tag, Clock, Plug,
  Trash2, X, Plus,
  Check, ChevronDown, Info, Lock,
  Bell, ShieldCheck, UserCheck,
} from "lucide-react";
import { PlatformIcon } from "@/components/publisher/demo/PlatformIcon";
import { BrandIcon } from "@/components/publisher/demo/BrandIcon";

// ── Nav structure ──────────────────────────────────────────────────────────────
type SectionId =
  | "general" | "brand" | "team" | "approvals"
  | "templates" | "labels" | "timetable"
  | "integrations";

const NAV: { group: string; items: { id: SectionId; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] }[] = [
  {
    group: "Workspace",
    items: [
      { id: "general",      label: "General settings", icon: Settings       },
      { id: "brand",        label: "Brand context",    icon: FileText       },
      { id: "team",         label: "Team & clients",   icon: Users          },
      { id: "approvals",    label: "Approvals",        icon: CheckSquare    },
      { id: "integrations", label: "Integrations",     icon: Plug           },
    ],
  },
  {
    group: "Content",
    items: [
      { id: "templates", label: "Templates", icon: LayoutTemplate },
      { id: "labels",    label: "Labels",    icon: Tag            },
      { id: "timetable", label: "Timetable", icon: Clock          },
    ],
  },
];

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ on, onChange, label }: { on: boolean; onChange?: (v: boolean) => void; label?: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange?.(!on)}
      className="relative flex-shrink-0 transition-colors rounded-full"
      style={{ width: 44, height: 24, background: on ? "#4f46e5" : "#d1d5db" }}
    >
      <span
        className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-[left]"
        style={{ left: on ? "calc(100% - 21px)" : "3px" }}
      />
    </button>
  );
}

// ── SVG icons for 3rd-party apps ──────────────────────────────────────────────
// ── General settings ──────────────────────────────────────────────────────────
function GeneralSection() {
  const [wsName, setWsName] = useState("DataClaw");
  const [website, setWebsite] = useState("dataclaw.io");
  const [tz, setTz] = useState("Asia/Bangkok");
  const [internal, setInternal] = useState(false);
  const [hideEmails, setHideEmails] = useState(false);
  const [saved, setSaved] = useState(false);
  const { resetDemo } = useDemoStore();
  const router = useRouter();

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  return (
    <div className="max-w-xl flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ws-name" className="text-[13px] text-gray-600">Workspace name</label>
          <input
            id="ws-name"
            value={wsName}
            onChange={(e) => setWsName(e.target.value)}
            className="border border-[#d1d5db] rounded-lg px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ws-url" className="text-[13px] text-gray-600">Website URL</label>
          <input
            id="ws-url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="e.g. planable.io"
            className="border border-[#d1d5db] rounded-lg px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ws-tz" className="text-[13px] text-gray-600">Workspace timezone</label>
          <div className="relative">
            <select
              id="ws-tz"
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              className="w-full border border-[#d1d5db] rounded-lg px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 appearance-none bg-white transition-colors pr-10"
            >
              <option value="Asia/Bangkok">Bangkok, Asia  (UTC +7)</option>
              <option value="Asia/Singapore">Singapore (UTC +8)</option>
              <option value="UTC">UTC</option>
            </select>
            <ChevronDown size={16} className="absolute right-3.5 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[14px] text-gray-700">
            <span className="text-gray-400">✂</span> Create new posts as internal
            <Info size={14} className="text-gray-300" />
          </div>
          <Toggle on={internal} onChange={setInternal} label="Create new posts as internal" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[14px] text-gray-700">
            <span className="text-gray-400">@</span> Hide emails from clients
            <Info size={14} className="text-gray-300" />
          </div>
          <Toggle on={hideEmails} onChange={setHideEmails} label="Hide emails from clients" />
        </div>
      </div>

      <button
        onClick={save}
        className={`self-start flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98] ${saved ? "bg-emerald-500" : "bg-[#4f46e5] hover:bg-[#4338ca]"}`}
      >
        {saved ? <><Check size={13} /> Saved</> : "Save changes"}
      </button>

      {/* Delete workspace */}
      <div className="border-t border-[#f0f0f0] pt-6">
        <h4 className="text-[15px] font-semibold text-gray-800 mb-1">Delete workspace</h4>
        <p className="text-[13px] text-gray-400 mb-3">Permanently deletes this workspace and all its data.<br />This cannot be undone.</p>
        <button
          className="text-[13px] font-semibold text-red-500 hover:underline"
          onClick={() => { if (window.confirm("Delete this workspace? This cannot be undone.")) { resetDemo(); router.push("/publisher/demo"); } }}
        >
          Delete this workspace
        </button>
      </div>
    </div>
  );
}

// ── Brand context ─────────────────────────────────────────────────────────────
const BRAND_FIELDS = [
  { key: "desc",       label: "Company description",  hint: "What the company does, who it serves, and what makes it different." },
  { key: "products",   label: "Products & services",  hint: "The main products or services this brand offers." },
  { key: "tone",       label: "Tone of voice",        hint: "How the brand should sound, e.g. warm and direct, never corporate." },
  { key: "values",     label: "Brand values",         hint: "What the brand stands for, and topics it should avoid." },
  { key: "terms",      label: "Approved terminology", hint: "Product names, preferred wording, and phrases to never use." },
  { key: "audience",   label: "Audience",             hint: "The people you reach on each platform, and what they care about." },
  { key: "hashtags",   label: "Hashtags",             hint: "Default hashtags to include in posts." },
  { key: "links",      label: "Links",                hint: "Default URLs for bios or post footers." },
];

function BrandSection() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="max-w-2xl flex flex-col gap-0">
      {/* AI hint banner */}
      {!dismissed && (
        <div className="flex items-start justify-between bg-[#f5f3ff] border border-[#e0e7ff] rounded-xl px-5 py-3.5 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-[#4f46e5] text-[16px] mt-0.5">✦</span>
            <div>
              <p className="text-[13px] font-semibold text-gray-800">Fill these in and Postable&apos;s AI will use them to write on-brand content</p>
              <p className="text-[12px] text-gray-500 mt-0.5">Add more sections or skip any you don&apos;t need.</p>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="text-[12px] text-gray-400 hover:text-gray-600 font-medium ml-4 flex-shrink-0">
            Dismiss
          </button>
        </div>
      )}

      <div className="border border-[#e5e7eb] rounded-2xl divide-y divide-[#f0f0f0] overflow-hidden">
        {BRAND_FIELDS.map((f) => (
          <div key={f.key} className="px-6 py-5">
            <label htmlFor={`brand-${f.key}`} className="text-[17px] font-semibold text-gray-800 mb-1 block">{f.label}</label>
            <p className="text-[13px] text-gray-400 mb-3">{f.hint}</p>
            <textarea
              id={`brand-${f.key}`}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
              rows={2}
              placeholder={`Write ${f.label.toLowerCase()}…`}
              className="w-full border border-[#e5e7eb] rounded-xl px-3.5 py-2.5 text-[13px] resize-none focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-colors placeholder:text-gray-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Team & clients ─────────────────────────────────────────────────────────────
type TeamSubTab = "members" | "permissions" | "notifications";

const MEMBERS = [
  { name: "Jakarin Osk (you)", email: "latinzx@gmail.com", membership: "Team", role: "Company Owner", online: true,  avatar: "J", color: "#d92d20" },
  { name: "Ploy Saengsawang",  email: "ploy@dataclaw.io",  membership: "Team", role: "Admin",         online: false, avatar: "P", color: "#7c3aed" },
  { name: "Nat Tanawat",       email: "nat@dataclaw.io",   membership: "Team", role: "Member",        online: false, avatar: "N", color: "#0ea5e9" },
  { name: "Mam Kanokwan",      email: "mam@dataclaw.io",   membership: "Client", role: "Approver",    online: true,  avatar: "M", color: "#10b981" },
];

function TeamSection() {
  const [sub, setSub] = useState<TeamSubTab>("members");

  return (
    <div className="max-w-3xl">
      {/* Sub-tabs + Invite button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(["members","permissions","notifications"] as TeamSubTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setSub(t)}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-medium capitalize transition-colors ${sub === t ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
            >
              {t === "members" ? <span className="flex items-center gap-1.5"><Users size={13} />{t}</span>
               : t === "permissions" ? <span className="flex items-center gap-1.5"><ShieldCheck size={13} />{t}</span>
               : <span className="flex items-center gap-1.5"><Bell size={13} />{t}</span>}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#4f46e5] hover:bg-[#4338ca] px-4 py-2 rounded-lg transition-colors active:scale-[0.98]">
          <UserCheck size={14} /> Invite members
        </button>
      </div>

      {sub === "members" && (
        <div className="border border-[#e5e7eb] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f0] bg-[#fafafa]">
                {["User","Membership","Role","Last online",""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[12px] font-semibold text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {MEMBERS.map((m) => (
                <tr key={m.email} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0" style={{ background: m.color }}>
                        {m.avatar}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-800">{m.name}</p>
                        <p className="text-[11px] text-gray-400">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${m.membership === "Team" ? "bg-[#4f46e5] text-white" : "bg-gray-100 text-gray-600"}`}>
                      {m.membership}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[12px] text-gray-600 border border-[#e5e7eb] px-2.5 py-1 rounded-lg bg-white">
                      {m.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[12px] font-medium ${m.online ? "text-emerald-500" : "text-gray-400"}`}>
                      {m.online ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {m.role !== "Company Owner" && (
                      <button aria-label={`Remove ${m.name}`} className="text-red-300 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors">
                        <X size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sub === "permissions" && (
        <div className="border border-[#e5e7eb] rounded-2xl p-8 text-center text-gray-400">
          <ShieldCheck size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-[14px] font-semibold text-gray-600 mb-1">Role permissions</p>
          <p className="text-[13px]">Configure what each role can see and do in this workspace.</p>
        </div>
      )}

      {sub === "notifications" && (
        <div className="border border-[#e5e7eb] rounded-2xl p-8 text-center text-gray-400">
          <Bell size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-[14px] font-semibold text-gray-600 mb-1">Notification settings</p>
          <p className="text-[13px]">Control which events trigger email or in-app notifications per role.</p>
        </div>
      )}
    </div>
  );
}

// ── Approvals ─────────────────────────────────────────────────────────────────
type ApprovalMode = "none" | "optional" | "required" | "multilevel";

function ApprovalsSection() {
  const [mode, setMode] = useState<ApprovalMode>("optional");
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [lockAfter, setLockAfter] = useState(false);
  const [reminders, setReminders] = useState(false);

  const MODES: { id: ApprovalMode; label: string; desc: string; checks: number; badge?: string; badgeColor?: string }[] = [
    { id: "none",       label: "None",        desc: "Approvals are disabled and not needed for publishing",            checks: 0 },
    { id: "optional",   label: "Optional",    desc: "Approvals are enabled, but not required for publishing",          checks: 1 },
    { id: "required",   label: "Required",    desc: "A member has to approve the content before publishing",           checks: 1, badge: "PRO",       badgeColor: "#6366f1" },
    { id: "multilevel", label: "Multi-level", desc: "2+ members need to approve content before publishing",            checks: 3, badge: "ENT",       badgeColor: "#f59e0b" },
  ];

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      {/* Mode cards */}
      <div className="grid grid-cols-4 gap-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`relative text-left p-4 rounded-xl border-2 transition-all ${
              mode === m.id ? "border-[#4f46e5] bg-[#f5f3ff]" : "border-[#e5e7eb] hover:border-gray-300 bg-white"
            }`}
          >
            {mode === m.id && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#4f46e5] flex items-center justify-center">
                <Check size={10} className="text-white" strokeWidth={3} />
              </div>
            )}
            {/* Check icons */}
            <div className="flex gap-1 mb-3">
              {m.checks === 0
                ? <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                : Array.from({ length: m.checks }).map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                  ))
              }
            </div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[14px] font-semibold text-gray-800">{m.label}</span>
              {m.badge && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded text-white" style={{ background: m.badgeColor }}>
                  {m.badge}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 leading-snug">{m.desc}</p>
          </button>
        ))}
      </div>

      {mode !== "none" && (
        <>
          {/* Who can approve */}
          <div>
            <p className="text-[14px] font-semibold text-gray-700 mb-3">Who can approve content?</p>
            <div className="flex items-center justify-between border border-[#e5e7eb] rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#d92d20] flex items-center justify-center text-white text-[12px] font-bold">J</div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-800 flex items-center gap-2">
                    Jakarin Osk (you)
                    <span className="text-[10px] font-bold bg-[#4f46e5] text-white px-2 py-0.5 rounded-full">Team</span>
                  </p>
                  <p className="text-[11px] text-gray-400">latinzx@gmail.com · Online</p>
                </div>
              </div>
              <Toggle on={true} label="Jakarin Osk can approve" />
            </div>
          </div>

          {/* Settings toggles */}
          <div>
            <p className="text-[14px] font-semibold text-gray-700 mb-3">Settings</p>
            <div className="flex flex-col gap-3">
              {[
                { icon: <Clock size={15} className="text-gray-400"/>, label: "Schedule posts automatically on approval", val: autoSchedule, set: setAutoSchedule },
                { icon: <Lock size={15} className="text-gray-400"/>,  label: "Lock content after approval",              val: lockAfter,    set: setLockAfter    },
                { icon: <Bell size={15} className="text-red-400"/>,   label: "Automatic reminders for pending approvals", val: reminders,    set: setReminders    },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[13px] text-gray-700">
                    {item.icon} {item.label}
                    {item.label.includes("reminders") && <Info size={13} className="text-gray-300" />}
                  </div>
                  <Toggle on={item.val} onChange={item.set} label={item.label} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Integrations ──────────────────────────────────────────────────────────────
type ConnState = Record<string, boolean>;

function IntegrationsSection() {
  const [social, setSocial] = useState<ConnState>({
    facebook: true, instagram: true, linkedin: true, tiktok: false,
  });
  const [apps, setApps] = useState<ConnState>({
    drive: true, canva: true, obsidian: false, line: true, notion: false, zapier: false, make: false,
  });

  const APP_LIST: {
    key: string;
    label: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    { key: "drive",    label: "Google Drive",  desc: "Attach images and files directly from Drive",         icon: <BrandIcon brand="googledrive" size={28} /> },
    { key: "canva",    label: "Canva",          desc: "Design visuals inside Postable without leaving",      icon: <BrandIcon brand="canva"       size={28} /> },
    { key: "obsidian", label: "Obsidian",       desc: "Pull notes, ideas, and brand docs from your vault",   icon: <BrandIcon brand="obsidian"    size={28} /> },
    { key: "line",     label: "Line",           desc: "Send approval notifications to Line groups",          icon: <BrandIcon brand="line"        size={28} /> },
    { key: "notion",   label: "Notion",         desc: "Sync content briefs and pages from Notion",           icon: <BrandIcon brand="notion"      size={28} /> },
    { key: "zapier",   label: "Zapier",         desc: "Automate workflows with 5,000+ apps",                 icon: <BrandIcon brand="zapier"      size={28} /> },
    { key: "make",     label: "Make",           desc: "Build advanced multi-step automations visually",      icon: <BrandIcon brand="make"        size={28} /> },
  ];

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      {/* Social channels */}
      <div>
        <h3 className="text-[14px] font-bold text-gray-500 uppercase tracking-wider mb-3">Social Channels</h3>
        <div className="border border-[#e5e7eb] rounded-2xl divide-y divide-[#f5f5f5] overflow-hidden">
          {(["facebook","instagram","linkedin","tiktok"] as const).map((p) => {
            const names = { facebook: "Facebook Page", instagram: "Instagram Business", linkedin: "LinkedIn Company", tiktok: "TikTok Business" };
            const on = social[p];
            return (
              <div key={p} className="flex items-center gap-4 px-5 py-4">
                <PlatformIcon platform={p} size={28} />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-gray-800">{names[p]}</p>
                  <p className={`text-[11px] font-medium mt-0.5 ${on ? "text-emerald-500" : "text-gray-400"}`}>
                    {on ? "Connected · DataClaw account" : "Not connected"}
                  </p>
                </div>
                <button
                  onClick={() => setSocial((prev) => ({ ...prev, [p]: !on }))}
                  className={`text-[12px] font-semibold px-4 py-1.5 rounded-lg border transition-colors ${
                    on
                      ? "border-red-200 text-red-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                      : "border-[#4f46e5] text-[#4f46e5] hover:bg-[#f5f3ff]"
                  }`}
                >
                  {on ? "Disconnect" : "Connect"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Third-party apps */}
      <div>
        <h3 className="text-[14px] font-bold text-gray-500 uppercase tracking-wider mb-3">Apps & Tools</h3>
        <div className="border border-[#e5e7eb] rounded-2xl divide-y divide-[#f5f5f5] overflow-hidden">
          {APP_LIST.map((app) => {
            const on = apps[app.key];
            return (
              <div key={app.key} className="flex items-center gap-4 px-5 py-4">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">{app.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-gray-800">{app.label}</p>
                    {on && (
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full">Connected</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">{app.desc}</p>
                </div>
                <button
                  onClick={() => setApps((prev) => ({ ...prev, [app.key]: !on }))}
                  className={`text-[12px] font-semibold px-4 py-1.5 rounded-lg border transition-colors flex-shrink-0 ${
                    on
                      ? "border-red-200 text-red-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                      : "border-[#4f46e5] text-[#4f46e5] hover:bg-[#f5f3ff]"
                  }`}
                >
                  {on ? "Disconnect" : "Connect"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Templates ─────────────────────────────────────────────────────────────────
function TemplatesSection() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <h3 className="text-[18px] font-bold text-gray-800">Manage your workspace templates</h3>
      <p className="text-[14px] text-gray-400 text-center max-w-md">
        Create content faster with reusable captions, hashtags, and text snippets
        for all your social media profiles and other content.
      </p>
      <button className="mt-2 px-6 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[#4f46e5] hover:bg-[#4338ca] transition-colors">
        Create new template
      </button>
    </div>
  );
}

// ── Labels ────────────────────────────────────────────────────────────────────
const DEFAULT_LABELS = [
  { name: "Launch", color: "#6366f1" },
  { name: "Promotion", color: "#f59e0b" },
  { name: "Educational", color: "#10b981" },
  { name: "Evergreen", color: "#0ea5e9" },
];

function LabelsSection() {
  const [labels, setLabels] = useState(DEFAULT_LABELS);
  const [newLabel, setNewLabel] = useState("");

  function addLabel() {
    if (!newLabel.trim()) return;
    setLabels((p) => [...p, { name: newLabel.trim(), color: "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0") }]);
    setNewLabel("");
  }

  return (
    <div className="max-w-lg flex flex-col gap-5">
      <div className="border border-[#e5e7eb] rounded-2xl divide-y divide-[#f5f5f5] overflow-hidden">
        {labels.map((l) => (
          <div key={l.name} className="flex items-center gap-3 px-5 py-3.5">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: l.color }} />
            <span className="text-[13px] font-semibold text-gray-800 flex-1">{l.name}</span>
            <button
              aria-label={`Delete label ${l.name}`}
              onClick={() => setLabels((p) => p.filter((x) => x.name !== l.name))}
              className="text-red-300 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addLabel()}
          placeholder="New label name…"
          className="flex-1 border border-[#d1d5db] rounded-lg px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-colors"
        />
        <button onClick={addLabel} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#4f46e5] text-white text-[13px] font-semibold hover:bg-[#4338ca] transition-colors">
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}

// ── Timetable ─────────────────────────────────────────────────────────────────
function TimetableSection() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <h3 className="text-[18px] font-bold text-gray-800">Add your preferred time slots</h3>
      <p className="text-[14px] text-gray-400 text-center max-w-md">
        Set up your timetable for faster scheduling across all your social media profiles.
      </p>
      <button className="mt-2 px-6 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[#4f46e5] hover:bg-[#4338ca] transition-colors">
        Create a slot
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const SECTION_CONTENT: Record<SectionId, { title: string; component: React.ReactNode }> = {
  general:      { title: "General settings", component: <GeneralSection />      },
  brand:        { title: "Brand context",    component: <BrandSection />        },
  team:         { title: "Team & clients",   component: <TeamSection />         },
  approvals:    { title: "Approvals",        component: <ApprovalsSection />    },
  integrations: { title: "Integrations",     component: <IntegrationsSection /> },
  templates:    { title: "Templates",        component: <TemplatesSection />    },
  labels:       { title: "Labels",           component: <LabelsSection />       },
  timetable:    { title: "Timetable",        component: <TimetableSection />    },
};

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>("general");
  const { title, component } = SECTION_CONTENT[active];

  return (
    <div className="flex h-full overflow-hidden bg-white">

      {/* ── Left nav ── */}
      <nav aria-label="Settings navigation" className="w-52 flex-shrink-0 border-r border-[#e8e8e8] flex flex-col py-5 px-3 gap-4">
        {NAV.map((group) => (
          <div key={group.group}>
            <p role="presentation" className="text-[11px] font-semibold text-gray-400 px-3 mb-1.5">{group.group}</p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`settings-panel-${item.id}`}
                    onClick={() => setActive(item.id)}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] transition-colors text-left ${
                      isActive
                        ? "bg-[#ede9fe] text-[#4f46e5] font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <Icon size={14} className={isActive ? "text-[#4f46e5]" : "text-gray-400"} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto px-10 py-8">
        <h1 className="text-[22px] font-bold text-gray-900 mb-7">{title}</h1>
        <div
          id={`settings-panel-${active}`}
          role="tabpanel"
          aria-label={title}
        >
          {component}
        </div>
      </div>
    </div>
  );
}
