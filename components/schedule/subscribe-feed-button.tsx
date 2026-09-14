"use client"

import { LinkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { useLocale } from "@/hooks/use-locale"
import { FEED_PATH } from "@/lib/schedule/calendar-config"

function copyText(value: string): boolean {
  const input = document.createElement("textarea")
  input.value = value
  input.setAttribute("readonly", "")
  input.style.position = "fixed"
  input.style.left = "-9999px"
  document.body.appendChild(input)
  input.select()
  const ok = document.execCommand("copy")
  document.body.removeChild(input)
  return ok
}

export function SubscribeFeedButton() {
  const { t } = useLocale()

  async function onCopy() {
    const url = `${window.location.origin}${FEED_PATH}`
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else if (!copyText(url)) {
        throw new Error("copy failed")
      }
      toast.add({
        type: "success",
        description: t.subscribeCopied,
      })
    } catch {
      if (copyText(url)) {
        toast.add({
          type: "success",
          description: t.subscribeCopied,
        })
        return
      }
      toast.add({
        type: "error",
        description: t.subscribeCopyError,
        priority: "high",
      })
    }
  }

  return (
    <Button variant="outline" onClick={onCopy} aria-label={t.subscribeFeed}>
      <LinkIcon data-icon="inline-start" />
      <span className="max-sm:sr-only">{t.subscribeFeed}</span>
    </Button>
  )
}
