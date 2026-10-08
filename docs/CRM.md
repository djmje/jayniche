# Jay CRM

Private lead tracker at **https://jayniche.ca/crm**. Works on your phone and computer.

## Logging in

- Go to https://jayniche.ca/crm and enter your password.
- The first time, you'll be asked to change the starting password. Use at least 12 characters,
  ideally from a password manager.
- You stay logged in for 14 days on that device. **Log out** on any shared computer.
- Five wrong passwords lock logins from that internet connection for 15 minutes.
- Forgot your password? Ask Claude to reset it. It's stored in the CRM database and can be
  replaced without losing any leads.

## How leads get in

- **Website form:** every submission is saved automatically, with which page it came from.
  It's also still emailed to you through Web3Forms, so you have a backup.
- **Anything else** (calls, Facebook lead ads, referrals): click **+ Add lead**.

## Priority (Hot / Warm / Cold)

Set automatically from the form answers, based on what a good deal looks like for you:

| Answer | Points |
| --- | --- |
| Needs a lot of work / some work | +3 / +2 |
| Not listed / **listed with an agent** | +1 / **−4, always Cold** |
| Vacant / tenants | +2 / +1 |
| ASAP / 1–3 months / 3–6 months | +3 / +2 / +1 |

6+ points = **Hot**, 3–5 = **Warm**, under 3 = **Cold**. You can override it on any lead.

## Working a lead

- **Status:** New → Contacted → Appointment set → Offer made → Under contract → Closed - bought
  (or Referred to realtor / Not a fit / Dead, which hide it from the open list).
- **Follow-up date:** leads past their date show in red and in the **Follow-ups due** box.
- **Numbers:** asking price, after-repair value, repairs, mortgage owing and your offer. The lead
  page then shows a rough spread (after-repair value − offer − repairs).
- **Notes:** a timestamped log of every call and text.
- **Export:** downloads every lead as a spreadsheet (CSV), for backups or a Google Sheet.

## Where the data lives

Cloudflare D1 database `jayniche-crm` (in your Cloudflare account). Schema: `migrations/0001_crm.sql`.
