"use client";

import { useState } from "react";

type Template = { kind: string; body: string; approved: boolean };

const LABELS: Record<string, string> = {
  missed_call: "Missed call text",
  review_request: "Review request text",
};

export default function Admin() {
  const [token, setToken] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [status, setStatus] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const headers = { "Content-Type": "application/json", "x-admin-token": token };

  async function load() {
    const res = await fetch("/api/admin/templates", { headers });
    if (!res.ok) return setStatus("Wrong token, or the server isn't set up yet.");
    const json = await res.json();
    setTemplates(json.templates);
    setStatus("");
  }

  async function save(t: Template, approved: boolean) {
    const res = await fetch("/api/admin/templates", {
      method: "POST",
      headers,
      body: JSON.stringify({ kind: t.kind, body: t.body, approved }),
    });
    setStatus(res.ok ? (approved ? "Approved." : "Saved, not approved yet.") : "Save failed.");
    load();
  }

  async function completeJob() {
    const res = await fetch("/api/jobs/complete", {
      method: "POST",
      headers,
      body: JSON.stringify({ name, phone }),
    });
    const json = await res.json();
    if (res.ok) {
      setStatus(`Review text scheduled for ${name || phone} in about 2 hours.`);
      setName("");
      setPhone("");
    } else {
      setStatus(json.error ?? "Failed.");
    }
  }

  function edit(kind: string, body: string) {
    setTemplates((ts) => ts.map((t) => (t.kind === kind ? { ...t, body } : t)));
  }

  return (
    <div className="wrap" style={{ padding: "40px 20px" }}>
      <h1>Admin</h1>

      <div className="card">
        <label htmlFor="token">Admin token</label>
        <input id="token" type="password" value={token} onChange={(e) => setToken(e.target.value)} />
        <div className="row">
          <button className="btn" onClick={load}>Unlock</button>
          {status && <span className="note">{status}</span>}
        </div>
      </div>

      {templates.length > 0 && (
        <>
          <h2>Messages</h2>
          <p className="note">
            Nothing is sent until you approve the wording. Editing a message resets its approval.
            Variables: {"{business}"}, {"{name}"}, {"{review_link}"}.
          </p>
          {templates.map((t) => (
            <div className="card" key={t.kind} style={{ marginBottom: 16 }}>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 0 }}>
                <strong>{LABELS[t.kind] ?? t.kind}</strong>
                <span className={`tag ${t.approved ? "ok" : "no"}`}>
                  {t.approved ? "Approved" : "Not approved"}
                </span>
              </div>
              <textarea value={t.body} onChange={(e) => edit(t.kind, e.target.value)} />
              <div className="row">
                <button className="btn" onClick={() => save(t, true)}>Approve and save</button>
                <button className="btn" style={{ background: "#5b6b62" }} onClick={() => save(t, false)}>
                  Save as draft
                </button>
              </div>
            </div>
          ))}

          <h2>Mark a job complete</h2>
          <div className="card">
            <label htmlFor="name">Customer name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            <label htmlFor="phone">Customer mobile number</label>
            <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(508) 555-0100" />
            <div className="row">
              <button className="btn" onClick={completeJob}>Schedule review request</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
