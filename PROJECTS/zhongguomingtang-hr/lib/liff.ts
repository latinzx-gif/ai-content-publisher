'use client'
import liff from '@line/liff'

let initialized = false

export async function initLiff(): Promise<void> {
  if (initialized) return
  await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
  initialized = true
}

export async function getLiffProfile() {
  await initLiff()
  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri: window.location.href })
    return null
  }
  return await liff.getProfile()
}

export async function closeLiff() {
  await initLiff()
  liff.closeWindow()
}

/** ส่ง Flex Message ผ่าน Line */
export async function sendLineMessage(userId: string, message: object) {
  await fetch('/api/line/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, message }),
  })
}
