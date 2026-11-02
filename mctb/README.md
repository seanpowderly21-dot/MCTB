# Missed Call Text Back + Google Review Requests

Two automations for local service businesses:

1. **Missed call text back:** a caller who isn't answered gets a text within a minute.
2. **Review requests:** after a job is marked complete, the customer gets a Google review link a couple of hours later.

Stack: Next.js (site + API routes), Supabase (database), Twilio (calls and texts), Vercel (hosting), GitHub Actions (15-minute scheduler).

## How it works

```
Customer calls business number
  -> forwarded to your Twilio number
  -> /api/twilio/voice          rings the owner's cell for 20 seconds
  -> /api/twilio/dial-status    if unanswered: send "missed call" text (once per 6 hours per caller)
Customer texts back
  -> /api/twilio/sms            logs it, forwards it to the owner's cell, handles STOP

Mark job complete (/admin)
  -> /api/jobs/complete         schedules the review text for 2 hours later
GitHub Action, every 15 min
  -> /api/cron/send-reviews     sends review texts that are due
```

Safety rules built into `lib/sms.ts` (every text goes through it):

- Nothing sends until the owner approves that message's wording in `/admin`.
- Anyone who has replied STOP is never texted again.
- Everyone who has a completed job is asked for a review. No filtering by sentiment, no incentives.

## Setup

### 1. Accounts
- GitHub (you have this), Supabase (free), Twilio, Vercel (free, sign in with GitHub).

### 2. Database
Create a Supabase project, open the SQL editor, paste in `supabase/schema.sql`, run it.

### 3. Environment variables
```bash
cp .env.example .env.local
```
Fill in every value. `.env.local` is git-ignored. Never commit real keys.

### 4. Run locally
```bash
npm install
npm run dev
```
Site: http://localhost:3000, admin: http://localhost:3000/admin

### 5. Deploy
Push to GitHub, then in Vercel choose "Add New Project", pick the repo, and paste in the same environment variables (set `APP_URL` to the Vercel URL). Every push to `main` redeploys.

### 6. Twilio
- **Register for texting first.** US business texting requires A2P 10DLC registration, which takes days to approve. Real texts can't send until it's approved. The registration asks for a public page describing your messages: `/sms-policy` is there for that (fill in your real contact email first).
- On your Twilio number, set **Voice: A call comes in** to `POST https://YOUR-APP/api/twilio/voice` and **Messaging: A message comes in** to `POST https://YOUR-APP/api/twilio/sms`.
- On the business's phone carrier, forward the business number to the Twilio number (conditional "no answer / busy" forwarding if the carrier supports it, otherwise forward all calls).

### 7. Review scheduler
In the GitHub repo: Settings > Secrets and variables > Actions, add `APP_URL` and `CRON_SECRET` (same value as in Vercel). The workflow in `.github/workflows/send-reviews.yml` then runs every 15 minutes. (Vercel's free plan only allows daily cron jobs, which is why this uses GitHub Actions.)

### 8. Go live
1. Open `/admin`, enter your `ADMIN_TOKEN`, read both messages, edit if you want, and click **Approve and save**.
2. Call the Twilio number from another phone and don't answer. You should get the text.
3. Add a test job for your own number in `/admin` to check the review text.

## Git workflow for two people

```bash
git checkout -b feature/short-name   # never work directly on main
# ...make changes...
git add -A && git commit -m "Describe the change"
git push -u origin feature/short-name
```
Open a pull request on GitHub, have your partner review it, then merge. In repo settings you can protect `main` so nobody pushes to it directly. Run `git pull` on `main` before starting each new branch.

## Before you use this on real customers

- Get the messages approved by the business owner (that's in the app) and keep a record of when.
- Only text people who called the business or are its customers.
- Check Twilio's current rules and local rules for your area on text consent; this code handles opt-outs but it's not legal advice.

## Where to go next
- Multiple businesses: add a `business_id` column to each table and look up the business by the Twilio number that was called.
- A simple dashboard of missed calls caught, replies, and reviews requested, which is the before-and-after proof.
- Move the "mark job complete" step into the CRM Max already has.
