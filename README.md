# GreenSpot

**Recycle, collect points and win rewards from the businesses in your city.**

Languages: Italian and English

This project started from a simple observation: people don't know where to throw their waste, and when they do, they have no incentive to do it. GreenSpot tries to solve both problems: it shows you the nearest recycling machines and bins, and it rewards you with points for every bottle you recycle, which you can spend at local shops.

---

## How it came to be

I designed GreenSpot starting from a problem I saw every day, and I worked on it for about two months. I set the rules myself: half a point per bottle, a monthly and yearly leaderboard, medals with surprise envelopes for the top three, and rewards offered by the local businesses that join the program. I also decided who can do what: the user scans and redeems, the company manages its own rewards, the admin keeps everything in order.

I wrote the first prototype myself, then brought in Claude as a pair programmer for the more complicated parts: the AI photo verification, the database schema with row-level security, the barcode de-duplication logic, and the automation that assigns medals. For those pieces, I explained what I wanted, Claude wrote a first version, I tested it, found what didn't work, and went back with a more precise request. Every product decision, every test, and every choice about what to keep and what to cut was mine. Claude wrote a good portion of the code and the database schema, but it didn't know what was needed until I told it.

The hardest part was bottle verification. The first prototype accepted any photo with a bottle in it, so downloading one from the internet was enough to get points. I had to add an AI check with a quick web search, a background check, barcode reading, and a block that stops the same bottle from being scanned twice. Another detail that made me think: after the shot the camera stayed on and it felt like we were spying on the user, so now it switches off right away. And when I removed the "simulate month end" and "simulate year end" buttons from the admin, it turned out nobody was assigning medals anymore: I had to make the database do it automatically.

---

## What it does

**Users** photograph the bottle from the barcode side. The AI checks that the photo is real (not a screen, not an image taken from the internet, with a real background), the barcode is read and saved digit by digit, and if everything is fine they get 0.5 points. If something doesn't add up, the app goes back to the home page and says why. The map shows machines and bins, taken from OpenStreetMap and from the ones reported by users, with a full-screen walking navigator. Anyone who finds a missing spot can report it with a photo: the AI looks at it, then the admin decides.

Each user can set their own municipality and see the upcoming pickups (plastic, paper, glass, organic…), with a reminder the day before. Points are spent in the Rewards section: you pick a company, redeem, and get a token to show in the shop. There is a leaderboard (month, year, all time) and a medal collection. Anyone with a business can send a partnership request; if it is rejected, it disappears on its own after 24 hours.

**The admin** approves or rejects partnerships, creates partners and links an account to a company with *Set Company Account*. They manage users (reset points, delete an account), collection points (add, approve, delete machines and bins) and the pickup calendar, which is organized by area: you open a country, then a town, then a municipality, and the calendar is there. There are also two charts with the activity of the last 14 days.

**Companies** have a page where they add and remove rewards and mark tokens as used.

## The database

Everything lives on Supabase (PostgreSQL). The tables are `profiles`, `partners`, `partnership_requests`, `partner_accounts`, `rewards`, `transactions`, `scans`, `scanned_barcodes`, `collection_points`, `hidden_osm_points`, `medals`, `user_medals`, `places`, `collection_schedules` and `user_schedule_preferences`. Points, rewards, medals and the leaderboard aren't computed by the browser but by server-side SQL functions, protected by security rules (RLS), so nobody can give themselves points by editing the page's code.

### Technologies

| What | With what |
|---|---|
| Interface | Plain HTML + CSS + JavaScript (no framework) |
| Database, login, files | [Supabase](https://supabase.com) (PostgreSQL + RLS + Storage) |
| AI for photos | Google Gemini (`gemini-3.1-flash-lite`) · TensorFlow.js COCO-SSD as a fallback |
| Barcodes | html5-qrcode |
| Maps and routes | Leaflet · OpenStreetMap (Overpass) · OSRM |
| Charts / effects | Chart.js · canvas-confetti |
| Installable app | Service worker + web manifest (PWA) |

---

## File structure

```
index.html            page
style.css             style and animations
app.js                app logic (numbered sections, index at the top of the file)
config.js             Supabase and Gemini keys  <-- the only file to customize
sw.js                 offline cache
manifest.webmanifest  phone installation (uses logo.png as the icon)
logo.png              logo and app icon
sql/database.sql      COMPLETE database in a single file
```

## Installation

1. Create a free project on supabase.com.
2. **SQL Editor**: paste all of `sql/database.sql` and run it. The file can be run again without losing data, so it also works on an existing database.
3. **Authentication › Providers › Email**: turn off *Confirm email*.
4. **Project Settings › API**: copy the URL and anon key into `config.js`.
5. Free Gemini key (aistudio.google.com/apikey) into `config.js`.
6. **Database › Extensions**: enable `pg_cron` (needed for the cleanups and the automatic medals; without it the app still works, but medals are not assigned on their own).
7. Open `index.html` › Sign up with username `Admin`, then in the SQL Editor:
   `update profiles set role = 'admin' where lower(username) = 'admin';`
8. Log out and back in: the Admin tab appears.

To install it on a phone the app must be online (Netlify Drop or GitHub Pages are free).

## Database automations
- **Every hour**: deletes partnership requests rejected more than 24 hours ago.
- **Every evening (23:55 UTC)**: if the next day is the 1st of the month (or of the year), it assigns the medals.

## Security notes
- Supabase's anon key is public by design: security lives in the RLS policies. Never use the `service_role` key.
- Points, rewards, medals and the leaderboard only go through server-side SQL functions.
- ⚠️ The Gemini key in `config.js` is visible to anyone who opens the site: see "What I'd do next".

---

## What I'd do next

First I would secure the Gemini key. Right now it sits in `config.js`, so anyone who opens the site can copy and use it, and the photo verification runs in the browser, where a savvy user could bypass it. Moving it into a Supabase Edge Function fixes both problems, and it's the point that bothers me most to leave as is.

Then I'd like real pickup calendars. Right now I enter them by hand, municipality by municipality, and for now only Qualiano has data; it works to show how it's organized, but it doesn't hold up with hundreds of municipalities. I'd like to import them from the open data of the municipalities or of the waste collection companies, because a wrong calendar is worse than no calendar.

Finally, I'd like to improve the check on photos "taken from the internet". What's there now is an AI check with a quick web search, so it's a heuristic and not a real reverse image search. I'm interested in finding out how hard it can be made to fool without slowing down the user who is just recycling a bottle.
