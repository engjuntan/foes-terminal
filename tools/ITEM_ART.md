# Item art pipeline

Turns each item's `image_prompt` into an icon: prompt → image → your Imgur
account → the item's `icon` field in the vault → the app after a sync.
Script: `tools/item-art.mjs`. Run everything from the project folder.

```bash
npm run art -- status
```

## One-time setup

Create a file called `.env` in the project folder (it's gitignored — never
commit it) and fill in the keys below as you get them.

```
IMGUR_CLIENT_ID=
IMGUR_CLIENT_SECRET=
IMGUR_REFRESH_TOKEN=
IMGUR_ALBUM_ID=
GEMINI_API_KEY=
```

### Imgur (needed for uploads)

1. Signed in to Imgur, register an app at <https://api.imgur.com/oauth2/addclient>.
   Choose **OAuth 2 authorization with a callback URL** and use
   `https://localhost` as the callback. You get a Client ID and Client Secret.
2. Open this in your browser, with your Client ID pasted in:
   `https://api.imgur.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=token`
3. Click **Allow**. The browser lands on a `https://localhost/#access_token=…`
   page that fails to load — that's expected. Copy the `refresh_token=` value
   from the address bar into `.env`.
4. Optional: create an album for the icons; its id is the part after
   `imgur.com/a/`. Put it in `IMGUR_ALBUM_ID`.

### Gemini (only for paid automatic generation)

Image generation is **not** on the Gemini API's free tier. To use
`generate`, create a key in Google AI Studio, turn on billing for its
project, and **set a budget alert** in Google Cloud. Roughly US$0.03 per
image at the default model (`gemini-3.1-flash-lite-image`; override with
`GEMINI_IMAGE_MODEL` in `.env`).

## What it covers

- **Item icons** — 284 vault items. Prompts live in each item's vault file.
- **Content slots** — the 18 square cards the app shows outside the vault:
  6 reputation tiers, 5 karma tiers, 7 SPECIAL cards. Their prompts live in
  `tools/art-slots.mjs`, and the url is written straight into
  `src/reputationContent.js` / `src/goatContent.js` (commit those).

`--only items` or `--only slots` narrows `sheet` and `generate`.

## Daily use

**Free route — you generate the images:**

```bash
npm run art -- sheet --limit 20
```

Opens nothing, writes `art/prompt-sheet.md`: each prompt with the exact file
name to save it as. Generate them in the Gemini app or AI Studio, save each
into the vault's `Media/New items/` folder under that name (e.g. `angkasa_wrench.png`), then:

```bash
npm run art -- ingest --limit 20
```

**Paid route — the script generates them:**

```bash
npm run art -- generate --limit 5
```

Look through `Media/New items/` in the vault, delete any image you don't like (it'll be
regenerated next run), then `ingest` as above.

**Already uploaded an image yourself?** Attach it without re-uploading:

```bash
npm run art -- link rep_idolized https://i.imgur.com/xxxx.png
```

After ingesting, pull the icons into the app:

```bash
node sync-obsidian.js --once
```

## Safety rails

- Every spending command needs an explicit `--limit`, and no run can go past
  **25**, whatever you type.
- Paid generations have a **lifetime cap of 400** (`LIFETIME_GENERATE_CAP`
  in the script), counted in `art/ledger.json`.
- The first error stops the run — no retry loops.
- A rate limit ends the run cleanly. Running the same command again resumes:
  anything already linked, or already in the inbox, is skipped.
- `--dry-run` on any command shows what it would do and changes nothing.
- Images live in the vault at `Media/New items/`, so they sync to Drive.
  Approved art gets dragged out of that folder by hand; `ingest` moves what
  it uploads into `Media/New items/uploaded/`.
- The ledger records each upload's Imgur `deletehash`, so any image can be
  removed later.

## Changing the look

The shared style lives in one line, `STYLE`, at the top of the script.
Vault prompts describe only the object, so editing `STYLE` restyles the
whole set on the next generation.
