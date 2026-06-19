# macOS launchd Schedule Setup

## Schedule

The morning brief runs every day at **06:00 Asia/Bangkok**.

Since macOS launchd uses the **system timezone** (not UTC), and the Mac is configured for Asia/Bangkok, you set `Hour: 6, Minute: 0` in the plist — not 23:00 UTC.

Verify your system timezone:

```bash
sudo systemsetup -gettimezone
```

Expected: `Time Zone: Asia/Bangkok`

## Create the launchd plist

Create `~/Library/LaunchAgents/com.hermes.morningbrief.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.hermes.morningbrief</string>

  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>/Users/jakarinosk/HEAD-OFFICE/OS/HERMES-OS/scripts/hermes_morning_brief.sh</string>
  </array>

  <!-- 06:00 daily in system timezone (Asia/Bangkok) -->
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>6</integer>
    <key>Minute</key>
    <integer>0</integer>
  </dict>

  <!-- Load .env from home directory -->
  <key>EnvironmentVariables</key>
  <dict>
    <key>TELEGRAM_BOT_TOKEN</key>
    <string>your_bot_token_here</string>
    <key>TELEGRAM_CHAT_ID</key>
    <string>your_chat_id_here</string>
  </dict>

  <key>RunAtLoad</key>
  <false/>

  <key>StandardOutPath</key>
  <string>/tmp/hermes_morning_brief.log</string>

  <key>StandardErrorPath</key>
  <string>/tmp/hermes_morning_brief.err</string>
</dict>
</plist>
```

**Security note:** The plist contains your Telegram token in plaintext. On macOS, `~/Library/LaunchAgents/` is owned by your user and readable only by you (0600 permissions). Ensure this:

```bash
chmod 600 ~/Library/LaunchAgents/com.hermes.morningbrief.plist
```

## Load the job

```bash
launchctl load ~/Library/LaunchAgents/com.hermes.morningbrief.plist
```

## Verify it's loaded

```bash
launchctl list | grep hermes.morningbrief
```

Should show something like:

```
-    0    com.hermes.morningbrief
```

The `0` exit code means the last run succeeded.

## Unload (to stop or modify)

```bash
launchctl unload ~/Library/LaunchAgents/com.hermes.morningbrief.plist
```

Make changes to the plist, then load again.

## Manual test before scheduling

```bash
# Phase 1 — Generate the brief
cd /Users/jakarinosk/HEAD-OFFICE
bash OS/HERMES-OS/scripts/hermes_morning_brief.sh

# Phase 2–3 — Check for approval (reply in Telegram first)
bash OS/HERMES-OS/scripts/check_telegram_approval.sh
```

## Approval check is manual

The launchd schedule only runs `hermes_morning_brief.sh` (Phase 1). It does NOT run `check_telegram_approval.sh` because that requires a user reply.

To check for approval after receiving the Telegram brief, run:

```bash
bash OS/HERMES-OS/scripts/check_telegram_approval.sh
```

This can be run any number of times — it's idempotent.

## Optional: schedule approval check periodically

If you want Hermes to automatically check for approval after the brief is sent, create a second launchd job running at, say, 06:30, 07:00, and 08:00:

```bash
cp ~/Library/LaunchAgents/com.hermes.morningbrief.plist \
   ~/Library/LaunchAgents/com.hermes.checkapproval.plist
```

Then edit the new plist to:
- Change `ProgramArguments` to run `check_telegram_approval.sh`
- Change `StartCalendarInterval` to `6:30`, `7:00`, etc.
- Change `StandardOutPath` to a different log file

Alternatively, run it manually whenever convenient.