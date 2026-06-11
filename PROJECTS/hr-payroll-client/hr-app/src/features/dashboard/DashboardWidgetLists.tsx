import {
  AlertCircle,
  Building2,
  CalendarDays,
  Clock,
  FilePen,
  FileText,
  GraduationCap,
  IdCard,
  KeyRound,
  SearchCheck,
  Shield,
  Stethoscope,
  Syringe,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { StatusPill } from "@/components/brand/StatusPill"
import type {
  AttendanceException,
  ComplianceItem,
  RecentAlertItem,
} from "@/features/dashboard/widgets-data"
import { cn } from "@/lib/utils"

function IconTile({
  icon: Icon,
  className,
}: {
  icon: LucideIcon
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground",
        className
      )}
    >
      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
    </span>
  )
}

function CircleIcon({
  icon: Icon,
  tone = "neutral",
}: {
  icon: LucideIcon
  tone?: "neutral" | "warning" | "danger" | "info" | "success" | "purple"
}) {
  const tones = {
    neutral: "bg-muted/50 text-muted-foreground",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
    info: "bg-sky-50 text-sky-600",
    success: "bg-emerald-50 text-emerald-600",
    purple: "bg-violet-50 text-violet-600",
  }
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50",
        tones[tone]
      )}
    >
      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
    </span>
  )
}

function AvatarInitials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/)
  const initials =
    parts.length >= 2
      ? `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`
      : (parts[0]?.slice(0, 2) ?? "?")
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
      {initials.toUpperCase()}
    </span>
  )
}

export const DOCUMENT_APPROVAL_ITEMS = [
  {
    label: "Employment Contracts",
    subtitle: "New employee contracts awaiting approval",
    count: 12,
    icon: FilePen,
  },
  {
    label: "ID Proofs",
    subtitle: "Identity documents to verify",
    count: 9,
    icon: IdCard,
  },
  {
    label: "Bank Details",
    subtitle: "Bank account details to confirm",
    count: 7,
    icon: Building2,
  },
  {
    label: "Educational Certificates",
    subtitle: "Certificates awaiting verification",
    count: 6,
    icon: GraduationCap,
  },
  {
    label: "Background Checks",
    subtitle: "Reports awaiting review",
    count: 4,
    icon: SearchCheck,
  },
] as const

const COMPLIANCE_KIND_ICON: Record<
  ComplianceItem["kind"],
  { icon: LucideIcon; tone: "warning" | "danger" | "info" }
> = {
  probation: { icon: Clock, tone: "warning" },
  visa: { icon: Shield, tone: "info" },
  work_permit: { icon: FileText, tone: "info" },
}

const COMPLIANCE_STUB = [
  {
    title: "Annual Labor Law Training",
    status: "Due in 5 days",
    statusTone: "warning" as const,
    date: "May 21, 2025",
    icon: Clock,
    iconTone: "warning" as const,
  },
  {
    title: "Employee Handbook Acknowledgment",
    status: "Overdue",
    statusTone: "danger" as const,
    date: "May 10, 2025",
    icon: AlertCircle,
    iconTone: "danger" as const,
  },
  {
    title: "Quarterly Data Privacy Training",
    status: "Due in 12 days",
    statusTone: "warning" as const,
    date: "May 28, 2025",
    icon: Shield,
    iconTone: "info" as const,
  },
  {
    title: "Workplace Safety Inspection",
    status: "Due in 18 days",
    statusTone: "neutral" as const,
    date: "Jun 03, 2025",
    icon: Stethoscope,
    iconTone: "neutral" as const,
  },
  {
    title: "Vaccination Record Update",
    status: "Due in 25 days",
    statusTone: "neutral" as const,
    date: "Jun 10, 2025",
    icon: Syringe,
    iconTone: "neutral" as const,
  },
] as const

const HR_TICKET_STUB = [
  {
    id: "#HR-2025-1048",
    title: "Payroll discrepancy",
    meta: "May 16, 2025 · Zhang Wei",
    priority: "High",
    priorityVariant: "rejected" as const,
    status: "Open",
    statusVariant: "rejected" as const,
    icon: Wallet,
    iconTone: "purple" as const,
  },
  {
    id: "#HR-2025-1047",
    title: "Leave balance not updated",
    meta: "May 15, 2025 · Li Na",
    priority: "Medium",
    priorityVariant: "warning" as const,
    status: "In Progress",
    statusVariant: "warning" as const,
    icon: CalendarDays,
    iconTone: "danger" as const,
  },
  {
    id: "#HR-2025-1045",
    title: "Access request",
    meta: "May 14, 2025 · Wang Hao",
    priority: "Low",
    priorityVariant: "approved" as const,
    status: "Open",
    statusVariant: "rejected" as const,
    icon: KeyRound,
    iconTone: "success" as const,
  },
  {
    id: "#HR-2025-1043",
    title: "W-2 form request",
    meta: "May 13, 2025 · Chen Jie",
    priority: "Medium",
    priorityVariant: "warning" as const,
    status: "In Progress",
    statusVariant: "warning" as const,
    icon: FileText,
    iconTone: "info" as const,
  },
] as const

