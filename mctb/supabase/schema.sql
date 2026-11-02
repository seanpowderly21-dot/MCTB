-- Run this once in the Supabase SQL editor.

create table if not exists message_templates (
  kind text primary key check (kind in ('missed_call', 'review_request')),
  body text not null,
  approved boolean not null default false,
  approved_at timestamptz
);

-- Nothing sends until the owner approves each template in /admin.
insert into message_templates (kind, body) values
  ('missed_call',
   'Hi, this is {business}. Sorry I missed your call, I''m on a job right now. What do you need done? Reply STOP to opt out.'),
  ('review_request',
   'Hi {name}, thanks for choosing {business}! If you have a minute, a Google review really helps us: {review_link} Reply STOP to opt out.')
on conflict (kind) do nothing;

create table if not exists opt_outs (
  phone text primary key,
  created_at timestamptz not null default now()
);

create table if not exists missed_calls (
  id uuid primary key default gen_random_uuid(),
  call_sid text unique,
  from_number text not null,
  created_at timestamptz not null default now(),
  text_sent_at timestamptz,
  replied_at timestamptz
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_phone text not null,
  completed_at timestamptz not null default now(),
  review_send_at timestamptz not null,
  review_sent_at timestamptz
);

create index if not exists jobs_due_idx on jobs (review_send_at) where review_sent_at is null;

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  direction text not null check (direction in ('in', 'out')),
  kind text,
  phone text not null,
  body text not null,
  twilio_sid text,
  created_at timestamptz not null default now()
);

-- Only the server (service role key) touches these tables.
alter table message_templates enable row level security;
alter table opt_outs enable row level security;
alter table missed_calls enable row level security;
alter table jobs enable row level security;
alter table messages enable row level security;
