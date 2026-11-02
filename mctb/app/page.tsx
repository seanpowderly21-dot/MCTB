export default function Home() {
  return (
    <>
      <div className="wrap">
        <section className="hero">
          <h1>Stop losing jobs to the calls you can&apos;t answer.</h1>
          <p>
            You&apos;re on a mower, up a ladder, or in the middle of a job. When a call goes
            unanswered, the caller texts or calls the next company. We text them back in under a
            minute, and we ask every customer for a Google review after the job is done.
          </p>
          <a className="btn" href="mailto:you@example.com?subject=Missed%20call%20text%20back">
            Get it set up on my business
          </a>
        </section>

        <section>
          <h2>Two automations. That&apos;s the whole product.</h2>
          <div className="grid">
            <div className="card">
              <h3>Missed call text back</h3>
              <p>
                Someone calls, nobody picks up. Within 60 seconds they get a text, while they still
                have the phone in their hand.
              </p>
              <div className="sms">
                Hi, this is your local pro. Sorry I missed your call, I&apos;m on a job right now.
                What do you need done?
              </div>
            </div>
            <div className="card">
              <h3>Google review requests</h3>
              <p>
                A couple of hours after a job is marked complete, the customer gets a one-tap link
                to leave a review. A steady trickle of recent reviews is what moves you up the map.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2>No new app to learn</h2>
          <div className="grid">
            <div className="card">
              <h3>Your number, your profile</h3>
              <p>It runs off the phone number and Google Business Profile you already have.</p>
            </div>
            <div className="card">
              <h3>You approve every message</h3>
              <p>Nothing goes out that you haven&apos;t read first.</p>
            </div>
            <div className="card">
              <h3>Everyone can opt out</h3>
              <p>Reply STOP and that number is never texted again.</p>
            </div>
            <div className="card">
              <h3>Honest reviews only</h3>
              <p>Every customer is asked. No filtering out unhappy ones, no rewards for reviews.</p>
            </div>
          </div>
        </section>

        <footer>
          <a href="/sms-policy">SMS policy</a>
        </footer>
      </div>
    </>
  );
}
