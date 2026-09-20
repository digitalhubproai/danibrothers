"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { isEmail, isPhone, minLength, str, type ActionResult } from "@/lib/validation"

const INQUIRY_TYPES = ["SELL_DEVICE", "GENERAL", "REPAIR", "BULK"] as const
const DEVICE_CONDITIONS = ["WORKING", "MINOR_FAULT", "FAULTY", "UNKNOWN"] as const

export async function submitInquiryAction(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const typeRaw = str(form, "type")
  const type = (INQUIRY_TYPES as readonly string[]).includes(typeRaw) ? typeRaw : "GENERAL"

  const name = str(form, "name")
  const phone = str(form, "phone")
  const email = str(form, "email")
  const device = str(form, "device")
  const conditionRaw = str(form, "condition")
  const condition = (DEVICE_CONDITIONS as readonly string[]).includes(conditionRaw)
    ? conditionRaw
    : null
  const message = str(form, "message")

  const fieldErrors: Record<string, string> = {}
  if (!minLength(name, 2)) fieldErrors.name = "Tell us your name."
  if (!isPhone(phone)) fieldErrors.phone = "Enter a valid Pakistani mobile number."
  if (email && !isEmail(email)) fieldErrors.email = "That email address doesn't look right."
  if (type === "SELL_DEVICE" && !minLength(device, 2)) {
    fieldErrors.device = "Which make and model is it?"
  }
  if (!minLength(message, 5)) fieldErrors.message = "Add a little detail so we can help."

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please check the highlighted fields.", fieldErrors }
  }

  await prisma.inquiry.create({
    data: {
      type,
      name,
      phone,
      email: email || null,
      device: device || null,
      condition,
      message,
    },
  })

  revalidatePath("/admin/inquiries")

  return {
    ok: true,
    message:
      type === "SELL_DEVICE"
        ? "Thanks — we've got your details. We'll come back with a figure, usually the same day."
        : "Thanks for reaching out. We'll get back to you shortly.",
  }
}
