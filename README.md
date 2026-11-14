# Talk to my future self (TTMFS)

Send a text or voice message to your future self — on a chosen date and time, or at a random moment between tomorrow and twenty years. No login: you get a secret link.

## Local

```bash
npm install
env -u DATABASE_URL npm run dev
```

Without `DATABASE_URL` the app uses in-memory PGlite. With Postgres (on publish), migrations run during `npm run build`.

## Stack

- Next.js App Router
- Postgres via `DATABASE_URL` (PGlite locally)
- MediaRecorder for voice
- Framer Motion for transitions
