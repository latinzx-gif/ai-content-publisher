import Image from "next/image"

import { cn } from "@/lib/utils"

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
  }
  return (parts[0]?.slice(0, 2) ?? "?").toUpperCase()
}

export function EmployeeAvatar({
  name,
  size = "md",
  className,
}: {
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const sizes = {
    sm: "size-8 text-[10px]",
    md: "size-10 text-xs",
    lg: "size-20 text-lg",
  }

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-muted font-semibold text-muted-foreground",
        sizes[size],
        className
      )}
    >
      <Image
        src="/brand/mascot-hd.png"
        alt=""
        fill
        className="object-contain p-0.5"
      />
      <span className="sr-only">{initialsFromName(name)}</span>
    </span>
  )
}
