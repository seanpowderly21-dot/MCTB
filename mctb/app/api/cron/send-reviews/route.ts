import { db } from "@/lib/supabase";
import { sendTemplated } from "@/lib/sms";

// Runs every 15 minutes (see .github/workflows/send-reviews.yml).
// Sends review requests for jobs whose delay has passed. Everyone gets asked: no filtering by sentiment.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Forbidden", { status: 403 });
  }

  const supabase = db();
  const { data: due } = await supabase
    .from("jobs")
    .select("id, customer_name, customer_phone")
    .is("review_sent_at", null)
    .lte("review_send_at", new Date().toISOString())
    .limit(50);

  const results: Record<string, string> = {};
  for (const job of due ?? []) {
    const firstName = job.customer_name?.split(" ")[0] || "there";
    const result = await sendTemplated("review_request", job.customer_phone, { name: firstName });

    if (result.sent || result.reason === "opted_out") {
      // Mark handled so we never retry an opted-out number.
      await supabase.from("jobs").update({ review_sent_at: new Date().toISOString() }).eq("id", job.id);
    }
    results[job.id] = result.sent ? "sent" : result.reason ?? "skipped";
  }

  return Response.json({ processed: due?.length ?? 0, results });
}
