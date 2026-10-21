# SkillPilot AI Server (optional)

This is a minimal reference server you can deploy to proxy AI calls (OpenAI, Anthropic, Gemini, etc.) without exposing API keys in the mobile app. The mobile app works fully without it using a curated local knowledge base; setting `EXPO_PUBLIC_AI_SERVER_URL` + `EXPO_PUBLIC_AI_API_KEY` routes roadmap/quiz/mentor calls here instead.

## Run locally

```bash
cd server
npm install
OPENAI_API_KEY=sk-... npm start
```

Exposes:

- `POST /roadmap` — `{ onboarding }` → `{ modules, tasks }`
- `POST /quiz` — `{ course, tasks, count }` → `Quiz`
- `POST /mentor` — `{ messages, context }` → `{ reply }`

Configure the mobile app's `.env` to point at `http://<your-lan-ip>:3000`.

## Production

Deploy behind HTTPS (Cloudflare, Vercel, Fly.io, Render) and set a non-empty `API_KEY` required via `Authorization: Bearer <key>`.
