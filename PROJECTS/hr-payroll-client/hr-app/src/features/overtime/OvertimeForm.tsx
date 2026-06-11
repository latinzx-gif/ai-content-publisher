"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const schema = z
  .object({
    workDate: z.string().min(1, "เลือกวันที่"),
    startTime: z.string().min(1, "เลือกเวลาเริ่ม"),
    endTime: z.string().min(1, "เลือกเวลาสิ้นสุด"),
    reason: z.string().trim().min(5, "ระบุเหตุผลอย่างน้อย 5 ตัวอักษร"),
  })
  .refine((v) => v.endTime > v.startTime, {
    path: ["endTime"],
    message: "เวลาสิ้นสุดต้องหลังเวลาเริ่ม",
  })

type FormValues = z.infer<typeof schema>

const inputClassName =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"

export function OvertimeForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { workDate: "", startTime: "18:00", endTime: "20:00", reason: "" },
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/overtime/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? "ส่งคำขอไม่สำเร็จ")
      }
      setSuccess(true)
      form.reset()
    } catch (e) {
      setError(e instanceof Error ? e.message : "ส่งคำขอไม่สำเร็จ")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <p className="text-sm text-green-700">ส่งคำขอ OT แล้ว — HR จะแจ้งผลทาง LINE</p>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="workDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>วันที่ทำ OT</FormLabel>
              <FormControl>
                <input type="date" className={inputClassName} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>เริ่ม</FormLabel>
                <FormControl>
                  <input type="time" className={inputClassName} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>สิ้นสุด</FormLabel>
                <FormControl>
                  <input type="time" className={inputClassName} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>เหตุผล / งานที่ทำ</FormLabel>
              <FormControl>
                <textarea
                  className="min-h-[80px] w-full rounded-lg border border-input px-3 py-2 text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "กำลังส่ง…" : "ส่งคำขอ OT"}
        </Button>
      </form>
    </Form>
  )
}
