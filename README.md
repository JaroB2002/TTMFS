# Talk to my future self (TTMFS)

Stuur een tekst- of spraakboodschap naar je toekomstige ik — op een gekozen datum, of op een random moment tussen morgen en twintig jaar. Geen login: je krijgt een geheime link.

## Lokaal

```bash
npm install
env -u DATABASE_URL npm run dev
```

Zonder `DATABASE_URL` gebruikt de app in-memory PGlite. Met Postgres (bij publish) worden migrations automatisch toegepast tijdens `npm run build`.

## Stack

- Next.js App Router
- Postgres via `DATABASE_URL` (PGlite lokaal)
- MediaRecorder voor spraak
