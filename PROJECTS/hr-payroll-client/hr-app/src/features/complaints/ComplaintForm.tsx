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

const schema = z.object({
  subject: z.string().trim().min(3, "หัวข้ออย่างน้อย 3 ตัวอักษร"),
  body: z.string().trim().min(10, "รายละเอียดอย่างน้อย 10 ตัวอักษร"),
  isAnonymous: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function ComplaintForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { subject: "", body: "", isAnonymous: false },
  })
  const [submitting, setSubmitting] = useState(false)
  const [ticketCode, setTicketCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/complaints/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? "ส่งเรื่องไม่สำเร็จ")
      }
      const data = (await res.json()) as { ticketCode: string }
      setTicketCode(data.ticketCode)
      form.reset()
    } catch (e) {
      setError(e instanceof Error ? e.message : "ส่งเรื่องไม่สำเร็จ")
    } finally {
      setSubmitting(false)
    }
  }

  if (ticketCode) {
    return (
      <p className="text-sm text-green-700">
        รับเรื่องแล้ว — เลขที่ <strong>{ticketCode}</strong> HR จะติดต่อกลับทาง LINE
      </p>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>หัวข้อ</FormLabel>
              <FormControl>
                <input
                  className="h-9 w-full rounded-lg border border-input px-3 text-sm"
                  placeholder="สรุปเรื่องที่ต้องการแจ้ง"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>รายละเอียด</FormLabel>
              <FormControl>
                <textarea
                  className="min-h-[100px] w-full rounded-lg border border-input px-3 py-2 text-sm"
                  placeholder="อธิบายรายละเอียด"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isAnonymous"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">ไม่เปิดเผยตัวตน</FormLabel>
            </FormItem>
          )}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "กำลังส่ง…" : "ส่งเรื่องร้องเรียน"}
        </Button>
      </form>
    </Form>
  )
}