function formatExceptionLabel(kind: AttendanceException["kind"]): {
  label: string
  variant: "warning" | "rejected"
} {
  if (kind === "late") {
    return { label: "Late Check-in", variant: "warning" }
  }
  return { label: "Open", variant: "warning" }
}

function formatComplianceKind(kind: ComplianceItem["kind"]): string {
  if (kind === "probation") return "Probation review"
  if (kind === "visa") return "Visa renewal"
  return "Work permit renewal"
}

export function DocumentApprovalsList() {
  return (
    <ul className="space-y-3">
      {DOCUMENT_APPROVAL_ITEMS.map((item) => (
        <li key={item.label} className="flex items-start gap-3">
          <IconTile icon={item.icon} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-tight">{item.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{item.subtitle}</p>
          </div>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-brand-red">
            {item.count}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function ComplianceRemindersList({
  items,
}: {
  items: ComplianceItem[]
}) {
  if (items.length === 0) {
    return (
      <ul className="space-y-3">
        {COMPLIANCE_STUB.map((item) => (
          <li key={item.title} className="flex items-start gap-3">
            <CircleIcon icon={item.icon} tone={item.iconTone} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight">{item.title}</p>
              <p
                className={cn(
                  "mt-0.5 text-xs",
                  item.statusTone === "danger"
                    ? "font-semibold text-brand-red"
                    : item.statusTone === "warning"
                      ? "text-amber-600"
                      : "text-muted-foreground"
                )}
              >
                {item.status}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {item.date}
            </span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const meta = COMPLIANCE_KIND_ICON[item.kind]
        const overdue = item.daysLeft < 0
        return (
          <li
            key={`${item.employeeId}-${item.kind}`}
            className="flex items-start gap-3"
          >
            <CircleIcon
              icon={meta.icon}
              tone={overdue ? "danger" : item.daysLeft <= 7 ? "warning" : meta.tone}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight">
                {item.employeeName}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatComplianceKind(item.kind)}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-xs",
                  overdue
                    ? "font-semibold text-brand-red"
                    : item.daysLeft <= 7
                      ? "text-amber-600"
                      : "text-muted-foreground"
                )}
              >
                {overdue
                  ? "Overdue"
                  : item.daysLeft === 0
                    ? "Due today"
                    : `Due in ${item.daysLeft} days`}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {item.dueDate}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export function AttendanceExceptionsList({
  items,
}: {
  items: AttendanceException[]
}) {
  if (items.length === 0) {
    const demo = [
      {
        name: "Zhang Wei",
        label: "Late Check-in",
        variant: "warning" as const,
        time: "Today, 09:18 AM",
      },
      {
        name: "Li Na",
        label: "Early Check-out",
        variant: "warning" as const,
        time: "Today, 04:12 PM",
      },
      {
        name: "Wang Hao",
        label: "Absent",
        variant: "rejected" as const,
        time: "May 16, 2025",
      },
      {
        name: "Chen Jie",
        label: "Late Check-in",
        variant: "warning" as const,
        time: "May 16, 2025",
      },
      {
        name: "Xu Ming",
        label: "Absent",
        variant: "rejected" as const,
        time: "May 16, 2025",
      },
    ]
    return (
      <ul className="space-y-3">
        {demo.map((row) => (
          <li key={row.name} className="flex items-center gap-3">
            <AvatarInitials name={row.name} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{row.name}</p>
              <StatusPill label={row.label} variant={row.variant} />
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {row.time}
            </span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const st = formatExceptionLabel(item.kind)
        return (
          <li key={item.id} className="flex items-center gap-3">
            <AvatarInitials name={item.employeeName} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.employeeName}</p>
              <StatusPill label={st.label} variant={st.variant} />
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {item.detail}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export function RecentHrTicketsList({
  items,
}: {
  items: RecentAlertItem[]
}) {
  if (items.length === 0) {
    return (
      <ul className="space-y-3">
        {HR_TICKET_STUB.map((ticket) => (
          <li key={ticket.id} className="flex items-start gap-3">
            <CircleIcon icon={ticket.icon} tone={ticket.iconTone} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight">
                <span className="text-muted-foreground">{ticket.id}</span>
                {" · "}
                {ticket.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{ticket.meta}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <StatusPill label={ticket.priority} variant={ticket.priorityVariant} />
                <StatusPill label={ticket.status} variant={ticket.statusVariant} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => {
        const stub = HR_TICKET_STUB[index % HR_TICKET_STUB.length]
        return (
          <li key={item.id} className="flex items-start gap-3">
            <CircleIcon icon={stub.icon} tone={stub.iconTone} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight">
                <span className="text-muted-foreground">Alert</span>
                {" · "}
                {item.alertType}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.triggerDate} · {item.employeeName}
              </p>
              <div className="mt-1.5">
                <StatusPill
                  label={item.status === "failed" ? "Failed" : "Open"}
                  variant={item.status === "failed" ? "rejected" : "pending"}
                />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
