import { db } from "@/lib/supabase";
import { isFromTwilio, normalizePhone, readForm, twiml } from "@/lib/twilio";

const STOP_WORDS = ["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"];
const START_WORDS = ["START", "UNSTOP", "YES"];

// Twilio calls this for every text a customer sends to our number.
export async function POST(req: Request) {
  const params = await readForm(req);
  if (!isFromTwilio(req, params)) return new Response("Forbidden", { status: 403 });

  const from = normalizePhone(params.From ?? "");
  const body = (params.Body ?? "").trim();
  if (!from) return twiml();

  const supabase = db();
  const word = body.toUpperCase();

  await supabase.from("messages").insert({
    direction: "in",
    phone: from,
    body,
    twilio_sid: params.MessageSid,
  });

  if (STOP_WORDS.includes(word)) {
    await supabase.from("opt_outs").upsert({ phone: from });
    return twiml(); // Twilio sends its own opt-out confirmation.
  }

  if (START_WORDS.includes(word) && word !== "YES") {
    await supabase.from("opt_outs").delete().eq("phone", from);
    return twiml();
  }

  // A real reply: mark the most recent missed call from this number as replied.
  const { data: latest } = await supabase
    .from("missed_calls")
    .select("id")
    .eq("from_number", from)
    .is("replied_at", null)
    .order("created_at", { ascending: false })
    .limit(1);
  if (latest && latest.length > 0) {
    await supabase
      .from("missed_calls")
      .update({ replied_at: new Date().toISOString() })
      .eq("id", latest[0].id);
  }

  // Forward the reply to the owner so they can follow up by hand.
  if (process.env.OWNER_PHONE_NUMBER) {
    const { twilioClient } = await import("@/lib/twilio");
    await twilioClient().messages.create({
      to: process.env.OWNER_PHONE_NUMBER,
      from: process.env.TWILIO_PHONE_NUMBER!,
      body: `Reply from ${from}: ${body}`.slice(0, 300),
    });
  }

  return twiml();
}
