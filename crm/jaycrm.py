"""Jay CRM: a lead tracker that runs only on your laptop.

Run it with:  python jaycrm.py   (or python3 jaycrm.py on a Mac)
Then it opens http://127.0.0.1:8765 in your browser. Press Ctrl+C in the terminal to stop it.

- Only your own laptop can open it. It isn't reachable from the internet or your Wi-Fi.
- Your leads are saved in data/jaycrm.db, next to this file. Back that file up now and then.
- New website leads wait in a locked drop box on jayniche.ca. Each time you open the leads
  page (or click "Get new leads"), the CRM downloads them and deletes them from the drop box.
- Uses only Python's standard library, so there's nothing to pip install.
"""

import csv
import html
import io
import json
import os
import re
import sqlite3
import sys
import threading
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from datetime import date, datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = 8765
HOST = "127.0.0.1"  # local only: never change this to 0.0.0.0
SITE = os.environ.get("JAYCRM_SITE", "https://jayniche.ca")  # override only for testing

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE / "data"
DB_PATH = DATA_DIR / "jaycrm.db"
CONFIG_PATH = HERE / "config.json"

STATUSES = [
    "New", "Contacted", "Appointment set", "Offer made", "Under contract",
    "Closed - bought", "Referred to realtor", "Not a fit", "Dead",
]
CLOSED = ["Closed - bought", "Referred to realtor", "Not a fit", "Dead"]
PRIORITIES = ["Hot", "Warm", "Cold"]
SOURCES = ["website", "facebook", "phone", "referral", "other"]
CONDITIONS = ["Move-in ready", "Needs some work", "Needs a lot of work"]
OCCUPANCY = ["I live there", "Tenants", "Vacant"]
TIMELINES = ["As soon as possible", "1–3 months", "3–6 months", "Just exploring"]
PROVINCES = ["Ontario", "Alberta"]
MONEY = ["asking_price", "est_value", "repair_estimate", "mortgage_owing", "offer_amount"]
TEXT_FIELDS = ["name", "phone", "email", "motivation", "address", "city", "property_type", "beds", "baths"]
LEAD_COLUMNS = TEXT_FIELDS + [
    "province", "condition", "listed", "occupancy", "timeline", "status", "priority", "score", "source", "follow_up",
] + MONEY

SCHEMA = """
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cloud_id INTEGER UNIQUE,                 -- id in the website drop box, to avoid duplicates
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  source TEXT NOT NULL DEFAULT 'website',
  source_page TEXT, name TEXT, phone TEXT, email TEXT, address TEXT, city TEXT, province TEXT,
  condition TEXT, listed TEXT, occupancy TEXT, timeline TEXT,
  score INTEGER NOT NULL DEFAULT 0, priority TEXT NOT NULL DEFAULT 'Warm', status TEXT NOT NULL DEFAULT 'New',
  follow_up TEXT, property_type TEXT, beds TEXT, baths TEXT,
  asking_price INTEGER, est_value INTEGER, repair_estimate INTEGER, mortgage_owing INTEGER, offer_amount INTEGER,
  motivation TEXT
);
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  body TEXT NOT NULL
);
"""


# ---------------------------------------------------------------- data

