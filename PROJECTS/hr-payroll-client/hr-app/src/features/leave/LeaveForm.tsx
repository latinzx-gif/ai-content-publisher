"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { formatLeaveApiError } from "@/features/leave/balance"
import {
  countLeaveDays,
  LEAVE_TYPE_LABELS,
  LEAVE_TYPES,
} from "@/features/leave/types"

const MAX_FILE_BYTES = 5 * 1024 * 1024
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"]

const leaveFormSchema = z
  .object({
    type: z.enum(LEAVE_TYPES, "เลือกประเภทการลา"),
    startDate: z.string().min(1, "เลือกวันเริ่มลา"),
    endDate: z.string().min(1, "เลือกวันสิ้นสุด"),
    reason: z.string().trim().min(5, "กรุณาระบุเหตุผลอย่างน้อย 5 ตัวอักษร"),
  })
  .refine((v) => countLeaveDays(v.startDate, v.endDate) !== null, {
    path: ["endDate"],
    message: "วันสิ้นสุดต้องไม่อยู่ก่อนวันเริ่มลา",
  })

type LeaveFormValues = z.infer<typeof leaveFormSchema>

const inputClassName =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"

export function LeaveForm() {
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    mode: "onTouched",
    defaultValues: { type: "sick", startDate: "", endDate: "", reason: "" },
  })

  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const type = form.watch("type")
  const days = countLeaveDays(form.watch("startDate"), form.watch("endDate"))

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null
    if (!selected) {
      setFile(null)
      setFileError(null)
      return
    }
    if (!ALLOWED_FILE_TYPES.includes(selected.type)) {
      setFile(null)
      setFileError("รองรับเฉพาะไฟล์ JPEG, PNG หรือ PDF")
      return
    }
    if (selected.size > MAX_FILE_BYTES) {
      setFile(null)
      setFileError("ไฟล์ต้องมีขนาดไม่เกิน 5MB")
      return
    }
    setFile(selected)
    setFileError(null)
  }

  async function onSubmit(values: LeaveFormValues) {
    setSubmitting(true)
    setSubmitError(null)
    setSuccess(false)

    const formData = new FormData()
    formData.append("type", values.type)
    formData.append("startDate", values.startDate)
    formData.append("endDate", values.endDate)
    formData.append("reason", values.reason)
    if (file) formData.append("attachment", file)

    try {
      const res = await fetch("/api/leave/request", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string
          message?: string
        } | null
        throw new Error(formatLeaveApiError(body))
      }
      setSuccess(true)
      form.reset({ type: "sick", startDate: "", endDate: "", reason: "" })
      setFile(null)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "ส่งใบลาไม่สำเร็จ")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ประเภทการลา</FormLabel>
              <FormControl>
                <select {...field} className={cn(inputClassName, "bg-card")}>
                  {LEAVE_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {LEAVE_TYPE_LABELS[value]}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>วันเริ่มลา</FormLabel>
                <FormControl>
                  <input type="date" {...field} className={inputClassName} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>วันสิ้นสุด</FormLabel>
                <FormControl>
                  <input type="date" {...field} className={inputClassName} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <p className="text-sm text-muted-foreground">
          จำนวนวันลา:{" "}
          <span className="font-medium text-foreground tabular-nums">
            {days === null ? "—" : `${days} วัน`}
          </span>
        </p>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>เหตุผล</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={3}
                  placeholder="ระบุเหตุผลการลา"
                  className={cn(inputClassName, "h-auto py-2")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {type === "sick" ? (
          <FormItem>
            <FormLabel>ใบรับรองแพทย์ (JPEG/PNG/PDF ไม่เกิน 5MB)</FormLabel>
            <FormControl>
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={onFileChange}
                aria-invalid={!!fileError}
                className={cn(inputClassName, "h-auto py-1.5 file:mr-3")}
              />
            </FormControl>
            {fileError ? (
              <p className="text-sm text-destructive">{fileError}</p>
            ) : file ? (
              <FormDescription>เลือกไฟล์แล้ว: {file.name}</FormDescription>
            ) : null}
          </FormItem>
        ) : null}

        <div className="flex items-center gap-2 border-t pt-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? "กำลังส่ง…" : "ส่งใบลา"}
          </Button>
        </div>

        {success ? (
          <p className="text-sm text-green-600">
            ส่งคำขอลาแล้ว — ระบบจะแจ้งผลทาง LINE เมื่อ HR อนุมัติ
          </p>
        ) : null}
        {submitError ? (
          <p className="text-sm text-destructive">{submitError}</p>
        ) : null}
      </form>
    </Form>
  )
}
