import { isFromTwilio, readForm, twiml } from "@/lib/twilio";

// Twilio calls this when someone calls the business number (forwarded to Twilio).
// We ring the owner's real phone first. If nobody answers, Twilio hits /dial-status.
export async function POST(req: Request) {
  const params = await readForm(req);
  if (!isFromTwilio(req, params)) return new Response("Forbidden", { status: 403 });

  const action = `${process.env.APP_URL}/api/twilio/dial-status`;
  return twiml(
    `<Dial timeout="20" action="${action}" method="POST"><Number>${process.env.OWNER_PHONE_NUMBER}</Number></Dial>`
  );
}
