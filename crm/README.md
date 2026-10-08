# Jay CRM (runs on your laptop)

A private lead tracker that runs only on your own computer. Nobody on the internet, or even on
your Wi-Fi, can open it.

## One-time setup (about 5 minutes)

### 1. Check you have Python

- **Mac:** open **Terminal** and type `python3 --version`. If it shows `Python 3.9` or newer, you're set.
  If not, install it from https://www.python.org/downloads/
- **Windows:** open **Command Prompt** and type `python --version`. If it isn't found, install it
  from https://www.python.org/downloads/ and **tick "Add python.exe to PATH"** during install.

### 2. Get the CRM file

1. Make a folder for it, e.g. `Documents/JayCRM`.
2. Download `jaycrm.py` from your GitHub repo (`crm/jaycrm.py` → **Download raw file**) into that folder.

### 3. Start it

- **Mac:** in Terminal: `cd ~/Documents/JayCRM` then `python3 jaycrm.py`
- **Windows:** in Command Prompt: `cd %USERPROFILE%\Documents\JayCRM` then `python jaycrm.py`

Your browser opens **http://127.0.0.1:8765**. Leave the terminal window open while you use it.
Press **Ctrl+C** in it to stop.

### 4. Connect website leads (first time only)

Go to **Settings** in the CRM, paste the drop box key Claude gave you, and click **Save key**.
The key is saved in `config.json` next to `jaycrm.py`. **Don't share that file or post the key anywhere.**

## Every day

- Start it the same way as step 3. Each time you open the **Leads** page, new website leads
  download automatically (and are deleted from the website's drop box).
- Website leads also still arrive in your Gmail as a backup, even when your laptop is off.
- Add calls, Facebook lead ads and referrals with **+ Add lead**.

Tip: on a Mac you can make a double-click launcher. Create a file `Start Jay CRM.command` in the
same folder containing:

```
cd "$(dirname "$0")" && python3 jaycrm.py
```

then run `chmod +x "Start Jay CRM.command"` once in Terminal. On Windows, create
`Start Jay CRM.bat` containing `python jaycrm.py` and double-click it.

## Priority (Hot / Warm / Cold)

| Form answer | Points |
| --- | --- |
| Needs a lot of work / some work | +3 / +2 |
| Not listed / **listed with an agent** | +1 / **−4, always Cold** |
| Vacant / tenants | +2 / +1 |
| ASAP / 1–3 months / 3–6 months | +3 / +2 / +1 |

6+ = **Hot**, 3–5 = **Warm**, under 3 = **Cold**. You can override it on any lead.

## Backups (important)

Your leads live only in `data/jaycrm.db` in the CRM folder. If the laptop dies, they're gone, so:

- Copy `data/jaycrm.db` to a USB stick or external drive every week or two, **or**
- Click **Export** to download a spreadsheet copy.

To restore, put the `jaycrm.db` file back in the `data` folder.

## If something goes wrong

- **"The website didn't accept your key":** ask Claude for a new key and paste it in Settings.
- **"No internet connection":** your saved leads are fine; new ones wait safely on the website
  until next time.
- **New laptop:** copy the whole JayCRM folder (including `data` and `config.json`) across.
- **Lost or leaked the key:** ask Claude to replace it. The old key stops working immediately.
