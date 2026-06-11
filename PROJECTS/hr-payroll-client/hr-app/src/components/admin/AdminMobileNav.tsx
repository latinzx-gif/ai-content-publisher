"use client"

import { useState } from "react"
import { Menu } from "lucide-react"

import { AdminNavLinks } from "@/components/admin/AdminSidebar"
import { BrandMark } from "@/components/brand/BrandMark"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet"

export function AdminMobileNav({ alertBadge = 0 }: { alertBadge?: number }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="size-5" />
            <span className="sr-only">เปิดเมนู</span>
          </Button>
        }
      />
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b px-5 py-6">
          <BrandMark variant="sidebar" />
        </SheetHeader>
        <div className="py-4">
          <AdminNavLinks
            alertBadge={alertBadge}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
