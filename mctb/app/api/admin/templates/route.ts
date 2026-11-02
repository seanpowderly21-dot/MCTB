import { isAdmin, unauthorized } from "@/lib/admin";
import { db } from "@/lib/supabase";

export async function GET(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  const { data, error } = await db().from("message_templates").select("*").order("kind");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ templates: data });
}

// Body: { kind, body, approved }
// Editing the wording always resets approval unless `approved: true` is sent with it,
// so the owner has to look at the final text before it can go out.
export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  const { kind, body, approved } = await req.json();
  if (!["missed_call", "review_request"].includes(kind) || typeof body !== "string" || !body.trim()) {
    return Response.json({ error: "invalid input" }, { status: 400 });
  }
  const ok = approved === true;
  const { error } = await db()
    .from("message_templates")
    .update({ body, approved: ok, approved_at: ok ? new Date().toISOString() : null })
    .eq("kind", kind);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
