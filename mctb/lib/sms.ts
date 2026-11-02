import { db } from "./supabase";
import { twilioClient } from "./twilio";

export type Kind = "missed_call" | "review_request";
export type SendResult = { sent: boolean; reason?: string };

function render(body: string, vars: Record<string, string>) {
  return body.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

// The one place every outgoing text goes through.
// It refuses to send if the number opted out or the owner hasn't approved the wording.
export async function sendTemplated(
  kind: Kind,
  to: string,
  vars: Record<string, string> = {}
): Promise<SendResult> {
  const supabase = db();

  const { data: optOut } = await supabase.from("opt_outs").select("phone").eq("phone", to).maybeSingle();
  if (optOut) return { sent: false, reason: "opted_out" };

  const { data: template } = await supabase
    .from("message_templates")
    .select("body, approved")
    .eq("kind", kind)
    .single();
  if (!template?.approved) return { sent: false, reason: "template_not_approved" };

  const body = render(template.body, {
    business: process.env.BUSINESS_NAME ?? "",
    review_link: process.env.GOOGLE_REVIEW_URL ?? "",
    name: "there",
    ...vars,
  });

  const msg = await twilioClient().messages.create({
    to,
    from: process.env.TWILIO_PHONE_NUMBER!,
    body,
  });

  await supabase.from("messages").insert({ direction: "out", kind, phone: to, body, twilio_sid: msg.sid });
  return { sent: true };
}