def db():
    DATA_DIR.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def load_config():
    try:
        return json.loads(CONFIG_PATH.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_config(cfg):
    CONFIG_PATH.write_text(json.dumps(cfg, indent=2))


def score_lead(lead):
    """Same scoring as the website: needs work, not listed, motivated timeline = hotter."""
    score = {"Needs a lot of work": 3, "Needs some work": 2}.get(lead.get("condition"), 0)
    score += {"Yes": -4, "No": 1}.get(lead.get("listed"), 0)
    score += {"Vacant": 2, "Tenants": 1}.get(lead.get("occupancy"), 0)
    score += {"As soon as possible": 3, "1–3 months": 2, "3–6 months": 1}.get(lead.get("timeline"), 0)
    if lead.get("listed") == "Yes":
        priority = "Cold"
    else:
        priority = "Hot" if score >= 6 else "Warm" if score >= 3 else "Cold"
    return score, priority


def sync_leads():
    """Download new website leads, save them, then delete them from the drop box.
    Returns (number of new leads, error message or None)."""
    key = load_config().get("inbox_key")
    if not key:
        return 0, None
    headers = {"Authorization": f"Bearer {key}", "User-Agent": "JayCRM/1.0", "Accept": "application/json"}
    total = 0
    try:
        for _ in range(20):  # up to 4,000 leads per sync
            req = urllib.request.Request(f"{SITE}/api/inbox", headers=headers)
            with urllib.request.urlopen(req, timeout=20) as r:
                leads = json.load(r).get("leads", [])
            if not leads:
                break
            with db() as conn:
                for l in leads:
                    conn.execute(
                        """INSERT OR IGNORE INTO leads (cloud_id, created_at, source, source_page, name, phone, address,
                           province, condition, listed, occupancy, timeline, score, priority)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (l["id"], l["created_at"], l.get("source") or "website", l.get("source_page"), l.get("name"),
                         l.get("phone"), l.get("address"), l.get("province"), l.get("condition"), l.get("listed"),
                         l.get("occupancy"), l.get("timeline"), l.get("score") or 0, l.get("priority") or "Warm"),
                    )
            # Only delete from the drop box after they're safely saved here.
            ack = urllib.request.Request(
                f"{SITE}/api/inbox/ack", method="POST",
                data=json.dumps({"ids": [l["id"] for l in leads]}).encode(),
                headers={**headers, "Content-Type": "application/json"},
            )
            urllib.request.urlopen(ack, timeout=20).close()
            total += len(leads)
            if len(leads) < 200:
                break
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return total, "The website didn't accept your key. Check it on the Settings page."
        return total, f"Couldn't reach jayniche.ca (error {e.code}). Your saved leads are fine; try again later."
    except (urllib.error.URLError, TimeoutError, OSError):
        return total, "No internet connection, or jayniche.ca didn't respond. Your saved leads are fine."
    return total, None


# ---------------------------------------------------------------- html helpers

esc = lambda v: html.escape("" if v is None else str(v), quote=True)


def today():
    return date.today().isoformat()


def when(s):
    """Database times are UTC; show them in the laptop's local time."""
    if not s:
        return ""
    try:
        dt = datetime.strptime(s, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc).astimezone()
        return dt.strftime("%b %d, %Y %I:%M %p").replace(" 0", " ")
    except ValueError:
        return s


def money(n):
    return "" if n is None else f"${n:,}"


def options(values, selected):
    return "".join(f"<option{' selected' if v == selected else ''}>{esc(v)}</option>" for v in values)


def badge(p):
    return f'<span class="badge {esc(str(p).lower())}">{esc(p)}</span>'


def to_int(v):
    digits = re.sub(r"[^0-9-]", "", v or "")
    try:
        return int(digits) if digits not in ("", "-") else None
    except ValueError:
        return None


def page(title, body, flash=""):
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>{esc(title)} · Jay CRM</title>
<style>{CSS}</style></head><body>
<header class="top"><a class="brand" href="/">Jay CRM</a><nav><a href="/">Leads</a><a href="/new">+ Add lead</a>
<a href="/export.csv">Export</a><a href="/settings">Settings</a></nav></header>
<main>{flash}{body}</main></body></html>"""


# ---------------------------------------------------------------- pages

def dashboard(query):
    flash = ""
    if load_config().get("inbox_key"):
        added, error = sync_leads()
        if error:
            flash = f'<p class="error">{esc(error)}</p>'
        elif added:
            flash = f'<p class="saved">{added} new lead{"s" if added != 1 else ""} downloaded from the website.</p>'
    else:
        flash = '<p class="error">Website leads aren’t connected yet. <a href="/settings">Add your key in Settings.</a></p>'

    status = query.get("status", "open")
    priority = query.get("priority", "")
    q = query.get("q", "")[:100]
    where, args = [], []
    closed_marks = ",".join("?" * len(CLOSED))
    if status == "open":
        where.append(f"status NOT IN ({closed_marks})"); args += CLOSED
    elif status == "due":
        where.append(f"follow_up IS NOT NULL AND follow_up <= ? AND status NOT IN ({closed_marks})"); args += [today(), *CLOSED]
    elif status in STATUSES:
        where.append("status = ?"); args.append(status)
    if priority in PRIORITIES:
        where.append("priority = ?"); args.append(priority)
    if q:
        where.append("(name LIKE ? OR phone LIKE ? OR address LIKE ? OR city LIKE ?)"); args += [f"%{q}%"] * 4

    with db() as conn:
        leads = conn.execute(
            f"""SELECT id, created_at, name, phone, address, city, province, priority, status, follow_up, source
                FROM leads {'WHERE ' + ' AND '.join(where) if where else ''}
                ORDER BY CASE priority WHEN 'Hot' THEN 0 WHEN 'Warm' THEN 1 ELSE 2 END, created_at DESC LIMIT 1000""",
            args,
        ).fetchall()
        c = conn.execute(
            f"""SELECT SUM(status = 'New') n, SUM(priority = 'Hot' AND status NOT IN ({closed_marks})) hot,
                SUM(follow_up IS NOT NULL AND follow_up <= ? AND status NOT IN ({closed_marks})) due,
                SUM(status = 'Under contract') contract, SUM(status = 'Closed - bought') bought FROM leads""",
            [*CLOSED, today(), *CLOSED],
        ).fetchone()

    def stat(label, n, href):
        return f'<a class="stat" href="{href}"><strong>{n or 0}</strong><span>{label}</span></a>'

    rows = []
    for l in leads:
        overdue = l["follow_up"] and l["follow_up"] <= today() and l["status"] not in CLOSED
        place = ", ".join(x for x in (l["city"], l["province"]) if x)
        rows.append(
            f"""<tr><td>{badge(l['priority'])}</td>
<td><a href="/lead/{l['id']}"><strong>{esc(l['name'] or '(no name)')}</strong></a><br><small>{esc(l['phone'])}</small></td>
<td>{esc(l['address'])}{f'<br><small>{esc(place)}</small>' if place else ''}</td><td>{esc(l['status'])}</td>
<td class="{'overdue' if overdue else ''}">{esc(l['follow_up'] or '')}</td>
<td><small>{esc(when(l['created_at']))}<br>{esc(l['source'])}</small></td></tr>"""
        )
    status_opts = "".join(
        f'<option value="{esc(v)}"{" selected" if v == status else ""}>{esc(t)}</option>'
        for v, t in [("open", "All open"), ("due", "Follow-ups due"), ("all", "Everything"), *[(s, s) for s in STATUSES]]
    )
    body = f"""<div class="stats">{stat('New', c['n'], '/?status=New')}{stat('Hot (open)', c['hot'], '/?priority=Hot')}
{stat('Follow-ups due', c['due'], '/?status=due')}{stat('Under contract', c['contract'], '/?status=Under+contract')}
{stat('Bought', c['bought'], '/?status=Closed+-+bought')}</div>
<form class="filters" method="get" action="/"><select name="status">{status_opts}</select>
<select name="priority"><option value="">Any priority</option>{options(PRIORITIES, priority)}</select>
<input type="search" name="q" value="{esc(q)}" placeholder="Search name, phone, address"><button>Filter</button>
<a class="btn ghost" href="/">Get new leads</a></form>
<div class="table-wrap"><table><thead><tr><th>Priority</th><th>Seller</th><th>Property</th><th>Status</th><th>Follow up</th><th>Received</th></tr></thead>
<tbody>{''.join(rows) or '<tr><td colspan="6" class="empty">No leads here yet.</td></tr>'}</tbody></table></div>"""
    return page("Leads", body, flash)


def lead_form(l, action):
    l = dict(l)

    def f(name, label, kind="text"):
        return f'<label>{label}<input type="{kind}" name="{name}" value="{esc(l.get(name) or "")}" maxlength="300"></label>'

    def m(name, label):
        v = l.get(name)
        return f'<label>{label}<input type="text" inputmode="numeric" name="{name}" value="{"" if v is None else v}" placeholder="$"></label>'

    def s(name, label, values):
        return f'<label>{label}<select name="{name}"><option value=""></option>{options(values, l.get(name))}</select></label>'

    return f"""<form method="post" action="{action}" class="lead-edit">
<fieldset><legend>Status</legend><div class="grid">{s('status', 'Status', STATUSES)}{s('priority', 'Priority', PRIORITIES)}
{f('follow_up', 'Follow-up date', 'date')}{s('source', 'Source', SOURCES)}</div></fieldset>
<fieldset><legend>Seller</legend><div class="grid">{f('name', 'Name')}{f('phone', 'Phone', 'tel')}{f('email', 'Email', 'email')}
{f('motivation', 'Why are they selling?')}</div></fieldset>
<fieldset><legend>Property</legend><div class="grid">{f('address', 'Address')}{f('city', 'City')}{s('province', 'Province', PROVINCES)}
{f('property_type', 'Type (detached, semi, condo…)')}{f('beds', 'Beds')}{f('baths', 'Baths')}{s('condition', 'Condition', CONDITIONS)}
{s('listed', 'Listed with agent?', ['No', 'Yes'])}{s('occupancy', 'Occupancy', OCCUPANCY)}{s('timeline', 'Timeline', TIMELINES)}</div></fieldset>
<fieldset><legend>Numbers</legend><div class="grid">{m('asking_price', 'Asking price')}{m('est_value', 'After-repair value')}
{m('repair_estimate', 'Repair estimate')}{m('mortgage_owing', 'Mortgage owing')}{m('offer_amount', 'Our offer')}</div></fieldset>
<button>Save</button></form>"""


def read_lead_form(form):
    l = {k: (form.get(k, "").strip()[:300] or None) for k in TEXT_FIELDS}

    def pick(k, values):
        return form.get(k) if form.get(k) in values else None

    l["status"] = pick("status", STATUSES) or "New"
    l["source"] = pick("source", SOURCES) or "other"
    for k, values in [("province", PROVINCES), ("condition", CONDITIONS), ("listed", ["No", "Yes"]),
                      ("occupancy", OCCUPANCY), ("timeline", TIMELINES)]:
        l[k] = pick(k, values)
    fu = form.get("follow_up", "")
    l["follow_up"] = fu if re.fullmatch(r"\d{4}-\d{2}-\d{2}", fu) else None
    for k in MONEY:
        l[k] = to_int(form.get(k))
    l["score"], auto = score_lead(l)
    l["priority"] = pick("priority", PRIORITIES) or auto
    return l


def lead_page(lead_id, saved=False):
    with db() as conn:
        l = conn.execute("SELECT * FROM leads WHERE id = ?", (lead_id,)).fetchone()
        if not l:
            return None
        notes = conn.execute("SELECT * FROM notes WHERE lead_id = ? ORDER BY id DESC", (lead_id,)).fetchall()
    tel = re.sub(r"[^0-9+]", "", l["phone"] or "")
    place = ", ".join(x for x in (l["address"], l["city"], l["province"]) if x)
    maps = f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(place)}" if place else ""
    spread = ""
    if l["est_value"] is not None and l["offer_amount"] is not None:
        value = l["est_value"] - l["offer_amount"] - (l["repair_estimate"] or 0)
        spread = (f'<p class="card">Rough spread: after-repair value {money(l["est_value"])} − offer {money(l["offer_amount"])}'
                  f' − repairs {money(l["repair_estimate"] or 0)} = <strong>{money(value)}</strong> (before holding and selling costs)</p>')
    notes_html = "".join(
        f'<div class="note"><small>{esc(when(n["created_at"]))}</small><p>{esc(n["body"]).replace(chr(10), "<br>")}</p></div>'
        for n in notes
    ) or '<p class="muted">No notes yet.</p>'
    actions = (f'<a class="btn" href="tel:{esc(tel)}">Call</a><a class="btn" href="sms:{esc(tel)}">Text</a>' if tel else "") + (
        f'<a class="btn ghost" href="{esc(maps)}" target="_blank" rel="noreferrer">Map</a>' if maps else "")
    body = f"""<p><a href="/">← All leads</a></p>{'<p class="saved">Saved.</p>' if saved else ''}
<div class="lead-head"><div><h1>{esc(l['name'] or '(no name)')} {badge(l['priority'])}</h1><p>{esc(place)}</p>
<p class="muted">Received {esc(when(l['created_at']))} · {esc(l['source'])}{f" · from <code>{esc(l['source_page'])}</code>" if l['source_page'] else ''} · score {l['score']}</p></div>
<div class="actions">{actions}</div></div>{spread}
<div class="two-col"><section class="card">{lead_form(l, f'/lead/{l["id"]}')}</section>
<section class="card"><h2>Notes</h2><form method="post" action="/lead/{l['id']}/note">
<textarea name="body" rows="3" maxlength="5000" required placeholder="Call notes, what they said, next step…"></textarea><button>Add note</button></form>
{notes_html}
<details class="danger"><summary>Delete this lead</summary><form method="post" action="/lead/{l['id']}/delete">
<label class="check"><input type="checkbox" name="confirm" value="yes" required> Yes, permanently delete this lead and its notes</label>
<button class="danger-btn">Delete</button></form></details></section></div>"""
    return page(l["name"] or "Lead", body)


def settings_page(msg="", error=False):
    connected = bool(load_config().get("inbox_key"))
    note = f'<p class="{"error" if error else "saved"}">{esc(msg)}</p>' if msg else ""
    body = f"""<section class="card narrow"><h1>Settings</h1>{note}
<h2>Website leads</h2><p>{'✅ Connected. New website leads download each time you open the Leads page.' if connected else 'Not connected yet.'}</p>
<form method="post" action="/settings"><label>Drop box key<input type="password" name="inbox_key" autocomplete="off"
placeholder="{'Paste a new key to replace the current one' if connected else 'Paste the key Claude gave you'}" required></label>
<button>Save key</button></form>
<h2>Your data</h2><p class="muted">Leads are stored in:<br><code>{esc(DB_PATH)}</code><br>
Copy that file to a USB stick or another safe place now and then as a backup. You can also download everything with <a href="/export.csv">Export</a>.</p>
</section>"""
    return page("Settings", body)


def export_csv():
    with db() as conn:
        rows = conn.execute("SELECT * FROM leads ORDER BY created_at DESC").fetchall()
    out = io.StringIO()
    w = csv.writer(out)
    cols = rows[0].keys() if rows else ["id"]
    w.writerow(cols)
    for r in rows:
        # Prefix cells starting with = + - @ so spreadsheets don't run them as formulas.
        w.writerow(["'" + str(v) if isinstance(v, str) and v[:1] in "=+-@\t\r" else v for v in r])
    return out.getvalue()


# ---------------------------------------------------------------- server

ALLOWED_HOSTS = {f"127.0.0.1:{PORT}", f"localhost:{PORT}"}


class Handler(BaseHTTPRequestHandler):
    server_version = "JayCRM"

    def log_message(self, fmt, *args):  # keep the terminal quiet
        pass

    def send(self, status, body, ctype="text/html; charset=utf-8", extra=None):
        data = body.encode() if isinstance(body, str) else body
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "same-origin")
        self.send_header("Content-Security-Policy",
                         "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'")
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(data)

    def redirect(self, to):
        self.send(303, "", extra={"Location": to})

    def host_ok(self):
        # Blocks "DNS rebinding" tricks where a website pretends to be localhost.
        return self.headers.get("Host", "") in ALLOWED_HOSTS

    def origin_ok(self):
        # Blocks other websites from submitting forms to this CRM in the background.
        origin = self.headers.get("Origin")
        return origin in {f"http://{h}" for h in ALLOWED_HOSTS}

    def form(self):
        length = min(int(self.headers.get("Content-Length") or 0), 100_000)
        raw = self.rfile.read(length).decode("utf-8", "replace")
        return {k: v[0] for k, v in urllib.parse.parse_qs(raw, keep_blank_values=True).items()}

    def do_GET(self):
        if not self.host_ok():
            return self.send(403, "Forbidden")
        url = urllib.parse.urlsplit(self.path)
        query = {k: v[0] for k, v in urllib.parse.parse_qs(url.query).items()}
        path = url.path.rstrip("/") or "/"
        if path == "/":
            return self.send(200, dashboard(query))
        if path == "/new":
            body = ('<p><a href="/">← All leads</a></p><h1>Add a lead</h1><p class="muted">For calls, Facebook lead ads, '
                    'referrals or anything that didn’t come through the website.</p><section class="card">'
                    + lead_form({"status": "New", "source": "phone"}, "/new") + "</section>")
            return self.send(200, page("Add lead", body))
        if path == "/settings":
            return self.send(200, settings_page())
        if path == "/export.csv":
            return self.send(200, export_csv(), "text/csv; charset=utf-8",
                             {"Content-Disposition": f'attachment; filename="leads-{today()}.csv"'})
        m = re.fullmatch(r"/lead/(\d+)", path)
        if m:
            result = lead_page(int(m.group(1)), saved=query.get("saved") == "1")
            return self.send(200, result) if result else self.send(404, page("Not found", "<p>Lead not found.</p>"))
        return self.send(404, page("Not found", "<p>Page not found.</p>"))

    def do_POST(self):
        if not (self.host_ok() and self.origin_ok()):
            return self.send(403, "Forbidden")
        path = urllib.parse.urlsplit(self.path).path.rstrip("/")
        form = self.form()

        if path == "/settings":
            key = form.get("inbox_key", "").strip()
            if not re.fullmatch(r"[A-Za-z0-9_-]{32,128}", key):
                return self.send(400, settings_page("That doesn’t look like a valid key.", error=True))
            cfg = load_config()
            cfg["inbox_key"] = key
            save_config(cfg)
            added, error = sync_leads()
            if error:
                return self.send(200, settings_page(error, error=True))
            return self.send(200, settings_page(f"Key saved. Connected. {added} lead(s) downloaded."))

        if path == "/new":
            l = read_lead_form(form)
            if not (l["name"] or l["phone"] or l["address"]):
                return self.redirect("/new")
            with db() as conn:
                cur = conn.execute(
                    f"INSERT INTO leads ({', '.join(LEAD_COLUMNS)}) VALUES ({', '.join('?' * len(LEAD_COLUMNS))})",
                    [l[c] for c in LEAD_COLUMNS],
                )
            return self.redirect(f"/lead/{cur.lastrowid}")

        m = re.fullmatch(r"/lead/(\d+)(?:/(note|delete))?", path)
        if m:
            lead_id, action = int(m.group(1)), m.group(2)
            with db() as conn:
                if action is None:
                    l = read_lead_form(form)
                    conn.execute(
                        f"UPDATE leads SET {', '.join(c + ' = ?' for c in LEAD_COLUMNS)}, updated_at = datetime('now') WHERE id = ?",
                        [l[c] for c in LEAD_COLUMNS] + [lead_id],
                    )
                    return self.redirect(f"/lead/{lead_id}?saved=1")
                if action == "note":
                    body = form.get("body", "").strip()[:5000]
                    if body:
                        conn.execute("INSERT INTO notes (lead_id, body) VALUES (?, ?)", (lead_id, body))
                        conn.execute("UPDATE leads SET updated_at = datetime('now') WHERE id = ?", (lead_id,))
                    return self.redirect(f"/lead/{lead_id}")
                if action == "delete":
                    if form.get("confirm") == "yes":
                        conn.execute("DELETE FROM notes WHERE lead_id = ?", (lead_id,))
                        conn.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
                        return self.redirect("/")
                    return self.redirect(f"/lead/{lead_id}")
        return self.send(404, page("Not found", "<p>Page not found.</p>"))


CSS = """*{box-sizing:border-box}body{margin:0;font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#24272b;background:#f4f1ea}
a{color:#3e5545}main{max-width:1200px;margin:0 auto;padding:16px}h1{font-size:1.5rem;margin:0 0 4px}h2{font-size:1.15rem}
.top{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:space-between;padding:10px 16px;background:#4f6b57;color:#fff}
.top a{color:#fff;text-decoration:none;font-weight:600}.brand{font-size:1.1rem}.top nav{display:flex;flex-wrap:wrap;gap:14px}
button{background:#4f6b57;color:#fff;border:0;border-radius:8px;padding:9px 16px;font:inherit;font-weight:600;cursor:pointer}
.btn{display:inline-block;background:#4f6b57;color:#fff;border-radius:8px;padding:8px 14px;text-decoration:none;font-weight:600}
.btn.ghost{background:#fff;color:#4f6b57;border:1px solid #4f6b57}.actions{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-start}
input,select,textarea{width:100%;padding:8px 10px;border:1px solid #cfc8b8;border-radius:8px;font:inherit;background:#fff;margin-top:3px}
label{display:block;font-weight:600;font-size:.9rem}label.check{display:flex;gap:8px;align-items:center;font-weight:500}label.check input{width:auto}
.card{background:#fff;border:1px solid #dcd5c6;border-radius:10px;padding:16px;margin-bottom:16px}.narrow{max-width:560px;margin:24px auto}.narrow label{margin-bottom:12px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:14px}
.stat{background:#fff;border:1px solid #dcd5c6;border-radius:10px;padding:12px;text-decoration:none;color:#24272b}.stat strong{display:block;font-size:1.6rem}.stat span{color:#555a5f;font-size:.9rem}
.filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;align-items:center}.filters select,.filters input{width:auto;flex:1 1 160px;margin:0}
.table-wrap{overflow-x:auto;background:#fff;border:1px solid #dcd5c6;border-radius:10px}table{width:100%;border-collapse:collapse;min-width:720px}
th,td{text-align:left;padding:10px;border-bottom:1px solid #eee8dc;vertical-align:top}th{font-size:.8rem;text-transform:uppercase;color:#555a5f;background:#faf8f3}
.empty{text-align:center;color:#555a5f;padding:30px}.overdue{color:#b91c1c;font-weight:700}
.badge{display:inline-block;font-size:.75rem;font-weight:700;padding:2px 8px;border-radius:999px;vertical-align:middle}
.badge.hot{background:#fde2e1;color:#991b1b}.badge.warm{background:#fdf0d5;color:#8a5a12}.badge.cold{background:#e5e7eb;color:#374151}
.lead-head{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;margin-bottom:12px}.muted{color:#555a5f;font-size:.9rem}
.two-col{display:grid;gap:16px}@media(min-width:960px){.two-col{grid-template-columns:3fr 2fr;align-items:start}}
fieldset{border:0;padding:0;margin:0 0 14px}legend{font-weight:800;margin-bottom:6px}.grid{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}
.note{border-top:1px solid #eee8dc;padding-top:8px;margin-top:8px}.note p{margin:2px 0}textarea{margin-bottom:8px}
.saved{background:#e6f2e8;border:1px solid #9fc5a8;padding:8px 12px;border-radius:8px}.error{background:#fde2e1;border:1px solid #f1a9a6;padding:8px 12px;border-radius:8px}
.danger{margin-top:20px}.danger summary{color:#b91c1c;cursor:pointer}.danger-btn{background:#b91c1c;margin-top:8px}code{font-size:.85em;word-break:break-all}
@media(max-width:700px){table{min-width:0}thead{display:none}tr{display:block;padding:8px 0;border-bottom:1px solid #eee8dc}td{display:block;border:0;padding:3px 12px}td:empty{display:none}}"""


def main():
    with db() as conn:
        conn.executescript(SCHEMA)
    try:
        server = ThreadingHTTPServer((HOST, PORT), Handler)
    except OSError:
        print(f"Jay CRM looks like it's already running. Open http://127.0.0.1:{PORT}")
        webbrowser.open(f"http://127.0.0.1:{PORT}")
        return
    url = f"http://127.0.0.1:{PORT}"
    print(f"Jay CRM is running at {url}  (only this laptop can open it)")
    print(f"Your leads are saved in {DB_PATH}")
    print("Press Ctrl+C to stop.")
    if "--no-browser" not in sys.argv:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
