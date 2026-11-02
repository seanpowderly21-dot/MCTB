// Twilio's texting registration (10DLC) asks for a public page that explains the messages you send.
// Edit the business name and contact details before you submit the registration.
export default function SmsPolicy() {
  return (
    <div className="wrap" style={{ padding: "48px 20px" }}>
      <h1>SMS messaging policy</h1>
      <p>
        We send text messages on behalf of local service businesses. Two kinds of texts are sent,
        and only to people who have a real connection to the business:
      </p>
      <ul>
        <li>
          <strong>Missed call follow-up:</strong> a single text sent to someone who called the
          business and was not answered, asking what they need.
        </li>
        <li>
          <strong>Review request:</strong> a single text sent to a customer after a completed job,
          with a link to leave a Google review.
        </li>
      </ul>
      <p>
        Message frequency is low, typically one text per call or per job. Message and data rates
        may apply. Reply <strong>STOP</strong> at any time to stop receiving texts, or{" "}
        <strong>HELP</strong> for help. We do not sell or share phone numbers, and we do not
        offer rewards in exchange for reviews.
      </p>
      <p>Questions: <a href="mailto:you@example.com">you@example.com</a></p>
    </div>
  );
}
