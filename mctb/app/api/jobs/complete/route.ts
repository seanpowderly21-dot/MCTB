import { isAdmin, unauthorized } from "@/lib/admin";
import { db } from "@/lib/supabase";
import { normalizePhone } from "@/lib/twilio";

// Mark a job complete. The review text goes out `delay_hours` later (default 2).
// Body: { name: string, phone: string, delay_hours?: number }
export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();

  const { name, phone, delay_hours } = await req.json();
  const normalized = normalizePhone(String(phone ?? ""));
  if (!normalized) return Response.json({ error: "invalid phone number" }, { status: 400 });

  const hours = typeof delay_hours === "number" && delay_hours >= 0 ? delay_hours : 2;
  const sendAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

  const { data, error } = await db()
    .from("jobs")
    .insert({ customer_name: name ?? null, customer_phone: normalized, review_send_at: sendAt })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ job: data });
}
