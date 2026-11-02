import { db } from "@/lib/supabase";
import { sendTemplated } from "@/lib/sms";
import { isFromTwilio, normalizePhone, readForm, twiml } from "@/lib/twilio";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

// Twilio calls this when the attempt to ring the owner ends.
// DialCallStatus "completed" means the owner answered. Anything else is a missed call.
export async function POST(req: Request) {
  const params = await readForm(req);
  if (!isFromTwilio(req, params)) return new Response("Forbidden", { status: 403 });

  if (params.DialCallStatus === "completed") return twiml();

  const from = normalizePhone(params.From ?? "");
  if (!from) return twiml();

  const supabase = db();

  // One row per call; Twilio retries won't double-text.
  const { error } = await supabase
    .from("missed_calls")
    .insert({ call_sid: params.CallSid, from_number: from });
  if (error) return twiml();

  // Don't text the same person again within 6 hours.
  const { data: recent } = await supabase
    .from("missed_calls")
    .select("id")
    .eq("from_number", from)
    .not("text_sent_at", "is", null)
    .gte("text_sent_at", new Date(Date.now() - SIX_HOURS_MS).toISOString())
    .limit(1);
  if (recent && recent.length > 0) return twiml();

  const result = await sendTemplated("missed_call", from);
  if (result.sent) {
    await supabase
      .from("missed_calls")
      .update({ text_sent_at: new Date().toISOString() })
      .eq("call_sid", params.CallSid);
  }

  return twiml();
}
